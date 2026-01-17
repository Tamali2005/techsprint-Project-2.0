// document.getElementById('registerForm').addEventListener('submit', async (e) => {
//     e.preventDefault();
    
//     const password = document.getElementById('password').value;
//     const confirmPassword = document.getElementById('confirmPassword').value;
    
//     if (password !== confirmPassword) {
//         alert('Passwords do not match!');
//         return;
//     }
    
//     const formData = {
//         studentId: document.getElementById('studentId').value,
//         fullName: document.getElementById('fullName').value,
//         email: document.getElementById('email').value,
//         phone: document.getElementById('phone').value,
//         department: document.getElementById('department').value,
//         course: document.getElementById('course').value,
//         yearOfStudy: document.getElementById('yearOfStudy').value,
//         section: document.getElementById('section').value,
//         identityType: document.getElementById('identityType').value,
//         password: password
//     };
    
//     try {
//         const response = await fetch('/api/register', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(formData)
//         });
        
//         const data = await response.json();
        
//         if (data.success) {
//             alert('Registration successful! Please login.');
//             window.location.href = '/student-login';
//         } else {
//             alert('Registration failed: ' + data.message);
//         }
//     } catch (error) {
//         alert('An error occurred: ' + error.message);
//     }
// });



// Student Registration JavaScript
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validate passwords match
    if (password !== confirmPassword) {
        alert('❌ Passwords do not match!');
        return;
    }
    
    // Collect form data
    const formData = {
        studentId: document.getElementById('studentId').value,
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        department: document.getElementById('department').value,
        course: document.getElementById('course').value,
        yearOfStudy: document.getElementById('yearOfStudy').value,
        section: document.getElementById('section').value,
        identityType: document.getElementById('identityType').value,
        password: password
    };
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('✅ Registration successful! Redirecting to login...');
            setTimeout(() => {
                window.location.href = '/student-login';
            }, 1500);
        } else {
            alert('❌ Registration failed: ' + data.message);
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('❌ An error occurred. Please try again.');
    }
});