-- SANDBOX V2: 23 members, subscriptions, payments, events, posts, chat, referrals, profiles
-- All emails: *@test.bswfcc.com for easy cleanup

-- 1. MEMBERS
INSERT INTO members (id, full_name, email, phone, role, status, company, industry, city, bio, tier_slug, website, instagram, referral_count, created_at) VALUES
('a0000001-0000-4000-8000-000000000001','Carlos Eduardo Silva','carlos.silva@test.bswfcc.com','+1(239)555-1001','presidente','ativo','Silva Construction Group','Construcao','Cape Coral, FL','Fundador da BSWFCC. 18 anos no mercado americano. 2000+ projetos.','trustee','https://silvaconstruction.com','@silvaconstruction',8,NOW()-INTERVAL '14 months'),
('a0000001-0000-4000-8000-000000000002','Ana Paula Oliveira','ana.oliveira@test.bswfcc.com','+1(239)555-1002','vice_presidente','ativo','Oliveira Premier Realty','Real Estate','Fort Myers, FL','Top 1% realtor SW Florida. $45M vendas 2025.','executive','https://oliveirarealty.com','@oliveirarealty',5,NOW()-INTERVAL '13 months'),
('a0000001-0000-4000-8000-000000000003','Rafael Augusto Santos','rafael.santos@test.bswfcc.com','+1(239)555-1003','tesoureiro','ativo','Santos Associates CPA','Contabilidade / Finance','Naples, FL','CPA licenciado FL e NY. Tax planning internacional.','executive','https://santoscpa.com','@santoscpa',3,NOW()-INTERVAL '12 months'),
('a0000001-0000-4000-8000-000000000004','Mariana Costa Ribeiro','mariana.costa@test.bswfcc.com','+1(239)555-1004','diretor_marketing','ativo','Costa Digital Agency','Servicos Profissionais','Bonita Springs, FL','Marketing digital para negocios brasileiros. Google Partner.','business','https://costadigital.com','@costadigital',2,NOW()-INTERVAL '11 months'),
('a0000001-0000-4000-8000-000000000005','Fernando Almeida Souza','fernando.almeida@test.bswfcc.com','+1(239)555-1005','membro','ativo','Almeida Brazilian Steakhouse','Restaurante / Food','Cape Coral, FL','Melhor churrasco do SW Florida. Aberto desde 2019.','business','https://almeidagrill.com','@almeidagrill',1,NOW()-INTERVAL '9 months'),
('a0000001-0000-4000-8000-000000000006','Juliana Mendes Ferreira','juliana.mendes@test.bswfcc.com','+1(239)555-1006','membro','ativo','Mendes Beauty Wellness','Beleza / Estetica','Fort Myers, FL','Estetica avancada: harmonizacao, botox. 3000+ procedimentos.','community',NULL,'@mendesbeauty',0,NOW()-INTERVAL '8 months'),
('a0000001-0000-4000-8000-000000000007','Pedro Henrique Barbosa','pedro.barbosa@test.bswfcc.com','+1(239)555-1007','membro','ativo','Barbosa Immigration Law','Advocacia / Legal','Naples, FL','Advogado imigracao. EB-2 NIW, EB-5, L-1. 95% aprovacao.','business','https://barbosaimm.com','@barbosalaw',2,NOW()-INTERVAL '7 months'),
('a0000001-0000-4000-8000-000000000008','Luciana Ferreira Gomes','luciana.ferreira@test.bswfcc.com','+1(239)555-1008','parceiro_estrategico','ativo','Ferreira Insurance Solutions','Servicos Profissionais','Cape Coral, FL','Seguros completos. Licenciada em 12 estados.','executive','https://ferreirainsurance.com','@ferreirainsurance',1,NOW()-INTERVAL '6 months'),
('a0000001-0000-4000-8000-000000000009','Gustavo Pereira Lima','gustavo.pereira@test.bswfcc.com','+1(239)555-1009','membro','ativo','GP Auto Detailing','Automotivo','Lehigh Acres, FL','Auto detailing premium. Ceramic coating, PPF.','community',NULL,'@gpautodetail',0,NOW()-INTERVAL '5 months'),
('a0000001-0000-4000-8000-000000000010','Beatriz Rodrigues Nunes','beatriz.rodrigues@test.bswfcc.com','+1(239)555-1010','membro','ativo','Bea Travel Tours','Turismo / Hospitality','Fort Myers, FL','Turismo Brasil-EUA. Pacotes Orlando, Miami, NY.','community','https://beatravel.com','@beatravel',0,NOW()-INTERVAL '4 months'),
('a0000001-0000-4000-8000-000000000011','Ricardo Moreira Dias','ricardo.moreira@test.bswfcc.com','+1(239)555-1011','membro','ativo','Moreira Pool Landscape','Construcao','Cape Coral, FL','Piscinas e paisagismo. Licenciado e segurado FL.','business','https://moreirapools.com','@moreirapools',1,NOW()-INTERVAL '3 months'),
('a0000001-0000-4000-8000-000000000012','Camila Araujo Martins','camila.araujo@test.bswfcc.com','+1(239)555-1012','membro','ativo','Araujo Cleaning Pro','Servicos Profissionais','Cape Coral, FL','Limpeza residencial e comercial. 200+ clientes.','community',NULL,'@araujocleaning',0,NOW()-INTERVAL '2 months'),
('a0000001-0000-4000-8000-000000000013','Marcos Vinicius Teixeira','marcos.teixeira@test.bswfcc.com','+1(239)555-1013','membro','ativo','MV Tech Solutions','Tecnologia','Fort Myers, FL','TI para empresas. Redes, cybersecurity, cloud.','business',NULL,'@mvtechfl',0,NOW()-INTERVAL '6 weeks'),
('a0000001-0000-4000-8000-000000000014','Patricia Nascimento','patricia.nascimento@test.bswfcc.com','+1(239)555-1014','membro','ativo','Pati Cakes Desserts','Restaurante / Food','Bonita Springs, FL','Confeitaria artesanal. Brigadeiros gourmet, bolos decorados.','community',NULL,'@paticakes',0,NOW()-INTERVAL '4 weeks'),
('a0000001-0000-4000-8000-000000000015','Andre Luiz Campos','andre.campos@test.bswfcc.com','+1(239)555-1015','voluntario','ativo','Campos Fitness Training','Saude','Cape Coral, FL','Personal trainer NASM. Funcional, crossfit, reab.','community',NULL,'@camposfitness',0,NOW()-INTERVAL '3 weeks'),
('a0000001-0000-4000-8000-000000000016','Isabela Fonseca Costa','isabela.fonseca@test.bswfcc.com','+1(239)555-1016','membro','ativo','Fonseca Interior Design','Servicos Profissionais','Naples, FL','Design de interiores residencial e comercial.','business','https://fonsecadesign.com','@fonsecainteriors',0,NOW()-INTERVAL '2 weeks'),
('a0000001-0000-4000-8000-000000000017','Diego Fernandes','diego.fernandes@test.bswfcc.com','+1(239)555-1017','membro','ativo','DF Painting Drywall','Construcao','Lehigh Acres, FL','Pintura e drywall. 10 anos experiencia.','community',NULL,'@dfpainting',0,NOW()-INTERVAL '10 days'),
('a0000001-0000-4000-8000-000000000018','Renata Souza Pinto','renata.souza@test.bswfcc.com','+1(239)555-1018','membro','ativo','Souza Notary Translation','Servicos Profissionais','Fort Myers, FL','Notary public, traducao juramentada EN/PT/ES.','community',NULL,'@souzanotary',0,NOW()-INTERVAL '7 days'),
('a0000001-0000-4000-8000-000000000019','Roberto Lima Junior','roberto.lima@test.bswfcc.com','+1(239)555-1019','membro','pendente','Lima Electric Services','Construcao','Cape Coral, FL','Eletricista licenciado FL. Residencial e comercial.','community',NULL,NULL,0,NOW()-INTERVAL '2 days'),
('a0000001-0000-4000-8000-000000000020','Tatiana Machado','tatiana.machado@test.bswfcc.com','+1(239)555-1020','membro','pendente','Machado Pet Care','Servicos Profissionais','Fort Myers, FL','Pet sitting, dog walking, grooming.','community',NULL,'@machadopets',0,NOW()-INTERVAL '1 day'),
('a0000001-0000-4000-8000-000000000021','Leandro Costa Neto','leandro.costa@test.bswfcc.com','+1(239)555-1021','membro','pendente','Costa Plumbing LLC','Construcao','Lehigh Acres, FL','Encanador licenciado. Instalacao e reparo.','business',NULL,NULL,0,NOW()-INTERVAL '12 hours'),
('a0000001-0000-4000-8000-000000000022','Sandra Vieira','sandra.vieira@test.bswfcc.com','+1(239)555-1022','membro','inativo','Vieira Tutoring','Educacao','Cape Coral, FL','Aulas de portugues e matematica para criancas.','community',NULL,NULL,0,NOW()-INTERVAL '11 months'),
('a0000001-0000-4000-8000-000000000023','Fabio Carvalho','fabio.carvalho@test.bswfcc.com','+1(239)555-1023','membro','inativo','Carvalho Photo Video','Servicos Profissionais','Fort Myers, FL','Fotografia e video. Drone certificado FAA.','community',NULL,'@carvalhophoto',0,NOW()-INTERVAL '9 months')
ON CONFLICT (email) DO NOTHING;

