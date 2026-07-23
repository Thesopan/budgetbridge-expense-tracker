# BudgetBridge Activity Blog

## Planning Meeting 01 - Milestone 01 Setup

**Date:** Wednesday, June 3, 2026  
**Location:** iMessage  
**Attendees:** Group 6 members

The group selected the Personal Expense Tracker idea and named the project BudgetBridge. The agreed technology direction was HTML, CSS, JavaScript, Node.js, and MySQL. Meetings were scheduled for Wednesdays and Saturdays at 7 PM. Initial responsibilities were assigned and the GitHub repository, Project board, and activity blog were created.

## Planning Meeting 02 - Milestone 01 Final Review

**Date:** Thursday, June 4, 2026  
**Location:** iMessage  
**Attendees:** Group 6 members

The team reviewed the proposal, user stories, wireframes, data plan, GitHub evidence, and submission links. The main challenge was keeping the backlog, wireframes, and report consistent. The group completed Milestone 01 and prepared the submission package.

## Progress Entry 03 - Milestone 02 Front-End Implementation

**Date:** Saturday, June 13, 2026  
**Location:** iMessage  
**Attendees:** Group 6 members

The team responded to Milestone 01 feedback by ensuring that every major user story had a matching screen or visible action. Separate HTML pages and shared CSS/JavaScript were used. Mock data and localStorage supported the Milestone 02 workflow while the database integration was still pending.

## Progress Entry 04 - Milestone 02 Database and Back-End Setup

**Date:** Wednesday, June 17, 2026  
**Location:** iMessage  
**Attendees:** Group 6 members

The group completed the MySQL schema and Node.js route/controller skeleton. The team deliberately avoided unapproved front-end frameworks and selected the built-in Node.js HTTP module. The database design included users, categories, transactions, sessions, and activity logs.

## Progress Entry 05 - Milestone 02 Final Review

**Date:** Friday, June 26, 2026  
**Location:** iMessage  
**Attendees:** Group 6 members

The group reviewed all Milestone 02 screens, the database PDF, server entry point, route/controller files, README, Kanban board, and activity blog. The repository was updated and the team documented that mock data would be replaced by database-backed API calls in Milestone 03.

---

## Progress Entry 06 - Milestone 03 Integration Planning

**Date:** Wednesday, July 8, 2026  
**Location:** iMessage  
**Attendees:** Group 6 members

### Work and Decisions

The team reviewed the final milestone requirements and broke the integration into authentication, transaction CRUD, category CRUD, reports, validation/security, testing, and documentation. The group kept the course-approved stack: plain HTML/CSS/JavaScript, Node.js, and MySQL.

The database design was refined to avoid storing transaction type twice. Transaction type is derived from the selected category, preventing inconsistent records. Default categories are copied to each new user during registration.

### Blocker and Resolution

**Blocker:** The Milestone 02 client stored mock records in localStorage, while Milestone 03 required database-backed records.  
**Resolution:** The shared JavaScript file was rewritten to call authenticated API endpoints. A store interface was introduced so the same business workflow could be tested in memory while the final application uses MySQL.

### Assignments

- Aditya and Thesopan: authentication and server integration
- Fisher and Tahmina: front-end API integration and responsive review
- Noor: MySQL schema/query review
- Rida: test plan and validation cases
- Jana and Ravishan: final documentation review
- Rafay: Kanban task movement
- Sahil: reports and demo workflow

## Progress Entry 07 - Full-Stack CRUD and Security Review

**Date:** Saturday, July 18, 2026  
**Location:** iMessage  
**Attendees:** Group 6 members

### Work Completed

- Connected registration and login to the database.
- Implemented scrypt password hashing and HTTP-only session cookies.
- Added transaction create, list, edit, delete, search, and filtering endpoints.
- Added custom category create, edit, and delete endpoints.
- Connected dashboard totals and report aggregation to database queries.
- Added profile and password update endpoints.
- Added parameterized SQL, ownership checks, security headers, same-origin checks, body-size limits, and server-side validation.

### Blocker and Resolution

**Blocker:** Category type changes could make old transactions appear under the wrong financial type.  
**Resolution:** The application prevents changing the type of any category already used by a transaction. Default categories are protected from editing and deletion.

**Blocker:** User sessions needed to be secure without introducing an unapproved authentication framework.  
**Resolution:** The group used Node.js `crypto` to generate random tokens, stored only token hashes in MySQL, and sent the raw token through an HTTP-only SameSite cookie.

## Progress Entry 08 - Testing, Documentation, and Final Review

**Date:** Wednesday, July 22, 2026  
**Location:** iMessage  
**Attendees:** Group 6 members

### Work Completed

- Added automated validation, password-security, authenticated CRUD, reporting, logout, and ownership-isolation tests.
- Completed the testing summary report with results and known limitations.
- Updated the README with clean-machine MySQL setup instructions.
- Created the final one-page project overview and the 10-minute demo script.
- Reviewed the final repository structure and removed obsolete submission-helper files.
- Prepared the final Kanban task list and contribution evidence.

### Final Decisions

- The final demonstration will use MySQL, not the in-memory test mode.
- The demo will show registration, transaction CRUD, category management, reports, validation, and one testing example.
- The final ZIP will contain the testing report, presentation artifact, `links.txt`, and the Teams/OneDrive demo video link.

---

## Progress Entry 09 - Final MySQL Verification and Defect Resolution

**Date:** Thursday, July 23, 2026  
**Location:** MySQL Workbench, local Windows development environment, and iMessage  
**Attendees:** Group 6 members

### Final Verification Completed

The final database was created in MySQL 8.x using `database/schema.sql`. Workbench showed the five required tables: `users`, `categories`, `transactions`, `user_sessions`, and `activity_logs`. The application then started in MySQL mode and successfully preserved account and transaction data after logout and login.

The team verified the main database-backed workflow through the browser: registration and login, adding income and expense transactions, viewing dashboard totals, editing a transaction, creating a custom category, and generating a report for a selected date range. The final automated suite was also rerun and produced 12 passing tests with no failures.

### Defect Found and Resolution

During the final report verification, MySQL returned `ER_WRONG_ARGUMENTS: Incorrect arguments to mysqld_stmt_execute`. The error was isolated to the recent-transactions query, where a prepared placeholder was used in `LIMIT ?`.

The data-store code was corrected by parsing and validating the limit as an integer between 1 and 100 before adding it to the SQL statement. All user-controlled filter values remain parameterized. After restarting the server, the Reports page displayed income, expenses, balance, and spending by category correctly.

### Final Evidence Prepared

- MySQL schema and final tables captured
- Dashboard and report results captured
- Automated test output captured: 12 passed, 0 failed
- Final README, testing report, Kanban snapshot, and overview completed
- Final demo video assembled with the three presenter recordings
- Final MyLS ZIP and GitHub upload package prepared

## Final Reflection - Milestone 03 Completion

The final milestone confirmed the value of separating routes, controllers, validation, security utilities, and data-store logic. That separation made the prepared-statement issue easy to isolate without changing the user interface or controller behavior. It also allowed the automated suite to exercise the complete business workflow with repeatable test data while the final application continued to use MySQL.

BudgetBridge now demonstrates the required end-to-end workflow, database-backed CRUD, user isolation, input validation, authentication, reporting, testing evidence, and clean-machine documentation. The remaining product limitations are intentional course-scope decisions: local deployment, Canadian-dollar display, no bank synchronization, no email password reset, and no multi-factor authentication.
