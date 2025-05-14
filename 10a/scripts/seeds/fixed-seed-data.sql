-- Seed data for Hospital Management System that matches the schema

-- Seed Departments
INSERT INTO departments (name, location)
VALUES 
    ('Cardiology', 'Building A, Floor 2'),
    ('Neurology', 'Building B, Floor 3'),
    ('Pediatrics', 'Building A, Floor 1'),
    ('Orthopedics', 'Building C, Floor 2'),
    ('Emergency', 'Building D, Ground Floor');

-- Seed Staff
INSERT INTO staff (first_name, last_name, role, department_id, contact, hire_date)
VALUES
    ('John', 'Smith', 'Doctor', 1, '123-456-7890', '2018-06-15'),
    ('Emily', 'Johnson', 'Doctor', 2, '123-456-7891', '2019-03-22'),
    ('Michael', 'Brown', 'Doctor', 3, '123-456-7892', '2017-11-10'),
    ('Sarah', 'Wilson', 'Nurse', 1, '123-456-7893', '2020-01-05'),
    ('David', 'Lee', 'Nurse', 3, '123-456-7894', '2021-04-18'),
    ('James', 'Taylor', 'Doctor', 4, '123-456-7895', '2016-08-30'),
    ('Jessica', 'Garcia', 'Doctor', 5, '123-456-7896', '2019-07-12');

-- Seed Patients
INSERT INTO patients (first_name, last_name, date_of_birth, gender, contact, address, admission_date)
VALUES
    ('Robert', 'Anderson', '1975-04-12', 'Male', '987-654-3210', '123 Main St, Cityville', '2022-01-15'),
    ('Patricia', 'Thomas', '1982-08-23', 'Female', '987-654-3212', '456 Oak St, Townsville', '2022-02-03'),
    ('Jennifer', 'Martinez', '1990-11-05', 'Female', '987-654-3214', '789 Pine St, Villageton', '2022-03-22'),
    ('William', 'Jackson', '1968-03-30', 'Male', '987-654-3216', '101 Elm St, Hamletville', '2022-04-10'),
    ('Elizabeth', 'White', '2005-06-17', 'Female', '987-654-3218', '202 Maple St, Boroughtown', '2022-05-05'),
    ('Daniel', 'Harris', '1995-09-28', 'Male', '987-654-3220', '303 Cedar St, Districtville', '2022-06-18');

-- Seed Medical Records
INSERT INTO medical_records (patient_id, staff_id, diagnosis, treatment, prescription, record_date)
VALUES
    (1, 1, 'Mild hypertension', 'Prescribed Lisinopril 10mg once daily', 'Lisinopril 10mg', '2023-05-10'),
    (2, 2, 'Tension headaches', 'Prescribed Ibuprofen as needed', 'Ibuprofen 400mg', '2023-05-12'),
    (3, 3, 'Healthy child, normal development', 'No treatment necessary', NULL, '2023-05-15');

-- Seed Appointments
INSERT INTO appointments (patient_id, staff_id, appointment_date, status, notes)
VALUES
    (1, 1, '2023-05-10 09:30:00', 'Completed', 'Follow-up for heart condition'),
    (2, 2, '2023-05-12 11:00:00', 'Completed', 'Initial consultation for headaches'),
    (3, 3, '2023-05-15 14:30:00', 'Completed', 'Routine check-up'),
    (4, 6, '2023-05-20 10:00:00', 'Scheduled', 'Knee pain assessment'),
    (5, 3, '2023-05-22 15:45:00', 'Scheduled', 'Regular pediatric check-up'),
    (6, 7, '2023-05-25 08:15:00', 'Scheduled', 'Chest pain investigation');