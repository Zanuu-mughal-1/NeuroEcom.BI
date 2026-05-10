using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NeuroEcom.BI.Data;
using NeuroEcom.BI.Models;

namespace NeuroEcom.BI.Controllers;

// ===================== CUSTOMERS =====================
[ApiController]
[Route("api/[controller]")]
public class CustomersController : ControllerBase
{
    private readonly AppDbContext _db;
    public CustomersController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? search, [FromQuery] string? tier)
    {
        var query = _db.Customers.Include(c => c.Flags).AsQueryable();
        if (!string.IsNullOrEmpty(search))
            query = query.Where(c => c.FirstName.Contains(search) || c.LastName.Contains(search) || c.Email.Contains(search));
        if (!string.IsNullOrEmpty(tier))
            query = query.Where(c => c.LoyaltyTier == tier);
        var customers = await query.ToListAsync();
        return Ok(customers.Select(c => new {
            c.Id, c.FirstName, c.LastName, c.Email, c.Phone, c.City,
            c.LoyaltyTier, c.LoyaltyPoints, c.TotalSpent, c.TotalOrders,
            c.IsBlocked, c.JoinedDate, c.LastOrderDate,
            Flags = c.Flags.Where(f => f.IsActive).Select(f => new { f.FlagType, f.Reason })
        }));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var customer = await _db.Customers
            .Include(c => c.Flags)
            .Include(c => c.Orders).ThenInclude(o => o.Items).ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(c => c.Id == id);
        if (customer == null) return NotFound();
        var returns = await _db.Returns.Where(r => r.CustomerId == id).ToListAsync();
        return Ok(new {
            customer.Id, customer.FirstName, customer.LastName, customer.Email, customer.Phone,
            customer.City, customer.Pincode, customer.ShippingAddress, customer.BillingAddress,
            customer.LoyaltyTier, customer.LoyaltyPoints, customer.TotalSpent, customer.TotalOrders,
            customer.IsBlocked, customer.BlockReason, customer.JoinedDate, customer.LastOrderDate,
            Flags = customer.Flags.Where(f => f.IsActive),
            RecentOrders = customer.Orders.OrderByDescending(o => o.OrderDate).Take(10),
            TotalReturns = returns.Count,
            ReturnRate = (customer.TotalOrders ?? 0) > 0 ? Math.Round((double)returns.Count / (double)customer.TotalOrders.Value * 100, 1) : 0
        });
    }

    [HttpPost("{id}/action")]
    public async Task<IActionResult> TakeAction(int id, [FromBody] CustomerActionDto action)
    {
        var customer = await _db.Customers.FindAsync(id);
        if (customer == null) return NotFound();
        string details = "";
        switch (action.Action)
        {
            case "Flag":
                _db.CustomerFlags.Add(new CustomerFlag { CustomerId = id, FlagType = action.FlagType ?? "", Reason = action.Reason });
                details = $"Customer flagged: {action.FlagType}"; break;
            case "RemoveFlag":
                var flags = await _db.CustomerFlags.Where(f => f.CustomerId == id && f.IsActive).ToListAsync();
                flags.ForEach(f => f.IsActive = false);
                details = "All flags removed"; break;
            case "ChangeTier":
                customer.LoyaltyTier = action.Tier ?? customer.LoyaltyTier;
                details = $"Tier changed to {action.Tier}"; break;
            case "Block":
                customer.IsBlocked = true; customer.BlockReason = action.Reason;
                details = $"Customer blocked: {action.Reason}"; break;
            case "Unblock":
                customer.IsBlocked = false; customer.BlockReason = null;
                details = "Customer unblocked"; break;
            case "GiveDiscount":
                _db.CustomerDiscounts.Add(new CustomerDiscount {
                    CustomerId = id, DiscountType = action.DiscountType, DiscountValue = action.DiscountValue ?? 0,
                    ExpiryDate = action.ExpiryDate, Reason = action.Reason,
                    VoucherCode = $"VC-{Guid.NewGuid().ToString()[..8].ToUpper()}"
                });
                details = $"Discount given: {action.DiscountValue} {action.DiscountType}"; break;
        }
        _db.Decisions.Add(new Decision { Section = "Customers", ItemId = id,
            ItemName = $"{customer.FirstName} {customer.LastName}", DecisionType = action.Action,
            DecisionDetails = details, AppliedBy = "Admin" });
        await _db.SaveChangesAsync();
        return Ok(new { message = details });
    }

    [HttpGet("analytics")]
    public async Task<IActionResult> GetAnalytics()
    {
        var customers = await _db.Customers.ToListAsync();
        var now = DateTime.UtcNow;
        var tierDist = customers.GroupBy(c => c.LoyaltyTier)
            .Select(g => new { Tier = g.Key, Count = g.Count() }).ToList();
        return Ok(new {
            Total = customers.Count,
            Active30d = customers.Count(c => c.LastOrderDate >= now.AddDays(-30)),
            New30d = customers.Count(c => c.JoinedDate >= now.AddDays(-30)),
            Churned = customers.Count(c => c.LastOrderDate < now.AddDays(-90)),
            TotalLTV = customers.Sum(c => c.TotalSpent),
            AvgLTV = customers.Count > 0 ? Math.Round(customers.Average(c => (double)c.TotalSpent), 2) : 0,
            TierDistribution = tierDist
        });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Customer customer)
    {
        customer.CreatedAt = DateTime.UtcNow;
        customer.JoinedDate = DateTime.UtcNow;
        _db.Customers.Add(customer);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = customer.Id }, customer);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Customer update)
    {
        var customer = await _db.Customers.FindAsync(id);
        if (customer == null) return NotFound();
        customer.FirstName = update.FirstName; customer.LastName = update.LastName;
        customer.Email = update.Email; customer.Phone = update.Phone;
        customer.City = update.City; customer.LoyaltyTier = update.LoyaltyTier;
        await _db.SaveChangesAsync();
        return Ok(customer);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var customer = await _db.Customers.FindAsync(id);
        if (customer == null) return NotFound();
        _db.Customers.Remove(customer);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

public class CustomerActionDto
{
    public string Action { get; set; } = "";
    public string? FlagType { get; set; }
    public string? Reason { get; set; }
    public string? Tier { get; set; }
    public string? DiscountType { get; set; }
    public decimal? DiscountValue { get; set; }
    public DateTime? ExpiryDate { get; set; }
}

// ===================== ORDERS =====================
[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _db;
    public OrdersController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? search, [FromQuery] string? status, [FromQuery] string? payment, [FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var query = _db.Orders.Include(o => o.Customer).Include(o => o.Items).AsQueryable();
        if (!string.IsNullOrEmpty(search))
            query = query.Where(o => o.OrderNumber.Contains(search) || (o.Customer != null && (o.Customer.FirstName.Contains(search) || o.Customer.LastName.Contains(search))));
        if (!string.IsNullOrEmpty(status)) query = query.Where(o => o.FulfillmentStatus == status);
        if (!string.IsNullOrEmpty(payment)) query = query.Where(o => o.PaymentMethod == payment);
        if (from.HasValue) query = query.Where(o => o.OrderDate >= from.Value);
        if (to.HasValue) query = query.Where(o => o.OrderDate <= to.Value);
        var orders = await query.OrderByDescending(o => o.OrderDate).Take(200).ToListAsync();
        return Ok(orders.Select(o => new {
            o.Id, o.OrderNumber, o.OrderDate, o.TotalAmount, o.PaymentMethod,
            o.PaymentStatus, o.FulfillmentStatus, o.RTORiskScore, o.RTODecision,
            Customer = o.Customer == null ? null : new { o.Customer.FirstName, o.Customer.LastName, o.Customer.Email },
            ItemCount = o.Items.Count
        }));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var order = await _db.Orders
            .Include(o => o.Customer)
            .Include(o => o.Items).ThenInclude(i => i.Product)
            .Include(o => o.Timeline)
            .FirstOrDefaultAsync(o => o.Id == id);
        if (order == null) return NotFound();
        var rto = await _db.RTOAssessments.Where(r => r.OrderId == id).FirstOrDefaultAsync();
        return Ok(new { order, RTOAssessment = rto });
    }

    [HttpPost("{id}/action")]
    public async Task<IActionResult> TakeAction(int id, [FromBody] OrderActionDto action)
    {
        var order = await _db.Orders.FindAsync(id);
        if (order == null) return NotFound();
        switch (action.Action)
        {
            case "Confirm": order.PaymentStatus = "Confirmed"; break;
            case "Ship": order.FulfillmentStatus = "Shipped"; order.TrackingNumber = action.TrackingNumber; break;
            case "Deliver": order.FulfillmentStatus = "Delivered"; break;
            case "Cancel": order.FulfillmentStatus = "Cancelled"; order.PaymentStatus = "Refunded"; break;
        }
        order.UpdatedAt = DateTime.UtcNow;
        _db.OrderTimelines.Add(new OrderTimeline { OrderId = id, Status = action.Action, Description = action.Notes });
        await _db.SaveChangesAsync();
        return Ok(new { message = $"Order {action.Action} applied" });
    }

    [HttpGet("analytics")]
    public async Task<IActionResult> GetAnalytics()
    {
        var now = DateTime.UtcNow;
        var orders30d = await _db.Orders.Where(o => o.OrderDate >= now.AddDays(-30)).ToListAsync();
        var returns30d = await _db.Returns.Where(r => r.RequestDate >= now.AddDays(-30)).CountAsync();
        var byStatus = orders30d.GroupBy(o => o.FulfillmentStatus)
            .Select(g => new { Status = g.Key, Count = g.Count() }).ToList();
        var byPayment = orders30d.GroupBy(o => o.PaymentMethod)
            .Select(g => new { Method = g.Key, Count = g.Count() }).ToList();
        return Ok(new {
            TotalOrders = orders30d.Count,
            TotalRevenue = orders30d.Sum(o => o.TotalAmount),
            AvgOrderValue = orders30d.Count > 0 ? Math.Round(orders30d.Average(o => (double)o.TotalAmount), 2) : 0,
            FulfillmentRate = orders30d.Count > 0 ? Math.Round((double)orders30d.Count(o => o.FulfillmentStatus == "Delivered") / orders30d.Count * 100, 1) : 0,
            ReturnRate = orders30d.Count > 0 ? Math.Round((double)returns30d / orders30d.Count * 100, 1) : 0,
            ByStatus = byStatus, ByPayment = byPayment
        });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Order order)
    {
        order.OrderNumber = $"ORD-{DateTime.UtcNow.Ticks.ToString()[^8..]}";
        order.OrderDate = DateTime.UtcNow;
        order.CreatedAt = DateTime.UtcNow;
        order.UpdatedAt = DateTime.UtcNow;
        _db.Orders.Add(order);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = order.Id }, order);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Order update)
    {
        var order = await _db.Orders.FindAsync(id);
        if (order == null) return NotFound();
        order.FulfillmentStatus = update.FulfillmentStatus;
        order.PaymentStatus = update.PaymentStatus;
        order.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(order);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var order = await _db.Orders.FindAsync(id);
        if (order == null) return NotFound();
        _db.Orders.Remove(order);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

public class OrderActionDto
{
    public string Action { get; set; } = "";
    public string? TrackingNumber { get; set; }
    public string? Notes { get; set; }
    public decimal? RefundAmount { get; set; }
}

// ===================== RETURNS =====================
[ApiController]
[Route("api/[controller]")]
public class ReturnsController : ControllerBase
{
    private readonly AppDbContext _db;
    public ReturnsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? status)
    {
        var query = _db.Returns.Include(r => r.Customer).Include(r => r.Product).Include(r => r.Order).AsQueryable();
        if (!string.IsNullOrEmpty(status)) query = query.Where(r => r.Status == status);
        var returns = await query.OrderByDescending(r => r.RequestDate).ToListAsync();
        return Ok(returns.Select(r => new {
            r.Id, r.ReturnNumber, r.Status, r.ReturnReason, r.Quantity, r.RefundAmount, r.RequestDate,
            Customer = r.Customer == null ? null : new { r.Customer.FirstName, r.Customer.LastName },
            Product = r.Product == null ? null : new { r.Product.Name, r.Product.SKU },
            OrderNumber = r.Order?.OrderNumber
        }));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var ret = await _db.Returns.Include(r => r.Customer).Include(r => r.Product).Include(r => r.Order).FirstOrDefaultAsync(r => r.Id == id);
        if (ret == null) return NotFound();
        return Ok(ret);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Return ret)
    {
        try 
        {
            ret.ReturnNumber = $"RET-{DateTime.UtcNow.Ticks.ToString()[^8..]}";
            ret.RequestDate = DateTime.UtcNow;
            ret.CreatedAt = DateTime.UtcNow;
            ret.UpdatedAt = DateTime.UtcNow;
            _db.Returns.Add(ret);
            
            // Auto-action for defective items
            if (ret.ReturnReason == "Defective")
            {
                _db.Decisions.Add(new Decision { Section = "Returns", ItemId = ret.ProductId, ItemName = $"Product ID: {ret.ProductId}", DecisionType = "Alert", DecisionDetails = "Product quality alert triggered due to defective return." });
            }

            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = ret.Id }, ret);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Database error while creating return", details = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Return ret)
    {
        if (id != ret.Id) return BadRequest();
        ret.UpdatedAt = DateTime.UtcNow;
        _db.Entry(ret).State = EntityState.Modified;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var ret = await _db.Returns.FindAsync(id);
        if (ret == null) return NotFound();
        _db.Returns.Remove(ret);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id}/action")]
    public async Task<IActionResult> TakeAction(int id, [FromBody] ReturnActionDto action)
    {
        var ret = await _db.Returns.FindAsync(id);
        if (ret == null) return NotFound();
        switch (action.Action)
        {
            case "Approve": ret.Status = "Approved"; break;
            case "Reject": ret.Status = "Rejected"; ret.Notes = action.Reason; break;
            case "Refund": ret.Status = "Refunded"; ret.RefundAmount = action.RefundAmount; ret.ProcessedDate = DateTime.UtcNow; break;
            case "ReturnToStock":
                var product = await _db.Products.FindAsync(ret.ProductId);
                if (product != null) product.Stock += ret.Quantity; break;
        }
        await _db.SaveChangesAsync();
        return Ok(new { message = $"Return {action.Action} applied" });
    }

    [HttpGet("analytics")]
    public async Task<IActionResult> GetAnalytics()
    {
        var now = DateTime.UtcNow;
        var returns30d = await _db.Returns.Where(r => r.RequestDate >= now.AddDays(-30)).ToListAsync();
        var totalOrders30d = await _db.Orders.Where(o => o.OrderDate >= now.AddDays(-30)).CountAsync();
        var byReason = returns30d.GroupBy(r => r.ReturnReason)
            .Select(g => new { Reason = g.Key, Count = g.Count() }).ToList();
        return Ok(new {
            TotalReturns = returns30d.Count,
            ReturnRate = totalOrders30d > 0 ? Math.Round((double)returns30d.Count / totalOrders30d * 100, 1) : 0,
            TotalRefundAmount = returns30d.Where(r => r.RefundAmount.HasValue).Sum(r => r.RefundAmount!.Value),
            ByReason = byReason
        });
    }
}

