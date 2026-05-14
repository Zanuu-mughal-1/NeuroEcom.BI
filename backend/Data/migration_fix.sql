-- ============================================================
-- NeuroEcom.BI — Migration Fix (Audit Issues C2-C6)
-- Adds missing tables & columns to match C# Models
-- Run this AFTER schema.sql on an existing database
-- ============================================================
USE NeuroEcomBI;
GO

-- ===== C6: SystemRules missing IsEditable =====
IF COL_LENGTH('SystemRules', 'IsEditable') IS NULL
    ALTER TABLE SystemRules ADD IsEditable BIT DEFAULT 1;
GO

-- ===== C2: Customers missing columns =====
IF COL_LENGTH('Customers', 'AlternatePhone') IS NULL
    ALTER TABLE Customers ADD AlternatePhone NVARCHAR(20);
IF COL_LENGTH('Customers', 'Gender') IS NULL
    ALTER TABLE Customers ADD Gender NVARCHAR(10);
IF COL_LENGTH('Customers', 'DateOfBirth') IS NULL
    ALTER TABLE Customers ADD DateOfBirth DATETIME2;
IF COL_LENGTH('Customers', 'ShippingAddress') IS NULL
    ALTER TABLE Customers ADD ShippingAddress NVARCHAR(MAX);
IF COL_LENGTH('Customers', 'BillingAddress') IS NULL
    ALTER TABLE Customers ADD BillingAddress NVARCHAR(MAX);
IF COL_LENGTH('Customers', 'Pincode') IS NULL
    ALTER TABLE Customers ADD Pincode NVARCHAR(20);
IF COL_LENGTH('Customers', 'TotalReturns') IS NULL
    ALTER TABLE Customers ADD TotalReturns INT DEFAULT 0;
IF COL_LENGTH('Customers', 'TotalRTO') IS NULL
    ALTER TABLE Customers ADD TotalRTO INT DEFAULT 0;
IF COL_LENGTH('Customers', 'RTORiskScore') IS NULL
    ALTER TABLE Customers ADD RTORiskScore INT DEFAULT 0;
IF COL_LENGTH('Customers', 'IsCODBlocked') IS NULL
    ALTER TABLE Customers ADD IsCODBlocked BIT DEFAULT 0;
IF COL_LENGTH('Customers', 'BlockReason') IS NULL
    ALTER TABLE Customers ADD BlockReason NVARCHAR(MAX);
IF COL_LENGTH('Customers', 'LastOrderDate') IS NULL
    ALTER TABLE Customers ADD LastOrderDate DATETIME2;
GO

-- ===== C3: Orders missing columns =====
IF COL_LENGTH('Orders', 'TrackingNumber') IS NULL
    ALTER TABLE Orders ADD TrackingNumber NVARCHAR(100);
IF COL_LENGTH('Orders', 'ShippingAddress') IS NULL
    ALTER TABLE Orders ADD ShippingAddress NVARCHAR(MAX);
IF COL_LENGTH('Orders', 'RTORiskScore') IS NULL
    ALTER TABLE Orders ADD RTORiskScore INT;
IF COL_LENGTH('Orders', 'RTODecision') IS NULL
    ALTER TABLE Orders ADD RTODecision NVARCHAR(50);
IF COL_LENGTH('Orders', 'Notes') IS NULL
    ALTER TABLE Orders ADD Notes NVARCHAR(MAX);
IF COL_LENGTH('Orders', 'UpdatedAt') IS NULL
    ALTER TABLE Orders ADD UpdatedAt DATETIME2 DEFAULT GETDATE();
GO

-- ===== C4: Missing tables =====

IF OBJECT_ID('CustomerFlags', 'U') IS NULL
CREATE TABLE CustomerFlags (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CustomerId INT NOT NULL REFERENCES Customers(Id),
    FlagType NVARCHAR(50) NOT NULL,
    Reason NVARCHAR(MAX),
    FlaggedAt DATETIME2 DEFAULT GETDATE(),
    IsActive BIT DEFAULT 1
);

IF OBJECT_ID('CustomerNotes', 'U') IS NULL
CREATE TABLE CustomerNotes (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CustomerId INT NOT NULL REFERENCES Customers(Id),
    Note NVARCHAR(MAX),
    CreatedBy NVARCHAR(100),
    CreatedAt DATETIME2 DEFAULT GETDATE()
);

IF OBJECT_ID('OrderItems', 'U') IS NULL
CREATE TABLE OrderItems (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    OrderId INT NOT NULL REFERENCES Orders(Id),
    ProductId INT NOT NULL REFERENCES Products(Id),
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(18,2) NOT NULL,
    TotalPrice DECIMAL(18,2) NOT NULL,
    ReturnStatus NVARCHAR(50) DEFAULT 'None'
);