-- Referral chains
UPDATE members SET referred_by='a0000001-0000-4000-8000-000000000001' WHERE id IN ('a0000001-0000-4000-8000-000000000005','a0000001-0000-4000-8000-000000000006','a0000001-0000-4000-8000-000000000009','a0000001-0000-4000-8000-000000000011','a0000001-0000-4000-8000-000000000012','a0000001-0000-4000-8000-000000000014','a0000001-0000-4000-8000-000000000017','a0000001-0000-4000-8000-000000000019');
UPDATE members SET referred_by='a0000001-0000-4000-8000-000000000002' WHERE id IN ('a0000001-0000-4000-8000-000000000008','a0000001-0000-4000-8000-000000000010','a0000001-0000-4000-8000-000000000013','a0000001-0000-4000-8000-000000000016','a0000001-0000-4000-8000-000000000020');
UPDATE members SET referred_by='a0000001-0000-4000-8000-000000000003' WHERE id IN ('a0000001-0000-4000-8000-000000000007','a0000001-0000-4000-8000-000000000015','a0000001-0000-4000-8000-000000000018');
UPDATE members SET referred_by='a0000001-0000-4000-8000-000000000007' WHERE id='a0000001-0000-4000-8000-000000000021';
UPDATE members SET referred_by='a0000001-0000-4000-8000-000000000004' WHERE id IN ('a0000001-0000-4000-8000-000000000022','a0000001-0000-4000-8000-000000000023');

