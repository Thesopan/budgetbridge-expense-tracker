-- BudgetBridge Personal Expense Tracker
-- CP476B Group 6 - Milestone 03 Final Database Schema
-- Target DBMS: MySQL 8.x
-- WARNING: This setup script recreates the budgetbridge_db database.

DROP DATABASE IF EXISTS budgetbridge_db;
CREATE DATABASE budgetbridge_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE budgetbridge_db;

CREATE TABLE users (
    user_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_users_name_not_blank CHECK (CHAR_LENGTH(TRIM(full_name)) > 0)
) ENGINE=InnoDB;

CREATE TABLE categories (
    category_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    category_name VARCHAR(80) NOT NULL,
    category_type ENUM('income', 'expense') NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_categories_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE,
    CONSTRAINT uq_category_per_user
        UNIQUE (user_id, category_name),
    CONSTRAINT chk_category_name_not_blank CHECK (CHAR_LENGTH(TRIM(category_name)) > 0),
    INDEX idx_categories_user_type (user_id, category_type)
) ENGINE=InnoDB;

CREATE TABLE transactions (
    transaction_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    category_id INT UNSIGNED NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    transaction_date DATE NOT NULL,
    description VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_transactions_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_transactions_category
        FOREIGN KEY (category_id) REFERENCES categories(category_id)
        ON DELETE RESTRICT,
    CONSTRAINT chk_transaction_amount_positive CHECK (amount > 0),
    INDEX idx_transactions_user_date (user_id, transaction_date DESC),
    INDEX idx_transactions_category (category_id)
) ENGINE=InnoDB;

CREATE TABLE user_sessions (
    session_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    session_token_hash CHAR(64) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    CONSTRAINT fk_sessions_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE,
    INDEX idx_sessions_user (user_id),
    INDEX idx_sessions_expiry (expires_at)
) ENGINE=InnoDB;

CREATE TABLE activity_logs (
    log_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    action_description VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_activity_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE,
    INDEX idx_activity_user_date (user_id, created_at DESC)
) ENGINE=InnoDB;
