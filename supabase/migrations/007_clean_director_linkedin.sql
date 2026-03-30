-- BSWFCC Platform — Migration 007: Clean fake LinkedIn URLs from directors
-- The seed data had placeholder LinkedIn URLs that lead to 404s
-- Remove them until real profiles are confirmed by the diretoria

UPDATE public.directors SET linkedin = NULL WHERE linkedin IS NOT NULL;
