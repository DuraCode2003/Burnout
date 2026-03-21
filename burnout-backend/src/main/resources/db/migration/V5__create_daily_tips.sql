CREATE TABLE IF NOT EXISTS daily_tips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    display_date DATE UNIQUE
);

-- Seed some initial tips
INSERT INTO daily_tips (content, category, display_date) VALUES 
('Practice the 5-4-3-2-1 grounding technique: Notice 5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste.', 'Mindfulness', CURRENT_DATE),
('Take a short walk between classes. Even 5 minutes of fresh air can reset your focus.', 'Physical', CURRENT_DATE + INTERVAL '1 day'),
('Progressive Muscle Relaxation: Tense and then release each muscle group, starting from your toes up to your head.', 'Stress Management', CURRENT_DATE + INTERVAL '2 days'),
('Digital Detox: Try to spend the first hour after waking up without checking your phone.', 'Focus', CURRENT_DATE + INTERVAL '3 days'),
('Hydration is key: Dehydration can lead to fatigue and poor concentration. Keep a water bottle handy.', 'Physical', CURRENT_DATE + INTERVAL '4 days');