-- 2. SUBSCRIPTIONS (18 active, 1 canceled, 2 free)
INSERT INTO subscriptions (member_id, tier_id, status, current_period_start, current_period_end) VALUES
('a0000001-0000-4000-8000-000000000001','d64d2173-8b22-482b-8d0a-353822ca2b8b','active',NOW()-INTERVAL '1 month',NOW()+INTERVAL '11 months'),
('a0000001-0000-4000-8000-000000000002','f54ca600-51fe-4236-861a-396b5737eef1','active',NOW()-INTERVAL '2 months',NOW()+INTERVAL '10 months'),
('a0000001-0000-4000-8000-000000000003','f54ca600-51fe-4236-861a-396b5737eef1','active',NOW()-INTERVAL '1 month',NOW()+INTERVAL '11 months'),
('a0000001-0000-4000-8000-000000000004','1f9d87e8-d412-4f17-9f87-cd2143a408a4','active',NOW()-INTERVAL '3 months',NOW()+INTERVAL '9 months'),
('a0000001-0000-4000-8000-000000000005','1f9d87e8-d412-4f17-9f87-cd2143a408a4','active',NOW()-INTERVAL '2 months',NOW()+INTERVAL '10 months'),
('a0000001-0000-4000-8000-000000000006','7fe20dcc-fcd7-4fec-bb75-f963f025c20c','active',NOW()-INTERVAL '1 month',NOW()+INTERVAL '11 months'),
('a0000001-0000-4000-8000-000000000007','1f9d87e8-d412-4f17-9f87-cd2143a408a4','active',NOW()-INTERVAL '1 month',NOW()+INTERVAL '11 months'),
('a0000001-0000-4000-8000-000000000008','f54ca600-51fe-4236-861a-396b5737eef1','active',NOW()-INTERVAL '1 month',NOW()+INTERVAL '11 months'),
('a0000001-0000-4000-8000-000000000009','7fe20dcc-fcd7-4fec-bb75-f963f025c20c','active',NOW()-INTERVAL '2 months',NOW()+INTERVAL '10 months'),
('a0000001-0000-4000-8000-000000000010','7fe20dcc-fcd7-4fec-bb75-f963f025c20c','active',NOW()-INTERVAL '1 month',NOW()+INTERVAL '11 months'),
('a0000001-0000-4000-8000-000000000011','1f9d87e8-d412-4f17-9f87-cd2143a408a4','active',NOW()-INTERVAL '1 month',NOW()+INTERVAL '11 months'),
('a0000001-0000-4000-8000-000000000012','7fe20dcc-fcd7-4fec-bb75-f963f025c20c','active',NOW()-INTERVAL '1 month',NOW()+INTERVAL '11 months'),
('a0000001-0000-4000-8000-000000000013','1f9d87e8-d412-4f17-9f87-cd2143a408a4','active',NOW()-INTERVAL '3 weeks',NOW()+INTERVAL '11 months'),
('a0000001-0000-4000-8000-000000000014','7fe20dcc-fcd7-4fec-bb75-f963f025c20c','active',NOW()-INTERVAL '2 weeks',NOW()+INTERVAL '11 months'),
('a0000001-0000-4000-8000-000000000015','7fe20dcc-fcd7-4fec-bb75-f963f025c20c','free',NOW()-INTERVAL '2 weeks',NOW()+INTERVAL '11 months'),
('a0000001-0000-4000-8000-000000000016','1f9d87e8-d412-4f17-9f87-cd2143a408a4','active',NOW()-INTERVAL '1 week',NOW()+INTERVAL '11 months'),
('a0000001-0000-4000-8000-000000000022','7fe20dcc-fcd7-4fec-bb75-f963f025c20c','canceled',NOW()-INTERVAL '8 months',NOW()-INTERVAL '2 months'),
('a0000001-0000-4000-8000-000000000023','7fe20dcc-fcd7-4fec-bb75-f963f025c20c','canceled',NOW()-INTERVAL '6 months',NOW()-INTERVAL '1 month')
ON CONFLICT (member_id) DO NOTHING;

