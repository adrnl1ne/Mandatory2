# Hospital Management System

## Overview
A PostgreSQL database system for managing hospital operations.

## Project Structure
- `/docs`: Database documentation generated with SchemaSpy  
- `/scripts`: SQL scripts for database setup and seeding  
- `/src`: Source code for database connection and testing  

## Getting Started

1. **Start the database:**
        ```sh
        docker-compose up -d
        ```

2. **Initialize the database:**
        ```sh
        cd scripts
        psql -h localhost -U postgres -d hospitaldb -f init.sql
        ```

3. **View documentation:**  
        - Open `docs/output/index.html` for complete database documentation  
        - Diagrams are available in `docs/output/diagrams` directory  

---

## Database Schema

The Hospital Management System database includes the following tables:

- `departments`
- `staff`
- `patients`
- `medical_records`
- `appointments`
- `medications`
- `prescriptions`

### Entity Relationship Diagram

An interactive diagram of the database relationships can be found at:  
`docs/output/diagrams/summary/relationships.real.large.svg`

### Database Tables

Detailed information about each table, including columns, constraints, and relationships, is available in the HTML documentation:  
`docs/output/index.html`

---

## Database Design

### Departments

| Column       | Type           | Description                              |
|--------------|----------------|------------------------------------------|
| DepartmentID | INT            | Primary Key, Auto-increment              |
| Name         | NVARCHAR(100)  | Department name (required)               |
| Description  | NVARCHAR(500)  | Department description                   |
| Location     | NVARCHAR(100)  | Physical location within hospital        |

### Staff

| Column         | Type           | Description                              |
|----------------|----------------|------------------------------------------|
| StaffID        | INT            | Primary Key, Auto-increment              |
| FirstName      | NVARCHAR(50)   | First name (required)                    |
| LastName       | NVARCHAR(50)   | Last name (required)                     |
| Title          | NVARCHAR(50)   | Job title (required)                     |
| DepartmentID   | INT            | Foreign Key to Departments               |
| Specialization | NVARCHAR(100)  | Medical specialization                   |
| ContactNumber  | NVARCHAR(20)   | Phone number                             |
| Email          | NVARCHAR(100)  | Email address (unique)                   |
| HireDate       | DATE           | Employment start date                    |

### Patients

| Column           | Type           | Description                              |
|------------------|----------------|------------------------------------------|
| PatientID        | INT            | Primary Key, Auto-increment              |
| FirstName        | NVARCHAR(50)   | First name (required)                    |
| LastName         | NVARCHAR(50)   | Last name (required)                     |
| DateOfBirth      | DATE           | Date of birth (required)                 |
| Gender           | NVARCHAR(10)   | Patient gender                           |
| ContactNumber    | NVARCHAR(20)   | Phone number                             |
| Email            | NVARCHAR(100)  | Email address                            |
| Address          | NVARCHAR(200)  | Physical address                         |
| EmergencyContact | NVARCHAR(100)  | Emergency contact information            |
| BloodType        | NVARCHAR(5)    | Blood type                               |
| RegistrationDate | DATE           | Date of registration (default: current)  |

### Appointments

| Column           | Type           | Description                              |
|------------------|----------------|------------------------------------------|
| AppointmentID    | INT            | Primary Key, Auto-increment              |
| PatientID        | INT            | Foreign Key to Patients                  |
| StaffID          | INT            | Foreign Key to Staff                     |
| AppointmentDate  | DATE           | Date of appointment (required)           |
| AppointmentTime  | TIME           | Time of appointment (required)           |
| Status           | NVARCHAR(20)   | Status (Scheduled, Completed, Cancelled) |
| Notes            | NVARCHAR(500)  | Additional notes                         |

### MedicalRecords

| Column     | Type           | Description                              |
|------------|----------------|------------------------------------------|
| RecordID   | INT            | Primary Key, Auto-increment              |
| PatientID  | INT            | Foreign Key to Patients                  |
| StaffID    | INT            | Foreign Key to Staff                     |
| VisitDate  | DATE           | Date of visit (required)                 |
| Diagnosis  | NVARCHAR(500)  | Medical diagnosis                        |
| Treatment  | NVARCHAR(500)  | Treatment plan                           |
| Notes      | NVARCHAR(1000) | Additional notes                         |

### Medications

| Column       | Type           | Description                              |
|--------------|----------------|------------------------------------------|
| MedicationID | INT            | Primary Key, Auto-increment              |
| Name         | NVARCHAR(100)  | Medication name (required)               |
| Description  | NVARCHAR(500)  | Medication description                   |
| Dosage       | NVARCHAR(50)   | Available dosages                        |
| Manufacturer | NVARCHAR(100)  | Manufacturer name                        |

### Prescriptions

| Column           | Type           | Description                              |
|------------------|----------------|------------------------------------------|
| PrescriptionID   | INT            | Primary Key, Auto-increment              |
| PatientID        | INT            | Foreign Key to Patients                  |
| StaffID          | INT            | Foreign Key to Staff                     |
| MedicationID     | INT            | Foreign Key to Medications               |
| PrescriptionDate | DATE           | Date prescribed (default: current date)  |
| Dosage           | NVARCHAR(50)   | Prescribed dosage                        |
| Frequency        | NVARCHAR(50)   | How often to take                        |
| Duration         | NVARCHAR(50)   | How long to take                         |
| Notes            | NVARCHAR(500)  | Additional notes                         |

---

## Table Relationships

- Each **Department** can have multiple **Staff** members (One-to-Many)
- Each **Staff** member belongs to one **Department** (Many-to-One)
- Each **Staff** member can have multiple **Appointments** (One-to-Many)
- Each **Patient** can have multiple **Appointments** (One-to-Many)
- Each **Staff** member can create multiple **MedicalRecords** (One-to-Many)
- Each **Patient** can have multiple **MedicalRecords** (One-to-Many)
- Each **Staff** member can create multiple **Prescriptions** (One-to-Many)
- Each **Patient** can have multiple **Prescriptions** (One-to-Many)
- Each **Medication** can be in multiple **Prescriptions** (One-to-Many)

---

## Prerequisites

- Docker and Docker Compose
- Database management tool for viewing the database

## Setup

1. Clone this repository
2. Update the `.env` file with your preferred password
3. Run `docker-compose up -d` to start the database
4. Connect to the database using appropriate tools:
        - **Server:** localhost
        - **Port:** 5432
        - **Database:** hospitaldb
        - **Username:** postgres
        - **Password:** (from `.env` file)

## Documentation Generation

Documentation was created using [SchemaSpy](https://schemaspy.org/), which generates comprehensive HTML documentation including table relationships, constraints, and visual diagrams.