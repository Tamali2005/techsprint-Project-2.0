from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
import hashlib
import os
from datetime import datetime
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import secrets
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.secret_key = secrets.token_hex(32)
CORS(app)

# File upload configuration
UPLOAD_FOLDER = 'static/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf', 'doc', 'docx'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

# Google OAuth Configuration
GOOGLE_CLIENT_ID = "544206990021-o4ve57tle2tu6ag8s47dta87r547q4ir.apps.googleusercontent.com"  # Replace with your actual Client ID

# Database Configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',  # Change to your MySQL username
    'password': 'Tamali@2005',  # Change to your MySQL password
    'database': 'student_complaints'
}

# Initialize Database
def init_db():
    try:
        connection = mysql.connector.connect(
            host=DB_CONFIG['host'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password']
        )
        cursor = connection.cursor()
        cursor.execute("CREATE DATABASE IF NOT EXISTS student_complaints")
        cursor.close()
        connection.close()
        
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        # Students Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS students (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id VARCHAR(50) UNIQUE NOT NULL,
                full_name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                phone VARCHAR(20) NOT NULL,
                department VARCHAR(100) NOT NULL,
                course VARCHAR(100),
                year_of_study VARCHAR(20),
                section VARCHAR(20),
                identity_type VARCHAR(50) DEFAULT 'Student',
                password VARCHAR(255),
                google_id VARCHAR(255),
                registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Complaints Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS complaints (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id VARCHAR(50) NOT NULL,
                student_name VARCHAR(100) NOT NULL,
                student_email VARCHAR(100) NOT NULL,
                student_phone VARCHAR(20) NOT NULL,
                department VARCHAR(200) NOT NULL,
                identity_type VARCHAR(50) NOT NULL,
                category_type VARCHAR(100) NOT NULL,
                complaint_type VARCHAR(200) NOT NULL,
                complaint_title VARCHAR(300) NOT NULL,
                detailed_description TEXT NOT NULL,
                proof_file_path VARCHAR(500),
                complaint_mode VARCHAR(20) DEFAULT 'Online',
                priority VARCHAR(20) NOT NULL,
                status VARCHAR(50) DEFAULT 'Pending',
                admin_response TEXT,
                submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                response_date TIMESTAMP NULL,
                FOREIGN KEY (student_id) REFERENCES students(student_id)
            )
        """)
        
        # Admin Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS admins (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                email VARCHAR(100) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Insert default admin (username: admin, password: admin123)
        hashed_password = hashlib.sha256("admin123".encode()).hexdigest()
        try:
            cursor.execute("""
                INSERT INTO admins (username, password, email) 
                VALUES ('admin', %s, 'admin@college.edu')
            """, (hashed_password,))
            connection.commit()
        except:
            pass  # Admin already exists
        
        cursor.close()
        connection.close()
        print("Database initialized successfully!")
        
    except Error as e:
        print(f"Database error: {e}")

# Database Helper Functions
def get_db_connection():
    return mysql.connector.connect(**DB_CONFIG)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/student-register')
def student_register():
    return render_template('student_register.html')

@app.route('/student-login')
def student_login():
    return render_template('student_login.html')

@app.route('/admin-login')
def admin_login():
    return render_template('admin_login.html')

@app.route('/student-dashboard')
def student_dashboard():
    if 'student_id' not in session:
        return redirect(url_for('student_login'))
    return render_template('student_dashboard.html')

@app.route('/admin-dashboard')
def admin_dashboard():
    if 'admin_username' not in session:
        return redirect(url_for('admin_login'))
    return render_template('admin_dashboard.html')

# API Endpoints
@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.json
        connection = get_db_connection()
        cursor = connection.cursor()
        
        hashed_password = hashlib.sha256(data['password'].encode()).hexdigest()
        
        cursor.execute("""
            INSERT INTO students (student_id, full_name, email, phone, department, course, 
                                year_of_study, section, identity_type, password)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (data['studentId'], data['fullName'], data['email'], data['phone'], 
              data['department'], data.get('course'), data['yearOfStudy'], 
              data.get('section'), data.get('identityType', 'Student'), hashed_password))
        
        connection.commit()
        cursor.close()
        connection.close()
        
        return jsonify({'success': True, 'message': 'Registration successful!'})
    except Error as e:
        return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.json
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        hashed_password = hashlib.sha256(data['password'].encode()).hexdigest()
        
        cursor.execute("""
            SELECT * FROM students WHERE student_id = %s AND password = %s
        """, (data['studentId'], hashed_password))
        
        student = cursor.fetchone()
        cursor.close()
        connection.close()
        
        if student:
            session['student_id'] = student['student_id']
            session['student_name'] = student['full_name']
            return jsonify({'success': True, 'message': 'Login successful!'})
        else:
            return jsonify({'success': False, 'message': 'Invalid credentials'}), 401
    except Error as e:
        return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/api/google-login', methods=['POST'])
