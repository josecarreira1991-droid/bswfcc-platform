-- ═══════════════════════════════════════════════════════════════════
-- SANDBOX DATA — BSWFCC Platform
-- Run: psql -U postgres -d postgres -f seed-sandbox.sql
-- Creates realistic test data for development/staging
-- ═══════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════
-- SANDBOX MEMBERS (10 members with diverse roles and industries)
-- Using valid hex UUIDs: aa/ab/ac... prefix pattern
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO members (id, full_name, email, phone, role, status, company, industry, city, bio, tier_slug, website, linkedin_url, instagram, referral_count, created_at)
VALUES
  ('aa000000-0000-0000-0000-000000000001', 'Carlos Silva', 'carlos.sandbox@bswfcc.com', '+1 (239) 555-0101', 'presidente', 'ativo', 'Silva Construction LLC', 'Construção', 'Cape Coral, FL', 'Empresário brasileiro no SW Florida há 15 anos. Especialista em construção residencial e comercial.', 'trustee', 'https://silvaconstruction.com', 'https://linkedin.com/in/carlos-silva-sandbox', '@silvaconstruction', 5, NOW() - INTERVAL '8 months'),

  ('aa000000-0000-0000-0000-000000000002', 'Ana Oliveira', 'ana.sandbox@bswfcc.com', '+1 (239) 555-0102', 'vice_presidente', 'ativo', 'Oliveira Real Estate', 'Real Estate', 'Fort Myers, FL', 'Corretora de imóveis com foco no mercado brasileiro. Top producer 3 anos consecutivos.', 'executive', 'https://oliveirarealty.com', 'https://linkedin.com/in/ana-oliveira-sandbox', '@oliveirarealty', 3, NOW() - INTERVAL '7 months'),

  ('aa000000-0000-0000-0000-000000000003', 'Rafael Santos', 'rafael.sandbox@bswfcc.com', '+1 (239) 555-0103', 'tesoureiro', 'ativo', 'Santos Accounting', 'Contabilidade / Finance', 'Naples, FL', 'CPA especializado em tax planning para brasileiros nos EUA.', 'executive', NULL, 'https://linkedin.com/in/rafael-santos-sandbox', '@santosaccounting', 2, NOW() - INTERVAL '6 months'),

  ('aa000000-0000-0000-0000-000000000004', 'Mariana Costa', 'mariana.sandbox@bswfcc.com', '+1 (239) 555-0104', 'diretor_marketing', 'ativo', 'Costa Digital Marketing', 'Serviços Profissionais', 'Bonita Springs, FL', 'Especialista em marketing digital para empresas brasileiras nos EUA.', 'business', 'https://costadigital.com', NULL, '@costadigital', 1, NOW() - INTERVAL '5 months'),

  ('aa000000-0000-0000-0000-000000000005', 'Fernando Almeida', 'fernando.sandbox@bswfcc.com', '+1 (239) 555-0105', 'membro', 'ativo', 'Almeida Brazilian Grill', 'Restaurante / Food', 'Cape Coral, FL', 'Dono do melhor restaurante brasileiro de Cape Coral. Churrasco autêntico.', 'business', 'https://almeidagrill.com', NULL, '@almeidagrill', 0, NOW() - INTERVAL '4 months'),

  ('aa000000-0000-0000-0000-000000000006', 'Juliana Mendes', 'juliana.sandbox@bswfcc.com', '+1 (239) 555-0106', 'membro', 'ativo', 'Mendes Beauty Studio', 'Beleza / Estética', 'Fort Myers, FL', 'Esteticista certificada. Especialista em procedimentos faciais e corporais.', 'community', NULL, NULL, '@mendesbeauty', 0, NOW() - INTERVAL '3 months'),

  ('aa000000-0000-0000-0000-000000000007', 'Pedro Barbosa', 'pedro.sandbox@bswfcc.com', '+1 (239) 555-0107', 'membro', 'ativo', 'Barbosa Legal Services', 'Advocacia / Legal', 'Naples, FL', 'Advogado de imigração. Especialista em EB-2 NIW e investidor visa.', 'business', 'https://barbosalegal.com', 'https://linkedin.com/in/pedro-barbosa-sandbox', '@barbosalegal', 1, NOW() - INTERVAL '2 months'),

  ('aa000000-0000-0000-0000-000000000008', 'Luciana Ferreira', 'luciana.sandbox@bswfcc.com', '+1 (239) 555-0108', 'parceiro_estrategico', 'ativo', 'Ferreira Insurance Group', 'Serviços Profissionais', 'Cape Coral, FL', 'Seguros para pessoas físicas e empresas. Health, auto, home, business.', 'executive', 'https://ferreirainsurance.com', NULL, '@ferreirainsurance', 0, NOW() - INTERVAL '1 month'),

  ('aa000000-0000-0000-0000-000000000009', 'Roberto Lima', 'roberto.sandbox@bswfcc.com', '+1 (239) 555-0109', 'membro', 'pendente', 'Lima Auto Repair', 'Automotivo', 'Lehigh Acres, FL', 'Oficina mecânica especializada em carros importados.', 'community', NULL, NULL, NULL, 0, NOW() - INTERVAL '3 days'),

  ('aa000000-0000-0000-0000-000000000010', 'Camila Rodrigues', 'camila.sandbox@bswfcc.com', '+1 (239) 555-0110', 'membro', 'inativo', 'Rodrigues Travel', 'Turismo / Hospitality', 'Fort Myers, FL', 'Agência de viagens Brasil-EUA. Pacotes turísticos e assessoria.', 'community', NULL, NULL, '@rodriguestravel', 0, NOW() - INTERVAL '10 months')
