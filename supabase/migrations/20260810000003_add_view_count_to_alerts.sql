-- Migration: 20260810000003_add_view_count_to_alerts.sql

ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS view_count INT DEFAULT 0;
