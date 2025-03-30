  // Initialize Firebase
  const firebaseConfig = {
    apiKey: "AIzaSyB221RejvHWwYHPbMF4-J5NaU6g0sdAjEI",
    authDomain: "freelanceflow-93fa9.firebaseapp.com",
    projectId: "freelanceflow-93fa9",
    storageBucket: "freelanceflow-93fa9.appspot.com",
    messagingSenderId: "296748017027",
    appId: "1:296748017027:web:677499aade0ad0188f82b6",
    measurementId: "G-C0GN3LHQ2G"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Initialize Google Auth Provider
const googleProvider = new firebase.auth.GoogleAuthProvider();

// DOM Elements
const userName = document.getElementById('userName');
const userAvatar = document.getElementById('userAvatar');
const dashboardLink = document.getElementById('dashboardLink');
const profileLink = document.getElementById('profileLink');
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
const clientsTableBody = document.getElementById('clientsTableBody');
const leadsTableBody = document.getElementById('leadsTableBody');
const commentSidebar = document.getElementById('commentSidebar');
const commentContent = document.getElementById('commentContent');
const closeSidebar = document.getElementById('closeSidebar');
const overlay = document.getElementById('overlay');
const createLeadBtn = document.getElementById('createLeadBtn');
const clientModal = document.getElementById('clientModal');
const closeClientModal = document.getElementById('closeClientModal');
const cancelForm = document.getElementById('cancelForm');
const clientForm = document.getElementById('clientForm');
const statusOptions = document.querySelectorAll('.status-option');
const leadFields = document.getElementById('leadFields');
const clientFields = document.getElementById('clientFields');
const logoutBtn = document.getElementById('logoutBtn');
const paymentModal = document.getElementById('paymentModal');
const closePaymentModal = document.getElementById('closePaymentModal');
const paymentForm = document.getElementById('paymentForm');
const cancelPaymentForm = document.getElementById('cancelPaymentForm');
const leadTypeSelect = document.getElementById('leadType');
const convertedFields = document.getElementById('convertedFields');
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const googleSignInBtn = document.getElementById('googleSignInBtn');

// Show/Hide Modals
function showModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function hideModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Toggle between login and register modals
showRegister.addEventListener('click', (e) => {
    e.preventDefault();
    hideModal(loginModal);
    showModal(registerModal);
});

showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    hideModal(registerModal);
    showModal(loginModal);
});

