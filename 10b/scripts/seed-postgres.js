const { Client } = require('pg');
const dbConfig = require('../config/db_config');

async function seedDatabase() {
  // Connect to the existing database from 10a
  const client = new Client(dbConfig.postgres);
  
  try {
    console.log('Connecting to PostgreSQL database...');
    await client.connect();
    console.log('Connected successfully!');
    
    // Check if tables exist
    const tablesResult = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `);
    
    const tableNames = tablesResult.rows.map(row => row.table_name);
    console.log('Existing tables:', tableNames.join(', '));
    
    // We'll only proceed with seeding if the tables exist but are empty
    // Check if departments table has data
    if (tableNames.includes('departments')) {
      const deptCount = await client.query('SELECT COUNT(*) FROM departments');
      if (parseInt(deptCount.rows[0].count) > 0) {
        console.log('Database already contains data. Seeding skipped.');
        return;
      }
    }

    // If tables don't exist, we should run the init script first
    if (!tableNames.includes('departments')) {
      console.log('Tables not found. Please run the init-db.sql script from 10a first.');
      return;
    }
    
    console.log('Inserting sample data...');
    
    // Insert departments
    console.log('Inserting departments...');
    await client.query(`
      INSERT INTO departments (name, description, location) VALUES
      ('Cardiology', 'Specializes in heart diseases', 'Building A, 2nd Floor'),
      ('Neurology', 'Treats disorders of the nervous system', 'Building B, 1st Floor'),
      ('Pediatrics', 'Medical care for infants, children, and adolescents', 'Building C, Ground Floor'),
      ('Oncology', 'Diagnosis and treatment of cancer', 'Building D, 3rd Floor'),
      ('Emergency', 'Urgent and emergency care', 'Main Building, Ground Floor')
    `);
    
    // Insert staff
    console.log('Inserting staff...');
    await client.query(`
      INSERT INTO staff (firstname, lastname, title, departmentid, specialization, contactnumber, email, hiredate) VALUES
      ('John', 'Smith', 'Chief Physician', 1, 'Heart Surgery', '555-1234', 'john.smith@hospital.com', '2018-05-15'),
      ('Emily', 'Johnson', 'Neurologist', 2, 'Brain Disorders', '555-2345', 'emily.j@hospital.com', '2019-03-10'),
      ('Michael', 'Brown', 'Pediatrician', 3, 'Child Health', '555-3456', 'michael.b@hospital.com', '2020-01-20'),
      ('Sarah', 'Davis', 'Oncologist', 4, 'Breast Cancer', '555-4567', 'sarah.d@hospital.com', '2017-11-05'),
      ('James', 'Wilson', 'Emergency Doctor', 5, 'Trauma Care', '555-5678', 'james.w@hospital.com', '2021-06-12'),
      ('Lisa', 'Taylor', 'Cardiologist', 1, 'Arrhythmia', '555-6789', 'lisa.t@hospital.com', '2019-09-28')
    `);
    
    // Insert patients
    console.log('Inserting patients...');
    await client.query(`
      INSERT INTO patients (firstname, lastname, dateofbirth, gender, contactnumber, email, address, emergencycontact, bloodtype, registrationdate) VALUES
      ('Alice', 'Johnson', '1985-03-12', 'Female', '555-1001', 'alice.j@email.com', '123 Main St, City', 'Bob Johnson: 555-1002', 'O+', '2022-01-15'),
      ('Mark', 'Williams', '1974-08-25', 'Male', '555-2002', 'mark.w@email.com', '456 Elm St, City', 'Mary Williams: 555-2003', 'A-', '2021-11-30'),
      ('Emma', 'Davis', '1995-05-17', 'Female', '555-3003', 'emma.d@email.com', '789 Oak St, City', 'Eric Davis: 555-3004', 'B+', '2023-02-10'),
      ('David', 'Brown', '1968-12-03', 'Male', '555-4004', 'david.b@email.com', '101 Pine St, City', 'Donna Brown: 555-4005', 'AB+', '2021-07-22')
    `);
    
    // Insert medications if the table exists
    if (tableNames.includes('medications')) {
      console.log('Inserting medications...');
      await client.query(`
        INSERT INTO medications (name, description, dosage, manufacturer) VALUES
        ('Lisinopril', 'ACE inhibitor for treating high blood pressure', '10mg, 20mg tablets', 'PharmaCorp Inc.'),
        ('Amoxicillin', 'Antibiotic used to treat bacterial infections', '250mg, 500mg capsules', 'BioMed LLC'),
        ('Lipitor', 'Statin medication to treat high cholesterol', '10mg, 20mg, 40mg tablets', 'GlobalHealth Pharma')
      `);
    }
    
    // Insert medical records
    console.log('Inserting medical records...');
    await client.query(`
      INSERT INTO medical_records (patientid, staffid, visitdate, diagnosis, treatment, notes) VALUES
      (1, 1, '2023-05-10', 'Hypertension', 'Prescribed Lisinopril 10mg daily', 'Follow-up in 3 months'),
      (2, 2, '2023-06-15', 'Migraine', 'Prescribed pain management and trigger avoidance', 'Patient reports increased frequency'),
      (3, 3, '2023-04-20', 'Seasonal allergies', 'Prescribed antihistamines', 'Advised to avoid known allergens')
    `);
    
    // Insert appointments
    console.log('Inserting appointments...');
    await client.query(`
      INSERT INTO appointments (patientid, staffid, appointmentdate, appointmenttime, status, notes) VALUES
      (1, 1, '2024-01-15', '09:00:00', 'Scheduled', 'Follow-up for hypertension'),
      (2, 2, '2024-01-16', '10:30:00', 'Scheduled', 'Migraine reassessment'),
      (3, 3, '2024-01-17', '14:00:00', 'Scheduled', 'Seasonal allergies check')
    `);
    
    // Insert prescriptions if the table exists
    if (tableNames.includes('prescriptions')) {
      console.log('Inserting prescriptions...');
      await client.query(`
        INSERT INTO prescriptions (patientid, staffid, medicationid, prescriptiondate, dosage, frequency, duration, notes) VALUES
        (1, 1, 1, '2023-05-10', '10mg', 'Once daily', '3 months', 'Take in the morning with food'),
        (2, 2, 3, '2023-06-15', '20mg', 'Once daily', '1 month', 'Take at night')
      `);
    }
    
    console.log('Database seeded successfully!');
    
    // Verify count
    const deptCount = await client.query('SELECT COUNT(*) FROM departments');
    const staffCount = await client.query('SELECT COUNT(*) FROM staff');
    const patientCount = await client.query('SELECT COUNT(*) FROM patients');
    
    console.log(`Departments: ${deptCount.rows[0].count}`);
    console.log(`Staff: ${staffCount.rows[0].count}`);
    console.log(`Patients: ${patientCount.rows[0].count}`);
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.end();
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase().catch(console.error);
}

module.exports = { seedDatabase };