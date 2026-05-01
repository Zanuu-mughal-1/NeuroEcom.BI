# NeuroEcom.BI — Intelligent Commerce Intelligence Platform

> A full-stack Business Intelligence dashboard for eCommerce operations.
> Built with **ASP.NET Core 8** + **SQL Server** backend and **React 18 + Vite + TailwindCSS** frontend.

---

## 📁 Project Structure

```
NeuroEcom.BI/
├── backend/                    # ASP.NET Core 8 Web API
│   ├── Controllers/
│   │   ├── ProductsController.cs
│   │   └── AllControllers.cs   # Customers, Orders, Returns, Ads, Decisions, RTO, Dashboard
│   ├── Models/
│   │   └── Models.cs           # All entity models
│   ├── Data/
│   │   ├── AppDbContext.cs      # EF Core DbContext
│   │   └── schema.sql          # SQL Server schema + seed data
│   ├── Program.cs
│   ├── appsettings.json
│   └── NeuroEcom.BI.csproj
│
└── frontend/                   # React 18 + Vite + TailwindCSS
    ├── src/
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── Sidebar.jsx
    │   │   │   └── Header.jsx
    │   │   ├── ui/
    │   │   │   ├── KpiCard.jsx
    │   │   │   └── StatusBadge.jsx
    │   │   └── charts/
    │   │       └── MiniChart.jsx
    │   ├── pages/
    │   │   ├── dashboard/Dashboard.jsx
    │   │   ├── products/Products.jsx + ProductDetail.jsx
    │   │   ├── customers/Customers.jsx + CustomerDetail.jsx
    │   │   ├── orders/Orders.jsx
    │   │   ├── returns/Returns.jsx       (+ RTO Shield + Rules)
    │   │   ├── ads/Ads.jsx
    │   │   ├── decisions/Decisions.jsx
    │   │   └── predictions/Predictions.jsx
    │   ├── utils/api.js            # Axios client + mock data
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

---

## 🚀 Setup Instructions

### Prerequisites
- .NET 8 SDK
- SQL Server (LocalDB or full instance)
- Node.js 18+

---

### Backend Setup

```bash
cd backend

# 1. Update connection string in appsettings.json:
# "Server=localhost;Database=NeuroEcomBI;Trusted_Connection=True;TrustServerCertificate=True;"

# 2. Run the SQL schema to create DB + tables + seed data:
# Open SQL Server Management Studio → Run Data/schema.sql

# 3. (OR) Use EF migrations:
dotnet tool install --global dotnet-ef
dotnet ef migrations add InitialCreate
dotnet ef database update

# 4. Run the API:
dotnet run
# → Runs on http://localhost:5000
# → Swagger UI at http://localhost:5000/swagger
```

---

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
# → Runs on http://localhost:5173

# Build for production
npm run build
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Main dashboard aggregated data |
| GET/POST | `/api/products` | Product list & create |
| GET/PUT | `/api/products/{id}` | Product detail & update |
| POST | `/api/products/{id}/action` | Product actions (StopSelling, IncreaseInventory, etc.) |
| GET | `/api/products/analytics` | Products analytics |
| GET/POST | `/api/customers` | Customer list & create |
| GET | `/api/customers/{id}` | Customer detail |
| POST | `/api/customers/{id}/action` | Customer actions (Flag, Block, GiveDiscount, etc.) |
| GET | `/api/customers/analytics` | Customers analytics |
| GET/POST | `/api/orders` | Orders list & create |
| GET | `/api/orders/{id}` | Order detail |
| POST | `/api/orders/{id}/action` | Order actions (Confirm, Ship, Deliver, Cancel) |
| GET | `/api/orders/analytics` | Orders analytics |
| GET | `/api/returns` | Returns list |
| POST | `/api/returns/{id}/action` | Return actions (Approve, Reject, Refund) |
| GET | `/api/returns/analytics` | Returns analytics |
| GET/POST | `/api/ads` | Campaigns list & create |
| POST | `/api/ads/{id}/action` | Campaign actions |
| GET | `/api/ads/analytics` | Ads analytics |
| GET | `/api/decisions` | Decisions log |
| GET | `/api/decisions/rules` | All system rules |
| PUT | `/api/decisions/rules/{id}` | Edit a rule |
| POST | `/api/rto/test` | Run RTO risk assessment |
| GET | `/api/rto/logs` | RTO assessment logs |
| GET | `/api/rto/stats` | RTO statistics |

---

## 🎨 Features

### 🏠 Main Dashboard
- Revenue, Orders, Customers, Return Rate, ROI KPIs
- 30-day sales trend chart
- Product health distribution
- Customer loyalty tiers
- RTO Shield today summary
- Recent decisions log
- Active alerts panel
- Quick actions

### 📦 Products (3 sub-pages)
- Full product table with health scoring
- Health indicators: 🟢 Healthy / 🟡 Warning / 🔴 Critical
- Product detail with financial, inventory, performance metrics
- 11 product actions (Stop Selling, Inventory, Price, Discount, etc.)
- Sales trend charts per product

### 👥 Customers (4 sub-pages)
- Customer table with loyalty tiers & flags
- Customer detail with purchase history
- 7 customer actions (Flag, Block, Discount, Tier Change, etc.)
- Analytics dashboard

### 📦 Orders
- Order list with RTO risk indicators
- Order detail with timeline
- Inline order actions

### ↩️ Returns & RTO Shield
- Returns management with approve/reject
- **RTO Shield test interface** — enter order params, get instant risk score
- **RTO Rules editor** — edit all scoring rules in-app
- Risk score gauge visualization

### 📢 Ads Manager
- Campaign list with ROI/ROAS metrics
- Revenue vs. Spend charts
- Platform comparison
- Campaign pause/resume actions

### ⚙️ Decision Engine
- Full decisions log with section filtering
- **Editable rules** for all 30+ system rules
- Decision analytics (success rates, trigger frequency)
- Before/after impact analysis

### 🤖 AI Predictions
- **Product What-If:** Price & discount simulations with revenue predictions
- **Ads What-If:** Budget change simulations with ROI forecasting
- AI-generated 30-day forecasts
- Platform allocation recommendations
- Confidence scores

---

## 🎨 Design System

| Token | Color | Usage |
|-------|-------|-------|
| `neo` | `#6366f1` | Primary / Indigo |
| `pulse` | `#06b6d4` | Cyan / Live data |
| `bloom` | `#10b981` | Success / Growth |
| `ember` | `#f59e0b` | Warning / Caution |
| `danger` | `#ef4444` | Error / Critical |
| `royal` | `#8b5cf6` | Returns / Special |

**Typography:** Bebas Neue (headings), DM Sans (body), JetBrains Mono (code/numbers)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend API | ASP.NET Core 8 Web API |
| Database | SQL Server + Entity Framework Core 8 |
| API Docs | Swagger / OpenAPI |
| Frontend | React 18 + Vite |
| Styling | TailwindCSS 3 |
| Charts | Recharts |
| Routing | React Router v6 |
| HTTP | Axios |
| Icons | Lucide React |
| Animation | Framer Motion |

---

## 📄 License

MIT — Built for NeuroEcom.BI
