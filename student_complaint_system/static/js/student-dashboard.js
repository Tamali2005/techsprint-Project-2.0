// let allComplaints = [];

// // Load student info and complaints on page load
// document.addEventListener('DOMContentLoaded', () => {
//     loadStudentInfo();
//     loadComplaints();
// });

// async function loadStudentInfo() {
//     try {
//         const response = await fetch('/api/student-info');
//         const data = await response.json();
        
//         if (data.success && data.student) {
//             document.getElementById('userName').textContent = data.student.full_name;
            
//             // Populate profile info
//             const profileInfo = document.getElementById('profileInfo');
//             profileInfo.innerHTML = `
//                 <p><strong>Student ID:</strong> ${data.student.student_id}</p>
//                 <p><strong>Full Name:</strong> ${data.student.full_name}</p>
//                 <p><strong>Email:</strong> ${data.student.email}</p>
//                 <p><strong>Phone:</strong> ${data.student.phone || 'N/A'}</p>
//                 <p><strong>Department:</strong> ${data.student.department || 'N/A'}</p>
//                 <p><strong>Course:</strong> ${data.student.course || 'N/A'}</p>
//                 <p><strong>Year of Study:</strong> ${data.student.year_of_study || 'N/A'}</p>
//                 <p><strong>Section:</strong> ${data.student.section || 'N/A'}</p>
//                 <p><strong>Identity:</strong> ${data.student.identity_type || 'Student'}</p>
//                 <p><strong>Registration Date:</strong> ${new Date(data.student.registration_date).toLocaleDateString()}</p>
//             `;
            
//             // Populate complaint form user info
//             document.getElementById('regNumber').value = data.student.student_id;
//             document.getElementById('userName').value = data.student.full_name;
//             document.getElementById('userEmail').value = data.student.email;
//             document.getElementById('userPhone').value = data.student.phone || '';
            
//             const deptInfo = [
//                 data.student.department,
//                 data.student.course,
//                 data.student.year_of_study,
//                 data.student.section ? `Section ${data.student.section}` : ''
//             ].filter(Boolean).join(', ');
            
//             document.getElementById('userDepartment').value = deptInfo;
//             document.getElementById('userIdentity').value = data.student.identity_type || 'Student';
//         }
//     } catch (error) {
//         console.error('Error loading student info:', error);
//     }
// }

// async function loadComplaints() {
//     try {
//         const response = await fetch('/api/my-complaints');
//         const data = await response.json();
        
//         if (data.success) {
//             allComplaints = data.complaints;
//             updateDashboardStats();
//             displayRecentComplaints();
//             displayAllComplaints();
//         }
//     } catch (error) {
//         console.error('Error loading complaints:', error);
//     }
// }

// function updateDashboardStats() {
//     const total = allComplaints.length;
//     const pending = allComplaints.filter(c => c.status === 'Pending').length;
//     const resolved = allComplaints.filter(c => c.status === 'Resolved').length;
//     const inProgress = allComplaints.filter(c => c.status === 'In Progress').length;
    
//     document.getElementById('totalComplaints').textContent = total;
//     document.getElementById('pendingComplaints').textContent = pending;
//     document.getElementById('resolvedComplaints').textContent = resolved;
//     document.getElementById('inProgressComplaints').textContent = inProgress;
// }

// function displayRecentComplaints() {
//     const recentList = document.getElementById('recentComplaintsList');
//     const recent = allComplaints.slice(0, 3);
    
//     if (recent.length === 0) {
//         recentList.innerHTML = '<p>No complaints submitted yet.</p>';
//         return;
//     }
    
//     recentList.innerHTML = recent.map(complaint => createComplaintCard(complaint)).join('');
// }

// function displayAllComplaints() {
//     const complaintsList = document.getElementById('complaintsList');
    
//     if (allComplaints.length === 0) {
//         complaintsList.innerHTML = '<p>No complaints submitted yet.</p>';
//         return;
//     }
    
//     complaintsList.innerHTML = allComplaints.map(complaint => createComplaintCard(complaint)).join('');
// }

// function createComplaintCard(complaint) {
//     const statusClass = `status-${complaint.status.toLowerCase().replace(' ', '-')}`;
//     const priorityClass = `priority-${complaint.priority.toLowerCase()}`;
    
