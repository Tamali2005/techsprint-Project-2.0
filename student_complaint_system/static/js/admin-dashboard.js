// Admin Dashboard JavaScript - Fixed Version
let allStudents = [];
let allComplaints = [];

// Section navigation - FIXED
function showAdminSection(sectionName) {
    console.log('Showing admin section:', sectionName);
    
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
        'overview': 'Admin Dashboard',
        'students': 'Registered Students',
        'complaints': 'All Complaints'
    };
    
    document.getElementById('sectionTitle').textContent = titles[sectionName] || 'Admin Dashboard';
}

// Load on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Admin dashboard loaded');
    loadStudents();
    loadComplaints();
});

// Load all students
async function loadStudents() {
    try {
        const response = await fetch('/api/admin/students');
        const data = await response.json();
        
        if (data.success) {
            allStudents = data.students;
            console.log('Students loaded:', allStudents.length);
            updateAdminStats();
            displayStudents();
        }
    } catch (error) {
        console.error('Error loading students:', error);
    }
}

// Load all complaints
async function loadComplaints() {
    try {
        const response = await fetch('/api/admin/complaints');
        const data = await response.json();
        
        if (data.success) {
            allComplaints = data.complaints;
            console.log('Complaints loaded:', allComplaints.length);
            updateAdminStats();
            displayRecentComplaintsAdmin();
            displayAllComplaintsAdmin();
        }
    } catch (error) {
        console.error('Error loading complaints:', error);
    }
}

// Update stats
function updateAdminStats() {
    document.getElementById('totalStudents').textContent = allStudents.length;
    document.getElementById('totalComplaintsAdmin').textContent = allComplaints.length;
    
    const pending = allComplaints.filter(c => c.status === 'Pending').length;
    const resolved = allComplaints.filter(c => c.status === 'Resolved').length;
    
    document.getElementById('pendingComplaintsAdmin').textContent = pending;
    document.getElementById('resolvedComplaintsAdmin').textContent = resolved;
}

// Display students table
function displayStudents() {
    const tbody = document.getElementById('studentsTableBody');
    
    if (allStudents.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="px-6 py-8 text-center text-gray-500">No students registered yet.</td></tr>';
        return;
    }
    
    tbody.innerHTML = allStudents.map(student => `
        <tr class="hover:bg-blue-50 transition">
            <td class="px-6 py-4 font-semibold text-blue-600">${student.student_id}</td>
            <td class="px-6 py-4">${student.full_name}</td>
            <td class="px-6 py-4">${student.email}</td>
            <td class="px-6 py-4">${student.department || 'N/A'}</td>
            <td class="px-6 py-4">${student.course || 'N/A'} - ${student.year_of_study || 'N/A'}</td>
            <td class="px-6 py-4">
                <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                    ${student.identity_type || 'Student'}
                </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-600">${new Date(student.registration_date).toLocaleDateString()}</td>
        </tr>
    `).join('');
}

// Display recent complaints
function displayRecentComplaintsAdmin() {
    const container = document.getElementById('recentComplaintsAdmin');
    const recent = allComplaints.slice(0, 5);
    
    if (recent.length === 0) {
        container.innerHTML = '<p class="text-gray-500">No complaints yet.</p>';
        return;
    }
    
    container.innerHTML = recent.map(c => createAdminComplaintCard(c)).join('');
}

// Display all complaints
function displayAllComplaintsAdmin() {
    const container = document.getElementById('complaintsListAdmin');
    
    if (allComplaints.length === 0) {
        container.innerHTML = '<p class="text-gray-500">No complaints yet.</p>';
        return;
    }
    
    container.innerHTML = allComplaints.map(c => createAdminComplaintCard(c)).join('');
}

