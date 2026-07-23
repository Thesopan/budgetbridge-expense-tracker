# BudgetBridge: Personal Expense Tracker

## CP476B Group 6 - Milestone 03 Final

BudgetBridge is a full-stack web application for recording income and expenses, organizing transactions by category, and viewing financial summaries. The final version connects a plain HTML/CSS/JavaScript front end to a Node.js API and a normalized MySQL database.

## Final Features

- Secure account registration, login, logout, and session checks
- Password hashing with Node.js `crypto.scrypt`
- HTTP-only, SameSite session cookie with hashed session tokens in MySQL
- User-specific transaction create, read, update, and delete operations
- User-specific custom category create, update, and delete operations
- Search and filtering by type, category, date range, and description
- Dashboard totals and recent transactions from the database
- Reports with date-range totals and spending grouped by category
- Profile and password updates
- Server-side validation, parameterized SQL, ownership checks, security headers, and request-size limits
- Automated tests using Node's built-in test runner

## Technology Stack

- Front end: HTML, CSS, JavaScript
- Back end: Node.js built-in HTTP module
- Database: MySQL 8.x through the `mysql2` driver
- Security: Node.js `crypto`, parameterized queries, HTTP-only cookies
- Project tracking: GitHub Projects Kanban

No front-end framework or UI library is used.

## Project Structure

```text
budgetbridge-expense-tracker/
├── backend/
│   ├── controllers/
│   ├── data/
│   ├── routes/
│   ├── utils/
│   ├── config.js
│   └── server.js
├── database/
│   └── schema.sql
├── docs/
│   ├── activity-blog.md
│   ├── testing-summary-report.pdf
│   ├── budgetbridge-final-overview.pdf
│   ├── demo-video-script.md
│   └── final-kanban-update.md
├── public/
│   ├── css/style.css
│   ├── js/app.js
│   └── *.html
├── tests/
├── .env.example
├── package.json
└── README.md
```

## Clean Machine Setup

### Prerequisites

- Node.js 18 or newer
- MySQL 8.x
- A terminal and modern web browser

### 1. Download and open the project

```bash
cd budgetbridge-expense-tracker
```

### 2. Install the database driver

```bash
npm install
```

### 3. Create the database

Run `database/schema.sql` in MySQL Workbench, phpMyAdmin, or the MySQL command line. The script recreates the `budgetbridge_db` database and all required tables.

Command-line example:

```bash
mysql -u root -p < database/schema.sql
```

### 4. Configure the application

Copy `.env.example` to `.env` and enter your MySQL credentials:

```text
PORT=3000
NODE_ENV=development
DB_MODE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=budgetbridge_db
SESSION_DAYS=7
```

### 5. Start BudgetBridge

```bash
npm start
```

Open:

```text
http://localhost:3000
```

Register a new account. The application automatically creates default income and expense categories for that user.

## Development / Automated Test Mode

The following mode uses an in-memory relational-style store for automated tests and UI review. It does not replace the required MySQL setup for the final project demo.

```bash
npm run start:memory
```

Run automated tests:

```bash
npm test
```

## API Endpoints

```text
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/session

GET    /api/transactions
GET    /api/transactions/:id
POST   /api/transactions
PUT    /api/transactions/:id
DELETE /api/transactions/:id

GET    /api/categories
POST   /api/categories
PUT    /api/categories/:id
DELETE /api/categories/:id

GET    /api/reports/summary
GET    /api/user/profile
PUT    /api/user/profile
PUT    /api/user/password
```

## Validation and Security Hygiene

- Passwords are never stored in plain text.
- SQL values use placeholders through `mysql2`, reducing SQL injection risk.
- Every transaction and category query includes the authenticated user's ID.
- Raw session tokens are stored only in an HTTP-only cookie; MySQL stores SHA-256 token hashes.
- State-changing requests are same-origin checked.
- Security headers include CSP, frame blocking, MIME sniffing prevention, and restrictive permissions.
- The server rejects oversized or invalid JSON request bodies.
- Default categories cannot be edited or deleted, and categories in use cannot be deleted.

## Known Limitations

- BudgetBridge is designed for local course demonstration and is not deployed to a public host.
- Currency is displayed as Canadian dollars only.
- Password reset by email and multi-factor authentication are outside the approved project scope.
- Reports provide category totals rather than advanced financial forecasting.

## Team Contributions

- **Thesopan Sathiyanantham** - Scrum Master / Project Coordinator: milestone coordination, final integration review, GitHub tracking, README, and submission packaging
- **Aditya Arun Kumar** - Back-End Lead: API design, authentication flow, session handling, and controller review
- **Fisher Matichuk** - Front-End Lead: front-end integration, page workflow, responsive behavior, and JavaScript review
- **Noor Ehsan** - Database Lead: normalized schema, constraints, database query review, and data integrity checks
- **Jana Nazer** - Documentation Lead: activity blog, final documentation, and report review
- **Rida Shahid** - Testing / QA Lead: test plan, validation testing, and workflow verification
- **Tahmina Faez** - UI/UX Support: visual consistency, accessibility review, and wireframe alignment
- **Rafay Khan** - GitHub / Kanban Support: task ownership, status movement, and project board maintenance
- **Sahil Minhas** - Reports Support: summary queries, category aggregation, and demo preparation
- **Ravishan Thanarajah** - Review Support: clean-machine setup review, contribution summary, and final packaging check

## Final Project Links

See `links.txt` for the GitHub repository, GitHub Project board, and activity blog links.
