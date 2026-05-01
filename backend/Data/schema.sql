-- ============================================================
-- NeuroEcom.BI - SQL Server Database Schema
-- ============================================================

CREATE DATABASE NeuroEcomBI;
GO
USE NeuroEcomBI;
GO

-- ===================== PRODUCTS =====================
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

CREATE TABLE ProductSalesHistory (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ProductId INT REFERENCES Products(Id),
    SaleDate DATE NOT NULL,
    UnitsSold INT DEFAULT 0,
    Revenue DECIMAL(18,2) DEFAULT 0,
    Returns INT DEFAULT 0
);

-- ===================== CUSTOMERS =====================
CREATE TABLE Customers (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    FirstName NVARCHAR(100) NOT NULL,
    LastName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(200) UNIQUE NOT NULL,
    Phone NVARCHAR(20),
    AlternatePhone NVARCHAR(20),
    Gender NVARCHAR(10),
    DateOfBirth DATE,
    ShippingAddress NVARCHAR(500),
    BillingAddress NVARCHAR(500),
    City NVARCHAR(100),
    Pincode NVARCHAR(20),
    LoyaltyTier NVARCHAR(20) DEFAULT 'New', -- VIP, Gold, Silver, Bronze, New
    LoyaltyPoints INT DEFAULT 0,
    TotalSpent DECIMAL(18,2) DEFAULT 0,
    TotalOrders INT DEFAULT 0,
    IsBlocked BIT DEFAULT 0,
    BlockReason NVARCHAR(500),
    JoinedDate DATETIME2 DEFAULT GETDATE(),
    LastOrderDate DATETIME2,
    CreatedAt DATETIME2 DEFAULT GETDATE()
);

CREATE TABLE CustomerFlags (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CustomerId INT REFERENCES Customers(Id),
    FlagType NVARCHAR(50) NOT NULL, -- HighReturn, FraudRisk, PaymentIssue, Abusive, VIP
    Reason NVARCHAR(500),
    FlaggedAt DATETIME2 DEFAULT GETDATE(),
    IsActive BIT DEFAULT 1
);

CREATE TABLE CustomerNotes (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CustomerId INT REFERENCES Customers(Id),
    Note NVARCHAR(MAX),
    CreatedBy NVARCHAR(100),
    CreatedAt DATETIME2 DEFAULT GETDATE()
);

-- ===================== ORDERS =====================
CREATE TABLE Orders (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    OrderNumber NVARCHAR(50) UNIQUE NOT NULL,
    CustomerId INT REFERENCES Customers(Id),
    OrderDate DATETIME2 DEFAULT GETDATE(),
    TotalAmount DECIMAL(18,2) NOT NULL,
    PaymentMethod NVARCHAR(50), -- COD, CreditCard, UPI, NetBanking
    PaymentStatus NVARCHAR(50) DEFAULT 'Pending', -- Pending, Confirmed, Failed, Refunded
    FulfillmentStatus NVARCHAR(50) DEFAULT 'Pending', -- Pending, Shipped, Delivered, Cancelled
    TrackingNumber NVARCHAR(100),
    ShippingAddress NVARCHAR(500),
    RTORiskScore INT DEFAULT 0,
    RTODecision NVARCHAR(50), -- Approved, Rejected, Review
    Notes NVARCHAR(MAX),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE()
);

CREATE TABLE OrderItems (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    OrderId INT REFERENCES Orders(Id),
    ProductId INT REFERENCES Products(Id),
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(18,2) NOT NULL,
    TotalPrice DECIMAL(18,2) NOT NULL,
    ReturnStatus NVARCHAR(50) DEFAULT 'None'
);

CREATE TABLE OrderTimeline (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    OrderId INT REFERENCES Orders(Id),
    Status NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    Timestamp DATETIME2 DEFAULT GETDATE()
);

-- ===================== RETURNS =====================
CREATE TABLE Returns (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ReturnNumber NVARCHAR(50) UNIQUE NOT NULL,
    OrderId INT REFERENCES Orders(Id),
    CustomerId INT REFERENCES Customers(Id),
    ProductId INT REFERENCES Products(Id),
    Quantity INT NOT NULL,
    ReturnReason NVARCHAR(100), -- Defective, WrongSize, NotDescribed, ChangedMind, Other
    AdditionalComments NVARCHAR(MAX),
    Status NVARCHAR(50) DEFAULT 'Pending', -- Pending, Approved, Rejected, Refunded
    RefundAmount DECIMAL(18,2),
    RefundMethod NVARCHAR(50),
    RequestDate DATETIME2 DEFAULT GETDATE(),
    ProcessedDate DATETIME2,
    Notes NVARCHAR(MAX)
);

