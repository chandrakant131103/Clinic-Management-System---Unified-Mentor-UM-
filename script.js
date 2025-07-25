        // Firebase setup
        const firebaseConfig = {
            apiKey: "AIzaSyBVEKPE3eHUf5oYf5QN7O6y60FRXp4lvig",
            authDomain: "gov-doc--system.firebaseapp.com",
            projectId: "gov-doc--system",
            storageBucket: "gov-doc--system.firebasestorage.app",
            messagingSenderId: "481808708152",
            appId: "1:481808708152:web:ece7eb6e1911a0c344eccd"
        };

        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        const auth = firebase.auth();
        const db = firebase.firestore();
        const storage = firebase.storage();

        // Global variables
        let currentUser = null;
        let currentUserType = null;
        let currentTokenNumber = 1;
        let selectedPatientId = null;

        // Show alert messages
        function showAlert(message, type = 'success') {
            const alertBox = document.getElementById('alertBox');
            alertBox.textContent = message;
            alertBox.className = `alert ${type} show`;
            setTimeout(() => alertBox.classList.remove('show'), 5000);
        }

        // Log actions to Firestore
        function logAction(action, details = {}) {
            const logEntry = {
                timestamp: new Date().toISOString(),
                action: action,
                user: currentUser ? currentUser.email : 'anonymous',
                userType: currentUserType,
                details: details
            };
            console.log('LOG:', logEntry);
            db.collection('logs').add(logEntry)
                .catch(error => console.error('Error logging:', error));
        }

        // Show login section
        function showLogin() {
            document.getElementById('registerSection').style.display = 'none';
            document.getElementById('doctorLoginForm').parentElement.style.display = 'block';
            document.getElementById('receptionistLoginForm').parentElement.style.display = 'block';
            logAction('SHOW_LOGIN');
        }

        // Show registration form
        function showRegisterForm(userType) {
            document.getElementById('doctorLoginForm').parentElement.style.display = 'none';
            document.getElementById('receptionistLoginForm').parentElement.style.display = 'none';
            document.getElementById('registerSection').style.display = 'block';
            document.getElementById('registerTitle').textContent = `Register as ${userType.charAt(0).toUpperCase() + userType.slice(1)}`;
            document.getElementById('registerUserType').value = userType;
            logAction('SHOW_REGISTER_FORM', { userType: userType });
        }

        // Register new user
        document.getElementById('registerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const name = document.getElementById('registerName').value;
            const userType = document.getElementById('registerUserType').value;

            try {
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                await db.collection('users').doc(userCredential.user.uid).set({
                    email: email,
                    name: name,
                    userType: userType,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                logAction('REGISTER', { email: email, userType: userType });
                showAlert('Registration successful! Please login.', 'success');
                showLogin();
                document.getElementById('registerForm').reset();
            } catch (error) {
                logAction('REGISTER_FAILED', { error: error.message });
                let errorMessage = 'Registration failed: ' + error.message;
                if (error.code === 'auth/email-already-in-use') {
                    errorMessage = 'This email is already registered.';
                } else if (error.code === 'auth/weak-password') {
                    errorMessage = 'Password is too weak. Use at least 6 characters.';
                }
                showAlert(errorMessage, 'error');
            }
        });

        // Doctor login
        document.getElementById('doctorLoginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('doctorEmail').value;
            const password = document.getElementById('doctorPassword').value;

            try {
                const userCredential = await auth.signInWithEmailAndPassword(email, password);
                currentUser = userCredential.user;
                const userDoc = await db.collection('users').doc(currentUser.uid).get();
                
                if (!userDoc.exists || userDoc.data().userType !== 'doctor') {
                    throw new Error('Not authorized as a doctor');
                }

                currentUserType = 'doctor';
                logAction('LOGIN', { userType: 'doctor', email: email });
                showAlert('Doctor login successful!', 'success');
                showDoctorDashboard();
            } catch (error) {
                logAction('LOGIN_FAILED', { userType: 'doctor', error: error.message });
                let errorMessage = 'Login failed: ' + error.message;
                if (error.code === 'auth/user-not-found') {
                    errorMessage = 'No account found with this email.';
                } else if (error.code === 'auth/wrong-password') {
                    errorMessage = 'Incorrect password.';
                }
                showAlert(errorMessage, 'error');
            }
        });

        // Receptionist login
        document.getElementById('receptionistLoginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('receptionistEmail').value;
            const password = document.getElementById('receptionistPassword').value;

            try {
                const userCredential = await auth.signInWithEmailAndPassword(email, password);
                currentUser = userCredential.user;
                const userDoc = await db.collection('users').doc(currentUser.uid).get();
                
                if (!userDoc.exists || userDoc.data().userType !== 'receptionist') {
                    throw new Error('Not authorized as a receptionist');
                }

                currentUserType = 'receptionist';
                logAction('LOGIN', { userType: 'receptionist', email: email });
                showAlert('Receptionist login successful!', 'success');
                showReceptionistDashboard();
            } catch (error) {
                logAction('LOGIN_FAILED', { userType: 'receptionist', error: error.message });
                let errorMessage = 'Login failed: ' + error.message;
                if (error.code === 'auth/user-not-found') {
                    errorMessage = 'No account found with this email.';
                } else if (error.code === 'auth/wrong-password') {
                    errorMessage = 'Incorrect password.';
                }
                showAlert(errorMessage, 'error');
            }
        });

        // Show doctor dashboard
        function showDoctorDashboard() {
            document.getElementById('authSection').style.display = 'none';
            document.getElementById('doctorDashboard').classList.add('active');
            loadPatientQueue();
            logAction('SHOW_DOCTOR_DASHBOARD');
        }

        // Show receptionist dashboard
        function showReceptionistDashboard() {
            document.getElementById('authSection').style.display = 'none';
            document.getElementById('receptionistDashboard').classList.add('active');
            loadCurrentToken();
            loadBillingSection();
            logAction('SHOW_RECEPTIONIST_DASHBOARD');
        }

        // Load patient queue for doctor
        async function loadPatientQueue() {
            const patientQueue = document.getElementById('patientQueue');
            patientQueue.innerHTML = '<p>Loading patients...</p>';

            try {
                const querySnapshot = await db.collection('patients')
                    .where('status', '==', 'waiting')
                    .orderBy('tokenNumber')
                    .get();

                if (querySnapshot.empty) {
                    patientQueue.innerHTML = '<p>No patients in queue</p>';
                } else {
                    patientQueue.innerHTML = '';
                    querySnapshot.forEach((doc) => {
                        const patient = doc.data();
                        const patientItem = document.createElement('div');
                        patientItem.className = 'patient-item';
                        patientItem.innerHTML = `
                            <h4>Token #${patient.tokenNumber || 'N/A'} - ${patient.name || 'Unknown'}</h4>
                            <p>Age: ${patient.age || 'N/A'} | Phone: ${patient.phone || 'N/A'}</p>
                            <p>Complaint: ${patient.complaint || 'N/A'}</p>
                        `;
                        patientItem.onclick = () => selectPatient(doc.id, patient);
                        patientQueue.appendChild(patientItem);
                    });
                }
                logAction('LOAD_PATIENT_QUEUE', { count: querySnapshot.size });
            } catch (error) {
                console.error('Patient Queue Error:', error);
                logAction('LOAD_PATIENT_QUEUE_FAILED', { error: error.message });
                patientQueue.innerHTML = '<p>Error loading patients. Please check indexes and try again.</p>';
                if (error.message.includes('index')) {
                    showAlert('Patient queue requires a Firestore index. Create it in the Firebase Console under Indexes.', 'error');
                } else {
                    showAlert('Failed to load patient queue: ' + error.message, 'error');
                }
            }
        }

        // Select patient for examination
        function selectPatient(patientId, patient) {
            selectedPatientId = patientId;
            const detailsDiv = document.getElementById('selectedPatientDetails');
            detailsDiv.innerHTML = `
                <div style="background: #e3f2fd; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                    <h4>👤 ${patient.name || 'Unknown'}</h4>
                    <p><strong>Token:</strong> #${patient.tokenNumber || 'N/A'}</p>
                    <p><strong>Age:</strong> ${patient.age || 'N/A'}</p>
                    <p><strong>Phone:</strong> ${patient.phone || 'N/A'}</p>
                    <p><strong>Complaint:</strong> ${patient.complaint || 'N/A'}</p>
                </div>
            `;

            const prescriptionSection = document.getElementById('prescriptionSection');
            prescriptionSection.innerHTML = `
                <div class="prescription-form">
                    <h4>📋 Prescription</h4>
                    <form id="prescriptionForm">
                        <div class="form-group">
                            <label for="diagnosis">Diagnosis</label>
                            <input type="text" id="diagnosis" required>
                        </div>
                        <div class="form-group">
                            <label for="prescription">Prescription</label>
                            <textarea id="prescription" placeholder="Enter medications and instructions..." required></textarea>
                        </div>
                        <div class="form-group">
                            <label for="consultationFee">Consultation Fee (₹)</label>
                            <input type="number" id="consultationFee" value="500" required>
                        </div>
                        <button type="submit" class="btn">Submit Prescription</button>
                    </form>
                </div>
            `;

            document.getElementById('prescriptionForm').addEventListener('submit', (e) => submitPrescription(e, patientId));
            logAction('SELECT_PATIENT', { patientId, patientName: patient.name || 'Unknown' });
        }

        // Submit prescription
        async function submitPrescription(e, patientId) {
            e.preventDefault();
            const diagnosis = document.getElementById('diagnosis').value;
            const prescription = document.getElementById('prescription').value;
            const consultationFee = document.getElementById('consultationFee').value;

            try {
                await db.collection('patients').doc(patientId).update({
                    diagnosis: diagnosis || 'N/A',
                    prescription: prescription || 'N/A',
                    consultationFee: parseFloat(consultationFee) || 500,
                    status: 'completed',
                    doctorId: currentUser.uid,
                    completedAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                logAction('SUBMIT_PRESCRIPTION', { patientId, diagnosis, consultationFee });
                showAlert('Prescription submitted successfully!', 'success');
                document.getElementById('selectedPatientDetails').innerHTML = '<p>Select a patient to view details</p>';
                document.getElementById('prescriptionSection').innerHTML = '';
                loadPatientQueue();
            } catch (error) {
                console.error('Submit Prescription Error:', error);
                logAction('SUBMIT_PRESCRIPTION_FAILED', { error: error.message });
                showAlert('Failed to submit prescription: ' + error.message, 'error');
            }
        }

        // Load current token number
        async function loadCurrentToken() {
            try {
                const tokenDoc = await db.collection('settings').doc('currentToken').get();
                if (tokenDoc.exists) {
                    currentTokenNumber = tokenDoc.data().value || 1;
                } else {
                    currentTokenNumber = 1;
                    await db.collection('settings').doc('currentToken').set({ value: 1 });
                }
                document.getElementById('currentToken').textContent = String(currentTokenNumber).padStart(3, '0');
                logAction('LOAD_TOKEN');
            } catch (error) {
                console.error('Load Token Error:', error);
                logAction('LOAD_TOKEN_FAILED', { error: error.message });
                document.getElementById('currentToken').textContent = '001';
                showAlert('Failed to load token number', 'error');
            }
        }

        // Patient registration
        document.getElementById('patientRegistrationForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('patientName').value;
            const age = document.getElementById('patientAge').value;
            const phone = document.getElementById('patientPhone').value;
            const complaint = document.getElementById('patientComplaint').value;

            try {
                const patient = {
                    name: name || 'Unknown',
                    age: parseInt(age) || 0,
                    phone: phone || 'N/A',
                    complaint: complaint || 'N/A',
                    tokenNumber: currentTokenNumber,
                    status: 'waiting',
                    registeredAt: firebase.firestore.FieldValue.serverTimestamp(),
                    receptionistId: currentUser ? currentUser.uid : 'anonymous'
                };

                await db.collection('patients').add(patient);
                currentTokenNumber++;
                await db.collection('settings').doc('currentToken').set({ value: currentTokenNumber });

                document.getElementById('currentToken').textContent = String(currentTokenNumber).padStart(3, '0');
                logAction('REGISTER_PATIENT', { patientName: name, tokenNumber: currentTokenNumber - 1 });
                showAlert(`Patient registered! Token #${String(currentTokenNumber - 1).padStart(3, '0')}`, 'success');
                document.getElementById('patientRegistrationForm').reset();
                loadBillingSection();
            } catch (error) {
                console.error('Register Patient Error:', error);
                logAction('REGISTER_PATIENT_FAILED', { error: error.message });
                showAlert('Failed to register patient: ' + error.message, 'error');
            }
        });

        // Load billing section
        async function loadBillingSection() {
            const billingSection = document.getElementById('billingSection');
            billingSection.innerHTML = '<p>Loading bills...</p>';

            try {
                const querySnapshot = await db.collection('patients')
                    .where('status', '==', 'completed')
                    .orderBy('completedAt', 'desc')
                    .limit(10)
                    .get();

                if (querySnapshot.empty) {
                    billingSection.innerHTML = '<p>No bills available</p>';
                } else {
                    billingSection.innerHTML = '';
                    querySnapshot.forEach((doc) => {
                        const patient = doc.data();
                        const billingDiv = document.createElement('div');
                        billingDiv.className = 'billing-section';
                        billingDiv.innerHTML = `
                            <h4>💰 Bill for ${patient.name || 'Unknown'} (Token #${patient.tokenNumber || 'N/A'})</h4>
                            <div class="bill-item">
                                <span>Consultation Fee:</span>
                                <span>₹${patient.consultationFee || 0}</span>
                            </div>
                            <div class="bill-item">
                                <span>Registration Fee:</span>
                                <span>₹50</span>
                            </div>
                            <div class="total-amount">
                                Total: ₹${(patient.consultationFee || 0) + 50}
                            </div>
                            <button class="btn" onclick="generateBill('${doc.id}')">Generate Bill</button>
                        `;
                        billingSection.appendChild(billingDiv);
                    });
                }
                logAction('LOAD_BILLING_SECTION', { count: querySnapshot.size });
            } catch (error) {
                console.error('Load Billing Error:', error);
                logAction('LOAD_BILLING_SECTION_FAILED', { error: error.message });
                billingSection.innerHTML = '<p>Error loading bills. Please check indexes and try again.</p>';
                if (error.message.includes('index')) {
                    showAlert('Billing section requires a Firestore index. Create it in the Firebase Console under Indexes.', 'error');
                } else {
                    showAlert('Failed to load billing section: ' + error.message, 'error');
                }
            }
        }

        // Generate bill and PDF
        async function generateBill(patientId) {
            try {
                console.log('Generating bill for patient ID:', patientId);
                const patientDoc = await db.collection('patients').doc(patientId).get();
                if (!patientDoc.exists) {
                    throw new Error('Patient document not found');
                }
                const patient = patientDoc.data();
                console.log('Patient data:', patient);

                const billData = {
                    patientId: patientId,
                    patientName: patient.name || 'Unknown',
                    tokenNumber: patient.tokenNumber || 0,
                    consultationFee: patient.consultationFee || 0,
                    registrationFee: 50,
                    totalAmount: (patient.consultationFee || 0) + 50,
                    generatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    generatedBy: currentUser ? currentUser.uid : 'anonymous',
                    diagnosis: patient.diagnosis || 'N/A',
                    prescription: patient.prescription || 'N/A'
                };

                console.log('Bill data to save:', billData);

                // Generate PDF
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();
                doc.setFontSize(16);
                doc.text('Chandrakant Hospital - Bill', 20, 20);
                doc.setFontSize(12);
                doc.text(`Patient: ${billData.patientName}`, 20, 40);
                doc.text(`Token Number: #${billData.tokenNumber}`, 20, 50);
                doc.text(`Diagnosis: ${billData.diagnosis}`, 20, 60);
                // Wrap prescription text to fit page width (170px max)
                const prescriptionLines = doc.splitTextToSize(`Prescription: ${billData.prescription}`, 170);
                doc.text(prescriptionLines, 20, 70);
                const prescriptionHeight = prescriptionLines.length * 10; // Approximate height (10px per line)
                doc.text(`Consultation Fee: ₹${billData.consultationFee}`, 20, 80 + prescriptionHeight);
                doc.text(`Registration Fee: ₹${billData.registrationFee}`, 20, 90 + prescriptionHeight);
                doc.text(`Total Amount: ₹${billData.totalAmount}`, 20, 100 + prescriptionHeight);
                doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 110 + prescriptionHeight);
                doc.text(`By: ${currentUser ? currentUser.email : 'Anonymous'}`, 20, 120 + prescriptionHeight);

                // Convert PDF to blob
                const pdfBlob = doc.output('blob');
                console.log('PDF generated, size:', pdfBlob.size);

                // Sanitize patient name for filename
                const sanitizedPatientName = (patient.name || 'Unknown').replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
                const storagePath = `bills/Bill-Chandrakant_Hospital-${sanitizedPatientName}-Token_${billData.tokenNumber}.pdf`;
                const storageRef = storage.ref().child(storagePath);
                const uploadTask = await storageRef.put(pdfBlob);
                const downloadURL = await uploadTask.ref.getDownloadURL();
                console.log('PDF uploaded to:', downloadURL);

                // Save bill data to Firestore with PDF URL
                billData.pdfUrl = downloadURL;
                await db.collection('bills').add(billData);

                logAction('GENERATE_BILL', { patientId, patientName: patient.name, amount: billData.totalAmount, pdfUrl: downloadURL });
                showAlert(`Bill generated for ${patient.name} - Total: ₹${billData.totalAmount}. PDF saved.`, 'success');
                loadBillingSection();
            } catch (error) {
                console.error('Generate Bill Error:', error);
                logAction('GENERATE_BILL_FAILED', { error: error.message });
                showAlert('Failed to generate bill: ' + error.message, 'error');
            }
        }

        // Logout function
        function logout() {
            auth.signOut().then(() => {
                logAction('LOGOUT', { userType: currentUserType });
                currentUser = null;
                currentUserType = null;
                selectedPatientId = null;
                document.getElementById('authSection').style.display = 'flex';
                document.getElementById('doctorDashboard').classList.remove('active');
                document.getElementById('receptionistDashboard').classList.remove('active');
                document.getElementById('doctorLoginForm').reset();
                document.getElementById('receptionistLoginForm').reset();
                showAlert('Logged out successfully!', 'success');
            }).catch((error) => {
                console.error('Logout Error:', error);
                logAction('LOGOUT_FAILED', { error: error.message });
                showAlert('Logout failed: ' + error.message, 'error');
            });
        }

        // Initialize application
        window.addEventListener('load', () => {
            logAction('APP_INITIALIZED');
            console.log('Clinic Management System initialized');

            auth.onAuthStateChanged((user) => {
                if (user) {
                    currentUser = user;
                    db.collection('users').doc(user.uid).get().then((doc) => {
                        if (doc.exists) {
                            currentUserType = doc.data().userType;
                            if (currentUserType === 'doctor') {
                                showDoctorDashboard();
                            } else if (currentUserType === 'receptionist') {
                                showReceptionistDashboard();
                            }
                            logAction('AUTO_LOGIN', { email: user.email, userType: currentUserType });
                        } else {
                            showAlert('User data not found. Please register.', 'error');
                            auth.signOut();
                        }
                    }).catch((error) => {
                        console.error('User Data Fetch Error:', error);
                        logAction('USER_DATA_FETCH_FAILED', { error: error.message });
                        showAlert('Error fetching user data: ' + error.message, 'error');
                    });
                } else {
                    document.getElementById('authSection').style.display = 'flex';
                    document.getElementById('doctorDashboard').classList.remove('active');
                    document.getElementById('receptionistDashboard').classList.remove('active');
                }
            });
        });