# BudgetBridge ERD Description

## Entities
- users
- categories
- transactions
- user_sessions
- budgets
- activity_logs

## Relationships
- One user can have many transactions.
- One user can have many categories.
- One category can be used by many transactions.
- One user can have many sessions.
- One user can have many budget records.
- One category can have many budget records.
- One user can have many activity log records.

## Normalization Notes
The design avoids repeating category names directly inside transactions. Transactions reference categories through category_id, and both users and categories are separated into their own tables. This supports cleaner queries, easier updates, and better data integrity.
