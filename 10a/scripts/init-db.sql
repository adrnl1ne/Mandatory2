-- Add proper PostgreSQL initialization:
-- Create tables
CREATE TABLE IF NOT EXISTS departments (
    department_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS staff (
    staff_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    department_id INT REFERENCES departments(department_id),
    contact VARCHAR(100),
    hire_date DATE
);

CREATE TABLE IF NOT EXISTS patients (
    patient_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20),
    contact VARCHAR(100),
    address VARCHAR(200),
    admission_date DATE
);

CREATE TABLE IF NOT EXISTS medical_records (
    record_id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(patient_id),
    staff_id INT REFERENCES staff(staff_id),
    diagnosis VARCHAR(200),
    treatment VARCHAR(300),
    prescription VARCHAR(300),
    record_date DATE
);

CREATE TABLE IF NOT EXISTS appointments (
    appointment_id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(patient_id),
    staff_id INT REFERENCES staff(staff_id),
    appointment_date TIMESTAMP NOT NULL,
    status VARCHAR(50),
    notes TEXT
);