ON CONFLICT (email) DO NOTHING;

-- Referral relationships
UPDATE members SET referred_by = 'aa000000-0000-0000-0000-000000000001' WHERE id IN ('aa000000-0000-0000-0000-000000000005', 'aa000000-0000-0000-0000-000000000006', 'aa000000-0000-0000-0000-000000000007');
UPDATE members SET referred_by = 'aa000000-0000-0000-0000-000000000002' WHERE id IN ('aa000000-0000-0000-0000-000000000008', 'aa000000-0000-0000-0000-000000000009');

-- ═══════════════════════════════════════════════════════════════════
-- SUBSCRIPTIONS (using real tier IDs from database)
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO subscriptions (member_id, tier_id, status, current_period_start, current_period_end)
VALUES
  ('aa000000-0000-0000-0000-000000000001', 'd64d2173-8b22-482b-8d0a-353822ca2b8b', 'active', NOW() - INTERVAL '1 month', NOW() + INTERVAL '11 months'),
  ('aa000000-0000-0000-0000-000000000002', 'f54ca600-51fe-4236-861a-396b5737eef1', 'active', NOW() - INTERVAL '2 months', NOW() + INTERVAL '10 months'),
  ('aa000000-0000-0000-0000-000000000003', 'f54ca600-51fe-4236-861a-396b5737eef1', 'active', NOW() - INTERVAL '1 month', NOW() + INTERVAL '11 months'),
  ('aa000000-0000-0000-0000-000000000004', '1f9d87e8-d412-4f17-9f87-cd2143a408a4', 'active', NOW() - INTERVAL '3 months', NOW() + INTERVAL '9 months'),
  ('aa000000-0000-0000-0000-000000000005', '1f9d87e8-d412-4f17-9f87-cd2143a408a4', 'active', NOW() - INTERVAL '2 months', NOW() + INTERVAL '10 months'),
  ('aa000000-0000-0000-0000-000000000006', '7fe20dcc-fcd7-4fec-bb75-f963f025c20c', 'active', NOW() - INTERVAL '1 month', NOW() + INTERVAL '11 months'),
  ('aa000000-0000-0000-0000-000000000007', '1f9d87e8-d412-4f17-9f87-cd2143a408a4', 'active', NOW() - INTERVAL '1 month', NOW() + INTERVAL '11 months'),
  ('aa000000-0000-0000-0000-000000000008', 'f54ca600-51fe-4236-861a-396b5737eef1', 'active', NOW() - INTERVAL '1 month', NOW() + INTERVAL '11 months'),
  ('aa000000-0000-0000-0000-000000000010', '7fe20dcc-fcd7-4fec-bb75-f963f025c20c', 'canceled', NOW() - INTERVAL '6 months', NOW() - INTERVAL '1 month')
