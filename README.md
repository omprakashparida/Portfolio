# 🚀 Om Prakash Parida | Software Engineer Portfolio

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

A production-ready, full-stack personal portfolio designed to showcase my technical arsenal, engineering projects, and problem-solving capabilities. Built from scratch using the MERN stack with a focus on premium UI design and enterprise-grade backend architecture.

## 🏗️ Technical Architecture

### Frontend (Client)
* **Framework:** React.js powered by Vite for lightning-fast HMR and optimized production builds.
* **Styling:** Tailwind CSS with custom Glassmorphism effects and Apple-style Bento Grid layouts.
* **UI/UX:** Fully responsive design featuring interactive components, custom SVG branding, and fluid CSS animations.

### Backend (Server)
* **Runtime:** Node.js & Express.js implementing a scalable Controller Pattern architecture.
* **Database:** MongoDB Atlas (Mongoose) with optimized indexing (`createdAt`, `email`) for fast query execution and automatic timestamping.
* **Security Fortress:** * `express-rate-limit`: Prevents spam and mitigates basic DDoS attempts (max 5 requests per 15 mins per IP).
  * `express-validator`: Strict server-side data sanitization and regex validation before database insertion.

### ✉️ Automated Communication Service
Engineered a custom Node.js SMTP Service using `nodemailer` featuring automated dual-routing:
1. **Admin Alert:** Instantly emails me directly when a recruiter or client reaches out, capturing their secure details.
2. **Auto-Responder:** Sends a highly professional, branded HTML "Thank You" email directly to the sender's inbox, establishing immediate professional contact.

---

## 🚀 Local Setup & Installation

### Prerequisites
* [Node.js](https://nodejs.org/) (v16 or higher)
* A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster URI
* A Gmail account with 2-Step Verification and an **App Password** generated.

### 1. Clone the Repository
```bash
git clone https://github.com/omprakashparida/Portfolio.git
cd portfolio
2. Backend Configuration
Open a terminal and navigate to the server directory:

Bash
cd server
npm install
Create a .env file in the root of the server directory:

Code snippet
PORT=5000
MONGO_URI=your_mongodb_connection_string
GMAIL_USER=your_email@gmail.com
GMAIL_PASS=your_16_digit_app_password
Start the backend server:

Bash
npm run dev
# Expected output: ✅ MongoDB Connected | 🚀 Server running on http://localhost:5000
3. Frontend Configuration
Open a new terminal window and navigate to the client directory:

Bash
cd client
npm install
Create a .env file in the root of the client directory:


Bash
npm run dev
🌐 Deployment Details
Frontend: Hosted and automatically deployed via Vercel.

Backend: REST API hosted on Render.

Database: Cloud database managed via MongoDB Atlas.

Designed & Engineered by Om Prakash Parida.