//     return `
//         <div class="complaint-card">
//             <div class="complaint-header">
//                 <div>
//                     <h3>${complaint.complaint_title || complaint.subject}</h3>
//                     <span class="complaint-type">${complaint.category_type || 'General'}</span>
//                 </div>
//             </div>
//             <div class="complaint-meta">
//                 <span><strong>Type:</strong> ${complaint.complaint_type || 'N/A'}</span>
//                 <span><strong>Mode:</strong> ${complaint.complaint_mode || 'Online'}</span>
//             </div>
//             <div class="complaint-meta">
//                 <span><strong>Status:</strong> <span class="status-badge ${statusClass}">${complaint.status}</span></span>
//                 <span><strong>Priority:</strong> <span class="priority-badge ${priorityClass}">${complaint.priority}</span></span>
//                 <span><strong>Date:</strong> ${new Date(complaint.submission_date).toLocaleDateString()}</span>
//             </div>
//             <div class="complaint-description">
//                 <strong>Description:</strong><br>
//                 ${complaint.detailed_description || complaint.description}
//             </div>
//             ${complaint.proof_file_path ? `
//                 <div style="margin-top: 1rem;">
//                     <strong>Attached Proof:</strong> 
//                     <a href="${complaint.proof_file_path}" target="_blank" style="color: var(--secondary-blue);">View Document</a>
//                 </div>
//             ` : ''}
//             ${complaint.admin_response ? `
//                 <div class="complaint-response">
//                     <h4>Admin Response:</h4>
//                     <p>${complaint.admin_response}</p>
//                     <small>Responded on: ${new Date(complaint.response_date).toLocaleDateString()}</small>
//                 </div>
//             ` : '<p style="color: var(--gray); margin-top: 1rem;"><em>Awaiting admin response...</em></p>'}
//         </div>
//     `;
// }

// // Complaint type categories based on PDF
// const complaintTypes = {
//     'Infrastructure & Facilities': [
//         'Classroom conditions (AC, lighting, furniture)',
//         'Hostel or living issues',
//         'Canteen / food service quality',
//         'Transportation issues',
//         'Internet / WiFi issues',
//         'Washroom facilities',
//         'Drinking water availability',
//         'IT / computer connectivity'
//     ],
//     'Administrative': [
//         'Admission office issues',
//         'Registration problems',
//         'Fee and scholarship issues',
//         'Fee payment issues',
//         'Document processing delays',
//         'Transfer certificate delays',
//         'Transcript or marksheet delays'
//     ],
//     'Campus Services': [
//         'Transport issues',
//         'Campus security or safety concerns',
//         'Sports facilities',
//         'Medical or health services',
//         'Student housing',
//         'Parking availability'
//     ]
// };

// function updateComplaintTypes() {
//     const category = document.getElementById('categoryType').value;
//     const typeSelect = document.getElementById('complaintType');
    
//     typeSelect.innerHTML = '<option value="">Select Complaint Type</option>';
    
//     if (category && complaintTypes[category]) {
//         complaintTypes[category].forEach(type => {
//             const option = document.createElement('option');
//             option.value = type;
//             option.textContent = type;
//             typeSelect.appendChild(option);
//         });
//     }
// }

// // Complaint submission
// document.getElementById('complaintForm').addEventListener('submit', async (e) => {
//     e.preventDefault();
    
//     const formData = new FormData();
//     formData.append('categoryType', document.getElementById('categoryType').value);
//     formData.append('complaintType', document.getElementById('complaintType').value);
//     formData.append('complaintTitle', document.getElementById('complaintTitle').value);
//     formData.append('detailedDescription', document.getElementById('detailedDescription').value);
//     formData.append('complaintMode', document.getElementById('complaintMode').value);
//     formData.append('priority', document.getElementById('priority').value);
    
//     // Handle file upload
//     const fileInput = document.getElementById('proofUpload');
//     if (fileInput.files.length > 0) {
//         formData.append('proofFile', fileInput.files[0]);
//     }
    
//     try {
//         const response = await fetch('/api/submit-complaint', {
//             method: 'POST',
//             body: formData
//         });
        
//         const data = await response.json();
        
//         if (data.success) {
//             alert('Complaint submitted successfully! Your complaint has been registered and will be reviewed by the administration.');
//             document.getElementById('complaintForm').reset();
//             loadComplaints();
//             showSection('complaints');
//         } else {
//             alert('Failed to submit complaint: ' + data.message);
//         }
//     } catch (error) {
//         alert('An error occurred: ' + error.message);
//     }
// });

// // Section navigation
// function showSection(section) {
//     document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
//     document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
//     document.getElementById(`${section}-section`).classList.add('active');
//     event.target.classList.add('active');
    
//     const titles = {
//         'dashboard': 'Dashboard',
//         'profile': 'My Profile',
//         'submit': 'Submit Complaint',
//         'complaints': 'My Complaints'
//     };
    
//     document.getElementById('sectionTitle').textContent = titles[section];
// }

// // Logout
// async function logout() {
//     try {
//         await fetch('/api/logout', { method: 'POST' });
//         window.location.href = '/student-login';
//     } catch (error) {
//         console.error('Logout error:', error);
//     }
// }



// Student Dashboard JavaScript
let allComplaints = [];