-- ===================== ADS / CAMPAIGNS =====================
CREATE TABLE AdCampaigns (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(200) NOT NULL,
    Platform NVARCHAR(50) NOT NULL, -- Facebook, Google, Instagram, TikTok
    ProductId INT REFERENCES Products(Id),
    Budget DECIMAL(18,2) NOT NULL,
    DailyBudget DECIMAL(18,2),
    StartDate DATE,
    EndDate DATE,
    Status NVARCHAR(50) DEFAULT 'Draft', -- Active, Paused, Ended, Draft
    TargetAudience NVARCHAR(500),
    ROIAlertThreshold DECIMAL(5,2) DEFAULT -10,
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

-- ===================== DECISIONS =====================
CREATE TABLE Decisions (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Section NVARCHAR(50) NOT NULL, -- Products, Customers, Orders, Ads
    ItemId INT,
    ItemName NVARCHAR(200),
    DecisionType NVARCHAR(100) NOT NULL,
    DecisionDetails NVARCHAR(MAX),
    AppliedBy NVARCHAR(100) DEFAULT 'System',
    Status NVARCHAR(50) DEFAULT 'Applied', -- Applied, Pending, Reverted
    ImpactBefore NVARCHAR(MAX),
    ImpactAfter NVARCHAR(MAX),
    CreatedAt DATETIME2 DEFAULT GETDATE()
);

-- ===================== RULES =====================
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

-- ===================== RTO SHIELD =====================
CREATE TABLE RTOAssessments (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    OrderId INT REFERENCES Orders(Id),
    RiskScore INT NOT NULL,
    Decision NVARCHAR(50) NOT NULL,
    TriggeredRules NVARCHAR(MAX),
    AssessedAt DATETIME2 DEFAULT GETDATE()
);

-- ===================== DISCOUNTS / VOUCHERS =====================
CREATE TABLE CustomerDiscounts (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CustomerId INT REFERENCES Customers(Id),
    DiscountType NVARCHAR(20), -- Percentage, Fixed
    DiscountValue DECIMAL(10,2),
    VoucherCode NVARCHAR(50),
    ExpiryDate DATETIME2,
    IsUsed BIT DEFAULT 0,
    Reason NVARCHAR(500),
    CreatedAt DATETIME2 DEFAULT GETDATE()
);

-- ===================== SEED DEFAULT RULES =====================
INSERT INTO SystemRules (Category, RuleName, CurrentValue, DefaultValue, Description) VALUES
('Product', 'Stop Selling Threshold', '30', '30', 'Auto-stop if return rate exceeds %'),
('Product', 'Low Stock Alert', '10', '10', 'Alert when stock below this level'),
('Product', 'Critical Stock', '0', '0', 'Stop selling immediately'),
('Product', 'Margin Warning', '10', '10', 'Flag for review if margin below %'),
('Product', 'Sales Decline Weekly', '20', '20', 'Trigger review if drop > %'),
('Product', 'Sales Decline Monthly', '30', '30', 'Trigger review if drop > %'),
('Product', 'Health Score Healthy', '80', '80', 'Green status above this score'),
('Product', 'Health Score Warning', '50', '50', 'Yellow status above this score'),
('Customer', 'VIP Tier', '5000', '5000', 'Auto VIP if total spent > $'),
('Customer', 'Gold Tier', '2000', '2000', 'Auto Gold if total spent > $'),
('Customer', 'Silver Tier', '500', '500', 'Auto Silver if total spent > $'),
('Customer', 'High Return Flag', '50', '50', 'Auto-flag if return rate > %'),
('Customer', 'Fraud Risk Flag', '3', '3', 'Auto-flag if >X returns in 30 days'),
('Customer', 'Churned Customer', '90', '90', 'Mark as churned after X days inactive'),
('Customer', 'At-Risk Customer', '60', '60', 'Mark as at-risk after X days inactive'),
('RTO', 'Low Risk Max', '20', '20', 'Auto-approve if score 0-X'),
('RTO', 'Medium Risk Max', '50', '50', 'Manual review if score X-Y'),
('RTO', 'High Risk Max', '80', '80', 'Additional verification if score X-Y'),
('RTO', 'Customer Return Penalty', '40', '40', 'Points added if return rate >50%'),
('RTO', 'Product Return Penalty', '30', '30', 'Points added if product return rate >30%'),
('RTO', 'High Value Penalty', '20', '20', 'Points added if order value >$500'),
('RTO', 'COD Penalty', '15', '15', 'Points added for COD payment'),
('RTO', 'New Customer High Value', '25', '25', 'Points for first order >$500'),
('RTO', 'Multiple Orders Same Day', '35', '35', 'Points if >3 orders same day'),
('RTO', 'Suspicious Email', '20', '20', 'Points for temp email domain'),
('RTO', 'Weekend Order', '10', '10', 'Points for Fri/Sat night orders'),
('Ads', 'Pause Ad ROI Threshold', '-10', '-10', 'Auto-pause if ROI% drops below'),
('Ads', 'Budget Boost Threshold', '50', '50', 'Suggest boost if ROI > %'),
('Ads', 'ROAS Good', '3', '3', 'Green if ROAS > X'),
('Ads', 'ROAS Warning', '1.5', '1.5', 'Yellow if ROAS > X');

-- ===================== SEED SAMPLE DATA =====================
-- Insert sample products
INSERT INTO Products (Name, SKU, Category, Description, Price, Cost, Stock, ReorderLevel) VALUES
('Wireless Mouse Pro', 'WM-001', 'Electronics', 'Ergonomic wireless mouse with 12000 DPI', 29.99, 12.50, 234, 50),
('Gaming Keyboard RGB', 'GK-001', 'Electronics', 'Mechanical gaming keyboard with RGB backlight', 79.99, 35.00, 3, 20),
('USB-C Hub 7-in-1', 'UH-001', 'Electronics', 'Premium USB-C hub with HDMI, USB3.0, SD card', 45.99, 18.00, 87, 30),
('Laptop Stand Adjustable', 'LS-001', 'Accessories', 'Aluminum adjustable laptop stand', 39.99, 16.00, 156, 40),
('Noise Canceling Headphones', 'NH-001', 'Electronics', 'Active noise canceling over-ear headphones', 149.99, 65.00, 0, 25),
('Webcam 4K', 'WC-001', 'Electronics', '4K webcam with autofocus and ring light', 89.99, 38.00, 42, 20),
('Mouse Pad XL', 'MP-001', 'Accessories', 'Extended gaming mouse pad 900x400mm', 24.99, 8.50, 312, 60),
('Monitor Light Bar', 'ML-001', 'Accessories', 'Screen hanging LED light for monitor', 34.99, 14.00, 8, 15),
('Portable SSD 1TB', 'PS-001', 'Storage', 'USB 3.2 Gen2 portable SSD 1TB', 99.99, 52.00, 67, 30),
('Smart Power Strip', 'SP-001', 'Electronics', '6-outlet with USB charging and surge protection', 55.99, 22.00, 189, 45);

-- Insert sample customers
INSERT INTO Customers (FirstName, LastName, Email, Phone, City, LoyaltyTier, LoyaltyPoints, TotalSpent, TotalOrders, JoinedDate) VALUES
('James', 'Anderson', 'james.anderson@email.com', '+1-555-0101', 'New York', 'VIP', 8500, 12450.50, 89, '2022-03-15'),
('Sarah', 'Chen', 'sarah.chen@email.com', '+1-555-0102', 'San Francisco', 'Gold', 3200, 4350.00, 42, '2022-08-20'),
('Michael', 'Rodriguez', 'michael.r@email.com', '+1-555-0103', 'Chicago', 'Silver', 1100, 1890.00, 28, '2023-01-10'),
('Emily', 'Watson', 'emily.w@email.com', '+1-555-0104', 'Austin', 'Gold', 2800, 3750.00, 35, '2022-11-05'),
('David', 'Kim', 'david.kim@email.com', '+1-555-0105', 'Seattle', 'Silver', 650, 780.00, 12, '2023-06-22'),
('Lisa', 'Thompson', 'lisa.t@email.com', '+1-555-0106', 'Boston', 'Bronze', 200, 245.00, 4, '2024-01-15'),
('Robert', 'Martinez', 'r.martinez@tempmail.com', '+1-555-0107', 'Miami', 'New', 0, 0.00, 0, '2024-03-01'),
('Amanda', 'Johnson', 'amanda.j@email.com', '+1-555-0108', 'Denver', 'VIP', 9200, 15600.00, 124, '2021-07-12'),
('Kevin', 'Lee', 'kevin.lee@email.com', '+1-555-0109', 'Portland', 'Bronze', 320, 420.00, 7, '2023-09-30'),
('Jessica', 'Brown', 'jessica.b@email.com', '+1-555-0110', 'Phoenix', 'Silver', 950, 1450.00, 19, '2023-04-18');

-- Insert sample ad campaigns
INSERT INTO AdCampaigns (Name, Platform, ProductId, Budget, DailyBudget, StartDate, EndDate, Status) VALUES
('Summer Sale - Electronics', 'Facebook', 1, 5000.00, 100.00, '2024-06-01', '2024-08-31', 'Active'),
('Gaming Gear - YouTube', 'Google', 2, 3000.00, 80.00, '2024-05-15', '2024-07-15', 'Active'),
('Back to School', 'Instagram', 4, 2500.00, 60.00, '2024-08-01', '2024-09-15', 'Paused'),
('Tech Deals Q4', 'Facebook', 5, 8000.00, 150.00, '2024-10-01', '2024-12-31', 'Draft'),
('Wireless Week', 'Google', 1, 4500.00, 120.00, '2024-04-01', '2024-04-30', 'Ended');