def google_login():
    try:
        token = request.json['token']
        idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), GOOGLE_CLIENT_ID)
        
        google_id = idinfo['sub']
        email = idinfo['email']
        name = idinfo['name']
        
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("SELECT * FROM students WHERE google_id = %s OR email = %s", (google_id, email))
        student = cursor.fetchone()
        
        if student:
            session['student_id'] = student['student_id']
            session['student_name'] = student['full_name']
            cursor.close()
            connection.close()
            return jsonify({'success': True, 'message': 'Login successful!'})
        else:
            # Create new student with Google account
            student_id = f"G{google_id[:8]}"
            cursor.execute("""
                INSERT INTO students (student_id, full_name, email, google_id)
                VALUES (%s, %s, %s, %s)
            """, (student_id, name, email, google_id))
            connection.commit()
            
            session['student_id'] = student_id
            session['student_name'] = name
            
            cursor.close()
            connection.close()
            return jsonify({'success': True, 'message': 'Account created and logged in!'})
            
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/api/admin-login', methods=['POST'])
def admin_login_api():
    try:
        data = request.json
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        hashed_password = hashlib.sha256(data['password'].encode()).hexdigest()
        
        cursor.execute("""
            SELECT * FROM admins WHERE username = %s AND password = %s
        """, (data['username'], hashed_password))
        
        admin = cursor.fetchone()
        cursor.close()
        connection.close()
        
        if admin:
            session['admin_username'] = admin['username']
            return jsonify({'success': True, 'message': 'Login successful!'})
        else:
            return jsonify({'success': False, 'message': 'Invalid credentials'}), 401
    except Error as e:
        return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/api/submit-complaint', methods=['POST'])
def submit_complaint():
    try:
        if 'student_id' not in session:
            return jsonify({'success': False, 'message': 'Not authenticated'}), 401
        
        # Get student info
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM students WHERE student_id = %s", (session['student_id'],))
        student = cursor.fetchone()
        
        if not student:
            return jsonify({'success': False, 'message': 'Student not found'}), 404
        
        # Handle file upload
        file_path = None
        if 'proofFile' in request.files:
            file = request.files['proofFile']
            if file and file.filename and allowed_file(file.filename):
                filename = secure_filename(f"{session['student_id']}_{datetime.now().strftime('%Y%m%d%H%M%S')}_{file.filename}")
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(file_path)
                file_path = f"/static/uploads/{filename}"
        
        # Prepare department info
        dept_info = ', '.join(filter(None, [
            student.get('department'),
            student.get('course'),
            student.get('year_of_study'),
            f"Section {student.get('section')}" if student.get('section') else None
        ]))
        
        cursor.execute("""
            INSERT INTO complaints (student_id, student_name, student_email, student_phone, 
                                  department, identity_type, category_type, complaint_type,
                                  complaint_title, detailed_description, proof_file_path,
                                  complaint_mode, priority)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (session['student_id'], student['full_name'], student['email'], student['phone'],
              dept_info, student.get('identity_type', 'Student'),
              request.form.get('categoryType'), request.form.get('complaintType'),
              request.form.get('complaintTitle'), request.form.get('detailedDescription'),
              file_path, request.form.get('complaintMode', 'Online'),
              request.form.get('priority', 'Medium')))
        
        connection.commit()
        cursor.close()
        connection.close()
        
        return jsonify({'success': True, 'message': 'Complaint submitted successfully!'})
    except Error as e:
        return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/api/my-complaints', methods=['GET'])
def get_my_complaints():
    try:
        if 'student_id' not in session:
            return jsonify({'success': False, 'message': 'Not authenticated'}), 401
        
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT * FROM complaints WHERE student_id = %s ORDER BY submission_date DESC
        """, (session['student_id'],))
        
        complaints = cursor.fetchall()
        cursor.close()
        connection.close()
        
        return jsonify({'success': True, 'complaints': complaints})
    except Error as e:
        return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/api/student-info', methods=['GET'])