// Google Sign-In
googleSignInBtn.addEventListener('click', () => {
    auth.signInWithPopup(googleProvider)
        .then(async (result) => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = firebase.auth.GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            
            // The signed-in user info
            const user = result.user;
            
            // Check if user exists in Firestore
            const userDoc = await db.collection('users').doc(user.uid).get();
            
            if (!userDoc.exists) {
                // Create user document if it doesn't exist
                await db.collection('users').doc(user.uid).set({
                    name: user.displayName,
                    email: user.email,
                    photoURL: user.photoURL,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
            
            hideModal(loginModal);
        })
        .catch((error) => {
            console.error('Google Sign-In Error:', error);
            alert('Google Sign-In failed: ' + error.message);
        });
});

// Status Toggle
statusOptions.forEach(option => {
    option.addEventListener('click', () => {
        statusOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');

        if (option.dataset.value === 'lead') {
            leadFields.classList.add('active');
            clientFields.classList.remove('active');
            document.getElementById('leadType').required = true;
            document.getElementById('totalAmount').required = false;
            document.getElementById('advancePayment').required = false;
            document.getElementById('clientStatus').required = false;
        } else {
            leadFields.classList.remove('active');
            clientFields.classList.add('active');
            document.getElementById('leadType').required = false;
            document.getElementById('totalAmount').required = true;
            document.getElementById('advancePayment').required = true;
            document.getElementById('clientStatus').required = true;
        }
    });
});

// Handle lead type changes
leadTypeSelect.addEventListener('change', function () {
    if (this.value === 'converted') {
        convertedFields.classList.add('active');
        document.getElementById('convertedTotalAmount').required = true;
        document.getElementById('convertedAdvancePayment').required = true;
    } else {
        convertedFields.classList.remove('active');
        document.getElementById('convertedTotalAmount').required = false;
        document.getElementById('convertedAdvancePayment').required = false;
    }
});

// Format date
function formatDate(date) {
    if (!date) return 'N/A';
    const d = date.toDate();
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Format currency
function formatCurrency(amount) {
    if (!amount) return '$0';
    return '$' + parseFloat(amount).toFixed(2);
}

// Get status class
function getStatusClass(status) {
    switch (status) {
        case 'warm': return 'warm';
        case 'cold': return 'cold';
        case 'quotation': return 'quotation';
        case 'converted': return 'converted';
        case 'to-start': return 'to-start';
        case 'in-progress': return 'in-progress';
        case 'changes': return 'changes';
        case 'delivered': return 'delivered';
        case 'client': return 'client';
        default: return 'lead';
    }
}

// Get status display text
function getStatusText(status) {
    const statusMap = {
        'warm': 'Warm Lead',
        'cold': 'Cold Lead',
        'quotation': 'Quotation Sent',
        'converted': 'Converted',
        'to-start': 'To Start',
        'in-progress': 'In Progress',
        'changes': 'Changes',
        'delivered': 'Delivered',
        'client': 'Client'
    };
    return statusMap[status] || status;
}

// Open payment modal
function openPaymentModal(docId, type, totalAmount, advancePayment) {
    document.getElementById('paymentDocId').value = docId;
    document.getElementById('paymentType').value = type;
    document.getElementById('editTotalAmount').value = totalAmount || '';
    document.getElementById('editAdvancePayment').value = advancePayment || '';
    showModal(paymentModal);
}

// Load Data from Firestore
function loadData() {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    // Hide login modal if user is authenticated
    hideModal(loginModal);
    hideModal(registerModal);

    // Load Clients
    db.collection('users').doc(currentUser.uid).collection('clients')
        .orderBy('createdAt', 'desc')
        .onSnapshot(snapshot => {
            clientsTableBody.innerHTML = '';
            snapshot.forEach(doc => {
                const client = doc.data();
                const row = document.createElement('tr');
                
                // Create status dropdown
                const statusSelect = document.createElement('select');
                statusSelect.className = 'status-select';
                statusSelect.innerHTML = `
                    <option value="to-start" ${client.status === 'to-start' ? 'selected' : ''}>To Start</option>
                    <option value="in-progress" ${client.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                    <option value="changes" ${client.status === 'changes' ? 'selected' : ''}>Changes</option>
                    <option value="delivered" ${client.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                `;
                
                // Add change event to update status in Firestore
                statusSelect.addEventListener('change', async (e) => {
                    try {
                        await db.collection('users').doc(currentUser.uid)
                            .collection('clients').doc(doc.id)
                            .update({ status: e.target.value });
                    } catch (error) {
                        console.error('Error updating status:', error);
                        alert('Error updating status. Please try again.');
                    }
                });

                const statusCell = document.createElement('td');
                statusCell.appendChild(statusSelect);
                
                row.innerHTML = `
                    <td>${formatDate(client.createdAt)}</td>
                    <td>
                        <strong>${client.customerName}</strong><br>
                        ${client.contact}<br>
                        ${client.location}
                    </td>
                    <td>
                        ${client.comments ? client.comments.substring(0, 30) + (client.comments.length > 30 ? '...' : '') : 'No comments'}
                    </td>
                    <td>
                        ${client.advancePayment ? `Advance: ${formatCurrency(client.advancePayment)}<br>` : ''}
                        ${client.totalAmount ? `Total: ${formatCurrency(client.totalAmount)}` : ''}
                        <button class="payment-link" 
                            data-id="${doc.id}"
                            data-type="client"
                            data-total="${client.totalAmount || ''}"
                            data-advance="${client.advancePayment || ''}">
                            Edit Payment
                        </button>
                    </td>
                    <td>
                        <button class="view-comments" data-comments="${client.comments || 'No comments'}">
                            View Full
                        </button>
                    </td>
                `;
                
                // Insert status cell in the correct position
                row.insertBefore(statusCell, row.children[2]);
                clientsTableBody.appendChild(row);
            });
            
            addCommentListeners();
            addPaymentListeners();
        });

    // Load Leads
    db.collection('users').doc(currentUser.uid).collection('leads')
        .orderBy('createdAt', 'desc')
        .onSnapshot(snapshot => {
            leadsTableBody.innerHTML = '';
            snapshot.forEach(doc => {
                const lead = doc.data();
                const row = document.createElement('tr');
                
                // Convert button for non-converted leads
                let convertButton = '';
                if (lead.leadType !== 'converted') {
                    convertButton = `
                        <button class="btn convert-btn" data-id="${doc.id}" style="padding: 0.25rem 0.5rem; margin-top: 0.5rem;">
                            Convert to Client
                        </button>
                    `;
                }
                
                row.innerHTML = `
                    <td>${formatDate(lead.createdAt)}</td>
                    <td>
                        <strong>${lead.customerName}</strong><br>
                        ${lead.contact}<br>
                        ${lead.location}
                    </td>
                    <td><span class="status ${getStatusClass(lead.leadType)}">${getStatusText(lead.leadType)}</span></td>
                    <td>
                        ${lead.leadType === 'converted' ? `
                            ${lead.advancePayment ? `Advance: ${formatCurrency(lead.advancePayment)}<br>` : ''}
                            ${lead.totalAmount ? `Total: ${formatCurrency(lead.totalAmount)}` : ''}
                        ` : 'N/A'}
                    </td>
                    <td>
                        ${lead.comments ? lead.comments.substring(0, 30) + (lead.comments.length > 30 ? '...' : '') : 'No comments'}
                    </td>
                    <td>
                        <button class="view-comments" data-comments="${lead.comments || 'No comments'}">
                            View Full
                        </button>
                        ${convertButton}
                    </td>
                `;
                leadsTableBody.appendChild(row);
            });
            
            addCommentListeners();
            addConvertButtonListeners();
        });
}

// Add convert button listeners
function addConvertButtonListeners() {
    document.querySelectorAll('.convert-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const leadId = e.target.getAttribute('data-id');
            const currentUser = auth.currentUser;
            
            if (!currentUser) {
                alert('Please login first');
                return;
            }
            
            // Show conversion modal
            showConversionModal(leadId);
        });
    });
}