// Complaint type categories
const complaintTypes = {
    'Infrastructure & Facilities': [
        'Classroom conditions (AC, lighting, furniture)',
        'Hostel or living issues',
        'Canteen / food service quality',
        'Transportation issues',
        'Internet / WiFi issues',
        'Washroom facilities',
        'Drinking water availability',
        'IT / computer connectivity'
    ],
    'Administrative': [
        'Admission office issues',
        'Registration problems',
        'Fee and scholarship issues',
        'Fee payment issues',
        'Document processing delays',
        'Transfer certificate delays',
        'Transcript or marksheet delays'
    ],
    'Campus Services': [
        'Transport issues',
        'Campus security or safety concerns',
        'Sports facilities',
        'Medical or health services',
        'Student housing',
        'Parking availability'
    ]
};

// Update complaint types dropdown
function updateComplaintTypes() {
    const category = document.getElementById('categoryType').value;
    const typeSelect = document.getElementById('complaintType');
    
    typeSelect.innerHTML = '<option value="">Select Complaint Type</option>';
    
    if (category && complaintTypes[category]) {
        complaintTypes[category].forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            typeSelect.appendChild(option);
        });
    }
}

// Load on page load
document.addEventListener('DOMContentLoaded', () => {
    loadStudentInfo();
    loadComplaints();
});

// Load student information
async function loadStudentInfo() {
    try {
        const response = await fetch('/api/student-info');
        const data = await response.json();
        
        if (data.success && data.student) {
            const student = data.student;
            
            // Update header
            document.querySelectorAll('#userName').forEach(el => {
                if (el.tagName === 'SPAN') {
                    el.textContent = student.full_name;
                } else {
                    el.value = student.full_name;
                }
            });
            
            // Populate profile
            const profileInfo = document.getElementById('profileInfo');
            profileInfo.innerHTML = `
                <div class="grid md:grid-cols-2 gap-4">
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <p class="text-sm text-gray-600 mb-1">Student ID</p>
                        <p class="font-semibold text-gray-800">${student.student_id}</p>
                    </div>
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <p class="text-sm text-gray-600 mb-1">Full Name</p>
                        <p class="font-semibold text-gray-800">${student.full_name}</p>
                    </div>
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <p class="text-sm text-gray-600 mb-1">Email</p>
                        <p class="font-semibold text-gray-800">${student.email}</p>
                    </div>
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <p class="text-sm text-gray-600 mb-1">Phone</p>
                        <p class="font-semibold text-gray-800">${student.phone || 'N/A'}</p>
                    </div>
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <p class="text-sm text-gray-600 mb-1">Department</p>
                        <p class="font-semibold text-gray-800">${student.department || 'N/A'}</p>
                    </div>
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <p class="text-sm text-gray-600 mb-1">Course & Year</p>
                        <p class="font-semibold text-gray-800">${student.course || 'N/A'} - ${student.year_of_study || 'N/A'}</p>
                    </div>
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <p class="text-sm text-gray-600 mb-1">Section</p>
                        <p class="font-semibold text-gray-800">${student.section || 'N/A'}</p>
                    </div>
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <p class="text-sm text-gray-600 mb-1">Identity</p>
                        <p class="font-semibold text-gray-800">${student.identity_type || 'Student'}</p>
                    </div>
                </div>
            `;
            
            // Auto-fill complaint form
            document.getElementById('regNumber').value = student.student_id;
            const userNameInputs = document.querySelectorAll('#userName');
            userNameInputs.forEach(input => {
                if (input.tagName === 'INPUT') input.value = student.full_name;
            });
            document.getElementById('userEmail').value = student.email;
            document.getElementById('userPhone').value = student.phone || '';
            
            const deptInfo = [student.department, student.course, student.year_of_study, 
                            student.section ? `Section ${student.section}` : ''].filter(Boolean).join(', ');
            document.getElementById('userDepartment').value = deptInfo;
            document.getElementById('userIdentity').value = student.identity_type || 'Student';
        }
    } catch (error) {
        console.error('Error loading student info:', error);
    }
}

// Load complaints
async function loadComplaints() {
    try {
        const response = await fetch('/api/my-complaints');
        const data = await response.json();
        
        if (data.success) {
            allComplaints = data.complaints;
            updateDashboardStats();
            displayRecentComplaints();
            displayAllComplaints();
        }
    } catch (error) {
        console.error('Error loading complaints:', error);
    }
}

// Update stats
function updateDashboardStats() {
    const total = allComplaints.length;
    const pending = allComplaints.filter(c => c.status === 'Pending').length;
    const resolved = allComplaints.filter(c => c.status === 'Resolved').length;
    const inProgress = allComplaints.filter(c => c.status === 'In Progress').length;
    
    document.getElementById('totalComplaints').textContent = total;
    document.getElementById('pendingComplaints').textContent = pending;
    document.getElementById('resolvedComplaints').textContent = resolved;
    document.getElementById('inProgressComplaints').textContent = inProgress;
}

