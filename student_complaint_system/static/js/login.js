// document.getElementById('loginForm').addEventListener('submit', async (e) => {
//     e.preventDefault();
    
//     const formData = {
//         studentId: document.getElementById('studentId').value,
//         password: document.getElementById('password').value
//     };
    
//     try {
//         const response = await fetch('/api/login', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(formData)
//         });
        
//         const data = await response.json();
        
//         if (data.success) {
//             window.location.href = '/student-dashboard';
//         } else {
//             alert('Login failed: ' + data.message);
//         }
//     } catch (error) {
//         alert('An error occurred: ' + error.message);
//     }
// });

// // Google Login Handler
// function handleGoogleLogin(response) {
//     fetch('/api/google-login', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ token: response.credential })
//     })
//     .then(res => res.json())
//     .then(data => {
//         if (data.success) {
//             window.location.href = '/student-dashboard';
//         } else {
//             alert('Google login failed: ' + data.message);
//         }
//     })
//     .catch(error => {
//         alert('An error occurred: ' + error.message);
//     });
// }


// Student Login JavaScript
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        studentId: document.getElementById('studentId').value,
        password: document.getElementById('password').value
    };
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('✅ Login successful! Redirecting...');
            setTimeout(() => {
                window.location.href = '/student-dashboard';
            }, 1000);
        } else {
            alert('❌ ' + data.message);
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('❌ An error occurred. Please try again.');
    }
});

// Google Login Handler (if needed)
function handleGoogleLogin(response) {
    alert('Google login feature needs Google OAuth setup. Please use regular login for now.');
}