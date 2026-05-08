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
-- Insert sample products (IDs 1-50)
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
('Smart Power Strip', 'SP-001', 'Electronics', '6-outlet with USB charging and surge protection', 55.99, 22.00, 189, 45),
('Sony WH-1000XM5 Headphones', 'SNY-XM5', 'Audio', 349.99, 180.00, 45, 25),
('Logitech MX Master 3S Mouse', 'LOG-MX3', 'Accessories', 99.00, 45.00, 120, 25),
('Samsung Odyssey G7 32"', 'SAM-G7', 'Electronics', 699.99, 420.00, 15, 25),
('SanDisk Extreme Pro 1TB SSD', 'SND-1TB', 'Storage', 159.99, 85.00, 88, 25),
('Keychron Q1 Mechanical Keyboard', 'KEY-Q1', 'Accessories', 169.00, 95.00, 34, 25),
('Audio-Technica AT2020 Mic', 'AT-2020', 'Audio', 99.00, 55.00, 92, 25),
('Anker PowerCore 26K Battery', 'ANK-26K', 'Accessories', 129.99, 60.00, 140, 25),
('Apple iPad Pro 12.9" M2', 'APL-IPD', 'Electronics', 1099.00, 750.00, 23, 25),
('Seagate IronWolf 8TB NAS', 'SEA-8TB', 'Storage', 189.99, 120.00, 56, 25),
('Rode NT1 5th Gen Mic', 'ROD-NT1', 'Audio', 249.00, 140.00, 12, 25),
('Elgato Stream Deck MK.2', 'ELG-SD2', 'Accessories', 149.99, 70.00, 48, 25),
('Dell UltraSharp U2723QE', 'DEL-U27', 'Electronics', 579.00, 380.00, 19, 25),
('Crucial P5 Plus 2TB NVMe', 'CRU-P5', 'Storage', 145.00, 80.00, 110, 25),
('Blue Yeti USB Microphone', 'BLU-YTI', 'Audio', 129.99, 65.00, 67, 25),
('ASUS ROG Swift PG279QM', 'ASU-ROG', 'Electronics', 749.00, 490.00, 8, 25),
('Western Digital Black 4TB', 'WDC-BLK', 'Storage', 139.99, 85.00, 130, 25),
('Sennheiser HD 660S2', 'SEN-660', 'Audio', 499.00, 280.00, 21, 25),
('Secretlab MAGNUS Desk', 'SEC-MAG', 'Accessories', 499.00, 300.00, 14, 25),
('Nintendo Switch OLED', 'NIN-SWO', 'Electronics', 349.99, 260.00, 89, 25),
('Bose QuietComfort Earbuds II', 'BOS-QCE', 'Audio', 299.00, 160.00, 56, 25),
('Razer DeathAdder V3 Pro', 'RAZ-DA3', 'Accessories', 149.99, 75.00, 102, 25),
('NVIDIA RTX 4080 Founders', 'NVD-408', 'Electronics', 1199.00, 850.00, 5, 25),
('Shure SM7B Vocal Mic', 'SHU-SM7', 'Audio', 399.00, 240.00, 34, 25),
('Synology DS923+ NAS', 'SYN-923', 'Storage', 599.00, 400.00, 12, 25),
('SteelSeries Arctis Nova Pro', 'STE-ANP', 'Audio', 349.99, 190.00, 45, 25),
('Philips Hue Starter Kit', 'PHI-HUE', 'Electronics', 199.99, 110.00, 67, 25),
('Corsair Vengeance 32GB RAM', 'COR-VEN', 'Electronics', 115.00, 70.00, 88, 25),
('Belkin 3-in-1 MagSafe', 'BEL-MAG', 'Accessories', 149.00, 80.00, 43, 25),
('Sonos One (Gen 2) Speaker', 'SON-ONE', 'Audio', 219.00, 130.00, 56, 25),
('GoPro HERO11 Black', 'GPR-H11', 'Electronics', 399.00, 250.00, 22, 25),
('Jabra Evolve2 85 Headset', 'JAB-EVO', 'Audio', 449.00, 260.00, 14, 25),
('Nomad Base One Max', 'NOM-BS1', 'Accessories', 149.95, 75.00, 39, 25),
('Focusrite Scarlett 2i2', 'FOC-2I2', 'Audio', 189.00, 110.00, 28, 25),
('HyperX QuadCast S', 'HYP-QCS', 'Audio', 159.99, 90.00, 61, 25),
('Twelve South Curve Stand', 'TWS-CUR', 'Accessories', 59.99, 30.00, 89, 25),
('TP-Link Deco XE75 Pro', 'TPL-DEC', 'Electronics', 399.99, 240.00, 31, 25),
('Netgear Nighthawk M6', 'NET-M6', 'Electronics', 799.99, 550.00, 12, 25),
('Satechi Slim X1 Keyboard', 'SAT-SX1', 'Accessories', 69.99, 35.00, 47, 25),
('Elgato Key Light Air', 'ELG-KLA', 'Accessories', 129.99, 75.00, 25, 25),
('Oura Ring Gen3', 'OUR-RG3', 'Electronics', 299.00, 190.00, 38, 25);

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