// Display recent complaints
function displayRecentComplaints() {
    const container = document.getElementById('recentComplaintsList');
    const recent = allComplaints.slice(0, 3);
    
    if (recent.length === 0) {
        container.innerHTML = '<p class="text-gray-500">No complaints yet. Submit your first complaint!</p>';
        return;
    }
    
    container.innerHTML = recent.map(c => createComplaintCard(c)).join('');
}

// Display all complaints
function displayAllComplaints() {
    const container = document.getElementById('complaintsList');
    
    if (allComplaints.length === 0) {
        container.innerHTML = '<p class="text-gray-500">No complaints yet.</p>';
        return;
    }
    
    container.innerHTML = allComplaints.map(c => createComplaintCard(c)).join('');
}

// Create complaint card HTML
function createComplaintCard(complaint) {
    const statusColors = {
        'Pending': 'bg-yellow-100 text-yellow-800',
        'In Progress': 'bg-blue-100 text-blue-800',
        'Resolved': 'bg-green-100 text-green-800',
        'Rejected': 'bg-red-100 text-red-800'
    };
    
    const priorityColors = {
        'Low': 'bg-gray-100 text-gray-800',
        'Medium': 'bg-blue-100 text-blue-800',
        'High': 'bg-orange-100 text-orange-800',
        'Urgent': 'bg-red-100 text-red-800'
    };
    
    return `
        <div class="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border-l-4 border-blue-500 hover:shadow-lg transition">
            <div class="flex justify-between items-start mb-3">
                <h3 class="text-xl font-bold text-gray-800">${complaint.complaint_title}</h3>
                <span class="px-3 py-1 rounded-full text-xs font-semibold ${statusColors[complaint.status] || 'bg-gray-100 text-gray-800'}">
                    ${complaint.status}
                </span>
            </div>
            <div class="flex flex-wrap gap-2 mb-3">
                <span class="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-600">
                    📁 ${complaint.category_type}
                </span>
                <span class="px-3 py-1 rounded-full text-xs font-semibold ${priorityColors[complaint.priority]}">
                    ${complaint.priority}
                </span>
                <span class="px-3 py-1 bg-white rounded-full text-xs text-gray-600">
                    📅 ${new Date(complaint.submission_date).toLocaleDateString()}
                </span>
            </div>
            <p class="text-gray-700 mb-3">${complaint.detailed_description.substring(0, 150)}${complaint.detailed_description.length > 150 ? '...' : ''}</p>
            ${complaint.admin_response ? `
                <div class="bg-white p-4 rounded-lg border-l-4 border-green-500 mt-3">
                    <p class="text-sm font-semibold text-green-600 mb-1">✅ Admin Response:</p>
                    <p class="text-gray-700">${complaint.admin_response}</p>
                    <p class="text-xs text-gray-500 mt-1">${new Date(complaint.response_date).toLocaleString()}</p>
                </div>
            ` : '<p class="text-sm text-gray-500 italic">⏳ Awaiting admin response...</p>'}
        </div>
    `;
}

// Submit complaint form
document.getElementById('complaintForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('categoryType', document.getElementById('categoryType').value);
    formData.append('complaintType', document.getElementById('complaintType').value);
    formData.append('complaintTitle', document.getElementById('complaintTitle').value);
    formData.append('detailedDescription', document.getElementById('detailedDescription').value);
    formData.append('complaintMode', document.getElementById('complaintMode').value);
    formData.append('priority', document.getElementById('priority').value);
    
    const fileInput = document.getElementById('proofUpload');
    if (fileInput.files.length > 0) {
        formData.append('proofFile', fileInput.files[0]);
    }
    
    try {
        const response = await fetch('/api/submit-complaint', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('✅ Complaint submitted successfully!');
            document.getElementById('complaintForm').reset();
            loadComplaints();
            showSection('complaints');
        } else {
            alert('❌ ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ An error occurred. Please try again.');
    }
});

// Section navigation
function showSection(section) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
    
    document.getElementById(`${section}-section`).classList.add('active');
    event.currentTarget.classList.add('active');
    
    const titles = {
        'dashboard': 'Dashboard',
        'profile': 'My Profile',
        'submit': 'Submit Complaint',
        'complaints': 'My Complaints'
    };
    
    document.getElementById('sectionTitle').textContent = titles[section] || 'Dashboard';
}

// Logout
async function logout() {
    try {
        await fetch('/api/logout', { method: 'POST' });
        alert('✅ Logged out successfully!');
        window.location.href = '/student-login';
    } catch (error) {
        window.location.href = '/student-login';
    }
}