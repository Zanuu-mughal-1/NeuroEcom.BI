USE NeuroEcomBI;
GO

-- Fix Returns table
IF COL_LENGTH('Returns', 'CreatedAt') IS NULL
    ALTER TABLE Returns ADD CreatedAt DATETIME2 DEFAULT GETDATE();
IF COL_LENGTH('Returns', 'UpdatedAt') IS NULL
    ALTER TABLE Returns ADD UpdatedAt DATETIME2 DEFAULT GETDATE();
GO

-- Ensure all tables exist (from migration_fix.sql but without IF OBJECT_ID check if possible, or just re-run)
-- Actually, migration_fix.sql was fine for tables, just missed some columns on existing tables.

PRINT '✅ Final migration fix complete.';
GO