// Show conversion modal
function showConversionModal(leadId) {
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop active';
    modal.innerHTML = `
        <div class="modal-container">
            <div class="modal-header">
                <h2 class="modal-title">Convert Lead to Client</h2>
                <button class="close-btn" id="closeConvertModal">&times;</button>
            </div>
            <form id="convertForm">
                <input type="hidden" id="convertLeadId" value="${leadId}">
                
                <div class="form-group">
                    <label for="convertTotalAmount">Total Amount ($) *</label>
                    <input type="number" id="convertTotalAmount" class="form-control" min="0" step="0.01" required>
                </div>
                
                <div class="form-group">
                    <label for="convertAdvancePayment">Advance Payment ($)</label>
                    <input type="number" id="convertAdvancePayment" class="form-control" min="0" step="0.01">
                </div>
                
                <div class="form-group">
                    <label for="convertComments">Additional Comments</label>
                    <textarea id="convertComments" class="form-control" rows="3"></textarea>
                </div>
                
                <div class="form-group" style="display: flex; justify-content: flex-end; gap: 1rem;">
                    <button type="button" class="btn btn-secondary" id="cancelConvert">Cancel</button>
                    <button type="submit" class="submit-btn">Convert</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Add event listeners
    document.getElementById('closeConvertModal').addEventListener('click', () => {
        document.body.removeChild(modal);
        document.body.style.overflow = 'auto';
    });
    
    document.getElementById('cancelConvert').addEventListener('click', () => {
        document.body.removeChild(modal);
        document.body.style.overflow = 'auto';
    });
    
    document.getElementById('convertForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const currentUser = auth.currentUser;
        const leadId = document.getElementById('convertLeadId').value;
        const totalAmount = parseFloat(document.getElementById('convertTotalAmount').value);
        const advancePayment = parseFloat(document.getElementById('convertAdvancePayment').value) || 0;
        const comments = document.getElementById('convertComments').value.trim();
        
        if (isNaN(totalAmount)) {
            alert('Please enter a valid total amount');
            return;
        }
        
        try {
            const userRef = db.collection('users').doc(currentUser.uid);
            const leadDoc = await userRef.collection('leads').doc(leadId).get();
            const leadData = leadDoc.data();
            
            // Create client
            await userRef.collection('clients').add({
                customerName: leadData.customerName,
                contact: leadData.contact,
                location: leadData.location,
                status: 'to-start',
                totalAmount: totalAmount,
                advancePayment: advancePayment,
                comments: comments || leadData.comments || '',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                userId: currentUser.uid
            });
            
            // Update lead to converted
            await userRef.collection('leads').doc(leadId).update({
                leadType: 'converted',
                totalAmount: totalAmount,
                advancePayment: advancePayment,
                convertedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            alert('Lead converted to client successfully!');
            document.body.removeChild(modal);
            document.body.style.overflow = 'auto';
        } catch (error) {
            console.error('Error converting lead:', error);
            alert('Error converting lead. Please try again.');
        }
    });
}

function addCommentListeners() {
    document.querySelectorAll('.view-comments').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const comments = e.target.getAttribute('data-comments');
            commentContent.innerHTML = `<p>${comments || 'No comments available'}</p>`;
            showModal(commentSidebar);
        });
    });
}

function addPaymentListeners() {
    document.querySelectorAll('.payment-link').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const docId = e.target.getAttribute('data-id');
            const type = e.target.getAttribute('data-type');
            const totalAmount = e.target.getAttribute('data-total');
            const advancePayment = e.target.getAttribute('data-advance');
            openPaymentModal(docId, type, totalAmount, advancePayment);
        });
    });
}

// Form Submission
clientForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const currentUser = auth.currentUser;
    if (!currentUser) {
        alert('Please login first');
        return;
    }

    const formData = {
        customerName: document.getElementById('customerName').value.trim(),
        contact: document.getElementById('contact').value.trim(),
        location: document.getElementById('location').value.trim(),
        status: document.querySelector('.status-option.active').dataset.value,
        comments: document.getElementById('comments').value.trim(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        userId: currentUser.uid
    };

    // Validate required fields
    if (!formData.customerName || !formData.contact || !formData.location) {
        alert('Please fill all required fields');
        return;
    }

    try {
        const userRef = db.collection('users').doc(currentUser.uid);

        if (formData.status === 'lead') {
            formData.leadType = document.getElementById('leadType').value;

            // If lead is converted, add payment details
            if (formData.leadType === 'converted') {
                formData.totalAmount = parseFloat(document.getElementById('convertedTotalAmount').value) || 0;
                formData.advancePayment = parseFloat(document.getElementById('convertedAdvancePayment').value) || 0;

                // Also add as a client
                const clientData = {
                    customerName: formData.customerName,
                    contact: formData.contact,
                    location: formData.location,
                    status: 'to-start', // Default status for new clients
                    totalAmount: formData.totalAmount,
                    advancePayment: formData.advancePayment,
                    comments: formData.comments,
                    createdAt: formData.createdAt,
                    userId: formData.userId
                };

                await userRef.collection('clients').add(clientData);
            }

            await userRef.collection('leads').add(formData);
        } else {
            formData.status = document.getElementById('clientStatus').value;
            formData.totalAmount = parseFloat(document.getElementById('totalAmount').value) || 0;
            formData.advancePayment = parseFloat(document.getElementById('advancePayment').value) || 0;
            await userRef.collection('clients').add(formData);
        }

        alert('Data saved successfully!');
        clientForm.reset();
        hideModal(clientModal);
    } catch (error) {
        console.error('Error saving data:', error);
        alert('Error saving data. Please try again. ' + error.message);
    }
});

// Payment Form Submission
paymentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const currentUser = auth.currentUser;
    if (!currentUser) {
        alert('Please login first');
        return;
    }

    const docId = document.getElementById('paymentDocId').value;
    const type = document.getElementById('paymentType').value;
    const totalAmount = parseFloat(document.getElementById('editTotalAmount').value) || 0;
    const advancePayment = parseFloat(document.getElementById('editAdvancePayment').value) || 0;

    if (isNaN(totalAmount)) {
        alert('Please enter a valid total amount');
        return;
    }

    try {
        const userRef = db.collection('users').doc(currentUser.uid);

        if (type === 'client') {
            await userRef.collection('clients').doc(docId).update({
                totalAmount: totalAmount,
                advancePayment: advancePayment
            });
        } else if (type === 'lead') {
            await userRef.collection('leads').doc(docId).update({
                totalAmount: totalAmount,
                advancePayment: advancePayment
            });
        }

        alert('Payment updated successfully!');
        hideModal(paymentModal);
    } catch (error) {
        console.error('Error updating payment:', error);
        alert('Error updating payment. Please try again. ' + error.message);
    }
});

// Tab Switching
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        tab.classList.add('active');
        document.getElementById(`${tab.dataset.tab}Tab`).classList.add('active');
    });
});

// Login Form Submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        // User is logged in, loadData will be called by auth state change handler
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed: ' + error.message);
    }
});

// Register Form Submission
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    try {
        // Create user in Firebase Auth
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        
        // Update user profile with display name
        await userCredential.user.updateProfile({
            displayName: name
        });
        
        // Create user document in Firestore
        await db.collection('users').doc(userCredential.user.uid).set({
            name: name,
            email: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        alert('Registration successful! You are now logged in.');
        hideModal(registerModal);
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed: ' + error.message);
    }
});

// Event Listeners
createLeadBtn.addEventListener('click', () => {
    clientForm.reset();
    document.querySelector('.status-option[data-value="lead"]').click();
    document.getElementById('leadType').value = 'warm';
    convertedFields.classList.remove('active');
    showModal(clientModal);
});

closeClientModal.addEventListener('click', () => hideModal(clientModal));
cancelForm.addEventListener('click', () => hideModal(clientModal));

closePaymentModal.addEventListener('click', () => hideModal(paymentModal));
cancelPaymentForm.addEventListener('click', () => hideModal(paymentModal));

closeSidebar.addEventListener('click', () => hideModal(commentSidebar));
overlay.addEventListener('click', () => {
    hideModal(clientModal);
    hideModal(commentSidebar);
    hideModal(paymentModal);
});

// Close modals when clicking outside
clientModal.addEventListener('click', (e) => {
    if (e.target === clientModal) hideModal(clientModal);
});

paymentModal.addEventListener('click', (e) => {
    if (e.target === paymentModal) hideModal(paymentModal);
});

// Logout
logoutBtn.addEventListener('click', () => {
    auth.signOut()
        .then(() => {
            // Show login modal after logout
            showModal(loginModal);
        })
        .catch(error => {
            console.error('Logout error:', error);
            alert('Error during logout. Please try again.');
        });
});

// Auth State Changes
auth.onAuthStateChanged(user => {
    if (user) {
        // User is logged in
        userName.textContent = user.displayName || 'User';
        userAvatar.src = user.photoURL || 'https://via.placeholder.com/150';
        loadData();
    } else {
        // Show login modal if not authenticated
        showModal(loginModal);
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    statusOptions[0].click(); // Set lead as default
});