def get_student_info():
    try:
        if 'student_id' not in session:
            return jsonify({'success': False, 'message': 'Not authenticated'}), 401
        
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("SELECT * FROM students WHERE student_id = %s", (session['student_id'],))
        student = cursor.fetchone()
        
        if student:
            student.pop('password', None)
            student.pop('google_id', None)
        
        cursor.close()
        connection.close()
        
        return jsonify({'success': True, 'student': student})
    except Error as e:
        return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/api/admin/students', methods=['GET'])
def get_all_students():
    try:
        if 'admin_username' not in session:
            return jsonify({'success': False, 'message': 'Not authenticated'}), 401
        
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("SELECT id, student_id, full_name, email, phone, department, year_of_study, registration_date FROM students")
        students = cursor.fetchall()
        
        cursor.close()
        connection.close()
        
        return jsonify({'success': True, 'students': students})
    except Error as e:
        return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/api/admin/complaints', methods=['GET'])
def get_all_complaints():
    try:
        if 'admin_username' not in session:
            return jsonify({'success': False, 'message': 'Not authenticated'}), 401
        
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT * FROM complaints 
            ORDER BY submission_date DESC
        """)
        complaints = cursor.fetchall()
        
        cursor.close()
        connection.close()
        
        return jsonify({'success': True, 'complaints': complaints})
    except Error as e:
        return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/api/admin/respond-complaint', methods=['POST'])
def respond_complaint():
    try:
        if 'admin_username' not in session:
            return jsonify({'success': False, 'message': 'Not authenticated'}), 401
        
        data = request.json
        connection = get_db_connection()
        cursor = connection.cursor()
        
        cursor.execute("""
            UPDATE complaints 
            SET admin_response = %s, status = %s, response_date = NOW()
            WHERE id = %s
        """, (data['response'], data['status'], data['complaintId']))
        
        connection.commit()
        cursor.close()
        connection.close()
        
        return jsonify({'success': True, 'message': 'Response submitted successfully!'})
    except Error as e:
        return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True, 'message': 'Logged out successfully'})

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)

@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({'success': True, 'message': 'API is working!'})



# from flask import Flask, render_template, request, jsonify, session, redirect, url_for
# from flask_cors import CORS
# import mysql.connector
# from mysql.connector import Error
# import hashlib
# import os
# from datetime import datetime
# from werkzeug.utils import secure_filename

# app = Flask(__name__)
# app.secret_key = 'your-secret-key-change-this-in-production-123456789'
# CORS(app, supports_credentials=True)

# # File upload configuration
# UPLOAD_FOLDER = 'static/uploads'
# ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf', 'doc', 'docx'}
# MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

# if not os.path.exists(UPLOAD_FOLDER):
#     os.makedirs(UPLOAD_FOLDER)

# app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
# app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

# # Database Configuration - UPDATE THESE VALUES
# DB_CONFIG = {
#     'host': 'localhost',
#     'user': 'root',              # আপনার MySQL username
#     'password': 'Tamali@2005',              # আপনার MySQL password
#     'database': 'student_complaints'
# }

# # Initialize Database
# def init_db():
#     try:
#         connection = mysql.connector.connect(
#             host=DB_CONFIG['host'],
#             user=DB_CONFIG['user'],
#             password=DB_CONFIG['password']
#         )
#         cursor = connection.cursor()
#         cursor.execute("CREATE DATABASE IF NOT EXISTS student_complaints")
#         cursor.close()
#         connection.close()
        
#         connection = mysql.connector.connect(**DB_CONFIG)
#         cursor = connection.cursor()
        
#         # Students Table
#         cursor.execute("""
#             CREATE TABLE IF NOT EXISTS students (
#                 id INT AUTO_INCREMENT PRIMARY KEY,
#                 student_id VARCHAR(50) UNIQUE NOT NULL,
#                 full_name VARCHAR(100) NOT NULL,
#                 email VARCHAR(100) UNIQUE NOT NULL,
#                 phone VARCHAR(20) NOT NULL,
#                 department VARCHAR(100) NOT NULL,
#                 course VARCHAR(100),
#                 year_of_study VARCHAR(20),
#                 section VARCHAR(20),
#                 identity_type VARCHAR(50) DEFAULT 'Student',
#                 password VARCHAR(255),
#                 google_id VARCHAR(255),
#                 registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
#             )
#         """)
        