public class ReturnActionDto
{
    public string Action { get; set; } = "";
    public string? Reason { get; set; }
    public decimal? RefundAmount { get; set; }
}

// ===================== ADS =====================
[ApiController]
[Route("api/[controller]")]
public class AdsController : ControllerBase
{
    private readonly AppDbContext _db;
    public AdsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? status, [FromQuery] string? platform)
    {
        var query = _db.AdCampaigns.Include(c => c.Product).Include(c => c.Performance).AsQueryable();
        if (!string.IsNullOrEmpty(status)) query = query.Where(c => c.Status == status);
        if (!string.IsNullOrEmpty(platform)) query = query.Where(c => c.Platform == platform);
        var campaigns = await query.ToListAsync();
        return Ok(campaigns.Select(c => new {
            c.Id, c.Name, c.Platform, c.Budget, c.Status, c.StartDate, c.EndDate,
            Product = c.Product == null ? null : new { c.Product.Name },
            TotalSpend = c.Performance.Sum(p => p.Spend ?? 0),
            TotalRevenue = c.Performance.Sum(p => p.Revenue ?? 0),
            ROI = c.Performance.Sum(p => p.Spend ?? 0) > 0
                ? Math.Round((double)(c.Performance.Sum(p => p.Revenue ?? 0) - c.Performance.Sum(p => p.Spend ?? 0)) / (double)c.Performance.Sum(p => p.Spend ?? 0) * 100, 1) : 0,
            Clicks = c.Performance.Sum(p => p.Clicks ?? 0),
            Impressions = c.Performance.Sum(p => p.Impressions ?? 0)
        }));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var campaign = await _db.AdCampaigns.Include(c => c.Product).Include(c => c.Performance)
            .FirstOrDefaultAsync(c => c.Id == id);
        if (campaign == null) return NotFound();
        return Ok(campaign);
    }

    [HttpPost("{id}/action")]
    public async Task<IActionResult> TakeAction(int id, [FromBody] AdActionDto action)
    {
        var campaign = await _db.AdCampaigns.FindAsync(id);
        if (campaign == null) return NotFound();
        switch (action.Action)
        {
            case "Start": campaign.Status = "Active"; break;
            case "Pause": campaign.Status = "Paused"; break;
            case "UpdateBudget": campaign.Budget = action.Budget ?? campaign.Budget; break;
            case "Delete": _db.AdCampaigns.Remove(campaign); break;
        }
        await _db.SaveChangesAsync();
        return Ok(new { message = $"Campaign {action.Action}" });
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetPerformanceHistory([FromQuery] int days = 30)
    {
        var startDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-days));
        var performance = await _db.AdPerformance
            .Where(p => p.PerformanceDate >= startDate)
            .GroupBy(p => p.PerformanceDate)
            .OrderBy(g => g.Key)
            .Select(g => new {
                date = g.Key.ToString("MMM dd"),
                spend = g.Sum(p => p.Spend ?? 0),
                revenue = g.Sum(p => p.Revenue ?? 0),
                clicks = g.Sum(p => p.Clicks ?? 0)
            })
            .ToListAsync();
        return Ok(performance);
    }

    [HttpGet("analytics")]
    public async Task<IActionResult> GetAnalytics()
    {
        var campaigns = await _db.AdCampaigns.Include(c => c.Performance).ToListAsync();
        var totalSpend = campaigns.SelectMany(c => c.Performance).Sum(p => p.Spend ?? 0);
        var totalRevenue = campaigns.SelectMany(c => c.Performance).Sum(p => p.Revenue ?? 0);
        var roi = totalSpend > 0 ? Math.Round((double)(totalRevenue - totalSpend) / (double)totalSpend * 100, 1) : 0;
        var roas = totalSpend > 0 ? Math.Round((double)totalRevenue / (double)totalSpend, 2) : 0;
        var byPlatform = campaigns.GroupBy(c => c.Platform).Select(g => new {
            Platform = g.Key,
            Spend = g.SelectMany(c => c.Performance).Sum(p => p.Spend ?? 0),
            Revenue = g.SelectMany(c => c.Performance).Sum(p => p.Revenue ?? 0)
        }).ToList();
        return Ok(new {
            ActiveCampaigns = campaigns.Count(c => c.Status == "Active"),
            TotalSpend = totalSpend, TotalRevenue = totalRevenue,
            ROI = roi, ROAS = roas, ByPlatform = byPlatform
        });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CampaignRequestDto req)
    {
        var campaign = new AdCampaign
        {
            Name = req.Name,
            Platform = req.Platform,
            ProductId = req.ProductId,
            Budget = req.Budget,
            Status = req.Status,
            CreatedAt = DateTime.UtcNow,
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow)
        };
        _db.AdCampaigns.Add(campaign);
        await _db.SaveChangesAsync();

        // Seed initial performance if provided
        if (req.InitialSpend > 0 || req.InitialRevenue > 0 || req.InitialClicks > 0)
        {
            _db.AdPerformance.Add(new AdPerformance
            {
                CampaignId = campaign.Id,
                PerformanceDate = DateOnly.FromDateTime(DateTime.UtcNow),
                Spend = req.InitialSpend ?? 0,
                Revenue = req.InitialRevenue ?? 0,
                Clicks = req.InitialClicks ?? 0,
                Impressions = (int)((req.InitialClicks ?? 0) * 10) // Mock impressions
            });
            await _db.SaveChangesAsync();
        }

        return CreatedAtAction(nameof(GetById), new { id = campaign.Id }, campaign);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] CampaignRequestDto req)
    {
        var campaign = await _db.AdCampaigns.FindAsync(id);
        if (campaign == null) return NotFound();
        campaign.Name = req.Name;
        campaign.Budget = req.Budget;
        campaign.Platform = req.Platform;
        campaign.Status = req.Status;
        campaign.ProductId = req.ProductId;
        await _db.SaveChangesAsync();
        return Ok(campaign);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var campaign = await _db.AdCampaigns.FindAsync(id);
        if (campaign == null) return NotFound();
        _db.AdCampaigns.Remove(campaign);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

public class AdActionDto
{
    public string Action { get; set; } = "";
    public decimal? Budget { get; set; }
}

public class CampaignRequestDto
{
    public string Name { get; set; } = "";
    public string Platform { get; set; } = "";
    public int? ProductId { get; set; }
    public decimal Budget { get; set; }
    public string Status { get; set; } = "Draft";
    public decimal? InitialSpend { get; set; }
    public decimal? InitialRevenue { get; set; }
    public int? InitialClicks { get; set; }
}

// ===================== DECISIONS & RULES =====================
[ApiController]
[Route("api/[controller]")]
public class DecisionsController : ControllerBase
{
    private readonly AppDbContext _db;
    public DecisionsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? section)
    {
        var query = _db.Decisions.AsQueryable();
        if (!string.IsNullOrEmpty(section)) query = query.Where(d => d.Section == section);
        return Ok(await query.OrderByDescending(d => d.CreatedAt).Take(100).ToListAsync());
    }

    [HttpGet("rules")]
    public async Task<IActionResult> GetRules([FromQuery] string? category)
    {
        var query = _db.SystemRules.AsQueryable();
        if (!string.IsNullOrEmpty(category)) query = query.Where(r => r.Category == category);
        return Ok(await query.OrderBy(r => r.Category).ToListAsync());
    }

    [HttpPut("rules/{id}")]
    public async Task<IActionResult> UpdateRule(int id, [FromBody] RuleUpdateDto update)
    {
        var rule = await _db.SystemRules.FindAsync(id);
        if (rule == null) return NotFound();
        rule.CurrentValue = update.NewValue;
        rule.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(rule);
    }

    [HttpPost("rules/{id}/reset")]
    public async Task<IActionResult> ResetRule(int id)
    {
        var rule = await _db.SystemRules.FindAsync(id);
        if (rule == null) return NotFound();
        rule.CurrentValue = rule.DefaultValue;
        rule.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(rule);
    }
}

