import axios from 'axios'

const api = axios.create({ baseURL: '/api', timeout: 10000 })

api.interceptors.response.use(
  res => res,
  err => { console.error('API Error:', err); return Promise.reject(err); }
)

export default api

// ===================== MOCK DATA =====================
// Used when backend isn't connected
export const mockDashboard = {
  Revenue: { Today: 12450.50, ThisMonth: 124500.00 },
  Orders: { Total: 1247, Pending: 89 },
  Customers: { Total: 8234, New30d: 342 },
  ReturnRate: 12.4,
  ROI: 45.2,
  ProductHealth: { Healthy: 45, Warning: 12, Critical: 8, Discontinued: 3 },
  CustomerLoyalty: { VIP: 234, Gold: 1234, Silver: 3456, Bronze: 2100, New: 1210 },
  RTOToday: { AutoApproved: 28, ManualReview: 12, AutoRejected: 7 },
  ActiveAds: { Count: 12, TotalSpend: 4500, AvgROI: 45 },
  RecentDecisions: [
    { Id: 1, Section: 'Products', DecisionType: 'PriceDecrease', ItemName: 'Wireless Mouse Pro', DecisionDetails: 'Price reduced from $34.99 to $29.99', CreatedAt: new Date().toISOString(), Status: 'Applied' },
    { Id: 2, Section: 'Customers', DecisionType: 'Flag', ItemName: 'Robert Martinez', DecisionDetails: 'Flagged as Fraud Risk', CreatedAt: new Date(Date.now()-3600000).toISOString(), Status: 'Applied' },
    { Id: 3, Section: 'Ads', DecisionType: 'Pause', ItemName: 'Back to School', DecisionDetails: 'Campaign paused - ROI below threshold', CreatedAt: new Date(Date.now()-7200000).toISOString(), Status: 'Applied' },
    { Id: 4, Section: 'Products', DecisionType: 'IncreaseInventory', ItemName: 'Gaming Keyboard RGB', DecisionDetails: 'Stock increased by 150 units', CreatedAt: new Date(Date.now()-10800000).toISOString(), Status: 'Applied' },
    { Id: 5, Section: 'Returns', DecisionType: 'Approve', ItemName: 'RTN-00234', DecisionDetails: 'Return approved, refund of $89.99', CreatedAt: new Date(Date.now()-14400000).toISOString(), Status: 'Applied' },
  ],
  Alerts: [
    { Level: 'Critical', Message: '"Noise Canceling Headphones" is out of stock', Section: 'Products' },
    { Level: 'Warning', Message: '"Gaming Keyboard RGB" - only 3 left in stock', Section: 'Products' },
    { Level: 'Warning', Message: '"Monitor Light Bar" - only 8 left in stock', Section: 'Products' },
    { Level: 'Info', Message: '"Summer Sale" campaign ROI +120% — Consider boosting', Section: 'Ads' },
  ]
}