#         # Complaints Table
#         cursor.execute("""
#             CREATE TABLE IF NOT EXISTS complaints (
#                 id INT AUTO_INCREMENT PRIMARY KEY,
#                 student_id VARCHAR(50) NOT NULL,
#                 student_name VARCHAR(100) NOT NULL,
#                 student_email VARCHAR(100) NOT NULL,
#                 student_phone VARCHAR(20) NOT NULL,
#                 department VARCHAR(200) NOT NULL,
#                 identity_type VARCHAR(50) NOT NULL,
#                 category_type VARCHAR(100) NOT NULL,
#                 complaint_type VARCHAR(200) NOT NULL,
#                 complaint_title VARCHAR(300) NOT NULL,
#                 detailed_description TEXT NOT NULL,
#                 proof_file_path VARCHAR(500),
#                 complaint_mode VARCHAR(20) DEFAULT 'Online',
#                 priority VARCHAR(20) NOT NULL,
#                 status VARCHAR(50) DEFAULT 'Pending',
#                 admin_response TEXT,
#                 submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
#                 response_date TIMESTAMP NULL,
#                 FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
#             )
#         """)
        
#         # Admins Table
#         cursor.execute("""
#             CREATE TABLE IF NOT EXISTS admins (
#                 id INT AUTO_INCREMENT PRIMARY KEY,
#                 username VARCHAR(50) UNIQUE NOT NULL,
#                 password VARCHAR(255) NOT NULL,
#                 email VARCHAR(100) NOT NULL,
#                 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
#             )
#         """)
        
#         # Insert default admin (username: admin, password: admin123)
#         hashed_password = hashlib.sha256("admin123".encode()).hexdigest()
#         try:
#             cursor.execute("""
#                 INSERT INTO admins (username, password, email) 
#                 VALUES ('admin', %s, 'admin@college.edu')
#             """, (hashed_password,))
#             connection.commit()
#         except:
#             pass
        
#         cursor.close()
#         connection.close()
#         print("✅ Database initialized successfully!")
        
#     except Error as e:
#         print(f"❌ Database error: {e}")

# def get_db_connection():
#     return mysql.connector.connect(**DB_CONFIG)

# def allowed_file(filename):
#     return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# # HTML Routes
# @app.route('/')
# def index():
#     return render_template('index.html')

# @app.route('/student-register')
# def student_register():
#     return render_template('student_register.html')

# @app.route('/student-login')
# def student_login():
#     if 'student_id' in session:
#         return redirect(url_for('student_dashboard'))
#     return render_template('student_login.html')

# @app.route('/admin-login')
# def admin_login():
#     if 'admin_username' in session:
#         return redirect(url_for('admin_dashboard'))
#     return render_template('admin_login.html')

# @app.route('/student-dashboard')
# def student_dashboard():
#     if 'student_id' not in session:
#         return redirect(url_for('student_login'))
#     return render_template('student_dashboard.html')

# @app.route('/admin-dashboard')
# def admin_dashboard():
#     if 'admin_username' not in session:
#         return redirect(url_for('admin_login'))
#     return render_template('admin_dashboard.html')

# # API Endpoints
# @app.route('/api/register', methods=['POST'])
# def register():
#     try:
#         data = request.json
#         connection = get_db_connection()
#         cursor = connection.cursor()
        
#         hashed_password = hashlib.sha256(data['password'].encode()).hexdigest()
        
