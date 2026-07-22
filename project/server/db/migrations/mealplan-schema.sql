CREATE TABLE IF NOT EXISTS recipes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  ingredients TEXT[] NOT NULL DEFAULT '{}',
  instructions TEXT[] NOT NULL DEFAULT '{}',
  image_url TEXT DEFAULT '',
  diet_type VARCHAR(20) NOT NULL CHECK (diet_type IN ('veg', 'non_veg', 'vegan')),
  calories INT NOT NULL CHECK (calories >= 0),
  protein INT NOT NULL CHECK (protein >= 0),
  carbs INT NOT NULL CHECK (carbs >= 0),
  fats INT NOT NULL CHECK (fats >= 0),
  prep_time_minutes INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS meal_plans (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) DEFAULT 'My Personalized Meal Plan',
  goal VARCHAR(30) DEFAULT 'maintenance',
  start_date VARCHAR(50) DEFAULT '',
  days JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
