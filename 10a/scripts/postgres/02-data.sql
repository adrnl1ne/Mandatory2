-- Seed data for Hospital Management System

-- Seed Departments
INSERT INTO departments (name, description, location)
VALUES 
    ('Cardiology', 'Diagnosis and treatment of heart diseases', 'Building A, Floor 2'),
    ('Neurology', 'Diagnosis and treatment of nervous system disorders', 'Building B, Floor 3'),
    ('Pediatrics', 'Medical care for infants, children, and adolescents', 'Building A, Floor 1'),
    ('Orthopedics', 'Diagnosis and treatment of musculoskeletal system', 'Building C, Floor 2'),
    ('Emergency', 'Urgent care for acute illnesses and injuries', 'Building D, Ground Floor');

-- Seed Staff
INSERT INTO staff (first_name, last_name, title, department_id, specialization, contact_number, email, hire_date)
VALUES
    ('John', 'Smith', 'Doctor', 1, 'Interventional Cardiology', '123-456-7890', 'john.smith@hospital.com', '2018-06-15'),
    ('Emily', 'Johnson', 'Doctor', 2, 'Neurological Surgery', '123-456-7891', 'emily.johnson@hospital.com', '2019-03-22'),
    ('Michael', 'Brown', 'Doctor', 3, 'Pediatric Oncology', '123-456-7892', 'michael.brown@hospital.com', '2017-11-10'),
    ('Sarah', 'Wilson', 'Nurse', 1, 'Cardiac Care', '123-456-7893', 'sarah.wilson@hospital.com', '2020-01-05'),
    ('David', 'Lee', 'Nurse', 3, 'Pediatric Care', '123-456-7894', 'david.lee@hospital.com', '2021-04-18');

-- Seed Patients
INSERT INTO patients (first_name, last_name, date_of_birth, gender, contact_number, email, address, emergency_contact, blood_type, registration_date)
VALUES
    ('Robert', 'Anderson', '1975-04-12', 'Male', '987-654-3210', 'robert.anderson@email.com', '123 Main St, Cityville', 'Mary Anderson: 987-654-3211', 'A+', '2022-01-15'),
    ('Patricia', 'Thomas', '1982-08-23', 'Female', '987-654-3212', 'patricia.thomas@email.com', '456 Oak St, Townsville', 'James Thomas: 987-654-3213', 'O-', '2022-02-03'),
    ('Jennifer', 'Martinez', '1990-11-05', 'Female', '987-654-3214', 'jennifer.martinez@email.com', '789 Pine St, Villageton', 'Carlos Martinez: 987-654-3215', 'B+', '2022-03-22'),
    ('William', 'Jackson', '1968-03-30', 'Male', '987-654-3216', 'william.jackson@email.com', '101 Elm St, Hamletville', 'Susan Jackson: 987-654-3217', 'AB-', '2022-04-10');

-- Seed Medications
INSERT INTO medications (name, description, dosage, manufacturer)
VALUES
    ('Amoxicillin', 'Antibiotic for bacterial infections', '250mg, 500mg tablets', 'PharmaCorp'),
    ('Lisinopril', 'ACE inhibitor for hypertension', '10mg, 20mg tablets', 'MediPharm'),
    ('Metformin', 'Oral diabetes medication', '500mg, 1000mg tablets', 'HealthMed'),
    ('Atorvastatin', 'Statin for cholesterol management', '10mg, 20mg, 40mg tablets', 'BioPharma');

-- Seed Appointments
INSERT INTO appointments (patient_id, staff_id, appointment_date, appointment_time, status, notes)
VALUES
    (1, 1, '2023-05-10', '09:30:00', 'Completed', 'Follow-up for heart condition'),
    (2, 2, '2023-05-12', '11:00:00', 'Completed', 'Initial consultation for headaches'),
    (3, 3, '2023-05-15', '14:30:00', 'Completed', 'Routine check-up'),
    (4, 1, '2023-05-20', '10:00:00', 'Scheduled', 'Annual check-up');