-- Faculty Management System: additional departments
-- Safe for existing databases: INSERT IGNORE avoids duplicate dept_code errors.

INSERT IGNORE INTO departments (dept_code, dept_name) VALUES
  ('AI',      'Artificial Intelligence & Machine Learning'),
  ('DS',      'Data Science'),
  ('CSE-DS',  'Computer Science & Engineering (Data Science)'),
  ('CSE-AI',  'Computer Science & Engineering (Artificial Intelligence)'),
  ('EEE',     'Electrical & Electronics Engineering'),
  ('AE',      'Automobile Engineering'),
  ('CHE',     'Chemical Engineering'),
  ('AERO',    'Aerospace Engineering'),
  ('BIO',     'Biotechnology'),
  ('BME',     'Biomedical Engineering'),
  ('ARCH',    'Architecture'),
  ('MCOM',    'Master of Commerce'),
  ('MSC-CS',  'M.Sc. Computer Science'),
  ('MSC-IT',  'M.Sc. Information Technology'),
  ('MATH',    'Mathematics'),
  ('PHY',     'Physics'),
  ('CHEM',    'Chemistry'),
  ('ENG',     'English & Communication Skills'),
  ('COM',     'Commerce & Management'),
  ('LAW',     'Law'),
  ('EDU',     'Education');

-- Existing schema.sql already contains these core departments:
-- CS, IT, ME, CE, EE, ECE, MBA, MCA.
