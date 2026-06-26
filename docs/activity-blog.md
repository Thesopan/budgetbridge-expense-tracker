# BudgetBridge Activity Blog

## Planning Meeting 01 - Milestone 01 Setup

**Date:** Wednesday, June 3, 2026  
**Location:** iMessage  
**Attendees:** Group 9 members

### Summary
The group selected the Personal Expense Tracker idea and named the project BudgetBridge. The team agreed that the application should focus on a realistic workflow: user registration, login, adding transactions, viewing transactions, filtering records, managing categories, and viewing reports.

### Decisions
- Project name: BudgetBridge
- Technology direction: HTML, CSS, JavaScript, Node.js, MySQL
- Communication: iMessage
- Meeting cadence: Wednesdays and Saturdays at 7 PM
- Kanban columns: Backlog, Ready, In Progress, In Review, Done

### Initial Assignments
- Thesopan Sathiyanantham: Scrum Master / Project Coordinator
- Aditya Arun Kumar: Back-End Lead
- Fisher Matichuk: Front-End Lead
- Noor Ehsan: Database Lead
- Jana Nazer: Documentation / Activity Blog Lead
- Rida Shahid: Testing / QA Lead
- Tahmina Faez: UI/UX Support
- Rafay Khan: GitHub / Kanban Support
- Sahil Minhas: Reports Support
- Ravishan Thanarajah: README / Review Support

---

## Progress Entry 02 - Milestone 02 Front-End Implementation

**Date:** Saturday, June 13, 2026  
**Location:** iMessage  
**Attendees:** Group 6 members

### Work Completed
The team reviewed Milestone 01 feedback and noted that the wireframes needed stronger coverage for each user story. To address this, the Milestone 02 implementation includes a screen or visible UI action for each major story, including registration, login, logout, dashboard summary, transaction CRUD, category management, filtering, searching, reports, and settings.

The front-end was implemented using separate HTML pages with a shared CSS file and JavaScript file. The screens include login, registration, dashboard, transactions list, add transaction, edit transaction, categories, reports, and settings. Mock data is used through browser localStorage so the workflow can be demonstrated before full database integration.

### Decisions Made
- Separate HTML pages were selected instead of a single-page app because they are easier to inspect and match the course expectations.
- JavaScript localStorage is used only for Milestone 02 mock workflow behavior.
- The visual design follows the Milestone 01 Figma-style wireframes.
- A settings page was added to ensure the account settings user story has a matching screen.

### Blockers / Resolutions
- Blocker: The group needed to ensure all user stories were visible in the workflow.
- Resolution: Added the settings screen and made sure transaction filtering, searching, editing, deleting, and reports are all represented in the UI.

### Next Steps
- Test each front-end page.
- Confirm that navigation works across screens.
- Prepare database design PDF and SQL schema.

---

## Progress Entry 03 - Milestone 02 Database and Back-End Setup

**Date:** Wednesday, June 17, 2026  
**Location:** iMessage  
**Attendees:** Group 6 members

### Work Completed
The database design was completed for the main BudgetBridge workflow. The schema includes users, categories, transactions, user sessions, budgets, and activity logs. The design uses foreign keys, constraints, unique rules, and indexes to support data integrity and efficient queries.

A Node.js backend skeleton was also created. The backend includes a runnable `server.js` entry point and separate route/controller files for authentication, transactions, categories, and reports. The endpoints currently return stub responses because full database integration is planned for Milestone 03.

### Decisions Made
- MySQL remains the database target.
- Node.js was selected for the backend skeleton.
- No external front-end frameworks were used.
- Backend route/controller separation was added to make Milestone 03 integration easier.

### Blockers / Resolutions
- Blocker: The group wanted to avoid using unapproved frameworks.
- Resolution: The backend uses the built-in Node.js HTTP module and the front-end uses plain HTML, CSS, and JavaScript.

### Next Steps
- Upload all Milestone 02 files to GitHub.
- Move Kanban tasks into meaningful updated columns.
- Confirm README run instructions are accurate.
- Prepare the final Milestone 02 ZIP with the database PDF and links.txt.