-- Insert sample orders (30 days of real sales data for dashboard trends)
INSERT INTO Orders (OrderNumber, CustomerId, OrderDate, TotalAmount, PaymentMethod, PaymentStatus, FulfillmentStatus, CreatedAt, UpdatedAt) VALUES
('ORD-0001', 1, DATEADD(day, -29, GETUTCDATE()), 299.98, 'Credit Card', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0002', 2, DATEADD(day, -29, GETUTCDATE()), 149.99, 'Credit Card', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0003', 3, DATEADD(day, -28, GETUTCDATE()), 89.99, 'COD', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0004', 4, DATEADD(day, -28, GETUTCDATE()), 579.00, 'Credit Card', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0005', 1, DATEADD(day, -27, GETUTCDATE()), 349.99, 'Credit Card', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0006', 5, DATEADD(day, -27, GETUTCDATE()), 99.00, 'COD', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0007', 2, DATEADD(day, -26, GETUTCDATE()), 189.99, 'Credit Card', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0008', 6, DATEADD(day, -26, GETUTCDATE()), 749.00, 'Credit Card', 'Paid', 'Shipped', GETUTCDATE(), GETUTCDATE()),
('ORD-0009', 3, DATEADD(day, -25, GETUTCDATE()), 129.99, 'Credit Card', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0010', 8, DATEADD(day, -25, GETUTCDATE()), 399.00, 'Credit Card', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0011', 1, DATEADD(day, -24, GETUTCDATE()), 249.00, 'Credit Card', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0012', 4, DATEADD(day, -24, GETUTCDATE()), 1099.00, 'Credit Card', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0013', 9, DATEADD(day, -23, GETUTCDATE()), 55.99, 'COD', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0014', 2, DATEADD(day, -23, GETUTCDATE()), 699.99, 'Credit Card', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0015', 5, DATEADD(day, -22, GETUTCDATE()), 499.00, 'Credit Card', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0016', 7, DATEADD(day, -22, GETUTCDATE()), 39.99, 'COD', 'Pending', 'Pending', GETUTCDATE(), GETUTCDATE()),
('ORD-0017', 8, DATEADD(day, -21, GETUTCDATE()), 349.99, 'Credit Card', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0018', 1, DATEADD(day, -21, GETUTCDATE()), 159.99, 'Credit Card', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0019', 3, DATEADD(day, -20, GETUTCDATE()), 299.00, 'Credit Card', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0020', 6, DATEADD(day, -20, GETUTCDATE()), 89.99, 'COD', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0021', 4, DATEADD(day, -19, GETUTCDATE()), 449.00, 'Credit Card', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0022', 10, DATEADD(day, -19, GETUTCDATE()), 129.99, 'Credit Card', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0023', 2, DATEADD(day, -18, GETUTCDATE()), 219.00, 'Credit Card', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0024', 8, DATEADD(day, -18, GETUTCDATE()), 399.99, 'Credit Card', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0025', 1, DATEADD(day, -17, GETUTCDATE()), 1199.00, 'Credit Card', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0026', 5, DATEADD(day, -17, GETUTCDATE()), 59.99, 'COD', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0027', 3, DATEADD(day, -16, GETUTCDATE()), 189.00, 'Credit Card', 'Paid', 'Shipped', GETUTCDATE(), GETUTCDATE()),
('ORD-0028', 9, DATEADD(day, -16, GETUTCDATE()), 799.99, 'Credit Card', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0029', 4, DATEADD(day, -15, GETUTCDATE()), 145.00, 'Credit Card', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0030', 6, DATEADD(day, -15, GETUTCDATE()), 499.00, 'Credit Card', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0031', 2, DATEADD(day, -14, GETUTCDATE()), 339.98, 'Credit Card', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0032', 1, DATEADD(day, -13, GETUTCDATE()), 749.00, 'Credit Card', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0033', 10, DATEADD(day, -12, GETUTCDATE()), 169.00, 'COD', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0034', 3, DATEADD(day, -11, GETUTCDATE()), 299.00, 'Credit Card', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0035', 8, DATEADD(day, -10, GETUTCDATE()), 579.00, 'Credit Card', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0036', 5, DATEADD(day, -9, GETUTCDATE()), 129.99, 'Credit Card', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0037', 1, DATEADD(day, -8, GETUTCDATE()), 349.99, 'Credit Card', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0038', 4, DATEADD(day, -7, GETUTCDATE()), 89.99, 'COD', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0039', 2, DATEADD(day, -6, GETUTCDATE()), 399.00, 'Credit Card', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0040', 7, DATEADD(day, -5, GETUTCDATE()), 249.00, 'Credit Card', 'Paid', 'Shipped', GETUTCDATE(), GETUTCDATE()),
('ORD-0041', 9, DATEADD(day, -4, GETUTCDATE()), 699.99, 'Credit Card', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0042', 3, DATEADD(day, -3, GETUTCDATE()), 115.00, 'COD', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0043', 1, DATEADD(day, -2, GETUTCDATE()), 449.00, 'Credit Card', 'Paid', 'Delivered', GETUTCDATE(), GETUTCDATE()),
('ORD-0044', 6, DATEADD(day, -1, GETUTCDATE()), 299.00, 'Credit Card', 'Paid', 'Processing', GETUTCDATE(), GETUTCDATE()),
('ORD-0045', 8, GETUTCDATE(), 189.99, 'Credit Card', 'Paid', 'Pending', GETUTCDATE(), GETUTCDATE()),
('ORD-0046', 2, GETUTCDATE(), 79.99, 'COD', 'Pending', 'Pending', GETUTCDATE(), GETUTCDATE()),
('ORD-0047', 4, GETUTCDATE(), 1099.00, 'Credit Card', 'Paid', 'Pending', GETUTCDATE(), GETUTCDATE());
