-- LocalCircle: Hyper-Local Community Hub - Database Schema & PostGIS RLS Setup
-- Migration: 20260810000000_initial_schema.sql

-- Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. NEIGHBORHOODS & BOUNDARIES
CREATE TABLE IF NOT EXISTS public.neighborhoods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    boundary GEOMETRY(MultiPolygon, 4326) NOT NULL,
    verified_resident_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spatial index for high-performance boundary intersections
CREATE INDEX IF NOT EXISTS neighborhoods_boundary_idx ON public.neighborhoods USING GIST (boundary);

-- 2. USER PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    neighborhood_id UUID REFERENCES public.neighborhoods(id) ON DELETE SET NULL,
    home_location GEOMETRY(Point, 4326),
    is_verified BOOLEAN DEFAULT FALSE,
    verification_date TIMESTAMPTZ,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS profiles_neighborhood_idx ON public.profiles(neighborhood_id);
CREATE INDEX IF NOT EXISTS profiles_location_idx ON public.profiles USING GIST (home_location);

-- 3. NEIGHBORHOOD FEED (FR-2)
CREATE TYPE post_category AS ENUM ('general', 'announcement', 'lost_and_found', 'event', 'recommendation');

CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    neighborhood_id UUID NOT NULL REFERENCES public.neighborhoods(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category post_category DEFAULT 'general',
    attachments TEXT[] DEFAULT '{}',
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS posts_neighborhood_created_idx ON public.posts(neighborhood_id, created_at DESC);

-- 4. URGENT ALERTS (FR-3 / FR-7)
CREATE TYPE alert_severity AS ENUM ('critical', 'warning', 'advisory');
CREATE TYPE alert_status AS ENUM ('active', 'resolved', 'cancelled');

CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    neighborhood_id UUID NOT NULL REFERENCES public.neighborhoods(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity alert_severity DEFAULT 'warning',
    status alert_status DEFAULT 'active',
    location GEOMETRY(Point, 4326),
    affected_radius_meters INT DEFAULT 500,
    responses_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS alerts_neighborhood_status_idx ON public.alerts(neighborhood_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS alerts_location_idx ON public.alerts USING GIST (location);

-- 5. LOCAL MARKETPLACE (FR-4)
CREATE TYPE item_condition AS ENUM ('new', 'like_new', 'good', 'fair');
CREATE TYPE item_status AS ENUM ('available', 'reserved', 'sold');

CREATE TABLE IF NOT EXISTS public.marketplace_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    neighborhood_id UUID NOT NULL REFERENCES public.neighborhoods(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    is_free BOOLEAN DEFAULT FALSE,
    condition item_condition DEFAULT 'good',
    status item_status DEFAULT 'available',
    images TEXT[] DEFAULT '{}',
    category VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS marketplace_neighborhood_idx ON public.marketplace_items(neighborhood_id, status, created_at DESC);

-- 6. BUSINESS DIRECTORY (FR-5)
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    neighborhood_id UUID NOT NULL REFERENCES public.neighborhoods(id) ON DELETE CASCADE,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    website TEXT,
    address TEXT NOT NULL,
    location GEOMETRY(Point, 4326),
    is_verified BOOLEAN DEFAULT FALSE,
    rating NUMERIC(3,2) DEFAULT 5.00,
    review_count INT DEFAULT 0,
    operating_hours JSONB DEFAULT '{}'::jsonb,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS businesses_neighborhood_idx ON public.businesses(neighborhood_id, created_at DESC);
CREATE INDEX IF NOT EXISTS businesses_location_idx ON public.businesses USING GIST (location);

-- 7. BOUNDARY-NESTED GROUPS (FR-6)
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    neighborhood_id UUID NOT NULL REFERENCES public.neighborhoods(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    is_private BOOLEAN DEFAULT FALSE,
    member_count INT DEFAULT 1,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS groups_neighborhood_idx ON public.groups(neighborhood_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.group_members (
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member', -- 'admin', 'member'
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (group_id, user_id)
);

-- ============================================================================
-- POSTGIS HELPER FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function: Resolve User Neighborhood by Point Coordinates (Lng, Lat)
CREATE OR REPLACE FUNCTION public.find_neighborhood_by_point(lng DOUBLE PRECISION, lat DOUBLE PRECISION)
RETURNS TABLE (
    neighborhood_id UUID,
    neighborhood_name VARCHAR,
    neighborhood_slug VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT n.id, n.name, n.slug
    FROM public.neighborhoods n
    WHERE ST_Contains(n.boundary, ST_SetSRID(ST_MakePoint(lng, lat), 4326))
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function: Get Auth User Neighborhood ID
CREATE OR REPLACE FUNCTION public.get_current_user_neighborhood_id()
RETURNS UUID AS $$
    SELECT neighborhood_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Trigger: Automatically Create Profile on Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Neighbor'),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: Sync Group Member Count
CREATE OR REPLACE FUNCTION public.update_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.groups SET member_count = member_count + 1 WHERE id = NEW.group_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.groups SET member_count = GREATEST(member_count - 1, 0) WHERE id = OLD.group_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE TRIGGER on_group_member_change
    AFTER INSERT OR DELETE ON public.group_members
    FOR EACH ROW EXECUTE FUNCTION public.update_group_member_count();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.neighborhoods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- 1. Neighborhoods RLS (Readable by all authenticated users)
CREATE POLICY "Allow authenticated users to read neighborhoods"
    ON public.neighborhoods FOR SELECT
    TO authenticated
    USING (true);

-- 2. Profiles RLS
CREATE POLICY "Public profiles are viewable by everyone in same neighborhood"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (neighborhood_id = public.get_current_user_neighborhood_id() OR id = auth.uid());

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- 3. Posts RLS (Boundary Scoped Timeline)
CREATE POLICY "Users can view posts in their neighborhood"
    ON public.posts FOR SELECT
    TO authenticated
    USING (neighborhood_id = public.get_current_user_neighborhood_id());

CREATE POLICY "Users can insert posts in their neighborhood"
    ON public.posts FOR INSERT
    TO authenticated
    WITH CHECK (
        author_id = auth.uid() 
        AND neighborhood_id = public.get_current_user_neighborhood_id()
    );

CREATE POLICY "Authors can update their own posts"
    ON public.posts FOR UPDATE
    TO authenticated
    USING (author_id = auth.uid());

CREATE POLICY "Authors can delete their own posts"
    ON public.posts FOR DELETE
    TO authenticated
    USING (author_id = auth.uid());

-- 4. Alerts RLS
CREATE POLICY "Users can view alerts in their neighborhood"
    ON public.alerts FOR SELECT
    TO authenticated
    USING (neighborhood_id = public.get_current_user_neighborhood_id());

CREATE POLICY "Verified users can create emergency alerts"
    ON public.alerts FOR INSERT
    TO authenticated
    WITH CHECK (
        author_id = auth.uid() 
        AND neighborhood_id = public.get_current_user_neighborhood_id()
    );

CREATE POLICY "Authors can update their alerts"
    ON public.alerts FOR UPDATE
    TO authenticated
    USING (author_id = auth.uid());

-- 5. Marketplace Items RLS
CREATE POLICY "Users can view marketplace items in their neighborhood"
    ON public.marketplace_items FOR SELECT
    TO authenticated
    USING (neighborhood_id = public.get_current_user_neighborhood_id());

CREATE POLICY "Users can list marketplace items in their neighborhood"
    ON public.marketplace_items FOR INSERT
    TO authenticated
    WITH CHECK (
        seller_id = auth.uid() 
        AND neighborhood_id = public.get_current_user_neighborhood_id()
    );

CREATE POLICY "Sellers can update their marketplace items"
    ON public.marketplace_items FOR UPDATE
    TO authenticated
    USING (seller_id = auth.uid());

CREATE POLICY "Sellers can delete their marketplace items"
    ON public.marketplace_items FOR DELETE
    TO authenticated
    USING (seller_id = auth.uid());

-- 6. Business Directory RLS
CREATE POLICY "Users can view local businesses in their neighborhood"
    ON public.businesses FOR SELECT
    TO authenticated
    USING (neighborhood_id = public.get_current_user_neighborhood_id());

CREATE POLICY "Users can register a business in their neighborhood"
    ON public.businesses FOR INSERT
    TO authenticated
    WITH CHECK (
        owner_id = auth.uid() 
        AND neighborhood_id = public.get_current_user_neighborhood_id()
    );

CREATE POLICY "Owners can update their business listing"
    ON public.businesses FOR UPDATE
    TO authenticated
    USING (owner_id = auth.uid());

-- 7. Groups & Group Members RLS
CREATE POLICY "Users can view public groups in their neighborhood"
    ON public.groups FOR SELECT
    TO authenticated
    USING (neighborhood_id = public.get_current_user_neighborhood_id());

CREATE POLICY "Users can create groups in their neighborhood"
    ON public.groups FOR INSERT
    TO authenticated
    WITH CHECK (
        created_by = auth.uid() 
        AND neighborhood_id = public.get_current_user_neighborhood_id()
    );

CREATE POLICY "Users can view group memberships"
    ON public.group_members FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() OR group_id IN (
        SELECT id FROM public.groups WHERE neighborhood_id = public.get_current_user_neighborhood_id()
    ));

CREATE POLICY "Users can join public groups"
    ON public.group_members FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave groups"
    ON public.group_members FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- ============================================================================
-- SUPABASE REALTIME SUBSCRIPTIONS
-- ============================================================================
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;

-- Seed Sample Neighborhood Boundary for Local Testing (Northside District)
INSERT INTO public.neighborhoods (name, slug, city, state, boundary)
VALUES (
    'Northside District',
    'northside-district',
    'San Francisco',
    'CA',
    ST_Multi(ST_GeomFromText('POLYGON((-122.425 37.800, -122.400 37.800, -122.400 37.780, -122.425 37.780, -122.425 37.800))', 4326))
) ON CONFLICT (slug) DO NOTHING;
