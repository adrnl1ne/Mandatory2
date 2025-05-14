-- Create a new database
CREATE DATABASE MyDatabase;

-- Use the new database
USE MyDatabase;

-- Create database tables for Hospital Management System

-- Departments table
CREATE TABLE Departments (
    DepartmentID INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    Location NVARCHAR(100)
);

-- Staff table
CREATE TABLE Staff (
    StaffID INT PRIMARY KEY IDENTITY(1,1),
    FirstName NVARCHAR(50) NOT NULL,
    LastName NVARCHAR(50) NOT NULL,
    Title NVARCHAR(50) NOT NULL,
    DepartmentID INT FOREIGN KEY REFERENCES Departments(DepartmentID),
    Specialization NVARCHAR(100),
    ContactNumber NVARCHAR(20),
    Email NVARCHAR(100),
    HireDate DATE,
    CONSTRAINT UQ_Staff_Email UNIQUE (Email)
);

-- Patients table
CREATE TABLE Patients (
    PatientID INT PRIMARY KEY IDENTITY(1,1),
    FirstName NVARCHAR(50) NOT NULL,
    LastName NVARCHAR(50) NOT NULL,
    DateOfBirth DATE NOT NULL,
    Gender NVARCHAR(10),
    ContactNumber NVARCHAR(20),
    Email NVARCHAR(100),
    Address NVARCHAR(200),
    EmergencyContact NVARCHAR(100),
    BloodType NVARCHAR(5),
    RegistrationDate DATE DEFAULT GETDATE()
);

-- Appointments table
CREATE TABLE Appointments (
    AppointmentID INT PRIMARY KEY IDENTITY(1,1),
    PatientID INT FOREIGN KEY REFERENCES Patients(PatientID),
    StaffID INT FOREIGN KEY REFERENCES Staff(StaffID),
    AppointmentDate DATE NOT NULL,
    AppointmentTime TIME NOT NULL,
    Status NVARCHAR(20) DEFAULT 'Scheduled',
    Notes NVARCHAR(500),
    CONSTRAINT CK_Appointment_Status CHECK (Status IN ('Scheduled', 'Completed', 'Cancelled'))
);

-- MedicalRecords table
CREATE TABLE MedicalRecords (
    RecordID INT PRIMARY KEY IDENTITY(1,1),
    PatientID INT FOREIGN KEY REFERENCES Patients(PatientID),
    StaffID INT FOREIGN KEY REFERENCES Staff(StaffID),
    VisitDate DATE NOT NULL,
    Diagnosis NVARCHAR(500),
    Treatment NVARCHAR(500),
    Notes NVARCHAR(1000)
);

-- Medications table
CREATE TABLE Medications (
    MedicationID INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    Dosage NVARCHAR(50),
    Manufacturer NVARCHAR(100)
);

-- Prescriptions table
CREATE TABLE Prescriptions (
    PrescriptionID INT PRIMARY KEY IDENTITY(1,1),
    PatientID INT FOREIGN KEY REFERENCES Patients(PatientID),
    StaffID INT FOREIGN KEY REFERENCES Staff(StaffID),
    MedicationID INT FOREIGN KEY REFERENCES Medications(MedicationID),
    PrescriptionDate DATE DEFAULT GETDATE(),
    Dosage NVARCHAR(50),
    Frequency NVARCHAR(50),
    Duration NVARCHAR(50),
    Notes NVARCHAR(500)
);