-- 3. PAYMENTS (realistic revenue data across months)
INSERT INTO payments (member_id, amount, status, description, created_at) VALUES
('a0000001-0000-4000-8000-000000000001',1800000,'succeeded','Anuidade Trustee 2025-2026',NOW()-INTERVAL '12 months'),
('a0000001-0000-4000-8000-000000000002',600000,'succeeded','Anuidade Executive',NOW()-INTERVAL '11 months'),
('a0000001-0000-4000-8000-000000000003',600000,'succeeded','Anuidade Executive',NOW()-INTERVAL '10 months'),
('a0000001-0000-4000-8000-000000000004',15000,'succeeded','Mensalidade Business Mar',NOW()-INTERVAL '30 days'),
('a0000001-0000-4000-8000-000000000004',15000,'succeeded','Mensalidade Business Fev',NOW()-INTERVAL '60 days'),
('a0000001-0000-4000-8000-000000000004',15000,'succeeded','Mensalidade Business Jan',NOW()-INTERVAL '90 days'),
('a0000001-0000-4000-8000-000000000005',15000,'succeeded','Mensalidade Business Mar',NOW()-INTERVAL '25 days'),
('a0000001-0000-4000-8000-000000000005',15000,'succeeded','Mensalidade Business Fev',NOW()-INTERVAL '55 days'),
('a0000001-0000-4000-8000-000000000006',5000,'succeeded','Mensalidade Community Mar',NOW()-INTERVAL '20 days'),
('a0000001-0000-4000-8000-000000000007',15000,'succeeded','Mensalidade Business Mar',NOW()-INTERVAL '18 days'),
('a0000001-0000-4000-8000-000000000008',50000,'succeeded','Mensalidade Executive Mar',NOW()-INTERVAL '15 days'),
('a0000001-0000-4000-8000-000000000009',5000,'succeeded','Mensalidade Community Mar',NOW()-INTERVAL '12 days'),
('a0000001-0000-4000-8000-000000000010',5000,'succeeded','Mensalidade Community Mar',NOW()-INTERVAL '10 days'),
('a0000001-0000-4000-8000-000000000011',15000,'succeeded','Mensalidade Business Mar',NOW()-INTERVAL '8 days'),
('a0000001-0000-4000-8000-000000000012',5000,'succeeded','Mensalidade Community Mar',NOW()-INTERVAL '6 days'),
('a0000001-0000-4000-8000-000000000013',15000,'succeeded','Mensalidade Business Mar',NOW()-INTERVAL '5 days'),
('a0000001-0000-4000-8000-000000000014',5000,'succeeded','Mensalidade Community Mar',NOW()-INTERVAL '4 days'),
('a0000001-0000-4000-8000-000000000016',15000,'succeeded','Mensalidade Business Mar',NOW()-INTERVAL '3 days'),
('a0000001-0000-4000-8000-000000000011',15000,'succeeded','Mensalidade Business Fev',NOW()-INTERVAL '38 days'),
('a0000001-0000-4000-8000-000000000008',50000,'succeeded','Mensalidade Executive Fev',NOW()-INTERVAL '45 days');

-- 4. EVENTS (3 future, 2 past)
INSERT INTO events (id, title, description, date, time, location, type, max_attendees, is_public, check_in_enabled, created_at) VALUES
('e0000001-0000-4000-8000-000000000001','Networking Happy Hour - Abril','Encontro mensal. Open bar e appetizers. Traga seus cartoes!',(CURRENT_DATE+INTERVAL '7 days')::date,'18:00','Boat House Tiki Bar, Cape Coral','networking',50,true,true,NOW()-INTERVAL '14 days'),
('e0000001-0000-4000-8000-000000000002','Workshop: Empresa nos EUA','Passo-a-passo: LLC, EIN, conta bancaria, compliance.',(CURRENT_DATE+INTERVAL '14 days')::date,'19:00','BSWFCC Office, Fort Myers','workshop',30,true,false,NOW()-INTERVAL '7 days'),
('e0000001-0000-4000-8000-000000000003','Gala Anual BSWFCC 2026','Premiacao, jantar de gala, show ao vivo.',(CURRENT_DATE+INTERVAL '60 days')::date,'19:00','Hyatt Regency, Bonita Springs','gala',200,true,true,NOW()-INTERVAL '30 days'),
('e0000001-0000-4000-8000-000000000004','Almoco Executivo - Marco','Tema: Mercado imobiliario 2026. Exclusivo Executive+.',(CURRENT_DATE-INTERVAL '5 days')::date,'12:00','Fogo de Chao, Naples','almoco',20,false,true,NOW()-INTERVAL '35 days'),
('e0000001-0000-4000-8000-000000000005','Palestra: Marketing Digital','Estrategias que funcionam para negocios locais.',(CURRENT_DATE-INTERVAL '15 days')::date,'19:30','Virtual Zoom','palestra',100,true,false,NOW()-INTERVAL '45 days');