#         cursor.execute("""
#             INSERT INTO students (student_id, full_name, email, phone, department, course, 
#                                 year_of_study, section, identity_type, password)
#             VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
#         """, (data['studentId'], data['fullName'], data['email'], data['phone'], 
#               data['department'], data.get('course'), data['yearOfStudy'], 
#               data.get('section'), data.get('identityType', 'Student'), hashed_password))
        
#         connection.commit()
#         cursor.close()
#         connection.close()
        
#         return jsonify({'success': True, 'message': 'Registration successful!'})
#     except Error as e:
#         return jsonify({'success': False, 'message': str(e)}), 400

# @app.route('/api/login', methods=['POST'])
# def login():
#     try:
#         data = request.json
#         connection = get_db_connection()
#         cursor = connection.cursor(dictionary=True)
        
#         hashed_password = hashlib.sha256(data['password'].encode()).hexdigest()
        
#         cursor.execute("""
#             SELECT * FROM students WHERE student_id = %s AND password = %s
#         """, (data['studentId'], hashed_password))
        
#         student = cursor.fetchone()
#         cursor.close()
#         connection.close()
        
#         if student:
#             session['student_id'] = student['student_id']
#             session['student_name'] = student['full_name']
#             return jsonify({'success': True, 'message': 'Login successful!'})
#         else:
#             return jsonify({'success': False, 'message': 'Invalid credentials'}), 401
#     except Error as e:
#         return jsonify({'success': False, 'message': str(e)}), 400

# @app.route('/api/admin-login', methods=['POST'])
# def admin_login_api():
#     try:
#         data = request.json
#         connection = get_db_connection()
#         cursor = connection.cursor(dictionary=True)
        
#         hashed_password = hashlib.sha256(data['password'].encode()).hexdigest()
        
#         cursor.execute("""
#             SELECT * FROM admins WHERE username = %s AND password = %s
#         """, (data['username'], hashed_password))
        
#         admin = cursor.fetchone()
#         cursor.close()
#         connection.close()
        
#         if admin:
#             session['admin_username'] = admin['username']
#             return jsonify({'success': True, 'message': 'Login successful!'})
#         else:
#             return jsonify({'success': False, 'message': 'Invalid credentials'}), 401
#     except Error as e:
#         return jsonify({'success': False, 'message': str(e)}), 400

# @app.route('/api/submit-complaint', methods=['POST'])
# def submit_complaint():
#     try:
#         if 'student_id' not in session:
#             return jsonify({'success': False, 'message': 'Not authenticated'}), 401
        
#         connection = get_db_connection()
#         cursor = connection.cursor(dictionary=True)
#         cursor.execute("SELECT * FROM students WHERE student_id = %s", (session['student_id'],))
#         student = cursor.fetchone()
        
#         if not student:
#             return jsonify({'success': False, 'message': 'Student not found'}), 404
        
#         file_path = None
#         if 'proofFile' in request.files:
#             file = request.files['proofFile']
#             if file and file.filename and allowed_file(file.filename):
#                 filename = secure_filename(f"{session['student_id']}_{datetime.now().strftime('%Y%m%d%H%M%S')}_{file.filename}")
#                 file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
#                 file.save(file_path)
#                 file_path = f"/static/uploads/{filename}"
        
#         dept_info = ', '.join(filter(None, [
#             student.get('department'),
#             student.get('course'),
#             student.get('year_of_study'),
#             f"Section {student.get('section')}" if student.get('section') else None
#         ]))
        
#         cursor.execute("""
#             INSERT INTO complaints (student_id, student_name, student_email, student_phone, 
#                                   department, identity_type, category_type, complaint_type,
#                                   complaint_title, detailed_description, proof_file_path,
#                                   complaint_mode, priority)
#             VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
#         """, (session['student_id'], student['full_name'], student['email'], student['phone'],
#               dept_info, student.get('identity_type', 'Student'),
#               request.form.get('categoryType'), request.form.get('complaintType'),
#               request.form.get('complaintTitle'), request.form.get('detailedDescription'),
#               file_path, request.form.get('complaintMode', 'Online'),
#               request.form.get('priority', 'Medium')))
        
#         connection.commit()
#         cursor.close()
#         connection.close()
        