IF OBJECT_ID('OrderTimelines', 'U') IS NULL
CREATE TABLE OrderTimelines (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    OrderId INT NOT NULL REFERENCES Orders(Id),
    Status NVARCHAR(100) NOT NULL,
    Description NVARCHAR(MAX),
    Timestamp DATETIME2 DEFAULT GETDATE()
);

IF OBJECT_ID('Returns', 'U') IS NULL
CREATE TABLE Returns (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ReturnNumber NVARCHAR(50),
    OrderId INT NOT NULL REFERENCES Orders(Id),
    CustomerId INT NOT NULL REFERENCES Customers(Id),
    ProductId INT NOT NULL REFERENCES Products(Id),
    Quantity INT NOT NULL,
    ReturnReason NVARCHAR(100),
    AdditionalComments NVARCHAR(MAX),
    Status NVARCHAR(50) DEFAULT 'Pending',
    RefundAmount DECIMAL(18,2),
    RefundMethod NVARCHAR(50),
    RequestDate DATETIME2 DEFAULT GETDATE(),
    ProcessedDate DATETIME2,
    Notes NVARCHAR(MAX),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE()
);

IF OBJECT_ID('RTOs', 'U') IS NULL
CREATE TABLE RTOs (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    OrderId INT NOT NULL REFERENCES Orders(Id),
    CustomerId INT NOT NULL REFERENCES Customers(Id),
    DeliveryAttempts INT DEFAULT 0,
    FailureReason NVARCHAR(200),
    RiskScore INT DEFAULT 0,
    Status NVARCHAR(50) DEFAULT 'Pending',
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE()
);

IF OBJECT_ID('Decisions', 'U') IS NULL
CREATE TABLE Decisions (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Section NVARCHAR(50),
    ItemId INT,
    ItemName NVARCHAR(200),
    DecisionType NVARCHAR(100) NOT NULL,
    DecisionDetails NVARCHAR(MAX),
    AppliedBy NVARCHAR(100) DEFAULT 'System',
    Status NVARCHAR(50) DEFAULT 'Applied',
    ImpactBefore NVARCHAR(MAX),
    ImpactAfter NVARCHAR(MAX),
    CreatedAt DATETIME2 DEFAULT GETDATE()
);

IF OBJECT_ID('RTOAssessments', 'U') IS NULL
CREATE TABLE RTOAssessments (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    OrderId INT REFERENCES Orders(Id),
    RiskScore INT NOT NULL,
    Decision NVARCHAR(50) NOT NULL,
    TriggeredRules NVARCHAR(MAX),
    AssessedAt DATETIME2 DEFAULT GETDATE()
);

IF OBJECT_ID('CustomerDiscounts', 'U') IS NULL
CREATE TABLE CustomerDiscounts (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CustomerId INT NOT NULL REFERENCES Customers(Id),
    DiscountType NVARCHAR(20),
    DiscountValue DECIMAL(10,2) NOT NULL,
    VoucherCode NVARCHAR(50),
    ExpiryDate DATETIME2,
    IsUsed BIT DEFAULT 0,
    Reason NVARCHAR(MAX),
    CreatedAt DATETIME2 DEFAULT GETDATE()
);

IF OBJECT_ID('ProductSalesHistory', 'U') IS NULL
CREATE TABLE ProductSalesHistory (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ProductId INT NOT NULL REFERENCES Products(Id),
    SaleDate DATETIME2 NOT NULL,
    UnitsSold INT NOT NULL,
    Revenue DECIMAL(18,2) NOT NULL,
    Returns INT DEFAULT 0
);
GO

-- ===== W6: Performance indexes on foreign keys =====
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_OrderItems_OrderId')
    CREATE NONCLUSTERED INDEX IX_OrderItems_OrderId ON OrderItems(OrderId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_OrderItems_ProductId')
    CREATE NONCLUSTERED INDEX IX_OrderItems_ProductId ON OrderItems(ProductId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Orders_CustomerId')
    CREATE NONCLUSTERED INDEX IX_Orders_CustomerId ON Orders(CustomerId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Returns_CustomerId')
    CREATE NONCLUSTERED INDEX IX_Returns_CustomerId ON Returns(CustomerId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Returns_OrderId')
    CREATE NONCLUSTERED INDEX IX_Returns_OrderId ON Returns(OrderId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_CustomerFlags_CustomerId')
    CREATE NONCLUSTERED INDEX IX_CustomerFlags_CustomerId ON CustomerFlags(CustomerId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_AdPerformance_CampaignId')
    CREATE NONCLUSTERED INDEX IX_AdPerformance_CampaignId ON AdPerformance(CampaignId);
GO

PRINT '✅ Migration complete — all missing tables and columns added.';
GO
