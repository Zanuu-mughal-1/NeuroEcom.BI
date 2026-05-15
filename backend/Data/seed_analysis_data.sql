USE NeuroEcomBI;
GO

-- 0. Cleanup existing analysis data
DELETE FROM AdPerformance;
DELETE FROM AdCampaigns;
DELETE FROM Returns;
DELETE FROM RTOAssessments;
DELETE FROM RTOs;
DELETE FROM OrderTimelines;
DELETE FROM OrderTimeline;
DELETE FROM ProductSalesHistory;
DELETE FROM OrderItems;
DELETE FROM Orders;
DELETE FROM Customers;

DBCC CHECKIDENT ('Orders', RESEED, 0);
DBCC CHECKIDENT ('Customers', RESEED, 0);
DBCC CHECKIDENT ('Returns', RESEED, 0);
DBCC CHECKIDENT ('AdCampaigns', RESEED, 0);
GO

-- 1. Seed Customers (10 unique entries)
SET IDENTITY_INSERT Customers ON;
INSERT INTO Customers (Id, FirstName, LastName, Email, Phone, City, Pincode, ShippingAddress, LoyaltyTier, LoyaltyPoints, TotalSpent, TotalOrders, JoinedDate, CreatedAt) VALUES
(1, 'Zain', 'Mughal', 'zain.mughal@example.pk', '0300-1122334', 'Islamabad', '44000', 'House 123, Sector F-7, Islamabad', 'Gold', 1500, 45000, 12, DATEADD(DAY, -180, GETDATE()), GETDATE()),
(2, 'Ayesha', 'Khan', 'ayesha.k@gmail.com', '0321-5566778', 'Lahore', '54000', 'Apartment 4B, Gulberg III, Lahore', 'Silver', 800, 22000, 6, DATEADD(DAY, -120, GETDATE()), GETDATE()),
(3, 'Bilal', 'Ahmed', 'bilal.ahmed88@yahoo.com', '0333-9988776', 'Karachi', '75500', 'Plot 45, DHA Phase 6, Karachi', 'VIP', 3500, 125000, 25, DATEADD(DAY, -365, GETDATE()), GETDATE()),
(4, 'Fatima', 'Zahra', 'fatima.zahra@outlook.com', '0345-4433221', 'Rawalpindi', '46000', 'Street 5, Bahria Town Phase 7, Rawalpindi', 'Silver', 450, 15000, 4, DATEADD(DAY, -60, GETDATE()), GETDATE()),
(5, 'Omar', 'Sheikh', 'omar.sheikh@business.pk', '0312-7766554', 'Faisalabad', '38000', 'Chenab Club Road, Faisalabad', 'Gold', 1200, 38000, 10, DATEADD(DAY, -150, GETDATE()), GETDATE()),
(6, 'Sana', 'Malik', 'sana.malik@edu.pk', '0301-2233445', 'Multan', '60000', 'Bosan Road, Near University, Multan', 'Bronze', 150, 5000, 2, DATEADD(DAY, -30, GETDATE()), GETDATE()),
(7, 'Ali', 'Raza', 'ali.raza@tech.com', '0302-8877665', 'Peshawar', '25000', 'University Road, Peshawar', 'Silver', 600, 18500, 5, DATEADD(DAY, -90, GETDATE()), GETDATE()),
(8, 'Hina', 'Siddiqui', 'hina.sid@gmail.com', '0334-1122998', 'Quetta', '87300', 'Cantt Area, Quetta', 'Bronze', 100, 3200, 1, DATEADD(DAY, -15, GETDATE()), GETDATE()),
(9, 'Hamza', 'Butt', 'hamza.butt@gmail.com', '0322-6655443', 'Gujranwala', '52250', 'GT Road, Gujranwala', 'Gold', 1100, 35000, 9, DATEADD(DAY, -200, GETDATE()), GETDATE()),
(10, 'Maryam', 'Shah', 'maryam.shah@outlook.com', '0344-3322110', 'Sialkot', '51310', 'Kashmir Road, Sialkot', 'Silver', 700, 21000, 7, DATEADD(DAY, -110, GETDATE()), GETDATE());
SET IDENTITY_INSERT Customers OFF;
GO

-- 2. Seed Orders (50 orders)
INSERT INTO Orders (OrderNumber, CustomerId, OrderDate, TotalAmount, PaymentMethod, PaymentStatus, FulfillmentStatus, ShippingAddress, RTORiskScore, CreatedAt, UpdatedAt)
SELECT TOP 50 
    'ORD-' + LEFT(UPPER(REPLACE(CAST(NEWID() AS VARCHAR(36)), '-', '')), 8),
    (ABS(CHECKSUM(NEWID())) % 10) + 1,
    DATEADD(DAY, -(ABS(CHECKSUM(NEWID())) % 30), GETDATE()),
    0, 
    CASE WHEN ABS(CHECKSUM(NEWID())) % 3 = 0 THEN 'COD' ELSE 'Credit Card' END,
    'Paid',
    CASE WHEN ABS(CHECKSUM(NEWID())) % 4 = 0 THEN 'Delivered' ELSE 'Shipped' END,
    'Shipping Address',
    ABS(CHECKSUM(NEWID())) % 100,
    GETDATE(), GETDATE()
FROM sys.objects a CROSS JOIN sys.objects b;
GO