#         return jsonify({'success': True, 'message': 'Complaint submitted successfully!'})
#     except Error as e:
#         return jsonify({'success': False, 'message': str(e)}), 400

# @app.route('/api/my-complaints', methods=['GET'])
# def get_my_complaints():
#     try:
#         if 'student_id' not in session:
#             return jsonify({'success': False, 'message': 'Not authenticated'}), 401
        
#         connection = get_db_connection()
#         cursor = connection.cursor(dictionary=True)
        
#         cursor.execute("""
#             SELECT * FROM complaints WHERE student_id = %s ORDER BY submission_date DESC
#         """, (session['student_id'],))
        
#         complaints = cursor.fetchall()
#         cursor.close()
#         connection.close()
        
#         return jsonify({'success': True, 'complaints': complaints})
#     except Error as e:
#         return jsonify({'success': False, 'message': str(e)}), 400

# @app.route('/api/student-info', methods=['GET'])
# def get_student_info():
#     try:
#         if 'student_id' not in session:
#             return jsonify({'success': False, 'message': 'Not authenticated'}), 401
        
#         connection = get_db_connection()
#         cursor = connection.cursor(dictionary=True)
        
#         cursor.execute("SELECT * FROM students WHERE student_id = %s", (session['student_id'],))
#         student = cursor.fetchone()
        
#         if student:
#             student.pop('password', None)
#             student.pop('google_id', None)
        
#         cursor.close()
#         connection.close()
        
#         return jsonify({'success': True, 'student': student})
#     except Error as e:
#         return jsonify({'success': False, 'message': str(e)}), 400

# @app.route('/api/admin/students', methods=['GET'])
# def get_all_students():
#     try:
#         if 'admin_username' not in session:
#             return jsonify({'success': False, 'message': 'Not authenticated'}), 401
        
#         connection = get_db_connection()
#         cursor = connection.cursor(dictionary=True)
        
#         cursor.execute("SELECT * FROM students ORDER BY registration_date DESC")
#         students = cursor.fetchall()
        
#         cursor.close()
#         connection.close()
        
#         return jsonify({'success': True, 'students': students})
#     except Error as e:
#         return jsonify({'success': False, 'message': str(e)}), 400

# @app.route('/api/admin/complaints', methods=['GET'])
# def get_all_complaints():
#     try:
#         if 'admin_username' not in session:
#             return jsonify({'success': False, 'message': 'Not authenticated'}), 401
        
#         connection = get_db_connection()
#         cursor = connection.cursor(dictionary=True)
        
#         cursor.execute("""
#             SELECT * FROM complaints 
#             ORDER BY submission_date DESC
#         """)
#         complaints = cursor.fetchall()
        
#         cursor.close()
#         connection.close()
        
#         return jsonify({'success': True, 'complaints': complaints})
#     except Error as e:
#         return jsonify({'success': False, 'message': str(e)}), 400

# @app.route('/api/admin/respond-complaint', methods=['POST'])
# def respond_complaint():
#     try:
#         if 'admin_username' not in session:
#             return jsonify({'success': False, 'message': 'Not authenticated'}), 401
        
#         data = request.json
#         connection = get_db_connection()
#         cursor = connection.cursor()
        
#         cursor.execute("""
#             UPDATE complaints 
#             SET admin_response = %s, status = %s, response_date = NOW()
#             WHERE id = %s
#         """, (data['response'], data['status'], data['complaintId']))
        
#         connection.commit()
#         cursor.close()
#         connection.close()
        
#         return jsonify({'success': True, 'message': 'Response submitted successfully!'})
#     except Error as e:
#         return jsonify({'success': False, 'message': str(e)}), 400

# @app.route('/api/logout', methods=['POST'])
# def logout():
#     session.clear()
#     return jsonify({'success': True, 'message': 'Logged out successfully'})

# if __name__ == '__main__':
#     init_db()
#     print("\n" + "="*50)
#     print("🚀 Flask Server Starting...")
#     print("="*50)
#     print("📍 URL: http://localhost:5000")
#     print("👤 Admin: admin / admin123")
#     print("="*50 + "\n")
#     app.run(debug=True, port=5000, host='0.0.0.0')