-- Event registrations (realistic mix)
INSERT INTO event_registrations (event_id, member_id, status) VALUES
('e0000001-0000-4000-8000-000000000001','a0000001-0000-4000-8000-000000000001','confirmado'),
('e0000001-0000-4000-8000-000000000001','a0000001-0000-4000-8000-000000000002','confirmado'),
('e0000001-0000-4000-8000-000000000001','a0000001-0000-4000-8000-000000000004','confirmado'),
('e0000001-0000-4000-8000-000000000001','a0000001-0000-4000-8000-000000000005','confirmado'),
('e0000001-0000-4000-8000-000000000001','a0000001-0000-4000-8000-000000000006','confirmado'),
('e0000001-0000-4000-8000-000000000001','a0000001-0000-4000-8000-000000000007','confirmado'),
('e0000001-0000-4000-8000-000000000001','a0000001-0000-4000-8000-000000000008','confirmado'),
('e0000001-0000-4000-8000-000000000001','a0000001-0000-4000-8000-000000000011','confirmado'),
('e0000001-0000-4000-8000-000000000001','a0000001-0000-4000-8000-000000000013','lista_espera'),
('e0000001-0000-4000-8000-000000000002','a0000001-0000-4000-8000-000000000001','confirmado'),
('e0000001-0000-4000-8000-000000000002','a0000001-0000-4000-8000-000000000003','confirmado'),
('e0000001-0000-4000-8000-000000000002','a0000001-0000-4000-8000-000000000007','confirmado'),
('e0000001-0000-4000-8000-000000000002','a0000001-0000-4000-8000-000000000009','confirmado'),
('e0000001-0000-4000-8000-000000000002','a0000001-0000-4000-8000-000000000012','confirmado'),
('e0000001-0000-4000-8000-000000000003','a0000001-0000-4000-8000-000000000001','confirmado'),
('e0000001-0000-4000-8000-000000000003','a0000001-0000-4000-8000-000000000002','confirmado'),
('e0000001-0000-4000-8000-000000000003','a0000001-0000-4000-8000-000000000003','confirmado'),
('e0000001-0000-4000-8000-000000000003','a0000001-0000-4000-8000-000000000004','confirmado'),
('e0000001-0000-4000-8000-000000000003','a0000001-0000-4000-8000-000000000005','confirmado'),
('e0000001-0000-4000-8000-000000000003','a0000001-0000-4000-8000-000000000008','confirmado'),
('e0000001-0000-4000-8000-000000000004','a0000001-0000-4000-8000-000000000001','confirmado'),
('e0000001-0000-4000-8000-000000000004','a0000001-0000-4000-8000-000000000002','confirmado'),
('e0000001-0000-4000-8000-000000000004','a0000001-0000-4000-8000-000000000003','confirmado'),
('e0000001-0000-4000-8000-000000000004','a0000001-0000-4000-8000-000000000008','confirmado'),
('e0000001-0000-4000-8000-000000000005','a0000001-0000-4000-8000-000000000004','confirmado'),
('e0000001-0000-4000-8000-000000000005','a0000001-0000-4000-8000-000000000006','confirmado'),
('e0000001-0000-4000-8000-000000000005','a0000001-0000-4000-8000-000000000010','confirmado'),
('e0000001-0000-4000-8000-000000000005','a0000001-0000-4000-8000-000000000013','confirmado'),
('e0000001-0000-4000-8000-000000000005','a0000001-0000-4000-8000-000000000014','confirmado')
ON CONFLICT DO NOTHING;

