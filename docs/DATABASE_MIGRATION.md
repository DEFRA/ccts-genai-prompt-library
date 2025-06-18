# SQLite Database Migration Guide

## Overview
This document outlines the steps for migrating to SQLite database in the Template Library system.

## Technical Requirements
- Node.js v14.0 or higher
- SQLite3 v3.35.0 or higher
- Dependencies: better-sqlite3, knex, sqlite3

## Database Schema
```sql
CREATE TABLE templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE template_tags (
    template_id INTEGER,
    tag_id INTEGER,
    FOREIGN KEY (template_id) REFERENCES templates (id),
    FOREIGN KEY (tag_id) REFERENCES tags (id),
    PRIMARY KEY (template_id, tag_id)
);

-- Indexes
CREATE INDEX idx_templates_title ON templates(title);
CREATE INDEX idx_templates_category ON templates(category);
CREATE INDEX idx_tags_name ON tags(name);
```

## Migration Steps

1. **Backup**
   - Export existing data to JSON
   - Create database backup
   - Verify backup integrity

2. **Database Setup**
   ```javascript
   const sqlite3 = require('better-sqlite3');
   const db = new sqlite3('template_library.db');
   db.pragma('journal_mode = WAL');
   db.pragma('foreign_keys = ON');
   ```

3. **Migration Process**
   - Create new SQLite database
   - Run schema creation scripts
   - Import data from backup
   - Verify data integrity
   - Create indexes

4. **Validation**
   - Verify record counts
   - Check data consistency
   - Test application functionality

## Performance Settings
```javascript
{
  "cache_size": -2000,
  "page_size": 4096,
  "journal_mode": "WAL",
  "synchronous": "NORMAL",
  "temp_store": "MEMORY"
}
```

## Maintenance
- Weekly VACUUM operation
- Monthly index optimization
- Regular backups
- Performance monitoring
