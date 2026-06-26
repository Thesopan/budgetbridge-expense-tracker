# BudgetBridge: Personal Expense Tracker

## CP476B Group 6 - Milestone 02

BudgetBridge is a full-stack personal expense tracker designed for students and young adults who want to record income, track expenses, organize transactions by category, and view financial summaries.

The following screenshots demonstrate some user interfaces implemented during Milestone 02.

| Login | Dashboard |
|--------|-----------|
| ![](docs/screenshots/login.png) | ![](docs/screenshots/dashboard.png) |

| Reports | Categories |
|----------|------------|
| ![](docs/screenshots/reports.png) | ![](docs/screenshots/categories.png) |

## Milestone 02 Status

This milestone includes:

- Working front-end screens matching the Milestone 01 wireframes
- Functional UI workflow using mock data through JavaScript/localStorage
- Add, view, edit, delete, search, and filter transaction interactions
- Category management UI
- Reports page with category summaries
- Account settings page to cover the settings user story
- Node.js backend skeleton with route/controller structure
- MySQL database schema with primary keys, foreign keys, constraints, and indexes
- Database design PDF in `/docs`
- Updated activity blog in `/docs/activity-blog.md`
- Updated Kanban in GitHub Projects

## Technology Stack

- Front-End: HTML, CSS, JavaScript
- Back-End: Node.js using the built-in HTTP module
- Database Design: MySQL
- Project Management: GitHub Projects Kanban
- Documentation: Markdown and PDF

No front-end frameworks or outside UI libraries are used.

## Project Structure

```text
budgetbridge-expense-tracker/
├── public/
│   ├── index.html
│   ├── register.html
│   ├── dashboard.html
│   ├── transactions.html
│   ├── add-transaction.html
│   ├── edit-transaction.html
│   ├── categories.html
│   ├── reports.html
│   ├── settings.html
│   ├── css/style.css
│   └── js/app.js
├── backend/
│   ├── server.js
│   ├── routes/
│   └── controllers/
├── database/
│   ├── schema.sql
│   └── erd-description.md
├── docs/
│   ├── activity-blog.md
│   └── milestone02-database-design.pdf
├── package.json
├── README.md
└── links.txt
```

## How to Run Locally

### Option 1: Open the front-end directly

1. Open the `public` folder.
2. Double-click `index.html`.
3. Use the login form to enter any valid email and a password with at least 4 characters.
4. Navigate through the dashboard, transactions, categories, reports, and settings pages.

### Option 2: Run with Node.js server

1. Install Node.js if it is not installed.
2. Open a terminal in the project root folder.
3. Run:

```bash
npm start
```

4. Open this URL in a browser:

```text
http://localhost:3000
```

## Backend API Stubs

The backend is a runnable skeleton for Milestone 02. It includes stub endpoints for future Milestone 03 integration.

```text
POST   /api/auth/login
POST   /api/auth/register
GET    /api/transactions
POST   /api/transactions
PUT    /api/transactions?id=1
DELETE /api/transactions?id=1
GET    /api/categories
POST   /api/categories
GET    /api/reports/summary
```

## Database Setup

The database schema is located at:

```text
database/schema.sql
```

It contains MySQL `CREATE TABLE` statements for:

- users
- categories
- transactions
- user_sessions
- budgets
- activity_logs

The database design PDF is located at:

```text
docs/milestone02-database-design.pdf
```

## Team Member Contributions Summary

- Thesopan Sathiyanantham - Scrum Master / Project Coordinator: milestone coordination, GitHub tracking, workflow review and README
- Aditya Arun Kumar - Back-End Lead: backend skeleton planning and route/controller structure
- Fisher Matichuk - Front-End Lead: front-end screen layout and navigation workflow
- Noor Ehsan - Database Lead: database schema and ERD planning, Review Support: README review and final packaging check
- Jana Nazer - Documentation / Activity Blog Lead: activity blog and documentation updates
- Rida Shahid - Testing / QA Lead: validation checks and front-end workflow review
- Tahmina Faez - UI/UX and Wireframe Support: UI consistency and screen matching
- Rafay Khan - GitHub / Kanban Support: Kanban updates and task status tracking
- Sahil Minhas - Reports / Summary Feature Support: reports page and summary workflow review. Kanban and acitivty blog updates

## Notes for Milestone 03

Milestone 03 should connect the front-end forms to the Node.js backend and MySQL database. Server-side validation, authentication, CRUD database queries, testing evidence, and final demo preparation will be completed in the next milestone.
