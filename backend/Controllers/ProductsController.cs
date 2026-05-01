using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NeuroEcom.BI.Data;
using NeuroEcom.BI.Models;

namespace NeuroEcom.BI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _db;
    public ProductsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? search, [FromQuery] string? category,
        [FromQuery] string? health, [FromQuery] string? sortBy)
    {
        var query = _db.Products.AsQueryable();
        if (!string.IsNullOrEmpty(search))
            query = query.Where(p => p.Name.Contains(search) || p.SKU.Contains(search));
        if (!string.IsNullOrEmpty(category))
            query = query.Where(p => p.Category == category);

        var products = await query.ToListAsync();
        if (!string.IsNullOrEmpty(health))
            products = products.Where(p => p.HealthStatus == health).ToList();

        return Ok(products.Select(p => new {
            p.Id, p.Name, p.SKU, p.Category, p.Price, p.Cost,
            p.Stock, p.ReorderLevel, p.IsActive, p.IsDiscontinued,
            Margin = Math.Round(p.Margin, 2),
            HealthStatus = p.HealthStatus,
            HealthScore = p.HealthScore,
            p.LastRestockDate, p.CreatedAt
        }));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var product = await _db.Products.FindAsync(id);
        if (product == null) return NotFound();

        var sales30d = await _db.ProductSalesHistory
            .Where(h => h.ProductId == id && h.SaleDate >= DateTime.Today.AddDays(-30))
            .SumAsync(h => h.UnitsSold);
        var revenue30d = await _db.ProductSalesHistory
            .Where(h => h.ProductId == id && h.SaleDate >= DateTime.Today.AddDays(-30))
            .SumAsync(h => h.Revenue);
        var returns30d = await _db.ProductSalesHistory
            .Where(h => h.ProductId == id && h.SaleDate >= DateTime.Today.AddDays(-30))
            .SumAsync(h => h.Returns);

        return Ok(new {
            product.Id, product.Name, product.SKU, product.Category, product.Description,
            product.Price, product.Cost, product.Stock, product.ReorderLevel,
            product.IsActive, product.IsDiscontinued, product.ImageUrl,
            product.LastRestockDate, product.CreatedAt,
            Margin = Math.Round(product.Margin, 2),
            HealthStatus = product.HealthStatus,
            HealthScore = product.HealthScore,
            Sales30d = sales30d,
            Revenue30d = revenue30d,
            Returns30d = returns30d,
            ReturnRate = sales30d > 0 ? Math.Round((double)returns30d / sales30d * 100, 1) : 0
        });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Product product)
    {
        product.CreatedAt = DateTime.UtcNow;
        product.UpdatedAt = DateTime.UtcNow;
        _db.Products.Add(product);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Product update)
    {
        var product = await _db.Products.FindAsync(id);
        if (product == null) return NotFound();
        product.Name = update.Name; product.Price = update.Price;
        product.Cost = update.Cost; product.Stock = update.Stock;
        product.Category = update.Category; product.Description = update.Description;
        product.ReorderLevel = update.ReorderLevel;
        product.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(product);
    }

    [HttpPost("{id}/action")]
    public async Task<IActionResult> TakeAction(int id, [FromBody] ProductActionDto action)
    {
        var product = await _db.Products.FindAsync(id);
        if (product == null) return NotFound();

        string details = "";
        switch (action.Action)
        {
            case "StopSelling":
                product.IsActive = false; product.IsDiscontinued = true;
                details = "Product stopped and marked discontinued"; break;
            case "IncreaseInventory":
                product.Stock += action.Quantity ?? 0;
                product.LastRestockDate = DateTime.UtcNow;
                details = $"Stock increased by {action.Quantity}"; break;
            case "DecreaseInventory":
                product.Stock = Math.Max(0, product.Stock - (action.Quantity ?? 0));
                details = $"Stock decreased by {action.Quantity}"; break;
            case "IncreasePrice":
                product.Price = action.NewPrice ?? product.Price;
                details = $"Price changed to ${action.NewPrice}"; break;
            case "DecreasePrice":
                product.Price = action.NewPrice ?? product.Price;
                details = $"Price changed to ${action.NewPrice}"; break;
            case "Delete":
                product.IsActive = false;
                details = "Product archived"; break;
        }

        product.UpdatedAt = DateTime.UtcNow;
        _db.Decisions.Add(new Decision {
            Section = "Products", ItemId = id, ItemName = product.Name,
            DecisionType = action.Action, DecisionDetails = details, AppliedBy = "Admin"
        });
        await _db.SaveChangesAsync();
        return Ok(new { message = details, product });
    }

    [HttpGet("{id}/history")]
    public async Task<IActionResult> GetSalesHistory(int id, [FromQuery] int days = 30)
    {
        var history = await _db.ProductSalesHistory
            .Where(h => h.ProductId == id && h.SaleDate >= DateTime.Today.AddDays(-days))
            .OrderBy(h => h.SaleDate)
            .Select(h => new { h.SaleDate, h.UnitsSold, h.Revenue, h.Returns })
            .ToListAsync();
        return Ok(history);
    }

    [HttpGet("analytics")]
    public async Task<IActionResult> GetAnalytics()
    {
        var products = await _db.Products.ToListAsync();
        var totalValue = await _db.Products.SumAsync(p => p.Stock * p.Cost);
        var byCategory = await _db.Products.GroupBy(p => p.Category)
            .Select(g => new { Category = g.Key, Count = g.Count(), TotalStock = g.Sum(p => p.Stock) })
            .ToListAsync();

        return Ok(new {
            TotalProducts = products.Count,
            ActiveSKUs = products.Count(p => p.IsActive),
            OutOfStock = products.Count(p => p.Stock == 0),
            TotalInventoryValue = totalValue,
            Healthy = products.Count(p => p.HealthStatus == "Healthy"),
            Warning = products.Count(p => p.HealthStatus == "Warning"),
            Critical = products.Count(p => p.HealthStatus == "Critical"),
            Discontinued = products.Count(p => p.IsDiscontinued),
            ByCategory = byCategory
        });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var product = await _db.Products.FindAsync(id);
        if (product == null) return NotFound();
        product.IsActive = false;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Product archived" });
    }
}

public class ProductActionDto
{
    public string Action { get; set; } = "";
    public int? Quantity { get; set; }
    public decimal? NewPrice { get; set; }
    public string? Reason { get; set; }
    public int? DiscountPercent { get; set; }
    public int? AlertThreshold { get; set; }
}