-- 5. POSTS (8 posts with variety)
INSERT INTO posts (author_id, category, title, content, is_pinned, is_opportunity, opportunity_type, tags, likes_count, comments_count, created_at) VALUES
('a0000001-0000-4000-8000-000000000001','anuncio','Bem-vindos a Plataforma BSWFCC!','Membros, lancamos nossa plataforma digital! Networking, oportunidades, eventos e muito mais. Indiquem empresarios brasileiros!',true,false,NULL,ARRAY['plataforma','lancamento'],12,4,NOW()-INTERVAL '12 months'),
('a0000001-0000-4000-8000-000000000005','oportunidade','Procuro Fornecedor de Carnes','Preciso de fornecedor confiavel de picanha, fraldinha, linguica na regiao de SW Florida.',false,true,'procura',ARRAY['restaurante','fornecedor'],5,3,NOW()-INTERVAL '8 days'),
('a0000001-0000-4000-8000-000000000008','oportunidade','15% Desconto Seguros para Membros','Membros BSWFCC tem 15% off em todos os planos. Health, auto, home, business. Valido ate fim do mes!',false,true,'oferta',ARRAY['seguro','desconto'],8,2,NOW()-INTERVAL '5 days'),
('a0000001-0000-4000-8000-000000000004','evento','Resumo: Happy Hour Marco','35 membros presentes, 12 conexoes de negocio formadas! Proximo sera ainda melhor.',false,false,NULL,ARRAY['networking','resumo'],15,6,NOW()-INTERVAL '12 days'),
('a0000001-0000-4000-8000-000000000007','discussao','Melhor Banco para LLC?','Clientes perguntando qual banco para conta de empresa. Chase? BofA? Mercury? Experiencias?',false,false,NULL,ARRAY['banco','empresa'],9,8,NOW()-INTERVAL '6 days'),
('a0000001-0000-4000-8000-000000000011','oportunidade','Promocao Piscinas - Abril','Construcao de piscina com 10% off para membros BSWFCC. Inclui projeto 3D gratis.',false,true,'oferta',ARRAY['piscina','construcao','promocao'],6,2,NOW()-INTERVAL '3 days'),
('a0000001-0000-4000-8000-000000000002','parceria','Parceria Imobiliaria + Construcao','Buscando parceiros construtores para projetos de investimento. Terrenos ja adquiridos em Cape Coral.',false,false,NULL,ARRAY['parceria','imoveis','construcao'],11,5,NOW()-INTERVAL '4 days'),
('a0000001-0000-4000-8000-000000000013','discussao','Cybersecurity para Small Business','Ataques de phishing estao aumentando. Dicas basicas que todo empresario deve seguir.',false,false,NULL,ARRAY['seguranca','tecnologia'],4,3,NOW()-INTERVAL '2 days');

-- Post comments
INSERT INTO post_comments (post_id, author_id, content, created_at)
SELECT p.id, 'a0000001-0000-4000-8000-000000000002', 'Parabens Carlos! Plataforma ficou incrivel.', NOW()-INTERVAL '12 months'+INTERVAL '2 hours'
FROM posts p WHERE p.title LIKE 'Bem-vindos%' LIMIT 1;
INSERT INTO post_comments (post_id, author_id, content, created_at)
SELECT p.id, 'a0000001-0000-4000-8000-000000000005', 'Ja estou indicando pra todo mundo!', NOW()-INTERVAL '12 months'+INTERVAL '5 hours'
FROM posts p WHERE p.title LIKE 'Bem-vindos%' LIMIT 1;
INSERT INTO post_comments (post_id, author_id, content, created_at)
SELECT p.id, 'a0000001-0000-4000-8000-000000000001', 'Fernando, conheco fornecedor excelente. Te mando DM.', NOW()-INTERVAL '7 days'
FROM posts p WHERE p.title LIKE 'Procuro Fornecedor%' LIMIT 1;
INSERT INTO post_comments (post_id, author_id, content, created_at)
SELECT p.id, 'a0000001-0000-4000-8000-000000000003', 'Chase Business e o melhor custo-beneficio.', NOW()-INTERVAL '5 days'
FROM posts p WHERE p.title LIKE 'Melhor Banco%' LIMIT 1;
INSERT INTO post_comments (post_id, author_id, content, created_at)
SELECT p.id, 'a0000001-0000-4000-8000-000000000002', 'Mercury e excelente para LLC. Tudo online.', NOW()-INTERVAL '5 days'+INTERVAL '1 hour'
FROM posts p WHERE p.title LIKE 'Melhor Banco%' LIMIT 1;
INSERT INTO post_comments (post_id, author_id, content, created_at)
SELECT p.id, 'a0000001-0000-4000-8000-000000000001', 'Ana, tenho interesse! Vamos conversar.', NOW()-INTERVAL '3 days'
FROM posts p WHERE p.title LIKE 'Parceria Imobiliaria%' LIMIT 1;

-- 6. CHAT MESSAGES (on default channel)
INSERT INTO chat_messages (channel_id, sender_id, content, created_at) VALUES
('68739b08-f9e9-4ce0-8b4b-858627cf8521','a0000001-0000-4000-8000-000000000001','Bom dia pessoal! Lembrem do networking semana que vem.',NOW()-INTERVAL '3 days'),
('68739b08-f9e9-4ce0-8b4b-858627cf8521','a0000001-0000-4000-8000-000000000002','Bom dia Carlos! Ja confirmei presenca.',NOW()-INTERVAL '3 days'+INTERVAL '15 minutes'),
('68739b08-f9e9-4ce0-8b4b-858627cf8521','a0000001-0000-4000-8000-000000000005','Pessoal, promocao de buffet no restaurante essa semana! Membros BSWFCC ganham sobremesa.',NOW()-INTERVAL '2 days'),
('68739b08-f9e9-4ce0-8b4b-858627cf8521','a0000001-0000-4000-8000-000000000006','Fernando, vou levar a equipe la amanha!',NOW()-INTERVAL '2 days'+INTERVAL '30 minutes'),
('68739b08-f9e9-4ce0-8b4b-858627cf8521','a0000001-0000-4000-8000-000000000007','Alguem precisa de ajuda com visto? Estou com agenda aberta essa semana.',NOW()-INTERVAL '1 day'),
('68739b08-f9e9-4ce0-8b4b-858627cf8521','a0000001-0000-4000-8000-000000000009','Pedro, tenho um amigo que precisa. Vou passar seu contato!',NOW()-INTERVAL '1 day'+INTERVAL '20 minutes'),
('68739b08-f9e9-4ce0-8b4b-858627cf8521','a0000001-0000-4000-8000-000000000008','Renovacao de seguros ate dia 15 com desconto especial para membros!',NOW()-INTERVAL '12 hours'),
('68739b08-f9e9-4ce0-8b4b-858627cf8521','a0000001-0000-4000-8000-000000000011','Terminei uma piscina linda em Cape Coral. Posto fotos depois!',NOW()-INTERVAL '6 hours'),
('68739b08-f9e9-4ce0-8b4b-858627cf8521','a0000001-0000-4000-8000-000000000004','Pessoal, preparem-se para o networking! Vai ter surpresa.',NOW()-INTERVAL '2 hours'),
('68739b08-f9e9-4ce0-8b4b-858627cf8521','a0000001-0000-4000-8000-000000000013','Quem precisar de suporte de TI, estou a disposicao!',NOW()-INTERVAL '1 hour');

