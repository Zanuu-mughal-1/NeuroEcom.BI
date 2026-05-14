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
    AlternatePhone NVARCHAR(20),
    Gender NVARCHAR(10),
    DateOfBirth DATETIME2,
    ShippingAddress NVARCHAR(MAX),
    BillingAddress NVARCHAR(MAX),
    City NVARCHAR(100),
    Pincode NVARCHAR(20),
    LoyaltyTier NVARCHAR(20) DEFAULT 'New',
    LoyaltyPoints INT DEFAULT 0,
    TotalSpent DECIMAL(18,2) DEFAULT 0,
    TotalOrders INT DEFAULT 0,
    TotalReturns INT DEFAULT 0,
    TotalRTO INT DEFAULT 0,
    RTORiskScore INT DEFAULT 0,
    IsCODBlocked BIT DEFAULT 0,
    IsBlocked BIT DEFAULT 0,
    BlockReason NVARCHAR(MAX),
    JoinedDate DATETIME2 DEFAULT GETDATE(),
    LastOrderDate DATETIME2,
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
    TrackingNumber NVARCHAR(100),
    ShippingAddress NVARCHAR(MAX),
    RTORiskScore INT,
    RTODecision NVARCHAR(50),
    Notes NVARCHAR(MAX),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE()
);

CREATE TABLE OrderItems (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    OrderId INT NOT NULL REFERENCES Orders(Id),
    ProductId INT NOT NULL REFERENCES Products(Id),
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(18,2) NOT NULL,
    TotalPrice DECIMAL(18,2) NOT NULL,
    ReturnStatus NVARCHAR(50) DEFAULT 'None'
);

CREATE TABLE OrderTimelines (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    OrderId INT NOT NULL REFERENCES Orders(Id),
    Status NVARCHAR(100) NOT NULL,
    Description NVARCHAR(MAX),
    Timestamp DATETIME2 DEFAULT GETDATE()
);

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

CREATE TABLE CustomerFlags (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CustomerId INT NOT NULL REFERENCES Customers(Id),
    FlagType NVARCHAR(50) NOT NULL,
    Reason NVARCHAR(MAX),
    FlaggedAt DATETIME2 DEFAULT GETDATE(),
    IsActive BIT DEFAULT 1
);

CREATE TABLE CustomerNotes (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CustomerId INT NOT NULL REFERENCES Customers(Id),
    Note NVARCHAR(MAX),
    CreatedBy NVARCHAR(100),
    CreatedAt DATETIME2 DEFAULT GETDATE()
);

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

CREATE TABLE SystemRules (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Category NVARCHAR(50) NOT NULL,
    RuleName NVARCHAR(200) NOT NULL,
    CurrentValue NVARCHAR(200) NOT NULL,
    DefaultValue NVARCHAR(200) NOT NULL,
    Description NVARCHAR(500),
    IsEditable BIT DEFAULT 1,
    UpdatedAt DATETIME2 DEFAULT GETDATE()
);

CREATE TABLE RTOAssessments (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    OrderId INT REFERENCES Orders(Id),
    RiskScore INT NOT NULL,
    Decision NVARCHAR(50) NOT NULL,
    TriggeredRules NVARCHAR(MAX),
    AssessedAt DATETIME2 DEFAULT GETDATE()
);

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

CREATE TABLE ProductSalesHistory (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ProductId INT NOT NULL REFERENCES Products(Id),
    SaleDate DATETIME2 NOT NULL,
    UnitsSold INT NOT NULL,
    Revenue DECIMAL(18,2) NOT NULL,
    Returns INT DEFAULT 0
);
GO

-- ===================== PERFORMANCE INDEXES =====================
CREATE NONCLUSTERED INDEX IX_Orders_CustomerId ON Orders(CustomerId);
CREATE NONCLUSTERED INDEX IX_OrderItems_OrderId ON OrderItems(OrderId);
CREATE NONCLUSTERED INDEX IX_OrderItems_ProductId ON OrderItems(ProductId);
CREATE NONCLUSTERED INDEX IX_Returns_CustomerId ON Returns(CustomerId);
CREATE NONCLUSTERED INDEX IX_Returns_OrderId ON Returns(OrderId);
CREATE NONCLUSTERED INDEX IX_CustomerFlags_CustomerId ON CustomerFlags(CustomerId);
CREATE NONCLUSTERED INDEX IX_AdPerformance_CampaignId ON AdPerformance(CampaignId);
GO

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
(10, 'Smart Power Strip', 'SP-001', 'Electronics', '6-outlet strip', 55.99, 22.00, 189, 45, 1, 0, '2026-05-05', '2026-05-05');
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

