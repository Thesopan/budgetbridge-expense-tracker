# BudgetBridge Final Demo Script (Target: 9-10 Minutes)

## 0:00-0:45 - Introduction

"Hello, we are CP476B Group 6. Our project is BudgetBridge, a personal expense tracker for students and young adults. It allows a user to securely create an account, record income and expenses, organize transactions by category, and view summaries."

Show the title slide or one-page overview.

## 0:45-1:35 - Architecture Overview

Show the repository structure or overview artifact.

"The front end uses plain HTML, CSS, and JavaScript. The Node.js server exposes REST-style API routes. The server uses parameterized MySQL queries through a data-store layer. MySQL stores users, categories, transactions, sessions, and activity logs."

Mention that no front-end framework was used.

## 1:35-2:30 - Registration and Authentication

1. Open the registration page.
2. Show validation by briefly entering a weak password.
3. Register a valid account.
4. Explain that default categories are created automatically.

"Passwords are hashed with scrypt. The browser receives an HTTP-only SameSite session cookie, while the database stores only a SHA-256 hash of the session token."

## 2:30-5:20 - Main Feature Walkthrough

1. Show the empty dashboard.
2. Add an income transaction.
3. Add two expense transactions in different categories.
4. Show updated dashboard totals.
5. Open the transactions page.
6. Demonstrate search or date/type filtering.
7. Edit one transaction.
8. Delete one transaction and confirm the modal.

Explain that all operations are database-backed and restricted to the logged-in user.

## 5:20-6:20 - Category Management

1. Open Categories.
2. Add a custom category.
3. Edit the custom category.
4. Explain that default categories cannot be removed and categories used by transactions cannot be deleted.

## 6:20-7:15 - Reports and Settings

1. Open Reports.
2. Generate a date-range summary.
3. Show totals and category breakdown.
4. Open Settings and show profile update fields.

## 7:15-8:10 - Testing Highlight

Show the terminal and run:

```bash
npm test
```

"The automated tests cover validation, password hashing, authenticated transaction CRUD, reporting, logout, and ownership isolation between users."

Show one passing API integration test.

## 8:10-9:05 - Security and Database Highlights

Show `database/schema.sql` and one parameterized query in `backend/data/mysqlStore.js`.

Mention:
- primary keys and foreign keys
- positive amount constraint
- unique user email/category rules
- parameterized queries
- user ownership conditions
- HTTP-only sessions
- security headers and request validation

## 9:05-9:45 - Limitations and Closing

"BudgetBridge is designed for local course demonstration. It currently uses Canadian dollars and does not connect directly to banks. Password-reset email, multi-factor authentication, and advanced forecasting are possible future improvements. The completed application demonstrates a full end-to-end workflow with database-backed CRUD, validation, security hygiene, testing, and documentation. Thank you."

## Recording Checklist

- Keep the recording under 10 minutes.
- Use MySQL mode, not memory mode.
- Start from a clean browser session.
- Make sure the terminal text is readable.
- Do not show database passwords or the `.env` file.
- Confirm the shared Teams/OneDrive link works for the instructor before submitting.
