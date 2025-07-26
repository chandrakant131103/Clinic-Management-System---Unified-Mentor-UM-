https://gregarious-naiad-8abe52.netlify.app/

Link hosted of netlify


COMPANY: Unified Mentor Pvt. Ltd
NAME: Chandrakant Barik

UNID INTERN ID:  UMID01062540399

DOMAIN: Frontend Development Intern

DURATION: 05/06/2025 to 05/08/2025


# CLINIC MANAGEMENT SYSTEM

================================================================================

## PROJECT OVERVIEW

The Clinic Management System is a comprehensive web-based application designed 
to streamline healthcare operations. It provides separate interfaces for doctors 
and receptionists, enabling efficient patient management, appointment scheduling, 
prescription handling, and billing operations.

Purpose: To digitize and automate clinic operations, reduce paperwork, and 
improve patient care efficiency.

================================================================================

## KEY FEATURES

• Dual Role Authentication (Doctor & Receptionist)
• Patient Registration with Token Management
• Real-time Patient Queue System
• Electronic Prescription Management
• Automated Billing & Invoice Generation
• PDF Bill Generation with Cloud Storage
• Comprehensive Activity Logging
• Responsive Design for All Devices
• Real-time Data Synchronization
• Secure Firebase Authentication

================================================================================

## TECHNOLOGY STACK

Component           Technology
-----------------------------------------
Frontend            HTML5, CSS3, JavaScript
Backend             Firebase (Firestore, Auth, Storage)
PDF Generation      jsPDF Library
Styling             Custom CSS with Gradients

================================================================================

## INSTALLATION & SETUP

### Prerequisites
• Web browser (Chrome, Firefox, Safari, Edge)
• Firebase project with enabled services
• Text editor (VS Code recommended)

### Firebase Configuration
IMPORTANT: Update the Firebase configuration in script.js with your own 
project credentials.


### Required Firebase Services
• Authentication (Email/Password)
• Firestore Database
• Storage (for PDF files)

================================================================================

## DATABASE STRUCTURE

### Firestore Collections
```
Collections:
├── users (stores user profiles)
├── patients (patient records)
├── bills (billing information)
├── logs (activity logs)
└── settings (system settings)
```

### Required Indexes
```
Collection: patients
Fields: status (Ascending), tokenNumber (Ascending)

Collection: patients
Fields: status (Ascending), completedAt (Descending)
```

Tip: Firebase will prompt you to create indexes when needed. Click the 
provided links in browser console.

================================================================================

## USER ROLES & PERMISSIONS

### Doctor Dashboard
• View patient queue in real-time
• Select patients for examination
• Create and submit prescriptions
• Set consultation fees
• View patient history

### Receptionist Dashboard
• Register new patients
• Generate unique token numbers
• Manage billing operations
• Generate PDF bills
• View completed consultations

================================================================================

## HOW TO OPERATE THE SYSTEM

### Initial Setup
1. Open the application in a web browser
2. You'll see two login cards: Doctor Login and Receptionist Login
3. If this is your first time, click "Register as Doctor" or "Register as Receptionist"
4. Fill in the registration form with email, password, full name, and user type
5. Click "Register" button to create your account
6. After successful registration, you'll be redirected to login

### For Receptionists - Daily Operations

#### Step 1: Login
1. Enter your email and password in the "Receptionist Login" section
2. Click "Login as Receptionist" button
3. You'll be taken to the Receptionist Dashboard

#### Step 2: Register New Patients
1. In the "Token Generation" section, you'll see the current token number
2. Fill in the patient registration form:
   - Patient Name (required)
   - Age (required)
   - Phone number (required)
   - Chief Complaint (required)
3. Click "Register Patient" button
4. System will automatically generate the next token number
5. Patient will appear in the doctor's queue

#### Step 3: Generate Bills
1. In the "Billing Management" section, you'll see completed consultations
2. Each bill shows patient details, consultation fee, and registration fee
3. Click "Generate Bill" button for any patient
4. System will create a PDF bill and save it to cloud storage
5. Success message will confirm bill generation

### For Doctors - Daily Operations

#### Step 1: Login
1. Enter your email and password in the "Doctor Login" section
2. Click "Login as Doctor" button
3. You'll be taken to the Doctor Dashboard

#### Step 2: View Patient Queue
1. In the "Patient Queue" section, you'll see all waiting patients
2. Patients are displayed with:
   - Token number
   - Patient name
   - Age and phone number
   - Chief complaint
3. Queue is automatically sorted by token number