public class RuleUpdateDto { public string NewValue { get; set; } = ""; }

// ===================== RTO SHIELD =====================
[ApiController]
[Route("api/[controller]")]
public class RTOController : ControllerBase
{
    private readonly AppDbContext _db;
    public RTOController(AppDbContext db) => _db = db;

    [HttpPost("test")]
    public async Task<IActionResult> TestOrder([FromBody] RTOTestDto input)
    {
        int score = 0;
        var triggeredRules = new List<string>();
        var rules = await _db.SystemRules.Where(r => r.Category == "RTO").ToListAsync();

        decimal GetRule(string name) => decimal.TryParse(rules.FirstOrDefault(r => r.RuleName == name)?.CurrentValue, out var v) ? v : 0;

        if (input.PaymentMethod == "COD")
        { score += (int)GetRule("COD Penalty"); triggeredRules.Add($"COD payment (+{GetRule("COD Penalty")} pts)"); }

        if (input.OrderValue > 500)
        { score += (int)GetRule("High Value Penalty"); triggeredRules.Add($"High value order >Rs500 (+{GetRule("High Value Penalty")} pts)"); }

        if (input.CustomerId.HasValue)
        {
            var customer = await _db.Customers.FindAsync(input.CustomerId.Value);
            if (customer != null)
            {
                var totalReturns = await _db.Returns.CountAsync(r => r.CustomerId == input.CustomerId.Value);
                var returnRate = customer.TotalOrders > 0 ? (double)totalReturns / customer.TotalOrders * 100 : 0;
                if (returnRate > 50)
                { score += (int)GetRule("Customer Return Penalty"); triggeredRules.Add($"High customer return rate ({returnRate:F0}%) (+{GetRule("Customer Return Penalty")} pts)"); }
                if (customer.TotalOrders == 0 && input.OrderValue > 500)
                { score += (int)GetRule("New Customer High Value"); triggeredRules.Add($"New customer high value order (+{GetRule("New Customer High Value")} pts)"); }
                if (customer.Email.Contains("temp") || customer.Email.Contains("throwaway"))
                { score += (int)GetRule("Suspicious Email"); triggeredRules.Add($"Suspicious email domain (+{GetRule("Suspicious Email")} pts)"); }
            }
        }

        if (DateTime.Now.DayOfWeek == DayOfWeek.Friday || DateTime.Now.DayOfWeek == DayOfWeek.Saturday)
        { score += (int)GetRule("Weekend Order"); triggeredRules.Add($"Weekend order (+{GetRule("Weekend Order")} pts)"); }

        score = Math.Min(100, score);

        string decision;
        if (score <= 20) decision = "Auto-Approved";
        else if (score <= 50) decision = "Manual Review";
        else if (score <= 80) decision = "Additional Verification";
        else decision = "Auto-Rejected";

        _db.RTOAssessments.Add(new RTOAssessment {
            OrderId = input.OrderId, RiskScore = score, Decision = decision,
            TriggeredRules = string.Join("; ", triggeredRules)
        });
        await _db.SaveChangesAsync();

        return Ok(new { Score = score, Decision = decision, TriggeredRules = triggeredRules, Recommendation = decision });
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? status)
    {
        var query = _db.RTOs.Include(r => r.Customer).Include(r => r.Order).AsQueryable();
        if (!string.IsNullOrEmpty(status)) query = query.Where(r => r.Status == status);
        return Ok(await query.OrderByDescending(r => r.CreatedAt).ToListAsync());
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] RTO rto)
    {
        rto.CreatedAt = DateTime.UtcNow;
        rto.UpdatedAt = DateTime.UtcNow;
        _db.RTOs.Add(rto);
        await _db.SaveChangesAsync();
        
        // Recalculate customer risk
        await RecalculateRisk(rto.CustomerId);
        
        return Ok(rto);
    }

    [HttpPost("recalculate/{customerId}")]
    public async Task<IActionResult> RecalculateRisk(int customerId)
    {
        var customer = await _db.Customers.FindAsync(customerId);
        if (customer == null) return NotFound();

        var returns = await _db.Returns.CountAsync(r => r.CustomerId == customerId);
        var rtos = await _db.RTOs.CountAsync(r => r.CustomerId == customerId);
        var codOrders = await _db.Orders.CountAsync(o => o.CustomerId == customerId && o.PaymentMethod == "COD");

        // Formula: (returns * 2) + (rto * 3) + (cod_orders * 1.5)
        double score = (returns * 2.0) + (rtos * 3.0) + (codOrders * 1.5);
        customer.RTORiskScore = (int)Math.Min(100, score);
        
        if (customer.RTORiskScore > 50)
        {
            customer.IsCODBlocked = true;
            customer.BlockReason = "High RTO/Fraud risk score";
            _db.Decisions.Add(new Decision { 
                Section = "Customers", ItemId = customerId, ItemName = customer.FullName, 
                DecisionType = "BlockCOD", DecisionDetails = $"Auto-blocked COD due to risk score: {customer.RTORiskScore}" 
            });
        }

        customer.TotalReturns = returns;
        customer.TotalRTO = rtos;
        await _db.SaveChangesAsync();
        return Ok(new { Score = customer.RTORiskScore, IsCODBlocked = customer.IsCODBlocked });
    }

    [HttpGet("logs")]
    public async Task<IActionResult> GetLogs()
    {
        var logs = await _db.RTOs.Include(r => r.Order).Include(r => r.Customer).OrderByDescending(r => r.CreatedAt).Take(50).ToListAsync();
        return Ok(logs);
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var assessments = await _db.RTOAssessments.ToListAsync();
        return Ok(new {
            Total = assessments.Count,
            AutoApproved = assessments.Count(a => a.Decision == "Auto-Approved"),
            ManualReview = assessments.Count(a => a.Decision == "Manual Review"),
            AutoRejected = assessments.Count(a => a.Decision == "Auto-Rejected"),
            AvgScore = assessments.Count > 0 ? Math.Round(assessments.Average(a => a.RiskScore), 1) : 0
        });
    }
}

