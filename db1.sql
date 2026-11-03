SHOW DATABASES;
USE registration_db;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    number VARCHAR(15) NOT NULL
);
SHOW TABLES;
DESC users;
CREATE TABLE complaints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    mobile_number VARCHAR(10) NOT NULL,
    customer_email VARCHAR(150) NOT NULL,
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    pincode VARCHAR(6) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
DESCRIBE complaints;
ALTER TABLE complaints
ADD COLUMN category VARCHAR(50) NULL DEFAULT NULL;

SELECT id, subject, category
FROM complaints
WHERE id = 10;

CREATE TABLE states (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE districts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    state_id INT NOT NULL,
    FOREIGN KEY (state_id) REFERENCES states(id)
);
DESCRIBE states;
DESCRIBE districts;


INSERT INTO states (name) VALUES
('Andhra Pradesh'),
('Arunachal Pradesh'),
('Assam'),
('Bihar'),
('Chhattisgarh'),
('Goa'),
('Gujarat'),
('Haryana'),
('Himachal Pradesh'),
('Jharkhand'),
('Karnataka'),
('Kerala'),
('Madhya Pradesh'),
('Maharashtra'),
('Manipur'),
('Meghalaya'),
('Mizoram'),
('Nagaland'),
('Odisha'),
('Punjab'),
('Rajasthan'),
('Sikkim'),
('Tamil Nadu'),
('Telangana'),
('Tripura'),
('Uttar Pradesh'),
('Uttarakhand'),
('West Bengal'),
('Andaman and Nicobar Islands'),
('Chandigarh'),
('Dadra and Nagar Haveli and Daman and Diu'),
('Delhi'),
('Jammu and Kashmir'),
('Ladakh'),
('Lakshadweep'),
('Puducherry');

SELECT * FROM states
ORDER BY id;
DESCRIBE districts;
SELECT COUNT(*) FROM districts;

SELECT *
FROM districts
WHERE state_id = 26
ORDER BY name;

SELECT COUNT(*) AS total_districts
FROM districts
WHERE state_id = 26;

SELECT d.*
FROM districts d
LEFT JOIN states s
    ON d.state_id = s.id
WHERE s.id IS NULL;

SELECT id, subject, description, category
FROM complaints
ORDER BY id DESC
LIMIT 5;