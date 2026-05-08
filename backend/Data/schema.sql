-- ============================================================
-- NeuroEcom.BI - Full Database Export (Schema + Data)
-- Generated: 2026-05-08
-- ============================================================

USE master;
GO

-- Drop database if it exists to allow clean recreate
IF EXISTS (SELECT name FROM sys.databases WHERE name = N'NeuroEcomBI')
BEGIN
    ALTER DATABASE NeuroEcomBI SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE NeuroEcomBI;
END
GO

CREATE DATABASE NeuroEcomBI;
GO
USE NeuroEcomBI;
GO

-- ===================== TABLES SCHEMA =====================

CREATE TABLE Products (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(200) NOT NULL,
    SKU NVARCHAR(50) UNIQUE NOT NULL,
    Category NVARCHAR(100),
    Description NVARCHAR(MAX),
    Price DECIMAL(18,2) NOT NULL,
    Cost DECIMAL(18,2) NOT NULL,
    Stock INT DEFAULT 0,
    ReorderLevel INT DEFAULT 10,
    LastRestockDate DATETIME2,
    IsActive BIT DEFAULT 1,
    IsDiscontinued BIT DEFAULT 0,
    ImageUrl NVARCHAR(500),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE()
);

CREATE TABLE Customers (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    FirstName NVARCHAR(100) NOT NULL,
    LastName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(200) UNIQUE NOT NULL,
    Phone NVARCHAR(20),
    City NVARCHAR(100),
    LoyaltyTier NVARCHAR(20) DEFAULT 'New',
    LoyaltyPoints INT DEFAULT 0,
    TotalSpent DECIMAL(18,2) DEFAULT 0,
    TotalOrders INT DEFAULT 0,
    IsBlocked BIT DEFAULT 0,
    JoinedDate DATETIME2 DEFAULT GETDATE(),
    CreatedAt DATETIME2 DEFAULT GETDATE()
);

CREATE TABLE Orders (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    OrderNumber NVARCHAR(50) UNIQUE NOT NULL,
    CustomerId INT REFERENCES Customers(Id),
    OrderDate DATETIME2 DEFAULT GETDATE(),
    TotalAmount DECIMAL(18,2) NOT NULL,
    PaymentMethod NVARCHAR(50),
    PaymentStatus NVARCHAR(50) DEFAULT 'Pending',
    FulfillmentStatus NVARCHAR(50) DEFAULT 'Pending',
    CreatedAt DATETIME2 DEFAULT GETDATE()
);

CREATE TABLE AdCampaigns (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(200) NOT NULL,
    Platform NVARCHAR(50) NOT NULL,
    ProductId INT REFERENCES Products(Id),
    Budget DECIMAL(18,2) NOT NULL,
    DailyBudget DECIMAL(18,2),
    StartDate DATE,
    EndDate DATE,
    Status NVARCHAR(50) DEFAULT 'Draft',
    TargetAudience NVARCHAR(200),
    ROIAlertThreshold DECIMAL(5,2) DEFAULT -10.0,
    CreatedAt DATETIME2 DEFAULT GETDATE()
);

CREATE TABLE AdPerformance (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CampaignId INT REFERENCES AdCampaigns(Id),
    PerformanceDate DATE NOT NULL,
    Spend DECIMAL(18,2) DEFAULT 0,
    Revenue DECIMAL(18,2) DEFAULT 0,
    Impressions INT DEFAULT 0,
    Clicks INT DEFAULT 0,
    Conversions INT DEFAULT 0
);

CREATE TABLE SystemRules (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Category NVARCHAR(50) NOT NULL,
    RuleName NVARCHAR(200) NOT NULL,
    CurrentValue NVARCHAR(200) NOT NULL,
    DefaultValue NVARCHAR(200) NOT NULL,
    Description NVARCHAR(500),
    UpdatedAt DATETIME2 DEFAULT GETDATE()
);

-- ===================== DATA SEEDING =====================

