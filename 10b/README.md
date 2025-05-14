# Hospital Management System Database Migration

## Overview
This project demonstrates a data migration from a PostgreSQL relational database to a MongoDB document database for a hospital management system. It follows an **Extract-Transform-Load (ETL)** approach to move data between different database paradigms.

---

## Project Structure

- **config/**: Database configuration files
- **scripts/**: ETL scripts for the migration process
- **temp/**: Temporary storage for extracted data
- **transformed/**: Storage for transformed data ready for loading

---

## Migration Approach

The ETL process consists of three main steps:

1. **Extract**: Data is extracted from PostgreSQL tables into JSON files.
2. **Transform**: Relational data is transformed into document format.
3. **Load**: Transformed data is loaded into MongoDB collections.

---

## Key Data Model Changes

### PostgreSQL (Relational Model)
- Tables with foreign key relationships
- Normalized data structure
- Separate tables for departments, staff, patients, medical records, etc.

### MongoDB (Document Model)
- Collections with embedded documents
- Denormalized data structure
- References used where appropriate

---

## Schema Transformation Examples

### PostgreSQL Relational Schema

- `departments` table with `id`, `name`, `description`, `location`
- `staff` table with `department_id` foreign key

### MongoDB Document Schema

- `departments` collection
- `staff` collection with embedded department information:

```json
{
   "_id": 1,
   "firstName": "John",
   "lastName": "Smith",
   "title": "Chief Physician",
   "department": {
      "id": 1,
      "name": "Cardiology",
      "location": "Building A, Floor 3"
   }
}
```

---

## Database Entities

### PostgreSQL Tables

- departments
- staff
- patients
- medical_records
- appointments
- medications
- prescriptions

### MongoDB Collections

- departments
- staff (with embedded department data)
- patients
- medical_records (with embedded patient and staff data)
- appointments (with embedded patient and staff data)
- prescriptions (with embedded medication data)

---

## Getting Started

1. **Start the databases:**
    ```sh
    docker-compose up -d
    ```

2. **Install dependencies:**
    ```sh
    npm install
    ```

3. **Run the migration:**
    ```sh
    npm run migrate
    ```

4. **Verify data in MongoDB:**
    ```sh
    mongosh mongodb://localhost:27017/hospitaldb
    db.departments.find()
    ```

---

## Migration Scripts

- `extract_from_postgres.js`: Extracts data from PostgreSQL tables into JSON files
- `transform_data.js`: Transforms relational data to document format
- `load_to_mongodb.js`: Loads transformed data into MongoDB
- `run_migration.js`: Orchestrates the entire migration process
- `seed-postgres.js`: Seeds the PostgreSQL database with initial data

---

## Data Transformation Details

- **Staff Transformation:** PostgreSQL staff records are transformed to include embedded department information instead of just a foreign key reference.
- **Patient Transformation:** Patient contact information is grouped into a nested `contact` object.
- **Medical Records Transformation:** Patient and staff information is embedded as reference objects within medical records.
- **Appointments Transformation:** Appointment date and time fields are combined into a single `datetime` field, with embedded patient and staff information.

---

## Prerequisites

- Docker and Docker Compose
- Node.js and npm

---

## Notes

- This project demonstrates a one-time migration process.
- For production use, consider implementing data synchronization or dual-write patterns.