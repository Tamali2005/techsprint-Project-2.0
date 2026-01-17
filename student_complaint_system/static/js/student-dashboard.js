// Student Dashboard JavaScript - Fixed Version
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

// Section navigation - FIXED
function showSection(sectionName) {
    console.log('Showing section:', sectionName);
    
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionName + '-section');
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update active nav link
    event.currentTarget.classList.add('active');
    
    // Update title
    const titles = {
        'dashboard': 'Dashboard',
        'profile': 'My Profile',
        'submit': 'Submit Complaint',
        'complaints': 'My Complaints'
    };
    
    document.getElementById('sectionTitle').textContent = titles[sectionName] || 'Dashboard';
}

// Load on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded, initializing...');
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
            console.log('Student info loaded:', student);
            
            // Update header
            document.getElementById('headerUserName').textContent = student.full_name;
            
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
            document.getElementById('formUserName').value = student.full_name;
            document.getElementById('userEmail').value = student.email;
            document.getElementById('userPhone').value = student.phone || '';
            
            const deptInfo = [student.department, student.course, student.year_of_study, 
                            student.section ? `Section ${student.section}` : ''].filter(Boolean).join(', ');
            document.getElementById('userDepartment').value = deptInfo;
            document.getElementById('userIdentity').value = student.identity_type || 'Student';
        }
    } catch (error) {
        console.error('Error loading student info:', error);
        alert('Error loading profile. Please refresh the page.');
    }
}

// Load complaints
async function loadComplaints() {
    try {
        const response = await fetch('/api/my-complaints');
        const data = await response.json();
        
        if (data.success) {
            allComplaints = data.complaints;
            console.log('Complaints loaded:', allComplaints.length);
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
    
    console.log('Submitting complaint...');
    
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
            await loadComplaints();
            showSection('complaints');
        } else {
            alert('❌ ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ An error occurred. Please try again.');
    }
});

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