-- Migration 003: Players, Academies, Scouts tables
-- Must run academies BEFORE players (FK reference)

-- ─── Academies (must be first due to FK) ──────────────────────────────
CREATE TABLE IF NOT EXISTS academies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255),
  sport VARCHAR(100) NOT NULL DEFAULT 'Football',
  region VARCHAR(100),
  city VARCHAR(100),
  description TEXT,
  description_ar TEXT,
  logo_url TEXT,
  cover_url TEXT,
  website_url TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  verified BOOLEAN DEFAULT false,
  rating NUMERIC(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  player_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Players ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255),
  sport VARCHAR(100) NOT NULL DEFAULT 'Football',
  position VARCHAR(50),
  age INTEGER,
  region VARCHAR(100),
  rating INTEGER DEFAULT 0 CHECK (rating >= 0 AND rating <= 100),
  speed INTEGER DEFAULT 0 CHECK (speed >= 0 AND speed <= 100),
  agility INTEGER DEFAULT 0 CHECK (agility >= 0 AND agility <= 100),
  technique INTEGER DEFAULT 0 CHECK (technique >= 0 AND technique <= 100),
  stamina INTEGER DEFAULT 0 CHECK (stamina >= 0 AND stamina <= 100),
  badge VARCHAR(50),
  badge_color VARCHAR(20) DEFAULT '#00DCC8',
  academy_id UUID REFERENCES academies(id) ON DELETE SET NULL,
  academy_name VARCHAR(255),
  avatar_url TEXT,
  bio TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Scouts ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255),
  organization VARCHAR(255),
  organization_ar VARCHAR(255),
  sport VARCHAR(100) NOT NULL DEFAULT 'Football',
  region VARCHAR(100),
  speciality VARCHAR(100),
  experience_years INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  rating NUMERIC(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  reports_count INTEGER DEFAULT 0,
  avatar_url TEXT,
  bio TEXT,
  bio_ar TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Indexes ───────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_players_sport ON players(sport);
CREATE INDEX IF NOT EXISTS idx_players_region ON players(region);
CREATE INDEX IF NOT EXISTS idx_players_rating ON players(rating DESC);
CREATE INDEX IF NOT EXISTS idx_players_academy ON players(academy_id);
CREATE INDEX IF NOT EXISTS idx_academies_sport ON academies(sport);
CREATE INDEX IF NOT EXISTS idx_academies_region ON academies(region);
CREATE INDEX IF NOT EXISTS idx_academies_verified ON academies(verified);
CREATE INDEX IF NOT EXISTS idx_scouts_sport ON scouts(sport);
CREATE INDEX IF NOT EXISTS idx_scouts_region ON scouts(region);
CREATE INDEX IF NOT EXISTS idx_scouts_verified ON scouts(verified);

-- ─── RLS ──────────────────────────────────────────────────────────────
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE academies ENABLE ROW LEVEL SECURITY;
ALTER TABLE scouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players are publicly readable" ON players FOR SELECT USING (true);
CREATE POLICY "Academies are publicly readable" ON academies FOR SELECT USING (true);
CREATE POLICY "Scouts are publicly readable" ON scouts FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert players" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can insert academies" ON academies FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can insert scouts" ON scouts FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update players" ON players FOR UPDATE USING (true);
CREATE POLICY "Users can update academies" ON academies FOR UPDATE USING (true);
CREATE POLICY "Users can update scouts" ON scouts FOR UPDATE USING (true);

-- ─── Seed: Academies (first, due to FK) ──────────────────────────────
INSERT INTO academies (id, name, name_ar, sport, region, city, description, description_ar, rating, player_count, verified) VALUES
  ('b0000001-0000-0000-0000-000000000001', 'Al-Hilal Academy', 'أكاديمية الهلال', 'Football', 'Riyadh', 'Riyadh', 'Premier football academy with world-class facilities.', 'واحدة من أعرق أكاديميات كرة القدم.', 4.8, 120, true),
  ('b0000001-0000-0000-0000-000000000002', 'Al-Ittihad Academy', 'أكاديمية الاتحاد', 'Football', 'Makkah', 'Jeddah', 'Leading academy producing national team players.', 'أكاديمية رائدة تنتج لاعبين للمنتخب.', 4.7, 95, true),
  ('b0000001-0000-0000-0000-000000000003', 'Eastern Province Sports', 'أكاديمية المنطقة الشرقية', 'Athletics', 'Eastern', 'Dammam', 'Comprehensive athletics training center.', 'مركز تدريب شامل لألعاب القوى.', 4.5, 60, true),
  ('b0000001-0000-0000-0000-000000000004', 'Saudi Basketball Federation', 'الاتحاد السعودي لكرة السلة', 'Basketball', 'Riyadh', 'Riyadh', 'National basketball development program.', 'برنامج تطوير كرة السلة الوطني.', 4.3, 45, true),
  ('b0000001-0000-0000-0000-000000000005', 'Al-Ahli Academy', 'أكاديمية الأهلي', 'Football', 'Makkah', 'Jeddah', 'Historic club with strong youth program.', 'نادٍ تاريخي ببرنامج قوي لتطوير الشباب.', 4.6, 88, true),
  ('b0000001-0000-0000-0000-000000000006', 'Saudi Aquatics Federation', 'الاتحاد السعودي للسباحة', 'Swimming', 'Riyadh', 'Riyadh', 'National swimming and aquatic sports center.', 'المركز الوطني للسباحة والرياضات المائية.', 4.2, 35, true),
  ('b0000001-0000-0000-0000-000000000007', 'Al-Wahda Academy', 'أكاديمية الوحدة', 'Football', 'Asir', 'Abha', 'High-altitude training in Asir.', 'أكاديمية تدريب في منطقة عسير.', 4.1, 40, false),
  ('b0000001-0000-0000-0000-000000000008', 'Al-Shabab Academy', 'أكاديمية الشباب', 'Football', 'Hail', 'Hail', 'Youth-focused academy with modern facilities.', 'أكاديمية مركزة على الشباب بمرافق حديثة.', 4.0, 55, false),
  ('b0000001-0000-0000-0000-000000000009', 'Saudi National Training Center', 'المركز الوطني للتدريب', 'Football', 'Riyadh', 'Riyadh', 'Official national team development center.', 'المركز الرسمي لتدريب المنتخب الوطني.', 4.9, 30, true),
  ('b0000001-0000-0000-0000-000000000010', 'Nahda FC Academy', 'أكاديمية نادي النهضة', 'Football', 'Eastern', 'Dammam', 'Emerging academy with strong community ties.', 'أكاديمية ناشئة بروابط مجتمعية قوية.', 4.4, 70, true)
ON CONFLICT (id) DO NOTHING;

-- ─── Seed: Players ─────────────────────────────────────────────────────
INSERT INTO players (id, name, name_ar, sport, position, age, region, rating, speed, agility, technique, badge, badge_color, academy_name) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'Mohammed Al-Qahtani', 'محمد القحطاني', 'Football', 'RW', 17, 'Riyadh', 84, 88, 82, 85, 'TOP TALENT', '#00DCC8', 'Al-Hilal Academy'),
  ('a0000001-0000-0000-0000-000000000002', 'Khalid Al-Ghamdi', 'خالد الغامدي', 'Football', 'CM', 19, 'Jeddah', 78, 74, 80, 79, 'RISING STAR', '#007ABA', 'Al-Ittihad Academy'),
  ('a0000001-0000-0000-0000-000000000003', 'Faisal Al-Shehri', 'فيصل الشهري', 'Athletics', 'Sprint', 16, 'Dammam', 81, 92, 85, 76, 'VERIFIED', '#00DCC8', 'Eastern Province Sports'),
  ('a0000001-0000-0000-0000-000000000004', 'Omar Al-Dosari', 'عمر الدوسري', 'Basketball', 'PG', 18, 'Riyadh', 76, 79, 83, 72, 'PROSPECT', '#FFA500', 'Saudi Basketball Federation'),
  ('a0000001-0000-0000-0000-000000000005', 'Abdullah Al-Harbi', 'عبدالله الحربي', 'Football', 'ST', 20, 'Mecca', 82, 85, 78, 84, 'TOP TALENT', '#00DCC8', 'Al-Ahli Academy'),
  ('a0000001-0000-0000-0000-000000000006', 'Nawaf Al-Mutairi', 'نواف المطيري', 'Swimming', 'Freestyle', 15, 'Riyadh', 79, 88, 80, 77, 'RISING STAR', '#007ABA', 'Saudi Aquatics Federation'),
  ('a0000001-0000-0000-0000-000000000007', 'Turki Al-Zahrani', 'تركي الزهراني', 'Football', 'CB', 18, 'Abha', 75, 72, 76, 74, 'PROSPECT', '#FFA500', 'Al-Wahda Academy'),
  ('a0000001-0000-0000-0000-000000000008', 'Saud Al-Anazi', 'سعود العنزي', 'Football', 'LW', 16, 'Hail', 80, 86, 81, 83, 'RISING STAR', '#007ABA', 'Al-Shabab Academy'),
  ('a0000001-0000-0000-0000-000000000009', 'Majed Al-Otaibi', 'ماجد العتيبي', 'Football', 'GK', 21, 'Riyadh', 73, 70, 75, 71, 'PROSPECT', '#FFA500', 'Saudi National Training Center'),
  ('a0000001-0000-0000-0000-000000000010', 'Yasser Al-Amri', 'ياسر العمري', 'Football', 'CAM', 17, 'Jeddah', 85, 82, 87, 88, 'TOP TALENT', '#00DCC8', 'Al-Ittihad Academy')