export const mockProducts = [
  { Id: 1, Name: 'Wireless Mouse Pro', SKU: 'WM-001', Category: 'Electronics', Price: 29.99, Cost: 12.50, Stock: 234, ReorderLevel: 50, Margin: 58.3, HealthStatus: 'Healthy', HealthScore: 92, IsActive: true, IsDiscontinued: false },
  { Id: 2, Name: 'Gaming Keyboard RGB', SKU: 'GK-001', Category: 'Electronics', Price: 79.99, Cost: 35.00, Stock: 3, ReorderLevel: 20, Margin: 56.2, HealthStatus: 'Critical', HealthScore: 28, IsActive: true, IsDiscontinued: false },
  { Id: 3, Name: 'USB-C Hub 7-in-1', SKU: 'UH-001', Category: 'Electronics', Price: 45.99, Cost: 18.00, Stock: 87, ReorderLevel: 30, Margin: 60.9, HealthStatus: 'Healthy', HealthScore: 85, IsActive: true, IsDiscontinued: false },
  { Id: 4, Name: 'Laptop Stand Adjustable', SKU: 'LS-001', Category: 'Accessories', Price: 39.99, Cost: 16.00, Stock: 156, ReorderLevel: 40, Margin: 60.0, HealthStatus: 'Healthy', HealthScore: 88, IsActive: true, IsDiscontinued: false },
  { Id: 5, Name: 'Noise Canceling Headphones', SKU: 'NH-001', Category: 'Electronics', Price: 149.99, Cost: 65.00, Stock: 0, ReorderLevel: 25, Margin: 56.7, HealthStatus: 'Critical', HealthScore: 15, IsActive: false, IsDiscontinued: false },
  { Id: 6, Name: 'Webcam 4K', SKU: 'WC-001', Category: 'Electronics', Price: 89.99, Cost: 38.00, Stock: 42, ReorderLevel: 20, Margin: 57.8, HealthStatus: 'Warning', HealthScore: 65, IsActive: true, IsDiscontinued: false },
  { Id: 7, Name: 'Mouse Pad XL', SKU: 'MP-001', Category: 'Accessories', Price: 24.99, Cost: 8.50, Stock: 312, ReorderLevel: 60, Margin: 66.0, HealthStatus: 'Healthy', HealthScore: 95, IsActive: true, IsDiscontinued: false },
  { Id: 8, Name: 'Monitor Light Bar', SKU: 'ML-001', Category: 'Accessories', Price: 34.99, Cost: 14.00, Stock: 8, ReorderLevel: 15, Margin: 60.0, HealthStatus: 'Warning', HealthScore: 55, IsActive: true, IsDiscontinued: false },
  { Id: 9, Name: 'Portable SSD 1TB', SKU: 'PS-001', Category: 'Storage', Price: 99.99, Cost: 52.00, Stock: 67, ReorderLevel: 30, Margin: 48.0, HealthStatus: 'Healthy', HealthScore: 78, IsActive: true, IsDiscontinued: false },
  { Id: 10, Name: 'Smart Power Strip', SKU: 'SP-001', Category: 'Electronics', Price: 55.99, Cost: 22.00, Stock: 189, ReorderLevel: 45, Margin: 60.7, HealthStatus: 'Healthy', HealthScore: 90, IsActive: true, IsDiscontinued: false },
]

export const mockCustomers = [
  { Id: 1, FirstName: 'James', LastName: 'Anderson', Email: 'james.anderson@email.com', Phone: '+1-555-0101', City: 'New York', LoyaltyTier: 'VIP', LoyaltyPoints: 8500, TotalSpent: 12450.50, TotalOrders: 89, IsBlocked: false, Flags: [] },
  { Id: 2, FirstName: 'Sarah', LastName: 'Chen', Email: 'sarah.chen@email.com', Phone: '+1-555-0102', City: 'San Francisco', LoyaltyTier: 'Gold', LoyaltyPoints: 3200, TotalSpent: 4350.00, TotalOrders: 42, IsBlocked: false, Flags: [] },
  { Id: 3, FirstName: 'Michael', LastName: 'Rodriguez', Email: 'michael.r@email.com', Phone: '+1-555-0103', City: 'Chicago', LoyaltyTier: 'Silver', LoyaltyPoints: 1100, TotalSpent: 1890.00, TotalOrders: 28, IsBlocked: false, Flags: [] },
  { Id: 4, FirstName: 'Emily', LastName: 'Watson', Email: 'emily.w@email.com', Phone: '+1-555-0104', City: 'Austin', LoyaltyTier: 'Gold', LoyaltyPoints: 2800, TotalSpent: 3750.00, TotalOrders: 35, IsBlocked: false, Flags: [] },
  { Id: 5, FirstName: 'David', LastName: 'Kim', Email: 'david.kim@email.com', Phone: '+1-555-0105', City: 'Seattle', LoyaltyTier: 'Silver', LoyaltyPoints: 650, TotalSpent: 780.00, TotalOrders: 12, IsBlocked: false, Flags: [{ FlagType: 'HighReturn', Reason: 'Return rate > 50%' }] },
  { Id: 6, FirstName: 'Lisa', LastName: 'Thompson', Email: 'lisa.t@email.com', Phone: '+1-555-0106', City: 'Boston', LoyaltyTier: 'Bronze', LoyaltyPoints: 200, TotalSpent: 245.00, TotalOrders: 4, IsBlocked: false, Flags: [] },
  { Id: 7, FirstName: 'Robert', LastName: 'Martinez', Email: 'r.martinez@tempmail.com', Phone: '+1-555-0107', City: 'Miami', LoyaltyTier: 'New', LoyaltyPoints: 0, TotalSpent: 0, TotalOrders: 0, IsBlocked: false, Flags: [{ FlagType: 'FraudRisk', Reason: 'Suspicious email domain' }] },
  { Id: 8, FirstName: 'Amanda', LastName: 'Johnson', Email: 'amanda.j@email.com', Phone: '+1-555-0108', City: 'Denver', LoyaltyTier: 'VIP', LoyaltyPoints: 9200, TotalSpent: 15600.00, TotalOrders: 124, IsBlocked: false, Flags: [] },
]