public class RTOTestDto
{
    public int? OrderId { get; set; }
    public int? CustomerId { get; set; }
    public int? ProductId { get; set; }
    public decimal OrderValue { get; set; }
    public string PaymentMethod { get; set; } = "";
    public int Quantity { get; set; } = 1;
}

// ===================== DASHBOARD =====================
[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _db;
    public DashboardController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] int days = 30)
    {
        var now = DateTime.UtcNow;
        var startDate = now.AddDays(-days);
        var ordersPeriod = await _db.Orders.Where(o => o.OrderDate >= startDate).ToListAsync();
        var customers = await _db.Customers.ToListAsync();
        var products = await _db.Products.ToListAsync();
        var returnsListPeriod = await _db.Returns.Where(r => r.RequestDate >= startDate).ToListAsync();
        var returnsCount = returnsListPeriod.Count;
        var campaigns = await _db.AdCampaigns.Include(c => c.Performance).ToListAsync();
        var decisions = await _db.Decisions.OrderByDescending(d => d.CreatedAt).Take(5).ToListAsync();
        var rtoToday = await _db.RTOAssessments.Where(r => r.AssessedAt >= now.Date).ToListAsync();

        var totalSpend = campaigns.SelectMany(c => c.Performance).Sum(p => p.Spend);
        var totalAdRevenue = campaigns.SelectMany(c => c.Performance).Sum(p => p.Revenue);

        var revenueTrend = orders30d
            .Where(o => o.OrderDate.HasValue)
            .GroupBy(o => o.OrderDate.Value.Date)
            .OrderBy(g => g.Key)
            .Select(g => new {
                date = g.Key.ToString("MMM dd"),
                revenue = g.Sum(o => o.TotalAmount)
            })
            .ToList();

        return Ok(new {
            Revenue = new { Today = orders30d.Where(o => o.OrderDate.HasValue && o.OrderDate.Value.Date >= now.Date).Sum(o => o.TotalAmount),
                            ThisMonth = orders30d.Sum(o => o.TotalAmount),
                            Trend = revenueTrend },
            Orders = new { Total = orders30d.Count, Pending = orders30d.Count(o => o.FulfillmentStatus == "Pending") },
            Customers = new { Total = customers.Count, New30d = customers.Count(c => c.JoinedDate >= now.AddDays(-30)) },
            ReturnRate = orders30d.Count > 0 ? Math.Round((double)returns30d / orders30d.Count * 100, 1) : 0,
        var salesData = Enumerable.Range(0, days).Reverse().Select(i => {
            var date = now.AddDays(-i).Date;
            var dayOrders = ordersPeriod.Where(o => o.OrderDate.Date == date).ToList();
            return new {
                Date = date.ToString("MMM d"),
                Revenue = dayOrders.Sum(o => o.TotalAmount),
                Orders = dayOrders.Count,
                Returns = returnsListPeriod.Count(r => r.RequestDate.Date == date)
            };
        }).ToList();

        return Ok(new {
            Revenue = new { Today = ordersPeriod.Where(o => o.OrderDate >= now.Date).Sum(o => o.TotalAmount),
                            ThisMonth = ordersPeriod.Sum(o => o.TotalAmount),
                            Total = await _db.Orders.SumAsync(o => o.TotalAmount) },
            Orders = new { Total = ordersPeriod.Count, Pending = ordersPeriod.Count(o => o.FulfillmentStatus == "Pending") },
            Customers = new { Total = customers.Count, New30d = customers.Count(c => c.JoinedDate >= startDate) },
            ReturnRate = ordersPeriod.Count > 0 ? Math.Round((double)returnsCount / ordersPeriod.Count * 100, 1) : 0,
            ROI = totalSpend > 0 ? Math.Round((double)(totalAdRevenue - totalSpend) / (double)totalSpend * 100, 1) : 0,
            ProductHealth = new {
                Healthy = products.Count(p => p.HealthStatus == "Healthy"),
                Warning = products.Count(p => p.HealthStatus == "Warning"),
                Critical = products.Count(p => p.HealthStatus == "Critical"),
                Discontinued = products.Count(p => p.IsDiscontinued == true)
            },
            CustomerLoyalty = new {
                VIP = customers.Count(c => c.LoyaltyTier == "VIP"),
                Gold = customers.Count(c => c.LoyaltyTier == "Gold"),
                Silver = customers.Count(c => c.LoyaltyTier == "Silver"),
                Bronze = customers.Count(c => c.LoyaltyTier == "Bronze"),
                New = customers.Count(c => c.LoyaltyTier == "New")
            },
            RTOToday = new {
                AutoApproved = rtoToday.Count(r => r.Decision == "Auto-Approved"),
                ManualReview = rtoToday.Count(r => r.Decision == "Manual Review"),
                AutoRejected = rtoToday.Count(r => r.Decision == "Auto-Rejected")
            },
            ActiveAds = new {
                Count = campaigns.Count(c => c.Status == "Active"),
                TotalSpend = totalSpend,
                AvgROI = totalSpend > 0 ? Math.Round((double)(totalAdRevenue - totalSpend) / (double)totalSpend * 100, 1) : 0
            },
            RecentDecisions = decisions,
            Alerts = GetAlerts(products, ordersPeriod),
            SalesData = salesData
        });
    }

    private static List<object> GetAlerts(List<Product> products, List<Order> orders30d)
    {
        var alerts = new List<object>();
        foreach (var p in products.Where(p => p.Stock == 0 && p.IsActive == true))
            alerts.Add(new { Level = "Critical", Message = $"'{p.Name}' is out of stock", Section = "Products" });
        foreach (var p in products.Where(p => p.Stock > 0 && p.Stock < p.ReorderLevel))
            alerts.Add(new { Level = "Warning", Message = $"'{p.Name}' - only {p.Stock} left in stock", Section = "Products" });
        return alerts.Take(10).ToList();
    }
}