-- 7. REFERRAL CODES (active + used)
INSERT INTO referral_codes (member_id, code, is_active, created_at) VALUES
('a0000001-0000-4000-8000-000000000001','CARLOS26',true,NOW()-INTERVAL '6 months'),
('a0000001-0000-4000-8000-000000000002','ANA2026X',true,NOW()-INTERVAL '5 months'),
('a0000001-0000-4000-8000-000000000003','RAFAEL7K',true,NOW()-INTERVAL '4 months'),
('a0000001-0000-4000-8000-000000000004','MARI4MKT',true,NOW()-INTERVAL '3 months'),
('a0000001-0000-4000-8000-000000000007','PEDR08LW',true,NOW()-INTERVAL '2 months'),
('a0000001-0000-4000-8000-000000000011','RICARDO1',true,NOW()-INTERVAL '1 month')
ON CONFLICT DO NOTHING;

INSERT INTO referral_codes (member_id, code, is_active, used_by, used_at, created_at) VALUES
('a0000001-0000-4000-8000-000000000001','CARL0S01',false,'a0000001-0000-4000-8000-000000000005',NOW()-INTERVAL '9 months',NOW()-INTERVAL '10 months'),
('a0000001-0000-4000-8000-000000000001','CARL0S02',false,'a0000001-0000-4000-8000-000000000006',NOW()-INTERVAL '8 months',NOW()-INTERVAL '9 months'),
('a0000001-0000-4000-8000-000000000001','CARL0S03',false,'a0000001-0000-4000-8000-000000000009',NOW()-INTERVAL '5 months',NOW()-INTERVAL '6 months'),
('a0000001-0000-4000-8000-000000000002','ANA00001',false,'a0000001-0000-4000-8000-000000000008',NOW()-INTERVAL '6 months',NOW()-INTERVAL '7 months'),
('a0000001-0000-4000-8000-000000000002','ANA00002',false,'a0000001-0000-4000-8000-000000000010',NOW()-INTERVAL '4 months',NOW()-INTERVAL '5 months'),
('a0000001-0000-4000-8000-000000000003','RAF00001',false,'a0000001-0000-4000-8000-000000000007',NOW()-INTERVAL '7 months',NOW()-INTERVAL '8 months')
ON CONFLICT DO NOTHING;

-- 8. REFERRAL REWARDS
INSERT INTO referral_rewards (member_id, reward_type, status, milestone, discount_pct, label, earned_at) VALUES
('a0000001-0000-4000-8000-000000000001','discount_10','redeemed',1,10,'10% desconto anuidade',NOW()-INTERVAL '9 months'),
('a0000001-0000-4000-8000-000000000001','discount_20','earned',3,20,'20% desconto anuidade',NOW()-INTERVAL '5 months'),
('a0000001-0000-4000-8000-000000000001','vip_ambassador','earned',5,50,'VIP Ambassador + 50% anuidade',NOW()-INTERVAL '2 months'),
('a0000001-0000-4000-8000-000000000002','discount_10','earned',1,10,'10% desconto anuidade',NOW()-INTERVAL '6 months'),
('a0000001-0000-4000-8000-000000000002','discount_20','earned',3,20,'20% desconto anuidade',NOW()-INTERVAL '2 months'),
('a0000001-0000-4000-8000-000000000003','discount_10','earned',1,10,'10% desconto anuidade',NOW()-INTERVAL '4 months')
ON CONFLICT DO NOTHING;

