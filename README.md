**Job Portal Web Application**

A full-stack Job Portal Web Application built using Node.js, Express.js, MongoDB, and EJS, featuring user authentication, protected routes, job listings, and a clean professional UI.
This project is designed to simulate a real-world job portal used by job seekers and recruiters.

## ⚙️ Installation & Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   ```env
   PORT=5000
   DB_URI = mongodb://localhost:27017/jobportaljob
   COOKIE_SECRET = "secret"
   ```

3. **Run the application**

   ```bash
   npm start
   ```

4. Open in browser:

   ```
   http://localhost:3000
   ```

---


✨ Features
Authentication

User Registration

User Login

Secure password hashing (bcrypt)

Session-based authentication

Logout functionality

Flash messages for feedback

🔒 Security
Protected profile page |
Session validation middleware |
Unauthorized access prevention |

💼 Job Portal

View available job listings

Apply for jobs

Job application form

MongoDB-based data storage

👤 Profile

Logged-in user profile page,
Displays user information securely

🛠 Tech Stack

Frontend

EJS (Embedded JavaScript Templates) |
HTML|
CSS3 |

Backend

Node.js |
Express.js |

Database

MongoDB |
Mongoose ODM |
Authentication & Utilities |
express-session |
bcryptjs |
connect-flash |
cookie-parser |

**dotenv**
