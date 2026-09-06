-- Faculty Management System: complete 22-department seed for the 2024 curriculum.
-- Safe for existing MySQL databases: INSERT IGNORE avoids duplicate dept_code errors.

INSERT IGNORE INTO departments (dept_code, dept_name) VALUES
  ('CS',    'Computer Science & Engineering'),
  ('IT',    'Information Technology'),
  ('AIML',  'Artificial Intelligence & Machine Learning'),
  ('DS',    'Data Science'),
  ('CYBER', 'Cyber Security'),
  ('SE',    'Software Engineering'),
  ('CLOUD', 'Cloud Computing'),
  ('BCA',   'Computer Applications'),
  ('ECE',   'Electronics & Communication'),
  ('EE',    'Electrical Engineering'),
  ('ME',    'Mechanical Engineering'),
  ('CE',    'Civil Engineering'),
  ('AUTO',  'Automobile Engineering'),
  ('RA',    'Robotics & Automation'),
  ('BT',    'Biotechnology'),
  ('BME',   'Biomedical Engineering'),
  ('MATH',  'Mathematics'),
  ('PHY',   'Physics'),
  ('CHEM',  'Chemistry'),
  ('CM',    'Commerce & Management'),
  ('ENG',   'English & Communication'),
  ('BBA',   'Bachelor of Business Administration');

-- Compatibility aliases/additional departments used by older installations.
INSERT IGNORE INTO departments (dept_code, dept_name) VALUES
  ('AI',      'Artificial Intelligence & Machine Learning'),
  ('CSE-DS',  'Computer Science & Engineering (Data Science)'),
  ('CSE-AI',  'Computer Science & Engineering (Artificial Intelligence)'),
  ('EEE',     'Electrical & Electronics Engineering'),
  ('AE',      'Automobile Engineering'),
  ('CHE',     'Chemical Engineering'),
  ('AERO',    'Aerospace Engineering'),
  ('BIO',     'Biotechnology'),
  ('ARCH',    'Architecture'),
  ('MCOM',    'Master of Commerce'),
  ('MSC-CS',  'M.Sc. Computer Science'),
  ('MSC-IT',  'M.Sc. Information Technology'),
  ('COM',     'Commerce & Management'),
  ('LAW',     'Law'),
  ('EDU',     'Education');
