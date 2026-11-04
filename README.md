# Complaint Management System

A full-stack web application designed to manage customer complaints, track their status, and assist administrators with AI-powered complaint categorization.

## Tech Stack

- **Frontend:** React.js, CSS, Vite
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **AI Integration:** Ollama (Llama 3.2 3B)

## Features

- Customer complaint registration with form validation.
- Admin dashboard to view and manage complaints.
- Complaint status tracking (Pending, In Progress, Resolved, Cancelled).
- Complaint details and activity history.
- AI-powered complaint categorization using Ollama.
- AI assistant for retrieving complaint status.
- User registration and management.
- State and district selection.

## Project Structure

```text
Complaint-Management-System/
├── Back-end/
│   ├── db.js
│   ├── importDistricts.js
│   ├── server.js
│   └── package.json
├── vite-project/
│   ├── src/
│   │   ├── components/
│   │   └── pages/
│   └── package.json
├── db1.sql
├── db2.sql
└── README.md
```

## Prerequisites

- Node.js and npm
- MySQL Server
- Ollama

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/tanuverma20/Complaint-Management-System.git
cd Complaint-Management-System
```

### 2. Set up the database

- Start MySQL Server.
- Create the database named `registration_db`.
- Import `db1.sql` and `db2.sql` into MySQL.

### 3. Configure the backend

Navigate to the backend directory:

```bash
cd Back-end
npm install
```

Create a `.env` file inside the `Back-end` folder:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=registration_db
```

Replace `your_mysql_password` with your own MySQL password.

Start the backend:

```bash
node server.js
```

### 4. Configure the frontend

Open another terminal:

```bash
cd vite-project
npm install
npm run dev
```

Open the local URL displayed by Vite in your browser.

### 5. Set up Ollama

Install and start Ollama, then download the required model:

```bash
ollama pull llama3.2:3b
```

Ensure Ollama is running locally before using the AI-powered features.

## AI Integration

The application integrates Ollama with the backend to:

- Automatically categorize newly registered complaints.
- Save AI-generated complaint categories in MySQL.
- Retrieve complaint status through an AI assistant.

If AI categorization is unavailable, complaint registration can still succeed without an AI-generated category.

## Future Improvements

- Email notifications for complaint updates.
- Enhanced reporting and analytics.
- Additional AI-powered complaint insights.