// Create complaint card HTML
function createAdminComplaintCard(complaint) {
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
        <div class="bg-white p-6 rounded-2xl border-l-4 border-blue-500 hover:shadow-xl transition">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">${complaint.complaint_title}</h3>
                    <div class="flex gap-2 text-sm text-gray-600">
                        <span>👤 ${complaint.student_name} (${complaint.student_id})</span>
                        <span>•</span>
                        <span>📧 ${complaint.student_email}</span>
                    </div>
                </div>
                <span class="px-3 py-1 rounded-full text-xs font-semibold ${statusColors[complaint.status]}">
                    ${complaint.status}
                </span>
            </div>
            
            <div class="flex flex-wrap gap-2 mb-3">
                <span class="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                    ${complaint.category_type}
                </span>
                <span class="px-3 py-1 ${priorityColors[complaint.priority]} rounded-full text-xs font-semibold">
                    ${complaint.priority}
                </span>
                <span class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                    ${complaint.complaint_mode}
                </span>
                <span class="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs">
                    ${complaint.identity_type}
                </span>
            </div>
            
            <p class="text-gray-700 mb-3">${complaint.detailed_description}</p>
            
            ${complaint.proof_file_path ? `
                <div class="mb-3">
                    <a href="${complaint.proof_file_path}" target="_blank" 
                       class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm">
                        📎 View Attached Proof
                    </a>
                </div>
            ` : ''}
            
            ${complaint.admin_response ? `
                <div class="bg-green-50 p-4 rounded-lg border-l-4 border-green-500 mb-3">
                    <p class="text-sm font-semibold text-green-600 mb-1">✅ Your Response:</p>
                    <p class="text-gray-700">${complaint.admin_response}</p>
                    <p class="text-xs text-gray-500 mt-1">${new Date(complaint.response_date).toLocaleString()}</p>
                </div>
            ` : ''}
            
            <div class="flex gap-3 pt-3 border-t border-gray-200">
                <button onclick="openResponseModal(${complaint.id})" 
                        class="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition transform hover:scale-105">
                    ${complaint.admin_response ? '✏️ Update Response' : '💬 Respond'}
                </button>
            </div>
        </div>
    `;
}

// Open response modal
function openResponseModal(complaintId) {
    console.log('Opening modal for complaint:', complaintId);
    const complaint = allComplaints.find(c => c.id === complaintId);
    if (!complaint) {
        console.error('Complaint not found:', complaintId);
        return;
    }
    
    document.getElementById('complaintId').value = complaint.id;
    document.getElementById('status').value = complaint.status;
    document.getElementById('response').value = complaint.admin_response || '';
    
    const details = document.getElementById('complaintDetails');
    details.innerHTML = `
        <div class="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl space-y-3">
            <div class="grid md:grid-cols-2 gap-4">
                <div>
                    <p class="text-sm text-gray-600">Student</p>
                    <p class="font-semibold text-gray-800">${complaint.student_name} (${complaint.student_id})</p>
                </div>
                <div>
                    <p class="text-sm text-gray-600">Identity</p>
                    <p class="font-semibold text-gray-800">${complaint.identity_type}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-600">Email</p>
                    <p class="font-semibold text-gray-800">${complaint.student_email}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-600">Phone</p>
                    <p class="font-semibold text-gray-800">${complaint.student_phone}</p>
                </div>
            </div>
            <div>
                <p class="text-sm text-gray-600">Department</p>
                <p class="font-semibold text-gray-800">${complaint.department}</p>
            </div>
            <div class="grid md:grid-cols-2 gap-4">
                <div>
                    <p class="text-sm text-gray-600">Category</p>
                    <p class="font-semibold text-gray-800">${complaint.category_type}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-600">Type</p>
                    <p class="font-semibold text-gray-800">${complaint.complaint_type}</p>
                </div>
            </div>
            <div>
                <p class="text-sm text-gray-600">Title</p>
                <p class="font-semibold text-gray-800">${complaint.complaint_title}</p>
            </div>
            <div>
                <p class="text-sm text-gray-600">Description</p>
                <p class="text-gray-700">${complaint.detailed_description}</p>
            </div>
        </div>
    `;
    
    document.getElementById('responseModal').classList.add('active');
}

// Close modal
function closeModal() {
    document.getElementById('responseModal').classList.remove('active');
}

// Submit response
document.getElementById('responseForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        complaintId: document.getElementById('complaintId').value,
        status: document.getElementById('status').value,
        response: document.getElementById('response').value
    };
    
    console.log('Submitting response:', formData);
    
    try {
        const response = await fetch('/api/admin/respond-complaint', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('✅ Response submitted successfully!');
            closeModal();
            await loadComplaints();
        } else {
            alert('❌ ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ An error occurred. Please try again.');
    }
});

// Filter students
function filterStudents() {
    const searchTerm = document.getElementById('studentSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#studentsTableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Filter complaints
function filterComplaints() {
    const searchTerm = document.getElementById('complaintSearch').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    
    const filtered = allComplaints.filter(complaint => {
        const matchesSearch = 
            complaint.complaint_title.toLowerCase().includes(searchTerm) ||
            complaint.student_name.toLowerCase().includes(searchTerm) ||
            complaint.student_id.toLowerCase().includes(searchTerm);
        
        const matchesStatus = !statusFilter || complaint.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
    
    const container = document.getElementById('complaintsListAdmin');
    if (filtered.length === 0) {
        container.innerHTML = '<p class="text-gray-500">No complaints found.</p>';
    } else {
        container.innerHTML = filtered.map(c => createAdminComplaintCard(c)).join('');
    }
}

// Logout
async function logout() {
    try {
        await fetch('/api/logout', { method: 'POST' });
        alert('✅ Logged out successfully!');
        window.location.href = '/admin-login';
    } catch (error) {
        window.location.href = '/admin-login';
    }
}