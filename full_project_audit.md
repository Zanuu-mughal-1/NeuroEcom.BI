# 🔍 NeuroEcom.BI — Full System Audit Report
**Date:** 2026-05-14 | **Auditor:** Antigravity AI | **Scope:** All Layers

---

## 🔴 CRITICAL ERRORS (Must Fix — Will Break the System)

### C1 — `Models.cs` : Dead/Unreachable Code in `GetHealthStatus()` (Lines 31-38)
| Field | Value |
|---|---|
| **File** | [Models.cs](file:///e:/My%202nd%20Sem%20Project/NeuroEcom.BI/NeuroEcom.BI/backend/Models/Models.cs#L29-L39) |
| **Lines** | 29-38 |
| **Error Type** | Logical / Dead Code |
| **Description** | The `GetHealthStatus()` method has duplicate, unreachable branches. Line 31 checks `IsDiscontinued == true`, then lines 32-33 check `HealthScore`. Lines 34-37 are **completely dead code** because every possible path is already returned by lines 31-33 or 38. Specifically: a score ≥80 returns "Healthy" on L32, ≥50 returns "Warning" on L33, and everything else falls through to L38 "Critical". The checks for `IsActive == false` (L35), `HealthScore >= 100` (L36 — impossible to reach since ≥80 already matched), and the second `IsDiscontinued` (L34 — already matched L31) are all dead. |
| **Impact** | Products with `IsActive=false` will **never** show "Inactive" — they'll show "Warning" or "Critical" instead. |
| **Fix** | Replace with correct ordering: |

```csharp
private string GetHealthStatus()
{
    if (IsDiscontinued == true) return "Discontinued";
    if (IsActive == false) return "Inactive";
    if (HealthScore >= 80) return "Healthy";
    if (HealthScore >= 50) return "Warning";
    return "Critical";
}
```

---

### C2 — SQL Schema ↔ C# Model Mismatch: `Customers` Table Missing Columns
| Field | Value |
|---|---|
| **File** | [schema.sql](file:///e:/My%202nd%20Sem%20Project/NeuroEcom.BI/NeuroEcom.BI/backend/Data/schema.sql#L42-L56) vs [Models.cs](file:///e:/My%202nd%20Sem%20Project/NeuroEcom.BI/NeuroEcom.BI/backend/Models/Models.cs#L63-L94) |
| **Error Type** | Schema Mismatch |
| **Description** | The C# `Customer` model defines many columns that **do not exist** in the SQL `Customers` table: `AlternatePhone`, `Gender`, `DateOfBirth`, `ShippingAddress`, `BillingAddress`, `Pincode`, `TotalReturns`, `TotalRTO`, `RTORiskScore`, `IsCODBlocked`, `BlockReason`, `LastOrderDate`. EF Core will throw `SqlException: Invalid column name` when any query touches these columns. |
| **Impact** | **Runtime crash** on any customer detail page, RTO risk calculation, or blocking operations. |
| **Fix** | Add missing columns to schema.sql via ALTER TABLE or recreate: |

```sql
ALTER TABLE Customers ADD
    AlternatePhone NVARCHAR(20),
    Gender NVARCHAR(10),
    DateOfBirth DATETIME2,
    ShippingAddress NVARCHAR(MAX),
    BillingAddress NVARCHAR(MAX),
    Pincode NVARCHAR(20),
    TotalReturns INT DEFAULT 0,
    TotalRTO INT DEFAULT 0,
    RTORiskScore INT DEFAULT 0,
    IsCODBlocked BIT DEFAULT 0,
    BlockReason NVARCHAR(MAX),
    LastOrderDate DATETIME2;
```

---

### C3 — SQL Schema ↔ C# Model Mismatch: `Orders` Table Missing Columns
| Field | Value |
|---|---|
| **File** | [schema.sql](file:///e:/My%202nd%20Sem%20Project/NeuroEcom.BI/NeuroEcom.BI/backend/Data/schema.sql#L58-L68) vs [Models.cs](file:///e:/My%202nd%20Sem%20Project/NeuroEcom.BI/NeuroEcom.BI/backend/Models/Models.cs#L117-L139) |
| **Error Type** | Schema Mismatch |
| **Description** | The C# `Order` model has `TrackingNumber`, `ShippingAddress`, `RTORiskScore`, `RTODecision`, `Notes`, `UpdatedAt` columns that **do not exist** in the SQL `Orders` table. |
| **Impact** | Runtime crash when shipping/tracking orders, viewing order detail, or placing new orders. |
| **Fix** | Add to schema: |

```sql
ALTER TABLE Orders ADD
    TrackingNumber NVARCHAR(100),
    ShippingAddress NVARCHAR(MAX),
    RTORiskScore INT,
    RTODecision NVARCHAR(50),
    Notes NVARCHAR(MAX),
    UpdatedAt DATETIME2 DEFAULT GETDATE();
```

---

### C4 — Missing SQL Tables: `OrderItems`, `OrderTimelines`, `Returns`, `CustomerFlags`, `CustomerNotes`, `RTOs`, `Decisions`, `RTOAssessments`, `CustomerDiscounts`, `ProductSalesHistory`
| Field | Value |
|---|---|
| **File** | [schema.sql](file:///e:/My%202nd%20Sem%20Project/NeuroEcom.BI/NeuroEcom.BI/backend/Data/schema.sql) |
| **Error Type** | Missing Tables |
| **Description** | The schema.sql only defines 6 tables: `Products`, `Customers`, `Orders`, `AdCampaigns`, `AdPerformance`, `SystemRules`. **10 tables required by the C# models and DbContext are completely absent.** EF Core will crash at runtime when it tries to query any of these. |
| **Impact** | **Hard crash** on: Returns module, Order details (Items/Timeline), Customer flags, RTO Shield, Decisions engine, Customer discounts. Basically, most of the application is non-functional without these tables. |
| **Fix** | Add CREATE TABLE statements for all missing tables (see schema additions at end of report). |

---

### C5 — SQL Seed Data: Duplicate IDENTITY INSERTs Will Fail
| Field | Value |
|---|---|
| **File** | [schema.sql](file:///e:/My%202nd%20Sem%20Project/NeuroEcom.BI/NeuroEcom.BI/backend/Data/schema.sql#L108-L224) |
| **Error Type** | SQL Runtime Error |
| **Description** | The schema seeds Products (L108-123) with `IDENTITY_INSERT ON` using specific IDs like `WM-001`, `GK-001`, etc. Then at L174-224 it inserts **the same SKUs again** without `IDENTITY_INSERT ON`, which will violate the `UNIQUE` constraint on `SKU`. Similarly, Customers are seeded twice (L125-137 then L227-237) with the same emails, violating the `UNIQUE` constraint on `Email`. Same for AdCampaigns (L139-146 then L240-245) and Orders with same `OrderNumber`. |
| **Impact** | Running schema.sql **will fail** after the `GO` on line 171. The initial seed works, but the second batch of inserts crashes. |
| **Fix** | Remove the duplicate seed section (L172-555), or use `MERGE` / `INSERT WHERE NOT EXISTS` pattern. |

---

### C6 — `SystemRules` Model Has `IsEditable` Column Not in SQL
| Field | Value |
|---|---|
| **File** | [Models.cs](file:///e:/My%202nd%20Sem%20Project/NeuroEcom.BI/NeuroEcom.BI/backend/Models/Models.cs#L261) vs [schema.sql](file:///e:/My%202nd%20Sem%20Project/NeuroEcom.BI/NeuroEcom.BI/backend/Data/schema.sql#L96-L104) |
| **Error Type** | Schema Mismatch |
| **Description** | C# model has `IsEditable` (bool, default true). SQL table does not define this column. |
| **Fix** | `ALTER TABLE SystemRules ADD IsEditable BIT DEFAULT 1;` |

---

## 🟠 LOGICAL ERRORS (Will Produce Wrong Results)

### L1 — `CustomerAnalytics`: Potential Null Arithmetic in `AvgLTV`
| Field | Value |
|---|---|
| **File** | [AllControllers.cs](file:///e:/My%202nd%20Sem%20Project/NeuroEcom.BI/NeuroEcom.BI/backend/Controllers/AllControllers.cs#L110) |
| **Line** | 110 |
| **Description** | `customers.Average(c => (double)c.TotalSpent)` — `TotalSpent` is `decimal?` (nullable). Casting `null` to `double` will throw `InvalidOperationException`. |
| **Fix** | Use `(double)(c.TotalSpent ?? 0)` |

### L2 — `CustomerAnalytics`: Nullable DateTime Comparisons
| Field | Value |
|---|---|
| **File** | [AllControllers.cs](file:///e:/My%202nd%20Sem%20Project/NeuroEcom.BI/NeuroEcom.BI/backend/Controllers/AllControllers.cs#L106-L108) |
| **Lines** | 106-108 |
| **Description** | `c.LastOrderDate >= now.AddDays(-30)` and `c.JoinedDate >= now.AddDays(-30)` — both are `DateTime?`. When null, comparison returns `false`, which makes "Churned" count include brand-new customers who have never ordered. A customer with `LastOrderDate = null` and `TotalOrders = 0` is "New", not "Churned". |
| **Fix** | Add `c.LastOrderDate.HasValue && c.LastOrderDate < now.AddDays(-90)` |

### L3 — `DashboardController`: Nullable `Spend`/`Revenue` Sum Without Coalescing
| Field | Value |
|---|---|
| **File** | [AllControllers.cs](file:///e:/My%202nd%20Sem%20Project/NeuroEcom.BI/NeuroEcom.BI/backend/Controllers/AllControllers.cs#L889-L890) |
| **Lines** | 889-890 |
| **Description** | `campaigns.SelectMany(c => c.Performance).Sum(p => p.Spend)` — `Spend` is `decimal?`. Using `.Sum()` on nullable decimals returns `decimal?`, but the variable `totalSpend` is used in division (`(double)totalSpend`) which can throw if the result is null with no items. In `AdsController` this is correctly handled with `p.Spend ?? 0`, but in `DashboardController` it's not. |
| **Fix** | Use `Sum(p => p.Spend ?? 0)` and `Sum(p => p.Revenue ?? 0)` |

### L4 — `CustomerUpdate`: Boolean Override Bug
| Field | Value |
|---|---|
| **File** | [AllControllers.cs](file:///e:/My%202nd%20Sem%20Project/NeuroEcom.BI/NeuroEcom.BI/backend/Controllers/AllControllers.cs#L136) |
| **Line** | 136 |
| **Description** | `customer.IsBlocked = updated.IsBlocked;` — Since `IsBlocked` is `bool?`, sending a PUT with no `IsBlocked` field will deserialize as `null`, overwriting a previously-blocked customer's status to `null`. This is different from the pattern on L130-135 which use `??` to preserve existing values. |
| **Fix** | `customer.IsBlocked = updated.IsBlocked ?? customer.IsBlocked;` |

### L5 — E-Commerce Checkout: Hardcoded `CustomerId: 1`
| Field | Value |
|---|---|
| **File** | [Checkout.tsx](file:///e:/My%202nd%20Sem%20Project/NeuroEcom.BI/NeuroEcom.BI/nanoo%27selectric/src/pages/Checkout.tsx#L26) |
| **Line** | 26 |
| **Description** | `CustomerId: 1` is hardcoded. Every order placed from the e-commerce site is attributed to Customer ID 1 (James Anderson). The shipping form collects name/address but **none of it is sent** to the backend. |
| **Impact** | All e-commerce analytics are wrong — all orders go to one customer. |
| **Fix** | Use the `Customer` sub-object in `CreateOrderDto` instead of hardcoded ID. Collect and send form data. |

### L6 — E-Commerce Checkout: Product ID Type Mismatch
| Field | Value |
|---|---|
| **File** | [Checkout.tsx](file:///e:/My%202nd%20Sem%20Project/NeuroEcom.BI/NeuroEcom.BI/nanoo%27selectric/src/pages/Checkout.tsx#L30) |
| **Line** | 30 |
| **Description** | `ProductId: parseInt(item.id) || 1` — The ecommerce `Product.id` is a `string` (per `types.ts` L7), likely a Firebase document ID like `"abc123"`. `parseInt("abc123")` returns `NaN`, so `|| 1` means **every product maps to ProductId 1** (Wireless Mouse Pro). |
| **Impact** | All product-level analytics, inventory tracking, and return matching will be wrong. |
| **Fix** | Maintain a numeric product ID mapping or add a numeric `backendId` field to the ecommerce product type. |

---

## 🟡 INTEGRATION GAPS (Disconnected Layers)

### G1 — E-Commerce ↔ SQL Database: Products Not Synced
| Layer A → Layer B | E-Commerce Product Catalog → SQL Products Table |
|---|---|
| **What's Missing** | The e-commerce site uses its own product constants (`constants.ts`) with string IDs and completely different product data (energy drinks). The SQL database has electronics products. **No synchronization mechanism exists** between the two systems. |
| **Fix** | Either: (a) Use the backend API as the single source of truth for products, or (b) Create a product sync service that maps e-commerce product IDs to SQL product IDs. |

### G2 — E-Commerce ↔ SQL Database: No Customer Creation Pipeline
| Layer A → Layer B | E-Commerce Checkout Form → SQL Customers Table |
|---|---|
| **What's Missing** | The checkout form captures First Name, Last Name, Address, City, State, Zip — but none of this data reaches the backend. The `CreateOrderDto` supports a `Customer` sub-object, but the checkout sends `CustomerId: 1` instead. |
| **Fix** | Populate the `Customer` object in the order payload with form data. |

### G3 — Dashboard Currency Mismatch
| Layer A → Layer B | Orders.jsx UI → Backend Data |
|---|---|
| **What's Missing** | The Orders page shows `Rs` (Rupees) prefix for amounts, but the Dashboard, Customers, and mock data all use `$` (Dollar). The e-commerce site also uses `Rs`. There is no consistent currency handling. |
| **Fix** | Standardize on one currency format across the entire system, or implement locale-aware currency formatting. |

### G4 — `ProductSalesHistory` Table: No Data Pipeline
| Layer A → Layer B | Orders → ProductSalesHistory |
|---|---|
| **What's Missing** | The `ProductSalesHistory` table exists in the DbContext but there is **no code anywhere** that populates it. No controller writes to it, no trigger creates it. The Products analytics likely depend on it. |
| **Fix** | Add a background job or trigger that aggregates daily sales from OrderItems into ProductSalesHistory. |

---

## 🔵 SECURITY VULNERABILITIES

### S1 — No Authentication/Authorization
| File | All Controllers |
|---|---|
| **Vulnerability** | Missing Auth |
| **Risk Level** | 🔴 HIGH |
| **Description** | No `[Authorize]` attributes on any endpoint. Anyone can DELETE customers, modify orders, change system rules, block users, etc. |
| **Fix** | Add JWT or cookie-based authentication. At minimum, protect write endpoints with `[Authorize]`. |

### S2 — Connection String Hardcoded in appsettings.json
| File | [appsettings.json](file:///e:/My%202nd%20Sem%20Project/NeuroEcom.BI/NeuroEcom.BI/backend/appsettings.json) |
|---|---|
| **Vulnerability** | Credential Exposure |
| **Risk Level** | 🟡 MEDIUM |
| **Description** | SQL Server connection string with server name is committed to Git. Uses Windows Auth (`Trusted_Connection`), so no password is exposed, but the server name is. |
| **Fix** | Use environment variables or user secrets for connection strings. |

### S3 — CORS Allows All Localhost Origins
| File | [Program.cs](file:///e:/My%202nd%20Sem%20Project/NeuroEcom.BI/NeuroEcom.BI/backend/Program.cs#L27-L33) |
|---|---|
| **Vulnerability** | Overly Permissive CORS |
| **Risk Level** | 🟡 MEDIUM (dev) / 🔴 HIGH (prod) |
| **Description** | Any request from `localhost` on any port is allowed. Fine for development, dangerous in production. |
| **Fix** | Restrict to specific origins in production via `Cors:AllowedOrigins` config. |

### S4 — E-Commerce API: Hardcoded Backend URL
| File | [api.ts](file:///e:/My%202nd%20Sem%20Project/NeuroEcom.BI/NeuroEcom.BI/nanoo%27selectric/src/api.ts#L5) |
|---|---|
| **Vulnerability** | Hardcoded URL |
| **Risk Level** | 🟡 MEDIUM |
| **Description** | `baseURL: 'http://localhost:5000/api'` is hardcoded. Will break when deployed, and reveals the API location. |
| **Fix** | Use environment variable: `import.meta.env.VITE_API_URL || 'http://localhost:5000/api'` |

### S5 — Swagger Exposed in Production
| File | [Program.cs](file:///e:/My%202nd%20Sem%20Project/NeuroEcom.BI/NeuroEcom.BI/backend/Program.cs#L47-L48) |
|---|---|
| **Vulnerability** | API Documentation Exposure |
| **Risk Level** | 🟡 MEDIUM |
| **Description** | Swagger UI is always enabled, even outside development. |
| **Fix** | Wrap in `if (app.Environment.IsDevelopment())` |

---

## ⚪ WARNINGS & BEST PRACTICE VIOLATIONS

| # | File | Issue | Recommendation |
|---|---|---|---|
| W1 | AllControllers.cs | All controllers, DTOs, and action models in a single 950-line file | Split into separate files per controller |
| W2 | AllControllers.cs:889 | Dashboard loads ALL customers, products, orders into memory | Use `CountAsync()`, `SumAsync()` with filtered queries |
| W3 | AllControllers.cs:174 | `GetAll` for Orders always includes `Customer` and `Items` (N+1 risk) | Use projection or `AsNoTracking()` |
| W4 | Models.cs:22-23 | `DateTime.UtcNow` as default value is set at **entity instantiation** time, not at DB level | Only rely on DB defaults or set in controller |
| W5 | api.js | Dual API pattern: `fetchCustomers()` functions AND `customerApi` objects both exist | Consolidate to one pattern |
| W6 | schema.sql | No indexes on foreign keys (`CustomerId`, `OrderId`, `ProductId`) | Add non-clustered indexes for query performance |
| W7 | DataContext.jsx:15 | Health check polls `/api/health` every 10 seconds | This creates unnecessary load; use 30s or exponential backoff |
| W8 | Models.cs:25-27 | `[NotMapped]` computed properties (`Margin`, `HealthStatus`, `HealthScore`) trigger computation on every serialization | Consider caching or database-computed columns |
| W9 | csproj:13 | `Microsoft.AspNetCore.Cors` v2.2.0 package is ancient and unnecessary in .NET 8 (CORS is built-in) | Remove this package reference |
| W10 | schema.sql:174-224 | Second seed batch inserts products with 4-column format (missing `Description`) for some rows | Ensure consistent INSERT format |

---

## ✅ INTEGRATION HEALTH SUMMARY

| Check | Status | Notes |
|---|---|---|
| C# Backend compiles without errors | ✅ YES | Builds with 4 nullable warnings |
| SQL Schema matches C# models/entities | ❌ **NO** | 10 missing tables, 18+ missing columns across existing tables |
| E-Commerce Website → SQL Database: Data flowing correctly | ⚠️ **PARTIAL** | Orders POST works but with wrong CustomerId=1 and wrong ProductIds |
| SQL Database → C# Backend: Queries returning correct data | ❌ **NO** | Will crash on any query touching missing columns/tables |
| C# Backend → BI Dashboard: All API endpoints connected | ✅ YES | All routes match between frontend api.js and backend controllers |
| BI Dashboard displaying real, live data (not mock/hardcoded) | ⚠️ **PARTIAL** | Real API calls exist but mock data is also exported and may be used as fallback |
| Authentication/Authorization working across all layers | ❌ **NO** | Zero authentication implemented |
| Real-time/refresh pipeline functioning | ⚠️ **PARTIAL** | Health polling works (10s interval), but no real-time data push (no SignalR/WebSocket) |

---

## 📋 PRIORITIZED FIX PLAN

| Priority | Action | Effort | Impact |
|---|---|---|---|
| **1** | **Add missing SQL tables** (OrderItems, OrderTimelines, Returns, CustomerFlags, CustomerNotes, RTOs, Decisions, RTOAssessments, CustomerDiscounts, ProductSalesHistory) | 🟡 Medium | Unblocks 70% of the application |
| **2** | **Add missing columns** to Customers table (18 columns) and Orders table (6 columns) and SystemRules (1 column) | 🟢 Low | Fixes all customer and order runtime crashes |
| **3** | **Remove duplicate SQL seed data** (lines 172-555) that violate UNIQUE constraints | 🟢 Low | Allows clean database setup |
| **4** | **Fix `GetHealthStatus()` dead code** in Models.cs | 🟢 Low | Fixes product health display |
| **5** | **Fix nullable arithmetic** in CustomerAnalytics (`TotalSpent` cast) and DashboardController (`Spend`/`Revenue` sums) | 🟢 Low | Prevents runtime exceptions |
| **6** | **Fix e-commerce Checkout** — send actual customer form data instead of `CustomerId: 1`, and implement proper product ID mapping | 🟡 Medium | Enables real e-commerce → BI data pipeline |
| **7** | **Fix `IsBlocked` override bug** in CustomerUpdate (add `??` null coalescing) | 🟢 Low | Prevents accidental unblocking |
| **8** | **Standardize currency** across all frontend components (Rs vs $) | 🟢 Low | Consistency |
| **9** | **Add basic authentication** to write endpoints | 🟠 High | Security |
| **10** | **Wrap Swagger** in dev-only check | 🟢 Low | Security |
| **11** | **Optimize Dashboard query** — avoid loading full tables into memory | 🟡 Medium | Performance |
| **12** | **Clean up dual API pattern** in frontend api.js | 🟢 Low | Maintainability |

---

> [!IMPORTANT]
> **The #1 blocker** preventing the system from working end-to-end is the **SQL schema gap**. Your C# models define 16 tables but the schema.sql only creates 6. You must run the ALTER TABLE and CREATE TABLE statements to make the database match the code before anything beyond the Dashboard and basic Products list will work.