export const mockOrders = [
  { Id: 1, OrderNumber: 'ORD-00234', OrderDate: new Date().toISOString(), TotalAmount: 129.98, PaymentMethod: 'UPI', PaymentStatus: 'Confirmed', FulfillmentStatus: 'Delivered', RTORiskScore: 15, RTODecision: 'Auto-Approved', Customer: { FirstName: 'James', LastName: 'Anderson', Email: 'james.anderson@email.com' }, ItemCount: 2 },
  { Id: 2, OrderNumber: 'ORD-00235', OrderDate: new Date(Date.now()-86400000).toISOString(), TotalAmount: 79.99, PaymentMethod: 'COD', PaymentStatus: 'Pending', FulfillmentStatus: 'Shipped', RTORiskScore: 55, RTODecision: 'Manual Review', Customer: { FirstName: 'Sarah', LastName: 'Chen', Email: 'sarah.chen@email.com' }, ItemCount: 1 },
  { Id: 3, OrderNumber: 'ORD-00236', OrderDate: new Date(Date.now()-172800000).toISOString(), TotalAmount: 649.97, PaymentMethod: 'CreditCard', PaymentStatus: 'Confirmed', FulfillmentStatus: 'Pending', RTORiskScore: 35, RTODecision: 'Manual Review', Customer: { FirstName: 'Emily', LastName: 'Watson', Email: 'emily.w@email.com' }, ItemCount: 3 },
  { Id: 4, OrderNumber: 'ORD-00237', OrderDate: new Date(Date.now()-259200000).toISOString(), TotalAmount: 45.99, PaymentMethod: 'UPI', PaymentStatus: 'Confirmed', FulfillmentStatus: 'Delivered', RTORiskScore: 8, RTODecision: 'Auto-Approved', Customer: { FirstName: 'Michael', LastName: 'Rodriguez', Email: 'michael.r@email.com' }, ItemCount: 1 },
  { Id: 5, OrderNumber: 'ORD-00238', OrderDate: new Date(Date.now()-345600000).toISOString(), TotalAmount: 299.99, PaymentMethod: 'COD', PaymentStatus: 'Refunded', FulfillmentStatus: 'Cancelled', RTORiskScore: 88, RTODecision: 'Auto-Rejected', Customer: { FirstName: 'Robert', LastName: 'Martinez', Email: 'r.martinez@tempmail.com' }, ItemCount: 2 },
]

export const mockReturns = [
  { Id: 1, ReturnNumber: 'RTN-00045', OrderNumber: 'ORD-00180', Status: 'Pending', ReturnReason: 'Defective', Quantity: 1, RefundAmount: 79.99, RequestDate: new Date().toISOString(), Customer: { FirstName: 'David', LastName: 'Kim' }, Product: { Name: 'Gaming Keyboard RGB', SKU: 'GK-001' } },
  { Id: 2, ReturnNumber: 'RTN-00044', OrderNumber: 'ORD-00175', Status: 'Approved', ReturnReason: 'WrongSize', Quantity: 1, RefundAmount: 39.99, RequestDate: new Date(Date.now()-86400000).toISOString(), Customer: { FirstName: 'Lisa', LastName: 'Thompson' }, Product: { Name: 'Laptop Stand Adjustable', SKU: 'LS-001' } },
  { Id: 3, ReturnNumber: 'RTN-00043', OrderNumber: 'ORD-00170', Status: 'Refunded', ReturnReason: 'NotDescribed', Quantity: 1, RefundAmount: 45.99, RequestDate: new Date(Date.now()-172800000).toISOString(), Customer: { FirstName: 'Sarah', LastName: 'Chen' }, Product: { Name: 'USB-C Hub 7-in-1', SKU: 'UH-001' } },
]

