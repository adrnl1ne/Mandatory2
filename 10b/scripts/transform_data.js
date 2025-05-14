const fs = require('fs-extra');
const path = require('path');

async function transformData() {
  const tempDir = path.join(__dirname, '../temp');
  const outputDir = path.join(__dirname, '../transformed');
  
  try {
    console.log('Starting data transformation...');
    
    // Ensure output directory exists
    await fs.ensureDir(outputDir);
    
    // Get all JSON files in temp directory
    const files = await fs.readdir(tempDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    // Load all the extracted data
    const dataMap = {};
    for (const file of jsonFiles) {
      const tableName = file.replace('.json', '');
      dataMap[tableName] = await fs.readJson(path.join(tempDir, file));
      console.log(`Loaded ${dataMap[tableName].length} rows from ${tableName}`);
    }
    
    // Transform Departments (simple transform)
    if (dataMap.departments) {
      await fs.writeJson(
        path.join(outputDir, 'departments.json'),
        dataMap.departments.map(dept => ({
          _id: dept.departmentid,
          name: dept.name,
          description: dept.description,
          location: dept.location
        })),
        { spaces: 2 }
      );
    }
    
    // Transform Staff with embedded department information
    if (dataMap.staff && dataMap.departments) {
      // Create a lookup map for departments
      const deptMap = {};
      dataMap.departments.forEach(dept => {
        deptMap[dept.departmentid] = {
          id: dept.departmentid,
          name: dept.name,
          location: dept.location
        };
      });
      
      await fs.writeJson(
        path.join(outputDir, 'staff.json'),
        dataMap.staff.map(staff => ({
          _id: staff.staffid,
          firstName: staff.firstname,
          lastName: staff.lastname,
          title: staff.title,
          department: deptMap[staff.departmentid] || null,
          specialization: staff.specialization,
          contact: {
            phone: staff.contactnumber,
            email: staff.email
          },
          hireDate: staff.hiredate
        })),
        { spaces: 2 }
      );
    }
    
    // Transform Patients
    if (dataMap.patients) {
      await fs.writeJson(
        path.join(outputDir, 'patients.json'),
        dataMap.patients.map(patient => ({
          _id: patient.patientid,
          firstName: patient.firstname,
          lastName: patient.lastname,
          dateOfBirth: patient.dateofbirth,
          gender: patient.gender,
          contact: {
            phone: patient.contactnumber,
            email: patient.email,
            address: patient.address,
            emergencyContact: patient.emergencycontact
          },
          medicalInfo: {
            bloodType: patient.bloodtype
          },
          registrationDate: patient.registrationdate
        })),
        { spaces: 2 }
      );
    }
    
    // Transform Medical Records with embedded patient and staff info
    if (dataMap.medical_records && dataMap.patients && dataMap.staff) {
      // Create lookup maps
      const patientMap = {};
      dataMap.patients.forEach(p => {
        patientMap[p.patientid] = {
          id: p.patientid,
          name: `${p.firstname} ${p.lastname}`
        };
      });
      
      const staffMap = {};
      dataMap.staff.forEach(s => {
        staffMap[s.staffid] = {
          id: s.staffid,
          name: `${s.firstname} ${s.lastname}`,
          title: s.title
        };
      });
      
      await fs.writeJson(
        path.join(outputDir, 'medical_records.json'),
        dataMap.medical_records.map(record => ({
          _id: record.recordid,
          patient: patientMap[record.patientid] || null,
          staff: staffMap[record.staffid] || null,
          visitDate: record.visitdate,
          diagnosis: record.diagnosis,
          treatment: record.treatment,
          notes: record.notes
        })),
        { spaces: 2 }
      );
    }
    
    // Transform Appointments
    if (dataMap.appointments && dataMap.patients && dataMap.staff) {
      const patientMap = {};
      dataMap.patients.forEach(p => {
        patientMap[p.patientid] = {
          id: p.patientid,
          name: `${p.firstname} ${p.lastname}`
        };
      });
      
      const staffMap = {};
      dataMap.staff.forEach(s => {
        staffMap[s.staffid] = {
          id: s.staffid,
          name: `${s.firstname} ${s.lastname}`,
          title: s.title
        };
      });
      
      await fs.writeJson(
        path.join(outputDir, 'appointments.json'),
        dataMap.appointments.map(apt => ({
          _id: apt.appointmentid,
          patient: patientMap[apt.patientid] || null,
          staff: staffMap[apt.staffid] || null,
          scheduledDateTime: `${apt.appointmentdate}T${apt.appointmenttime}`,
          status: apt.status,
          notes: apt.notes
        })),
        { spaces: 2 }
      );
    }
    
    // Transform Prescriptions with medication info
    if (dataMap.prescriptions && dataMap.medications) {
      const medicationMap = {};
      dataMap.medications?.forEach(med => {
        medicationMap[med.medicationid] = {
          id: med.medicationid,
          name: med.name,
          manufacturer: med.manufacturer
        };
      });
      
      await fs.writeJson(
        path.join(outputDir, 'prescriptions.json'),
        dataMap.prescriptions.map(rx => ({
          _id: rx.prescriptionid,
          patientId: rx.patientid,
          staffId: rx.staffid,
          medication: medicationMap[rx.medicationid] || null,
          prescriptionDate: rx.prescriptiondate,
          dosage: rx.dosage,
          frequency: rx.frequency,
          duration: rx.duration,
          notes: rx.notes
        })),
        { spaces: 2 }
      );
    }
    
    console.log('Data transformation completed successfully!');
  } catch (error) {
    console.error('Error transforming data:', error);
  }
}

// Run the transformation if this script is executed directly
if (require.main === module) {
  transformData().catch(console.error);
}

module.exports = { transformData };