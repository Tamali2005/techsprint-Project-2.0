// document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
//     e.preventDefault();
    
//     const formData = {
//         username: document.getElementById('username').value,
//         password: document.getElementById('password').value
//     };
    
//     try {
//         const response = await fetch('/api/admin-login', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(formData)
//         });
        
//         const data = await response.json();
        
//         if (data.success) {
//             window.location.href = '/admin-dashboard';
//         } else {
//             alert('Login failed: ' + data.message);
//         }
//     } catch (error) {
//         alert('An error occurred: ' + error.message);
//     }
// });


// Admin Login JavaScript
document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value
    };
    
    try {
        const response = await fetch('/api/admin-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('✅ Admin login successful! Redirecting...');
            setTimeout(() => {
                window.location.href = '/admin-dashboard';
            }, 1000);
        } else {
            alert('❌ ' + data.message);
        }
    } catch (error) {
        console.error('Admin login error:', error);
        alert('❌ An error occurred. Please try again.');
    }
});