-- 3. Seed OrderItems (2 items for every order)
INSERT INTO OrderItems (OrderId, ProductId, Quantity, UnitPrice, TotalPrice)
SELECT O.Id, P.Id, 1, P.Price, P.Price
FROM Orders O
CROSS APPLY (SELECT TOP 2 Id, Price FROM Products ORDER BY NEWID()) P;
GO

-- Update Order Totals
UPDATE O
SET TotalAmount = (SELECT SUM(TotalPrice) FROM OrderItems WHERE OrderId = O.Id)
FROM Orders O;
GO

-- 4. Seed ProductSalesHistory (Daily data for 30 days)
INSERT INTO ProductSalesHistory (ProductId, SaleDate, UnitsSold, Revenue, Returns)
SELECT P.Id, DATEADD(DAY, -D.n, CAST(GETDATE() AS DATE)), 
       ABS(CHECKSUM(NEWID())) % 10, 
       P.Price * (ABS(CHECKSUM(NEWID())) % 10),
       CASE WHEN ABS(CHECKSUM(NEWID())) % 20 = 0 THEN 1 ELSE 0 END
FROM Products P
CROSS JOIN (SELECT TOP 30 (ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) - 1) as n FROM sys.objects) D;
GO

-- 5. Seed Returns (10 items)
INSERT INTO Returns (ReturnNumber, OrderId, CustomerId, ProductId, Quantity, ReturnReason, Status, RefundAmount, RequestDate, CreatedAt, UpdatedAt)
SELECT TOP 10 
    'RET-' + LEFT(UPPER(REPLACE(CAST(NEWID() AS VARCHAR(36)), '-', '')), 8),
    O.Id, O.CustomerId, OI.ProductId, 1, 
    'Defective', 'Pending', OI.UnitPrice, DATEADD(DAY, 1, O.OrderDate), GETDATE(), GETDATE()
FROM Orders O
JOIN OrderItems OI ON O.Id = OI.OrderId
WHERE TRIM(O.FulfillmentStatus) = 'Delivered'
ORDER BY NEWID();
GO

-- 6. Seed AdCampaigns & Performance
SET IDENTITY_INSERT AdCampaigns ON;
INSERT INTO AdCampaigns (Id, Name, Platform, ProductId, Budget, Status, StartDate, EndDate, CreatedAt) VALUES
(1, 'Smart Home Summer Sale', 'Facebook', 25, 50000, 'Active', DATEADD(DAY, -30, GETDATE()), DATEADD(DAY, 30, GETDATE()), GETDATE()),
(2, 'Industrial Gear Launch', 'Google', 29, 75000, 'Active', DATEADD(DAY, -20, GETDATE()), DATEADD(DAY, 40, GETDATE()), GETDATE()),
(3, 'Modern Lighting Collection', 'Instagram', 21, 30000, 'Active', DATEADD(DAY, -15, GETDATE()), DATEADD(DAY, 15, GETDATE()), GETDATE()),
(4, 'Pro Tools Performance', 'LinkedIn', 30, 45000, 'Paused', DATEADD(DAY, -45, GETDATE()), DATEADD(DAY, -5, GETDATE()), GETDATE()),
(5, 'DIY Wiring Tips', 'TikTok', 20, 20000, 'Active', DATEADD(DAY, -10, GETDATE()), DATEADD(DAY, 20, GETDATE()), GETDATE());
SET IDENTITY_INSERT AdCampaigns OFF;
GO

INSERT INTO AdPerformance (CampaignId, PerformanceDate, Spend, Revenue, Clicks, Impressions)
SELECT C.Id, DATEADD(DAY, -D.n, CAST(GETDATE() AS DATE)),
       500 + (ABS(CHECKSUM(NEWID())) % 500),
       2000 + (ABS(CHECKSUM(NEWID())) % 5000),
       100 + (ABS(CHECKSUM(NEWID())) % 200),
       2000 + (ABS(CHECKSUM(NEWID())) % 8000)
FROM AdCampaigns C
CROSS JOIN (SELECT TOP 30 (ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) - 1) as n FROM sys.objects) D;
GO

-- 7. Seed RTOs and RTOAssessments
INSERT INTO RTOs (OrderId, CustomerId, DeliveryAttempts, FailureReason, RiskScore, Status, CreatedAt, UpdatedAt)
SELECT TOP 5 
    O.Id, O.CustomerId, 
    ABS(CHECKSUM(NEWID())) % 3 + 1, 
    CASE WHEN ABS(CHECKSUM(NEWID())) % 2 = 0 THEN 'Customer not available' ELSE 'Address not found' END,
    ISNULL(O.RTORiskScore, 0), 
    'Returned', 
    DATEADD(DAY, 2, O.OrderDate), 
    DATEADD(DAY, 3, O.OrderDate)
FROM Orders O
WHERE O.FulfillmentStatus = 'Shipped'
ORDER BY NEWID();
GO

INSERT INTO RTOAssessments (OrderId, RiskScore, Decision, TriggeredRules, AssessedAt)
SELECT O.Id, ISNULL(O.RTORiskScore, 0), 
    CASE WHEN ISNULL(O.RTORiskScore, 0) <= 20 THEN 'Auto-Approved'
         WHEN ISNULL(O.RTORiskScore, 0) <= 50 THEN 'Manual Review'
         ELSE 'Auto-Rejected' END,
    'High Value Penalty (+20 pts)',
    O.OrderDate
FROM Orders O
WHERE O.RTORiskScore IS NOT NULL;
GO

PRINT '✅ Analysis data (Customers, Orders, History, Returns, Ads, RTOs) seeded successfully with set-based logic.';
GO
