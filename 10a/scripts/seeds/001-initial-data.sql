-- Seed data for Hospital Management System

-- Seed Departments
INSERT INTO Departments (Name, Description, Location)
VALUES 
    ('Cardiology', 'Diagnosis and treatment of heart diseases', 'Building A, Floor 2'),
    ('Neurology', 'Diagnosis and treatment of nervous system disorders', 'Building B, Floor 3'),
    ('Pediatrics', 'Medical care for infants, children, and adolescents', 'Building A, Floor 1'),
    ('Orthopedics', 'Diagnosis and treatment of musculoskeletal system', 'Building C, Floor 2'),
    ('Emergency', 'Urgent care for acute illnesses and injuries', 'Building D, Ground Floor');

-- Seed Staff
INSERT INTO Staff (FirstName, LastName, Title, DepartmentID, Specialization, ContactNumber, Email, HireDate)
VALUES
    ('John', 'Smith', 'Doctor', 1, 'Interventional Cardiology', '123-456-7890', 'john.smith@hospital.com', '2018-06-15'),
    ('Emily', 'Johnson', 'Doctor', 2, 'Neurological Surgery', '123-456-7891', 'emily.johnson@hospital.com', '2019-03-22'),
    ('Michael', 'Brown', 'Doctor', 3, 'Pediatric Oncology', '123-456-7892', 'michael.brown@hospital.com', '2017-11-10'),
    ('Sarah', 'Wilson', 'Nurse', 1, 'Cardiac Care', '123-456-7893', 'sarah.wilson@hospital.com', '2020-01-05'),
    ('David', 'Lee', 'Nurse', 3, 'Pediatric Care', '123-456-7894', 'david.lee@hospital.com', '2021-04-18'),
    ('James', 'Taylor', 'Doctor', 4, 'Orthopedic Surgery', '123-456-7895', 'james.taylor@hospital.com', '2016-08-30'),
    ('Jessica', 'Garcia', 'Doctor', 5, 'Emergency Medicine', '123-456-7896', 'jessica.garcia@hospital.com', '2019-07-12');

-- Seed Patients
INSERT INTO Patients (FirstName, LastName, DateOfBirth, Gender, ContactNumber, Email, Address, EmergencyContact, BloodType, RegistrationDate)
VALUES
    ('Robert', 'Anderson', '1975-04-12', 'Male', '987-654-3210', 'robert.anderson@email.com', '123 Main St, Cityville', 'Mary Anderson: 987-654-3211', 'A+', '2022-01-15'),
    ('Patricia', 'Thomas', '1982-08-23', 'Female', '987-654-3212', 'patricia.thomas@email.com', '456 Oak St, Townsville', 'James Thomas: 987-654-3213', 'O-', '2022-02-03'),
    ('Jennifer', 'Martinez', '1990-11-05', 'Female', '987-654-3214', 'jennifer.martinez@email.com', '789 Pine St, Villageton', 'Carlos Martinez: 987-654-3215', 'B+', '2022-03-22'),
    ('William', 'Jackson', '1968-03-30', 'Male', '987-654-3216', 'william.jackson@email.com', '101 Elm St, Hamletville', 'Susan Jackson: 987-654-3217', 'AB-', '2022-04-10'),
    ('Elizabeth', 'White', '2005-06-17', 'Female', '987-654-3218', 'elizabeth.white@email.com', '202 Maple St, Boroughtown', 'Richard White: 987-654-3219', 'A-', '2022-05-05'),
    ('Daniel', 'Harris', '1995-09-28', 'Male', '987-654-3220', 'daniel.harris@email.com', '303 Cedar St, Districtville', 'Nancy Harris: 987-654-3221', 'O+', '2022-06-18');

-- Seed Medications
INSERT INTO Medications (Name, Description, Dosage, Manufacturer)
VALUES
    ('Amoxicillin', 'Antibiotic for bacterial infections', '250mg, 500mg tablets', 'PharmaCorp'),
    ('Lisinopril', 'ACE inhibitor for hypertension', '10mg, 20mg tablets', 'MediPharm'),
    ('Metformin', 'Oral diabetes medication', '500mg, 1000mg tablets', 'HealthMed'),
    ('Atorvastatin', 'Statin for cholesterol management', '10mg, 20mg, 40mg tablets', 'BioPharma'),
    ('Albuterol', 'Bronchodilator for asthma', '90mcg inhaler', 'RespiCare'),
    ('Ibuprofen', 'NSAID for pain and inflammation', '200mg, 400mg tablets', 'PainRelief');

-- Seed Appointments
INSERT INTO Appointments (PatientID, StaffID, AppointmentDate, AppointmentTime, Status, Notes)
VALUES
    (1, 1, '2023-05-10', '09:30:00', 'Completed', 'Follow-up for heart condition'),
    (2, 2, '2023-05-12', '11:00:00', 'Completed', 'Initial consultation for headaches'),
    (3, 3, '2023-05-15', '14:30:00', 'Completed', 'Routine check-up'),
    (4, 6, '2023-05-20', '10:00:00', 'Scheduled', 'Knee pain assessment'),
    (5, 3, '2023-05-22', '15:45:00', 'Scheduled', 'Regular pediatric check-up'),
    (6, 7, '2023-05-25', '08:15:00', 'Scheduled', 'Chest pain investigation');

-- Seed MedicalRecords
INSERT INTO MedicalRecords (PatientID, StaffID, VisitDate, Diagnosis, Treatment, Notes)
VALUES
    (1, 1, '2023-05-10', 'Mild hypertension', 'Prescribed Lisinopril 10mg once daily', 'Blood pressure 140/90, recommended lifestyle changes'),
    (2, 2, '2023-05-12', 'Tension headaches', 'Prescribed Ibuprofen as needed', 'Recommended stress management techniques'),
    (3, 3, '2023-05-15', 'Healthy child, normal development', 'No treatment necessary', 'Height and weight appropriate for age');

-- Seed Prescriptions
INSERT INTO Prescriptions (PatientID, StaffID, MedicationID, PrescriptionDate, Dosage, Frequency, Duration, Notes)
VALUES
    (1, 1, 2, '2023-05-10', '10mg', 'Once daily', '30 days', 'Take in the morning with food'),
    (2, 2, 6, '2023-05-12', '400mg', 'Every 6 hours as needed', '10 days', 'Do not exceed 1200mg in 24 hours'),
    (3, 3, 1, '2023-02-20', '250mg', 'Twice daily', '7 days', 'For ear infection, complete full course');