-- ============================================================
-- மளிகை உதவியாளர் - Maligai Assistant
-- MySQL Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS maligai_assistant
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE maligai_assistant;

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(150) NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- PRODUCTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  product_name        VARCHAR(255) NOT NULL,
  tamil_name          VARCHAR(255),
  brand               VARCHAR(150),
  size                DECIMAL(10,3),
  unit                VARCHAR(50),
  price               DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  availability_status ENUM('AVAILABLE', 'OUT_OF_STOCK') NOT NULL DEFAULT 'AVAILABLE',
  notes               TEXT,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_product_name (product_name),
  INDEX idx_tamil_name (tamil_name),
  INDEX idx_brand (brand),
  INDEX idx_availability (availability_status),
  FULLTEXT INDEX ft_product_search (product_name, tamil_name, brand)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- PRODUCT ALIASES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS product_aliases (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  product_id       INT NOT NULL,
  alias            VARCHAR(255) NOT NULL,
  normalized_alias VARCHAR(255) NOT NULL,
  language         ENUM('TAMIL', 'ENGLISH', 'MIXED') DEFAULT 'MIXED',
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_alias (alias),
  INDEX idx_normalized_alias (normalized_alias),
  INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- INVENTORY UPDATE HISTORY TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS inventory_updates (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  product_id    INT NOT NULL,
  field_changed VARCHAR(100) NOT NULL,
  old_value     TEXT,
  new_value     TEXT,
  changed_by    INT,
  source        ENUM('MOBILE', 'WEB', 'IMPORT') DEFAULT 'WEB',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_product_id (product_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- IMPORT HISTORY TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS import_history (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  filename        VARCHAR(255) NOT NULL,
  total_rows      INT DEFAULT 0,
  valid_rows      INT DEFAULT 0,
  imported_rows   INT DEFAULT 0,
  error_rows      INT DEFAULT 0,
  status          ENUM('PENDING', 'PREVIEW', 'COMPLETED', 'FAILED') DEFAULT 'PENDING',
  imported_by     INT,
  error_details   JSON,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (imported_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SEARCH HISTORY TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS search_history (
  id                    INT AUTO_INCREMENT PRIMARY KEY,
  query_text            VARCHAR(500) NOT NULL,
  recognized_product_id INT,
  result_status         ENUM('FOUND', 'NOT_FOUND', 'MULTIPLE', 'ERROR') DEFAULT 'NOT_FOUND',
  source                ENUM('MOBILE_VOICE', 'MOBILE_TEXT', 'WEB') DEFAULT 'WEB',
  user_id               INT,
  created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recognized_product_id) REFERENCES products(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_created_at (created_at),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