-- 9. BUSINESS PROFILES (for matchmaking + networking)
INSERT INTO business_profiles (member_id, business_name, business_type, description, services_offered, services_needed, target_industries, looking_for, tags, updated_at) VALUES
('a0000001-0000-4000-8000-000000000001','Silva Construction','service','Construcao residencial e comercial',ARRAY['Construcao residencial','Reforma comercial','Project management'],ARRAY['Marketing digital','Contabilidade'],ARRAY['Real Estate','Restaurante / Food'],ARRAY['Parceiros imobiliarios','Subcontratados'],ARRAY['construcao','reforma'],NOW()-INTERVAL '3 months'),
('a0000001-0000-4000-8000-000000000002','Oliveira Realty','service','Compra venda imoveis para brasileiros',ARRAY['Venda de imoveis','Property management','Consultoria'],ARRAY['Fotografia','Staging','Construcao'],ARRAY['Construcao','Advocacia'],ARRAY['Investidores brasileiros','Construtores'],ARRAY['imoveis','investimento'],NOW()-INTERVAL '2 months'),
('a0000001-0000-4000-8000-000000000005','Almeida Steakhouse','product','Churrascaria brasileira autentica',ARRAY['Catering','Buffet eventos','Churrasco'],ARRAY['Fornecedor carnes','Marketing'],ARRAY['Turismo','Servicos'],ARRAY['Fornecedores','Eventos corporativos'],ARRAY['restaurante','catering'],NOW()-INTERVAL '1 month'),
('a0000001-0000-4000-8000-000000000007','Barbosa Immigration','service','Escritorio imigracao especializado',ARRAY['Visto EB-2','Visto E-2','Green card','Cidadania'],ARRAY['Marketing','Contabilidade'],ARRAY['Real Estate','Construcao'],ARRAY['Clientes brasileiros','Parcerias contabeis'],ARRAY['imigracao','visto'],NOW()-INTERVAL '3 weeks'),
('a0000001-0000-4000-8000-000000000008','Ferreira Insurance','service','Seguros completos',ARRAY['Seguro auto','Seguro residencial','Seguro empresarial','Health'],ARRAY['Leads qualificados'],ARRAY['Real Estate','Construcao','Automotivo'],ARRAY['Parcerias imobiliarias','Construtoras'],ARRAY['seguro','protecao'],NOW()-INTERVAL '2 weeks'),
('a0000001-0000-4000-8000-000000000011','Moreira Pools','service','Piscinas e paisagismo',ARRAY['Construcao piscina','Manutencao','Paisagismo'],ARRAY['Marketing','Fotografia'],ARRAY['Real Estate','Construcao'],ARRAY['Parceiros imobiliarios','Construtores'],ARRAY['piscina','paisagismo'],NOW()-INTERVAL '2 weeks'),
('a0000001-0000-4000-8000-000000000013','MV Tech','service','TI para empresas',ARRAY['Suporte TI','Cybersecurity','Cloud migration','Redes'],ARRAY['Clientes empresariais'],ARRAY['Construcao','Real Estate','Advocacia'],ARRAY['Empresas locais','Escritorios'],ARRAY['tecnologia','suporte'],NOW()-INTERVAL '1 week'),
('a0000001-0000-4000-8000-000000000016','Fonseca Design','service','Design interiores',ARRAY['Projeto residencial','Projeto comercial','Consultoria'],ARRAY['Construtores','Imobiliarias'],ARRAY['Construcao','Real Estate'],ARRAY['Projetos novos','Parcerias'],ARRAY['design','interiores'],NOW()-INTERVAL '1 week')
ON CONFLICT (member_id) DO NOTHING;

-- 10. DOCUMENTS
INSERT INTO documents (title, description, category, access_level, file_url, tags, is_pinned, uploaded_by, created_at) VALUES
('Estatuto Social BSWFCC','Estatuto social da camara - versao vigente','legal','member','https://docs.google.com/document/d/estatuto',ARRAY['estatuto','legal'],true,'a0000001-0000-4000-8000-000000000001',NOW()-INTERVAL '12 months'),
('Guia do Novo Membro','Tudo sobre beneficios, canais, eventos e contatos','guides','member','https://docs.google.com/document/d/guia',ARRAY['onboarding','guia'],true,'a0000001-0000-4000-8000-000000000004',NOW()-INTERVAL '10 months'),
('Relatorio Financeiro Q1 2026','Receitas, despesas e projecoes do Q1','financial','admin',NULL,ARRAY['financeiro','Q1'],false,'a0000001-0000-4000-8000-000000000003',NOW()-INTERVAL '1 month'),
('Template Proposta Comercial','Template oficial para parcerias','templates','member','https://docs.google.com/document/d/proposta',ARRAY['template','proposta'],false,'a0000001-0000-4000-8000-000000000004',NOW()-INTERVAL '6 months'),
('Ata Reuniao Diretoria Mar 2026','Decisoes, votacoes e proximos passos','operations','executive',NULL,ARRAY['ata','diretoria'],false,'a0000001-0000-4000-8000-000000000001',NOW()-INTERVAL '5 days'),
('Lista de Fornecedores Verificados','Fornecedores recomendados pela camara','guides','member','https://docs.google.com/spreadsheets/d/fornecedores',ARRAY['fornecedores','lista'],false,'a0000001-0000-4000-8000-000000000002',NOW()-INTERVAL '2 months');