-- Insert sample orders (30 days of real sales data)
INSERT INTO Orders (OrderNumber, CustomerId, OrderDate, TotalAmount, PaymentMethod, PaymentStatus, FulfillmentStatus, CreatedAt, UpdatedAt) VALUES
('ORD-0001', 1, DATEADD(day, -29, GETUTCDATE()), 299.98, 'Credit Card', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0002', 2, DATEADD(day, -28, GETUTCDATE()), 149.99, 'Credit Card', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0003', 3, DATEADD(day, -27, GETUTCDATE()), 89.99, 'COD', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0004', 4, DATEADD(day, -26, GETUTCDATE()), 579.00, 'Credit Card', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0005', 1, DATEADD(day, -25, GETUTCDATE()), 349.99, 'Credit Card', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0006', 5, DATEADD(day, -24, GETUTCDATE()), 99.00, 'COD', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0007', 2, DATEADD(day, -23, GETUTCDATE()), 189.99, 'Credit Card', 'Paid', 'Shipped', GETUTCDATE(), GETUTCDATE()),
('ORD-0008', 6, DATEADD(day, -22, GETUTCDATE()), 749.00, 'Credit Card', 'Paid', 'Shipped', GETUTCDATE(), GETUTCDATE()),
('ORD-0009', 3, DATEADD(day, -21, GETUTCDATE()), 129.99, 'Credit Card', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0010', 8, DATEADD(day, -20, GETUTCDATE()), 399.00, 'Credit Card', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0011', 1, DATEADD(day, -19, GETUTCDATE()), 249.00, 'Credit Card', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0012', 4, DATEADD(day, -18, GETUTCDATE()), 1099.00, 'Credit Card', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0013', 9, DATEADD(day, -17, GETUTCDATE()), 55.99, 'COD', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0014', 2, DATEADD(day, -16, GETUTCDATE()), 699.99, 'Credit Card', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0015', 5, DATEADD(day, -15, GETUTCDATE()), 499.00, 'Credit Card', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0016', 7, DATEADD(day, -14, GETUTCDATE()), 39.99, 'COD', 'Pending', 'Pending', GETUTCDATE(), GETUTCDATE()),
('ORD-0017', 8, DATEADD(day, -13, GETUTCDATE()), 349.99, 'Credit Card', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0018', 1, DATEADD(day, -12, GETUTCDATE()), 159.99, 'Credit Card', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0019', 3, DATEADD(day, -11, GETUTCDATE()), 299.00, 'Credit Card', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0020', 6, DATEADD(day, -10, GETUTCDATE()), 89.99, 'COD', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0021', 4, DATEADD(day, -9, GETUTCDATE()), 449.00, 'Credit Card', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0022', 10, DATEADD(day, -8, GETUTCDATE()), 129.99, 'Credit Card', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0023', 2, DATEADD(day, -7, GETUTCDATE()), 219.00, 'Credit Card', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0024', 8, DATEADD(day, -6, GETUTCDATE()), 399.99, 'Credit Card', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0025', 1, DATEADD(day, -5, GETUTCDATE()), 1199.00, 'Credit Card', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0026', 5, DATEADD(day, -4, GETUTCDATE()), 59.99, 'COD', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0027', 3, DATEADD(day, -3, GETUTCDATE()), 189.00, 'Credit Card', 'Paid', 'Shipped', GETUTCDATE(), GETUTCDATE()),
('ORD-0028', 9, DATEADD(day, -2, GETUTCDATE()), 799.99, 'Credit Card', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0029', 4, DATEADD(day, -1, GETUTCDATE()), 145.00, 'Credit Card', 'Paid', 'Processing', GETUTCDATE(), GETUTCDATE()),
('ORD-0030', 6, GETUTCDATE(), 499.00, 'Credit Card', 'Paid', 'Pending', GETUTCDATE(), GETUTCDATE());

GO
-- ===================== END OF SCHEMA + SEED =====================