export const mockCampaigns = [
  { Id: 1, Name: 'Summer Sale - Electronics', Platform: 'Facebook', Budget: 5000, Status: 'Active', StartDate: '2024-06-01', EndDate: '2024-08-31', TotalSpend: 2450, TotalRevenue: 8575, ROI: 250, Clicks: 12450, Impressions: 445000, Product: { Name: 'Wireless Mouse Pro' } },
  { Id: 2, Name: 'Gaming Gear - YouTube', Platform: 'Google', Budget: 3000, Status: 'Active', StartDate: '2024-05-15', EndDate: '2024-07-15', TotalSpend: 1800, TotalRevenue: 5400, ROI: 200, Clicks: 8900, Impressions: 320000, Product: { Name: 'Gaming Keyboard RGB' } },
  { Id: 3, Name: 'Back to School', Platform: 'Instagram', Budget: 2500, Status: 'Paused', StartDate: '2024-08-01', EndDate: '2024-09-15', TotalSpend: 900, TotalRevenue: 1800, ROI: 100, Clicks: 4500, Impressions: 180000, Product: { Name: 'Laptop Stand Adjustable' } },
  { Id: 4, Name: 'Tech Deals Q4', Platform: 'Facebook', Budget: 8000, Status: 'Draft', StartDate: '2024-10-01', EndDate: '2024-12-31', TotalSpend: 0, TotalRevenue: 0, ROI: 0, Clicks: 0, Impressions: 0, Product: { Name: 'Noise Canceling Headphones' } },
  { Id: 5, Name: 'Wireless Week', Platform: 'Google', Budget: 4500, Status: 'Ended', StartDate: '2024-04-01', EndDate: '2024-04-30', TotalSpend: 4200, TotalRevenue: 11340, ROI: 170, Clicks: 22000, Impressions: 890000, Product: { Name: 'Wireless Mouse Pro' } },
]

export const mockRules = [
  { Id: 1, Category: 'Product', RuleName: 'Stop Selling Threshold', CurrentValue: '30', DefaultValue: '30', Description: 'Auto-stop if return rate exceeds %', IsEditable: true },
  { Id: 2, Category: 'Product', RuleName: 'Low Stock Alert', CurrentValue: '10', DefaultValue: '10', Description: 'Alert when stock below this level', IsEditable: true },
  { Id: 3, Category: 'Product', RuleName: 'Margin Warning', CurrentValue: '10', DefaultValue: '10', Description: 'Flag for review if margin below %', IsEditable: true },
  { Id: 4, Category: 'Product', RuleName: 'Health Score Healthy', CurrentValue: '80', DefaultValue: '80', Description: 'Green status above this score', IsEditable: true },
  { Id: 5, Category: 'Customer', RuleName: 'VIP Tier', CurrentValue: '5000', DefaultValue: '5000', Description: 'Auto VIP if total spent > $', IsEditable: true },
  { Id: 6, Category: 'Customer', RuleName: 'Gold Tier', CurrentValue: '2000', DefaultValue: '2000', Description: 'Auto Gold if total spent > $', IsEditable: true },
  { Id: 7, Category: 'Customer', RuleName: 'High Return Flag', CurrentValue: '50', DefaultValue: '50', Description: 'Auto-flag if return rate > %', IsEditable: true },
  { Id: 8, Category: 'RTO', RuleName: 'COD Penalty', CurrentValue: '15', DefaultValue: '15', Description: 'Points added for COD payment', IsEditable: true },
  { Id: 9, Category: 'RTO', RuleName: 'High Value Penalty', CurrentValue: '20', DefaultValue: '20', Description: 'Points added if order value >$500', IsEditable: true },
  { Id: 10, Category: 'RTO', RuleName: 'Customer Return Penalty', CurrentValue: '40', DefaultValue: '40', Description: 'Points if return rate >50%', IsEditable: true },
  { Id: 11, Category: 'Ads', RuleName: 'Pause Ad ROI Threshold', CurrentValue: '-10', DefaultValue: '-10', Description: 'Auto-pause if ROI% drops below', IsEditable: true },
  { Id: 12, Category: 'Ads', RuleName: 'ROAS Good', CurrentValue: '3', DefaultValue: '3', Description: 'Green if ROAS > X', IsEditable: true },
]

// Generate 30 days of sales data
export function generateSalesData(days = 30) {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(Date.now() - (days - i - 1) * 86400000)
    return {
      date: date.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      revenue: Math.floor(Math.random() * 8000 + 2000),
      orders: Math.floor(Math.random() * 80 + 20),
      returns: Math.floor(Math.random() * 10 + 2),
    }
  })
}
