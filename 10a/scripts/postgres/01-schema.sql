-- Create database tables for Hospital Management System

-- Departments table
CREATE TABLE departments (
    department_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    location VARCHAR(100)
);

-- Staff table
CREATE TABLE staff (
    staff_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    title VARCHAR(50) NOT NULL,
    department_id INTEGER REFERENCES departments(department_id),
    specialization VARCHAR(100),
    contact_number VARCHAR(20),
    email VARCHAR(100) UNIQUE,
    hire_date DATE
);

-- Patients table
CREATE TABLE patients (
    patient_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10),
    contact_number VARCHAR(20),
    email VARCHAR(100),
    address VARCHAR(200),
    emergency_contact VARCHAR(100),
    blood_type VARCHAR(5),
    registration_date DATE DEFAULT CURRENT_DATE
);

-- Appointments table
CREATE TABLE appointments (
    appointment_id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(patient_id),
    staff_id INTEGER REFERENCES staff(staff_id),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed', 'Cancelled')),
    notes VARCHAR(500)
);

-- Medical Records table
CREATE TABLE medical_records (
    record_id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(patient_id),
    staff_id INTEGER REFERENCES staff(staff_id),
    visit_date DATE NOT NULL,
    diagnosis VARCHAR(500),
    treatment VARCHAR(500),
    notes VARCHAR(1000)
);

-- Medications table
CREATE TABLE medications (
    medication_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    dosage VARCHAR(50),
    manufacturer VARCHAR(100)
);

-- Prescriptions table
CREATE TABLE prescriptions (
    prescription_id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(patient_id),
    staff_id INTEGER REFERENCES staff(staff_id),
    medication_id INTEGER REFERENCES medications(medication_id),
    prescription_date DATE DEFAULT CURRENT_DATE,
    dosage VARCHAR(50),
    frequency VARCHAR(50),
    duration VARCHAR(50),
    notes VARCHAR(500)
);