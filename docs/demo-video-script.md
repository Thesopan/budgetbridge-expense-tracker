# BudgetBridge Final Demo Script and Visual Plan

**Final video length:** approximately 9 minutes 22 seconds  
**Presenters:** Mahnoor, Rida, and Jana  
**Screen content:** Actual BudgetBridge, MySQL, GitHub, and automated-test screenshots

## Before Recording or Re-Exporting

- Use the MySQL version of the application, not memory mode.
- Do not display `.env`, database passwords, or private account information.
- Keep the GitHub repository, MySQL table list, application pages, and test result ready.
- Speak naturally and leave short pauses between presenter sections.

## Mahnoor - Project Goal, Architecture, and Authentication

Show the title/overview, repository structure, registration screen, login screen, and first dashboard view.

Cover:
- BudgetBridge project name, goal, and target users
- HTML/CSS/JavaScript front end
- Node.js routes/controllers/validation/data-store design
- MySQL users, categories, transactions, sessions, and activity logs
- Registration, login, password validation, and protected sessions

## Rida - Main Feature Walkthrough

Show Add Transaction, Transactions, Edit Transaction, Categories, Dashboard, and Reports.

Cover:
- Adding income and expense records
- Dashboard totals and recent activity
- Searching and filtering transactions
- Editing and deleting transactions
- Creating and editing custom categories
- Protected default categories and category-in-use rules
- Date-range report totals and spending by category

## Jana - Settings, Security, Testing, Limitations, and Closing

Show Settings, MySQL tables, repository code structure, and the automated-test result.

Cover:
- Profile and password settings
- scrypt password hashing
- HTTP-only SameSite sessions and token hashing
- Parameterized queries and user-ownership conditions
- Primary/foreign keys and database constraints
- Final automated result: 12 passed, 0 failed
- MySQL report defect found, fixed, and retested
- Limitations and possible next steps

## Closing

BudgetBridge is a complete local full-stack course application with database-backed CRUD, authentication, validation, security hygiene, automated testing, documentation, and a professional demo.