SET IDENTITY_INSERT Products ON;
INSERT INTO Products (Id, Name, SKU, Category, Description, Price, Cost, Stock, ReorderLevel, IsActive, IsDiscontinued, CreatedAt, UpdatedAt) VALUES
(1, 'Wireless Mouse Pro', 'WM-001', 'Electronics', 'Ergonomic wireless mouse', 29.99, 12.50, 384, 50, 1, 0, '2026-05-05', '2026-05-07'),
(2, 'Gaming Keyboard RGB', 'GK-001', 'Electronics', 'Mechanical RGB keyboard', 79.99, 35.00, 3, 20, 1, 0, '2026-05-05', '2026-05-05'),
(3, 'USB-C Hub 7-in-1', 'UH-001', 'Electronics', '7-in-1 USB hub', 45.99, 18.00, 87, 30, 1, 0, '2026-05-05', '2026-05-05'),
(4, 'Laptop Stand Adjustable', 'LS-001', 'Accessories', 'Aluminum stand', 39.99, 16.00, 156, 40, 1, 0, '2026-05-05', '2026-05-05'),
(5, 'Noise Canceling Headphones', 'NH-001', 'Electronics', 'ANC headphones', 149.99, 65.00, 0, 25, 1, 0, '2026-05-05', '2026-05-05'),
(6, 'Webcam 4K', 'WC-001', 'Electronics', '4K webcam', 89.99, 38.00, 42, 20, 1, 0, '2026-05-05', '2026-05-05'),
(7, 'Mouse Pad XL', 'MP-001', 'Accessories', '900x400mm pad', 24.99, 8.50, 312, 60, 1, 0, '2026-05-05', '2026-05-05'),
(8, 'Monitor Light Bar', 'ML-001', 'Accessories', 'Screen LED light', 34.99, 14.00, 8, 15, 1, 0, '2026-05-05', '2026-05-07'),
(9, 'Portable SSD 1TB', 'PS-001', 'Storage', 'USB 3.2 SSD', 99.99, 52.00, 67, 30, 1, 0, '2026-05-05', '2026-05-05'),
(10, 'Smart Power Strip', 'SP-001', 'Electronics', '6-outlet strip', 55.99, 22.00, 189, 45, 1, 0, '2026-05-05', '2026-05-05'),
(12, 'Test Product', 'TEST-001', 'Test', 'Test Description', 99.99, 50.00, 100, 10, 1, 0, '2026-05-07', '2026-05-07'),
(13, 'Browser Test Produ', 'BT-001', 'Testing', NULL, 49.99, 25.00, 10, 5, 1, 0, '2026-05-07', '2026-05-07'),
(14, 'Browser Test Product Final', 'BT-003', 'Testing', NULL, 49.99, 25.00, 100, 10, 1, 0, '2026-05-07', '2026-05-07');
SET IDENTITY_INSERT Products OFF;

SET IDENTITY_INSERT Customers ON;
INSERT INTO Customers (Id, FirstName, LastName, Email, City, LoyaltyTier, LoyaltyPoints, TotalSpent, TotalOrders, JoinedDate) VALUES
(1, 'James', 'Anderson', 'james.anderson@email.com', 'New York', 'VIP', 8500, 12450.50, 89, '2022-03-15'),
(2, 'Sarah', 'Chen', 'sarah.chen@email.com', 'San Francisco', 'Gold', 3200, 4350.00, 42, '2022-08-20'),
(3, 'Michael', 'Rodriguez', 'michael.r@email.com', 'Chicago', 'Silver', 1100, 1890.00, 28, '2023-01-10'),
(4, 'Emily', 'Watson', 'emily.w@email.com', 'Austin', 'Gold', 2800, 3750.00, 35, '2022-11-05'),
(5, 'David', 'Kim', 'david.kim@email.com', 'Seattle', 'Silver', 650, 780.00, 12, '2023-06-22'),
(6, 'Lisa', 'Thompson', 'lisa.t@email.com', 'Boston', 'Bronze', 200, 245.00, 4, '2024-01-15'),
(7, 'Robert', 'Martinez', 'r.martinez@tempmail.com', 'Miami', 'New', 0, 0.00, 0, '2024-03-01'),
(8, 'Amanda', 'Johnson', 'amanda.j@email.com', 'Denver', 'VIP', 9200, 15600.00, 124, '2021-07-12'),
(9, 'Kevin', 'Lee', 'kevin.lee@email.com', 'Portland', 'Bronze', 320, 420.00, 7, '2023-09-30'),
(10, 'Jessica', 'Brown', 'jessica.b@email.com', 'Phoenix', 'Silver', 950, 1450.00, 19, '2023-04-18');
SET IDENTITY_INSERT Customers OFF;

