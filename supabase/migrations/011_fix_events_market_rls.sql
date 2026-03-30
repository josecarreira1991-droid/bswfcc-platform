-- Migration 011: Add missing UPDATE/DELETE RLS policies for events and market_data
-- Root cause of 503 errors on edit forms — RLS blocks UPDATE when no policy exists

-- Events: Add UPDATE and DELETE for admin/directors
CREATE POLICY "Directors can update events" ON events FOR UPDATE TO authenticated
USING ((SELECT role FROM members WHERE email = auth.jwt()->>'email' LIMIT 1) IN ('presidente', 'vice_presidente', 'secretario', 'tesoureiro', 'diretor_marketing', 'diretor_tecnologia', 'diretor_inovacao', 'diretor'));

CREATE POLICY "Directors can delete events" ON events FOR DELETE TO authenticated
USING ((SELECT role FROM members WHERE email = auth.jwt()->>'email' LIMIT 1) IN ('presidente', 'vice_presidente', 'secretario', 'tesoureiro', 'diretor_marketing', 'diretor_tecnologia', 'diretor_inovacao', 'diretor'));

-- Market Data: Add UPDATE and DELETE for admin/directors
CREATE POLICY "Market data update by admin" ON market_data FOR UPDATE TO authenticated
USING ((SELECT role FROM members WHERE email = auth.jwt()->>'email' LIMIT 1) IN ('presidente', 'vice_presidente', 'secretario', 'tesoureiro', 'diretor_marketing', 'diretor_tecnologia', 'diretor_inovacao', 'diretor'));

CREATE POLICY "Market data delete by admin" ON market_data FOR DELETE TO authenticated
USING ((SELECT role FROM members WHERE email = auth.jwt()->>'email' LIMIT 1) IN ('presidente', 'vice_presidente', 'secretario', 'tesoureiro', 'diretor_marketing', 'diretor_tecnologia', 'diretor_inovacao', 'diretor'));
