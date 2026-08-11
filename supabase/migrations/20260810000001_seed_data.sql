-- 1. Relax RLS for Local Development / Demo (Allow public SELECT and User-scoped ALL)

-- Neighborhoods
DROP POLICY IF EXISTS "Allow authenticated users to read neighborhoods" ON public.neighborhoods;
DROP POLICY IF EXISTS "Allow public to read neighborhoods" ON public.neighborhoods;
CREATE POLICY "Allow public to read neighborhoods" ON public.neighborhoods FOR SELECT USING (true);

-- Profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone in same neighborhood" ON public.profiles;
DROP POLICY IF EXISTS "Allow public to read profiles" ON public.profiles;
CREATE POLICY "Allow public to read profiles" ON public.profiles FOR SELECT USING (true);

-- Posts
DROP POLICY IF EXISTS "Users can view posts in their neighborhood" ON public.posts;
DROP POLICY IF EXISTS "Allow public to read posts" ON public.posts;
CREATE POLICY "Allow public to read posts" ON public.posts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow author to manage posts" ON public.posts;
CREATE POLICY "Allow author to manage posts" ON public.posts FOR ALL USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());

-- Alerts
DROP POLICY IF EXISTS "Users can view alerts in their neighborhood" ON public.alerts;
DROP POLICY IF EXISTS "Allow public to read alerts" ON public.alerts;
CREATE POLICY "Allow public to read alerts" ON public.alerts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow author to manage alerts" ON public.alerts;
CREATE POLICY "Allow author to manage alerts" ON public.alerts FOR ALL USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());

-- Marketplace
DROP POLICY IF EXISTS "Users can view marketplace items in their neighborhood" ON public.marketplace_items;
DROP POLICY IF EXISTS "Allow public to read marketplace items" ON public.marketplace_items;
CREATE POLICY "Allow public to read marketplace items" ON public.marketplace_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow seller to manage marketplace" ON public.marketplace_items;
CREATE POLICY "Allow seller to manage marketplace" ON public.marketplace_items FOR ALL USING (seller_id = auth.uid()) WITH CHECK (seller_id = auth.uid());

-- Businesses
DROP POLICY IF EXISTS "Users can view local businesses in their neighborhood" ON public.businesses;
DROP POLICY IF EXISTS "Allow public to read businesses" ON public.businesses;
CREATE POLICY "Allow public to read businesses" ON public.businesses FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow owner to manage businesses" ON public.businesses;
CREATE POLICY "Allow owner to manage businesses" ON public.businesses FOR ALL USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- Groups
DROP POLICY IF EXISTS "Users can view public groups in their neighborhood" ON public.groups;
DROP POLICY IF EXISTS "Allow public to read groups" ON public.groups;
CREATE POLICY "Allow public to read groups" ON public.groups FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow creator to manage groups" ON public.groups;
CREATE POLICY "Allow creator to manage groups" ON public.groups FOR ALL USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());


-- 2. Insert Mock Neighborhoods (Bandra West, Mumbai & Dahod, Gujarat)
INSERT INTO public.neighborhoods (id, name, slug, city, state, boundary)
VALUES 
    (
        '11111111-1111-1111-1111-111111111111',
        'Bandra West',
        'bandra-west-mumbai',
        'Mumbai',
        'Maharashtra',
        ST_Multi(ST_GeomFromText('POLYGON((72.825 19.050, 72.840 19.050, 72.840 19.065, 72.825 19.065, 72.825 19.050))', 4326))
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        'Dahod Central',
        'dahod-gujarat',
        'Dahod',
        'Gujarat',
        -- A large polygon covering the Dahod area so physical GPS locations match natively
        ST_Multi(ST_GeomFromText('POLYGON((74.15 22.75, 74.35 22.75, 74.35 22.95, 74.15 22.95, 74.15 22.75))', 4326))
    )
ON CONFLICT (slug) DO UPDATE 
  SET id = EXCLUDED.id, name = EXCLUDED.name, city = EXCLUDED.city, state = EXCLUDED.state, boundary = EXCLUDED.boundary;

-- End of Neighborhood Seeding. 
-- All mock users and demo posts have been removed for a clean production environment.