SET IDENTITY_INSERT AdCampaigns ON;
INSERT INTO AdCampaigns (Id, Name, Platform, ProductId, Budget, DailyBudget, StartDate, EndDate, Status, CreatedAt) VALUES
(1, 'Summer Sale - Electronics', 'Facebook', 1, 5000.00, 100.00, '2024-06-01', '2024-08-31', 'Active', '2026-05-07'),
(2, 'Gaming Gear - YouTube', 'Google', 2, 3000.00, 80.00, '2024-05-15', '2024-07-15', 'Active', '2026-05-07'),
(3, 'Back to School', 'Instagram', 4, 2500.00, 60.00, '2024-08-01', '2024-09-15', 'Paused', '2026-05-07'),
(4, 'Tech Deals Q4', 'Facebook', 5, 8000.00, 150.00, '2024-10-01', '2024-12-31', 'Draft', '2026-05-07'),
(5, 'Wireless Week', 'Google', 1, 4500.00, 120.00, '2024-04-01', '2024-04-30', 'Ended', '2026-05-07');
SET IDENTITY_INSERT AdCampaigns OFF;

SET IDENTITY_INSERT AdPerformance ON;
INSERT INTO AdPerformance (Id, CampaignId, PerformanceDate, Spend, Revenue, Impressions, Clicks, Conversions) VALUES
(1, 1, '2026-05-02', 115.00, 410.00, 14200, 420, 11),
(2, 1, '2026-05-03', 120.50, 450.00, 15000, 450, 12),
(3, 1, '2026-05-04', 135.00, 520.00, 16200, 480, 15),
(4, 1, '2026-05-05', 110.00, 390.00, 14500, 410, 10),
(5, 1, '2026-05-06', 145.00, 580.00, 17500, 520, 18),
(6, 1, '2026-05-07', 125.00, 480.00, 15800, 460, 14),
(7, 1, '2026-05-08', 98.00, 370.00, 12000, 380, 9),
(8, 2, '2026-05-02', 78.00, 240.00, 7800, 210, 5),
(9, 2, '2026-05-03', 80.00, 250.00, 8000, 220, 5),
(10, 2, '2026-05-04', 85.00, 280.00, 8500, 240, 6),
(11, 2, '2026-05-05', 75.00, 210.00, 7500, 200, 4),
(12, 2, '2026-05-06', 90.00, 310.00, 9200, 260, 7),
(13, 2, '2026-05-07', 82.00, 260.00, 8100, 230, 5),
(14, 2, '2026-05-08', 71.00, 220.00, 7200, 195, 4);
SET IDENTITY_INSERT AdPerformance OFF;

INSERT INTO SystemRules (Category, RuleName, CurrentValue, DefaultValue, Description) VALUES
('Product', 'Stop Selling Threshold', '30', '30', 'Auto-stop if return rate exceeds %'),
('Product', 'Low Stock Alert', '10', '10', 'Alert when stock below this level'),
('Ads', 'Pause Ad ROI Threshold', '-10', '-10', 'Auto-pause if ROI% drops below');

GO
