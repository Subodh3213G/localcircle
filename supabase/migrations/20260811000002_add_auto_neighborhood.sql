-- 20260811000002_add_auto_neighborhood.sql

CREATE OR REPLACE FUNCTION public.create_dynamic_neighborhood(
    p_name VARCHAR,
    p_slug VARCHAR,
    p_city VARCHAR,
    p_state VARCHAR,
    p_lng DOUBLE PRECISION,
    p_lat DOUBLE PRECISION,
    p_box_size DOUBLE PRECISION
) RETURNS TABLE (
    neighborhood_id UUID,
    neighborhood_name VARCHAR,
    neighborhood_slug VARCHAR
) AS $$
DECLARE
    new_id UUID;
BEGIN
    INSERT INTO public.neighborhoods (name, slug, city, state, boundary)
    VALUES (
        p_name,
        p_slug,
        p_city,
        p_state,
        ST_SetSRID(ST_MakeEnvelope(
            p_lng - p_box_size, p_lat - p_box_size, 
            p_lng + p_box_size, p_lat + p_box_size
        ), 4326)
    )
    ON CONFLICT (slug) DO UPDATE SET updated_at = NOW()
    RETURNING id INTO new_id;

    RETURN QUERY SELECT new_id, p_name::VARCHAR, p_slug::VARCHAR;
END;
$$ LANGUAGE plpgsql;
