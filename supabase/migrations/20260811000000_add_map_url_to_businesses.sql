-- Migration: 20260811000000_add_map_url_to_businesses.sql

ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS map_url TEXT;