ON CONFLICT (member_id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- PAYMENTS
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO payments (member_id, amount, status, description, created_at)
VALUES
  ('aa000000-0000-0000-0000-000000000001', 150000, 'succeeded', 'Anuidade Trustee', NOW() - INTERVAL '1 month'),
  ('aa000000-0000-0000-0000-000000000002', 50000, 'succeeded', 'Mensalidade Executive', NOW() - INTERVAL '15 days'),
  ('aa000000-0000-0000-0000-000000000003', 50000, 'succeeded', 'Mensalidade Executive', NOW() - INTERVAL '10 days'),
  ('aa000000-0000-0000-0000-000000000004', 15000, 'succeeded', 'Mensalidade Business', NOW() - INTERVAL '7 days'),
  ('aa000000-0000-0000-0000-000000000005', 15000, 'succeeded', 'Mensalidade Business', NOW() - INTERVAL '5 days'),
  ('aa000000-0000-0000-0000-000000000006', 5000, 'succeeded', 'Mensalidade Community', NOW() - INTERVAL '3 days'),
  ('aa000000-0000-0000-0000-000000000007', 15000, 'succeeded', 'Mensalidade Business', NOW() - INTERVAL '2 days'),
  ('aa000000-0000-0000-0000-000000000008', 50000, 'succeeded', 'Mensalidade Executive', NOW() - INTERVAL '1 day');

-- ═══════════════════════════════════════════════════════════════════
-- EVENTS
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO events (id, title, description, date, time, location, type, max_attendees, is_public, check_in_enabled, created_at)
VALUES
  ('ee000000-0000-0000-0000-000000000001', 'Networking Happy Hour — Abril', 'Encontro mensal para networking entre membros da câmara. Open bar e appetizers inclusos.', (CURRENT_DATE + INTERVAL '7 days')::date, '18:00', 'The Boat House Tiki Bar, Cape Coral', 'networking', 50, true, true, NOW() - INTERVAL '14 days'),
  ('ee000000-0000-0000-0000-000000000002', 'Workshop: Como Abrir Empresa nos EUA', 'Pedro Barbosa apresenta o passo-a-passo para brasileiros que querem abrir empresa na Flórida.', (CURRENT_DATE + INTERVAL '14 days')::date, '19:00', 'BSWFCC Office, Fort Myers', 'workshop', 30, true, false, NOW() - INTERVAL '7 days'),
  ('ee000000-0000-0000-0000-000000000003', 'Palestra: Marketing Digital para Negócios Locais', 'Mariana Costa compartilha estratégias de marketing digital que funcionam para pequenos negócios brasileiros.', (CURRENT_DATE + INTERVAL '21 days')::date, '19:30', 'Virtual — Zoom', 'palestra', 100, true, false, NOW() - INTERVAL '3 days'),
  ('ee000000-0000-0000-0000-000000000004', 'Almoço Executivo — Março', 'Almoço exclusivo para membros Executive e Trustee. Tema: Tendências do mercado imobiliário 2026.', (CURRENT_DATE - INTERVAL '5 days')::date, '12:00', 'Fogo de Chão, Naples', 'almoco', 20, false, true, NOW() - INTERVAL '30 days'),
  ('ee000000-0000-0000-0000-000000000005', 'Gala Anual BSWFCC 2026', 'Nosso evento principal do ano! Premiação dos membros destaque, jantar de gala e show ao vivo.', (CURRENT_DATE + INTERVAL '60 days')::date, '19:00', 'Hyatt Regency Coconut Point, Bonita Springs', 'gala', 200, true, true, NOW() - INTERVAL '60 days')
ON CONFLICT (id) DO NOTHING;

-- Event registrations
INSERT INTO event_registrations (event_id, member_id, status)
VALUES
  ('ee000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000001', 'confirmado'),
  ('ee000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000002', 'confirmado'),
  ('ee000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000004', 'confirmado'),
  ('ee000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000005', 'confirmado'),
  ('ee000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000006', 'lista_espera'),
  ('ee000000-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000001', 'confirmado'),
  ('ee000000-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000003', 'confirmado'),
  ('ee000000-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000007', 'confirmado'),
  ('ee000000-0000-0000-0000-000000000004', 'aa000000-0000-0000-0000-000000000001', 'confirmado'),
  ('ee000000-0000-0000-0000-000000000004', 'aa000000-0000-0000-0000-000000000002', 'confirmado'),
  ('ee000000-0000-0000-0000-000000000004', 'aa000000-0000-0000-0000-000000000008', 'confirmado'),
  ('ee000000-0000-0000-0000-000000000005', 'aa000000-0000-0000-0000-000000000001', 'confirmado'),
  ('ee000000-0000-0000-0000-000000000005', 'aa000000-0000-0000-0000-000000000002', 'confirmado'),
  ('ee000000-0000-0000-0000-000000000005', 'aa000000-0000-0000-0000-000000000003', 'confirmado'),
  ('ee000000-0000-0000-0000-000000000005', 'aa000000-0000-0000-0000-000000000004', 'confirmado'),
  ('ee000000-0000-0000-0000-000000000005', 'aa000000-0000-0000-0000-000000000005', 'confirmado')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- CHAT CHANNELS + MESSAGES
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO chat_channels (id, name, description, is_default, created_by, created_at)
VALUES
  ('cc000000-0000-0000-0000-000000000001', 'Sandbox Geral', 'Canal sandbox — boas-vindas, avisos e conversas gerais', false, 'aa000000-0000-0000-0000-000000000001', NOW() - INTERVAL '8 months'),
  ('cc000000-0000-0000-0000-000000000002', 'Oportunidades', 'Poste oportunidades de negócio, parcerias e indicações', false, 'aa000000-0000-0000-0000-000000000001', NOW() - INTERVAL '6 months'),
  ('cc000000-0000-0000-0000-000000000003', 'Eventos', 'Discussão sobre eventos, sugestões e feedback', false, 'aa000000-0000-0000-0000-000000000002', NOW() - INTERVAL '4 months')
ON CONFLICT (id) DO NOTHING;

INSERT INTO chat_messages (channel_id, sender_id, content, created_at)
VALUES
  ('cc000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000001', 'Bem-vindos ao chat da BSWFCC! Usem este canal para conversas gerais e networking.', NOW() - INTERVAL '7 months'),
  ('cc000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000002', 'Obrigada Carlos! Ótima iniciativa. Vamos usar bastante!', NOW() - INTERVAL '7 months' + INTERVAL '1 hour'),
  ('cc000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000005', 'Fala pessoal! Fernando aqui do Almeida Brazilian Grill. Promoção de buffet esta semana!', NOW() - INTERVAL '2 days'),
  ('cc000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000006', 'Adorei a promoção Fernando! Vou levar as meninas do salão lá amanhã.', NOW() - INTERVAL '2 days' + INTERVAL '30 minutes'),
  ('cc000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000004', 'Pessoal, lembrem que temos networking na próxima semana! Confirmem presença no app.', NOW() - INTERVAL '1 day'),
  ('cc000000-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000007', 'Tenho um cliente que precisa de um contador que fale português. Alguém indica?', NOW() - INTERVAL '3 days'),
  ('cc000000-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000003', 'Pedro, pode me passar o contato! Sou CPA e atendo a comunidade brasileira.', NOW() - INTERVAL '3 days' + INTERVAL '15 minutes'),
  ('cc000000-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000008', '15% off em seguro auto pra membros da câmara. Me chamem no DM!', NOW() - INTERVAL '1 day'),
  ('cc000000-0000-0000-0000-000000000003', 'aa000000-0000-0000-0000-000000000002', 'O que acharam do último networking? Sugestões para o próximo?', NOW() - INTERVAL '5 days'),
  ('cc000000-0000-0000-0000-000000000003', 'aa000000-0000-0000-0000-000000000005', 'Adorei! Sugiro fazer num restaurante brasileiro, tipo o meu!', NOW() - INTERVAL '5 days' + INTERVAL '2 hours');

-- ═══════════════════════════════════════════════════════════════════
-- DIRECT CONVERSATIONS + MESSAGES
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO direct_conversations (id, participant_1, participant_2, last_message, last_message_at, created_at)
VALUES
  ('dd000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000002', 'Vamos confirmar o local do almoço executivo?', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '5 days'),
  ('dd000000-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000007', 'aa000000-0000-0000-0000-000000000003', 'Perfeito, vou enviar o contato do cliente.', NOW() - INTERVAL '1 day', NOW() - INTERVAL '3 days')
ON CONFLICT DO NOTHING;

INSERT INTO direct_messages (conversation_id, sender_id, content, created_at)
VALUES
  ('dd000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000001', 'Ana, precisamos definir o local do almoço executivo.', NOW() - INTERVAL '5 days'),
  ('dd000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000002', 'Carlos! Que tal o Fogo de Chão em Naples?', NOW() - INTERVAL '5 days' + INTERVAL '1 hour'),
  ('dd000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000001', 'Perfeito! Vou reservar pra 20 pessoas.', NOW() - INTERVAL '2 hours'),
  ('dd000000-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000007', 'Rafael, tenho um cliente empresário brasileiro que precisa de um CPA urgente.', NOW() - INTERVAL '3 days'),
  ('dd000000-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000003', 'Opa Pedro! Pode mandar. Tenho disponibilidade essa semana.', NOW() - INTERVAL '3 days' + INTERVAL '30 minutes'),
  ('dd000000-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000007', 'Perfeito, vou enviar o contato do cliente.', NOW() - INTERVAL '1 day');

-- ═══════════════════════════════════════════════════════════════════
-- FEED POSTS (Mural)
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO posts (id, author_id, category, title, content, is_pinned, is_opportunity, opportunity_type, tags, likes_count, comments_count, created_at)
VALUES
  ('bb000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000001', 'anuncio', 'Bem-vindos à Plataforma BSWFCC!', 'Membros, estamos lançando nossa nova plataforma digital! Aqui vocês podem fazer networking, encontrar oportunidades e acompanhar eventos. Indiquem empresários brasileiros no SW Florida!', true, false, NULL, ARRAY['boas-vindas', 'plataforma'], 8, 3, NOW() - INTERVAL '6 months'),
  ('bb000000-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000005', 'oportunidade', 'Procuro Fornecedor de Carnes Importadas', 'Preciso de um fornecedor confiável de carnes brasileiras (picanha, fraldinha, linguiça) na região de SW Florida. Alguém conhece?', false, true, 'procura', ARRAY['restaurante', 'fornecedor', 'carnes'], 4, 2, NOW() - INTERVAL '1 week'),
  ('bb000000-0000-0000-0000-000000000003', 'aa000000-0000-0000-0000-000000000008', 'oportunidade', 'Desconto Especial em Seguros para Membros', 'Membros da BSWFCC têm 15% de desconto em todos os planos de seguro. Válido até o final do mês!', false, true, 'oferta', ARRAY['seguro', 'desconto', 'membros'], 6, 1, NOW() - INTERVAL '3 days'),
  ('bb000000-0000-0000-0000-000000000004', 'aa000000-0000-0000-0000-000000000004', 'evento', 'Resumo: Networking Happy Hour de Março', 'Que noite incrível! 35 membros presentes, 12 novas conexões de negócio formadas e muito churrasco!', false, false, NULL, ARRAY['networking', 'evento', 'resumo'], 12, 5, NOW() - INTERVAL '10 days'),
  ('bb000000-0000-0000-0000-000000000005', 'aa000000-0000-0000-0000-000000000007', 'discussao', 'Melhor Banco para Empresa nos EUA?', 'Clientes perguntando qual o melhor banco para abrir conta de empresa. Chase? Bank of America? Wells Fargo? Experiências?', false, false, NULL, ARRAY['banco', 'empresa', 'finanças'], 7, 3, NOW() - INTERVAL '4 days')
ON CONFLICT (id) DO NOTHING;

-- Post comments
INSERT INTO post_comments (post_id, author_id, content, created_at)
VALUES
  ('bb000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000002', 'Parabéns pela iniciativa Carlos! A plataforma ficou linda.', NOW() - INTERVAL '6 months' + INTERVAL '2 hours'),
  ('bb000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000005', 'Muito bom! Já estou indicando pra todo mundo.', NOW() - INTERVAL '6 months' + INTERVAL '5 hours'),
  ('bb000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000004', 'Marketing apoiando! Vamos divulgar nas redes.', NOW() - INTERVAL '6 months' + INTERVAL '1 day'),
  ('bb000000-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000001', 'Fernando, conheço um fornecedor excelente. Te mando por DM.', NOW() - INTERVAL '6 days'),
  ('bb000000-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000006', 'Meu vizinho importa carnes do Brasil. Posso fazer a ponte!', NOW() - INTERVAL '5 days'),
  ('bb000000-0000-0000-0000-000000000003', 'aa000000-0000-0000-0000-000000000005', 'Vou aproveitar! Preciso renovar o seguro do restaurante.', NOW() - INTERVAL '2 days'),
  ('bb000000-0000-0000-0000-000000000005', 'aa000000-0000-0000-0000-000000000003', 'Chase Business é o melhor custo-benefício. Sem taxa se mantiver $2k na conta.', NOW() - INTERVAL '3 days'),
  ('bb000000-0000-0000-0000-000000000005', 'aa000000-0000-0000-0000-000000000002', 'Mercury é excelente para LLC. Tudo online, sem burocracia.', NOW() - INTERVAL '3 days' + INTERVAL '1 hour'),
  ('bb000000-0000-0000-0000-000000000005', 'aa000000-0000-0000-0000-000000000008', 'Bank of America tem um programa bom pra small business.', NOW() - INTERVAL '2 days');

-- ═══════════════════════════════════════════════════════════════════
-- REFERRAL CODES
-- ═══════════════════════════════════════════════════════════════════

-- Active codes
INSERT INTO referral_codes (member_id, code, is_active, created_at)
VALUES
  ('aa000000-0000-0000-0000-000000000001', 'CARLOS24', true, NOW() - INTERVAL '6 months'),
  ('aa000000-0000-0000-0000-000000000002', 'ANA2026X', true, NOW() - INTERVAL '5 months'),
  ('aa000000-0000-0000-0000-000000000003', 'RAFAEL7K', true, NOW() - INTERVAL '4 months'),
  ('aa000000-0000-0000-0000-000000000004', 'MARI4MKT', true, NOW() - INTERVAL '3 months'),
  ('aa000000-0000-0000-0000-000000000007', 'PEDR08LW', true, NOW() - INTERVAL '2 months')
ON CONFLICT DO NOTHING;

-- Used codes
INSERT INTO referral_codes (member_id, code, is_active, used_by, used_at, created_at)
VALUES
  ('aa000000-0000-0000-0000-000000000001', 'CARL0S01', false, 'aa000000-0000-0000-0000-000000000005', NOW() - INTERVAL '4 months', NOW() - INTERVAL '5 months'),
  ('aa000000-0000-0000-0000-000000000001', 'CARL0S02', false, 'aa000000-0000-0000-0000-000000000006', NOW() - INTERVAL '3 months', NOW() - INTERVAL '4 months'),
  ('aa000000-0000-0000-0000-000000000001', 'CARL0S03', false, 'aa000000-0000-0000-0000-000000000007', NOW() - INTERVAL '2 months', NOW() - INTERVAL '3 months'),
  ('aa000000-0000-0000-0000-000000000002', 'ANA00001', false, 'aa000000-0000-0000-0000-000000000008', NOW() - INTERVAL '1 month', NOW() - INTERVAL '2 months'),
  ('aa000000-0000-0000-0000-000000000002', 'ANA00002', false, 'aa000000-0000-0000-0000-000000000009', NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 month')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- REFERRAL REWARDS
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO referral_rewards (member_id, reward_type, status, milestone, discount_pct, label, earned_at)
VALUES
  ('aa000000-0000-0000-0000-000000000001', 'discount_10', 'redeemed', 1, 10, '10% de desconto na próxima anuidade', NOW() - INTERVAL '4 months'),
  ('aa000000-0000-0000-0000-000000000001', 'discount_20', 'earned', 3, 20, '20% de desconto na próxima anuidade', NOW() - INTERVAL '2 months'),
  ('aa000000-0000-0000-0000-000000000002', 'discount_10', 'earned', 1, 10, '10% de desconto na próxima anuidade', NOW() - INTERVAL '1 month')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- DOCUMENTS
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO documents (title, description, category, access_level, file_url, tags, is_pinned, uploaded_by, created_at)
VALUES
  ('Estatuto Social BSWFCC', 'Estatuto social da Brazilian Southwest Florida Chamber of Commerce', 'legal', 'member', 'https://docs.google.com/document/d/sandbox-estatuto', ARRAY['estatuto', 'legal'], true, 'aa000000-0000-0000-0000-000000000001', NOW() - INTERVAL '8 months'),
  ('Guia do Novo Membro', 'Tudo que você precisa saber como novo membro da câmara', 'guides', 'member', 'https://docs.google.com/document/d/sandbox-guia', ARRAY['onboarding', 'guia'], true, 'aa000000-0000-0000-0000-000000000004', NOW() - INTERVAL '6 months'),
  ('Relatório Financeiro Q1 2026', 'Receitas, despesas e projeções do primeiro trimestre', 'financial', 'admin', NULL, ARRAY['financeiro', 'Q1', '2026'], false, 'aa000000-0000-0000-0000-000000000003', NOW() - INTERVAL '1 month'),
  ('Template: Proposta Comercial', 'Template oficial de proposta para parcerias da câmara', 'templates', 'member', 'https://docs.google.com/document/d/sandbox-proposta', ARRAY['template', 'proposta'], false, 'aa000000-0000-0000-0000-000000000004', NOW() - INTERVAL '3 months');

-- ═══════════════════════════════════════════════════════════════════
-- BUSINESS PROFILES (Matchmaking)
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO business_profiles (member_id, business_name, business_type, description, services_offered, services_needed, target_industries, looking_for, tags, updated_at)
VALUES
  ('aa000000-0000-0000-0000-000000000001', 'Silva Construction LLC', 'Construção', 'Construção residencial e comercial no SW Florida', ARRAY['Construção residencial', 'Reforma comercial', 'Project management'], ARRAY['Marketing digital', 'Contabilidade'], ARRAY['Real Estate', 'Restaurante / Food'], 'Parcerias com imobiliárias e arquitetos', ARRAY['construção', 'reforma'], NOW() - INTERVAL '3 months'),
  ('aa000000-0000-0000-0000-000000000002', 'Oliveira Real Estate', 'Real Estate', 'Compra e venda de imóveis para brasileiros', ARRAY['Compra e venda de imóveis', 'Property management'], ARRAY['Fotografia profissional', 'Staging'], ARRAY['Construção', 'Advocacia / Legal'], 'Investidores brasileiros e famílias', ARRAY['imóveis', 'investimento'], NOW() - INTERVAL '2 months'),
  ('aa000000-0000-0000-0000-000000000005', 'Almeida Brazilian Grill', 'Restaurante / Food', 'Churrascaria brasileira autêntica', ARRAY['Catering', 'Buffet para eventos', 'Churrasco'], ARRAY['Fornecedor de carnes', 'Marketing'], ARRAY['Turismo / Hospitality', 'Serviços Profissionais'], 'Fornecedores e parcerias para eventos', ARRAY['restaurante', 'catering'], NOW() - INTERVAL '1 month'),
  ('aa000000-0000-0000-0000-000000000008', 'Ferreira Insurance Group', 'Serviços Profissionais', 'Seguros para pessoas físicas e empresas', ARRAY['Seguro auto', 'Seguro residencial', 'Seguro empresarial'], ARRAY['Leads qualificados', 'Parcerias com imobiliárias'], ARRAY['Real Estate', 'Construção', 'Automotivo'], 'Parcerias com imobiliárias e construtoras', ARRAY['seguro', 'proteção'], NOW() - INTERVAL '2 weeks')
ON CONFLICT (member_id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- SANDBOX LOADED! Summary:
-- 10 members (4 directors, 4 active, 1 pending, 1 inactive)
-- 9 subscriptions, 8 payments
-- 5 events, 16 registrations
-- 3 chat channels, 10 messages
-- 2 direct conversations, 6 messages
-- 5 posts, 9 comments
-- 10 referral codes (5 active, 5 used), 3 rewards
-- 4 documents, 4 business profiles
-- ═══════════════════════════════════════════════════════════════════