ON CONFLICT (id) DO NOTHING;

-- ─── Seed: Scouts ─────────────────────────────────────────────────────
INSERT INTO scouts (id, name, name_ar, organization, organization_ar, sport, region, speciality, experience_years, verified, rating, reports_count) VALUES
  ('c0000001-0000-0000-0000-000000000001', 'Ahmed Al-Rashid', 'أحمد الراشد', 'SAFF', 'الاتحاد السعودي لكرة القدم', 'Football', 'Riyadh', 'Youth Development', 15, true, 4.8, 234),
  ('c0000001-0000-0000-0000-000000000002', 'Mansour Al-Fahad', 'منصور الفهد', 'Al-Hilal FC', 'نادي الهلال', 'Football', 'Riyadh', 'Technical Analysis', 12, true, 4.6, 189),
  ('c0000001-0000-0000-0000-000000000003', 'Hamza Al-Saeed', 'حمزة السعيد', 'Independent', 'مستقل', 'Football', 'Jeddah', 'Talent Identification', 8, true, 4.5, 145),
  ('c0000001-0000-0000-0000-000000000004', 'Sultan Al-Otaibi', 'سلطان العتيبي', 'Eastern Province FA', 'رابطة المنطقة الشرقية', 'Football', 'Dammam', 'Regional Scouting', 10, true, 4.7, 167),
  ('c0000001-0000-0000-0000-000000000005', 'Fahad Al-Zahrani', 'فهد الزهراني', 'Asir Sports Council', 'مجلس عسير الرياضي', 'Football', 'Abha', 'Youth Scouting', 6, false, 4.3, 98),
  ('c0000001-0000-0000-0000-000000000006', 'Nasser Al-Qahtani', 'ناصر القحطاني', 'SAFF', 'الاتحاد السعودي لكرة القدم', 'Football', 'Riyadh', 'National Team Scouting', 20, true, 4.9, 312)
ON CONFLICT (id) DO NOTHING;