#### Step 3: Examine Patients
1. Click on any patient in the queue to select them
2. Patient details will appear in the right panel
3. A prescription form will appear below patient details
4. Fill in the prescription form:
   - Diagnosis (required)
   - Prescription details (required)
   - Consultation Fee (default ₹500, can be modified)
5. Click "Submit Prescription" button
6. Patient will move from queue to billing section

### System Workflow Summary

#### Patient Registration Flow
1. Receptionist logs into the system
2. Registers new patient with details
3. System generates unique token number
4. Patient enters waiting queue

#### Consultation Flow
1. Doctor views patient queue
2. Selects patient for examination
3. Reviews patient information
4. Creates prescription and diagnosis
5. Sets consultation fee
6. Submits prescription (patient moves to billing)

#### Billing Flow
1. Receptionist views completed consultations
2. Generates itemized bill
3. System creates PDF invoice
4. PDF stored in Firebase Storage
5. Bill record saved to database

### Important Operating Tips
• Always logout when finishing your shift using the "Logout" button
• Patient tokens are generated automatically and cannot be manually changed
• Queue updates in real-time - refresh isn't needed
• Bills can only be generated after doctor completes prescription
• PDF bills are automatically saved to cloud storage
• All actions are logged for audit purposes
• System works best with Chrome or Firefox browsers

### Common User Actions
Action                  Who Can Do It       When
-------------------------------------------------------
Register new patient    Receptionist        Anytime
View patient queue      Doctor              After login
Create prescription     Doctor              After selecting patient
Generate bill           Receptionist        After doctor completes prescription
View bills              Receptionist        Anytime

================================================================================

## CONFIGURATION OPTIONS

### Customizable Settings
• Hospital Name: Update in PDF generation function
• Registration Fee: Currently set to ₹50
• Default Consultation Fee: ₹500
• Token Number Format: 3-digit padded numbers

```javascript
// Customize in generateBill function
registrationFee: 50,
consultationFee: 500 // default value
```

================================================================================

## SECURITY FEATURES

• Firebase Authentication with email/password
• Role-based access control
• Secure data transmission (HTTPS)
• Activity logging for audit trails
• Input validation and sanitization
• Session management

================================================================================

## FIREBASE SECURITY RULES

### Firestore Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Storage Rules
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

================================================================================

## FILE STRUCTURE

```
clinic-management-system/
├── index.html          # Main HTML structure
├── style.css           # Custom styling
├── script.js           # Application logic
└── README.txt          # This documentation
```

================================================================================

## TROUBLESHOOTING

### Common Issues
• Index Errors: Create required Firestore indexes
• Authentication Fails: Check Firebase config
• PDF Not Generating: Verify jsPDF library loading
• Storage Upload Fails: Check Firebase Storage rules

### Important Notes
• Always backup your Firebase data regularly
• Monitor Firebase usage to avoid quota limits
• Keep Firebase SDK updated for security
• Test thoroughly before production deployment

================================================================================

## FUTURE ENHANCEMENTS

• Appointment scheduling system
• SMS notifications for patients
• Medical history tracking
• Inventory management
• Analytics dashboard
• Multi-language support
• Mobile app development



================================================================================

## QUICK START GUIDE

1. Setup Firebase project with Authentication, Firestore, and Storage
2. Update Firebase configuration in script.js
3. Open index.html in web browser
4. Register as Doctor or Receptionist
5. Start using the system according to your role

For detailed setup instructions, refer to the "Installation & Setup" section above.

================================================================================


LINK :   https://gregarious-naiad-8abe52.netlify.app/

Link hosted of netlify



Images

HomePage


![alt text](<Screenshot (38).png>)



Register as Recipients


![alt text](<Screenshot (49).png>)



Authentication Database Storage


![alt text](<Screenshot (53).png>)



Token Generation and patients detail(name,phone,complaint)


![alt text](<Screenshot (70).png>)



token check in Firebase check and login check


![alt text](<Screenshot (71).png>)
![alt text](<Screenshot (72).png>)




Register as doctor and check in authentication

![alt text](<Screenshot (73).png>)
![alt text](<Screenshot (74).png>)







Doctor Queue select the patient token number and  patient prescription(Submit Prescription)
![alt text](<Screenshot (75).png>)
![alt text](<Screenshot (76).png>)


Receptionist genrate bill section and save the pdf of bill in the storage of firebase section
![alt text](<Screenshot (79).png>)
![alt text](<Screenshot (80).png>)
![alt text](<Screenshot (81).png>)
![alt text](<Screenshot (108).png>)
![alt text](<Screenshot (109).png>)



firestore Database of patient and bills
![alt text](<Screenshot (112).png>)
![alt text](<Screenshot (110).png>)
![alt text](<Screenshot (111).png>)
