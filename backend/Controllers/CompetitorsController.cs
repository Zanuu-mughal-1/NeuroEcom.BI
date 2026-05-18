using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NeuroEcom.BI.Data;
using NeuroEcom.BI.Models;

namespace NeuroEcom.BI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CompetitorsController : ControllerBase
{
    private readonly AppDbContext _db;
    public CompetitorsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetOverview([FromQuery] int days = 14)
    {
        await EnsureSeedAsync();

        var since = DateTime.UtcNow.AddDays(-days);
        var competitors = await _db.Competitors.OrderBy(c => c.Name).ToListAsync();
        var products = await _db.Products.Where(p => p.IsActive == true).OrderBy(p => p.Name).ToListAsync();
        var matches = await _db.CompetitorProductMatches
            .Include(m => m.Competitor)
            .Include(m => m.Product)
            .Include(m => m.PriceSnapshots.Where(s => s.CapturedAt >= since))
            .ToListAsync();

        var trackedProducts = products.Select(product =>
        {
            var productMatches = matches.Where(m => m.ProductId == product.Id).ToList();
            var latest = productMatches.Select(m => new
            {
                Match = m,
                Snapshot = m.PriceSnapshots.OrderByDescending(s => s.CapturedAt).FirstOrDefault()
            }).Where(x => x.Snapshot != null).ToList();

            var marketMin = latest.Count > 0 ? latest.Min(x => x.Snapshot!.Price + x.Snapshot.ShippingCost) : product.Price;
            var marketMax = latest.Count > 0 ? latest.Max(x => x.Snapshot!.Price + x.Snapshot.ShippingCost) : product.Price;
            var marketAvg = latest.Count > 0 ? latest.Average(x => (double)(x.Snapshot!.Price + x.Snapshot.ShippingCost)) : (double)product.Price;
            var gapPct = marketMin > 0 ? Math.Round((double)((product.Price - marketMin) / marketMin) * 100, 1) : 0;
            var marginPct = product.Price > 0 ? Math.Round((double)((product.Price - product.Cost) / product.Price) * 100, 1) : 0;
            var suggestedPrice = CalculateSuggestedPrice(product, marketMin);
            var estimatedGain = Math.Round((double)Math.Max(0, product.Price - suggestedPrice) * (product.Stock ?? 0) * 0.08, 2);
            var position = GetPosition(gapPct, product.Price, marketMin);

            return new
            {
                product.Id,
                product.Name,
                product.SKU,
                product.Category,
                MyPrice = product.Price,
                product.Cost,
                Margin = marginPct,
                MarketMin = Math.Round(marketMin, 2),
                MarketMax = Math.Round(marketMax, 2),
                MarketAvg = Math.Round(marketAvg, 2),
                Gap = gapPct,
                Position = position,
                Health = position == "Overpriced" ? "critical" : position == "Undercut" ? "warning" : "healthy",
                SuggestedPrice = Math.Round(suggestedPrice, 2),
                EstimatedGain = estimatedGain,
                Matches = latest.Select(x => new
                {
                    x.Match.CompetitorId,
                    Competitor = x.Match.Competitor!.Name,
                    x.Match.Competitor!.WebsiteUrl,
                    x.Match.Confidence,
                    Price = x.Snapshot!.Price,
                    x.Snapshot.ShippingCost,
                    x.Snapshot.InStock,
                    x.Snapshot.PromoText,
                    x.Snapshot.CapturedAt
                })
            };
        }).ToList();

        var over = trackedProducts.Count(p => p.Position == "Overpriced");
        var parity = trackedProducts.Count(p => p.Position == "Parity");
        var under = trackedProducts.Count(p => p.Position == "Undercut");
        var critical = trackedProducts.Count(p => p.Health == "critical");
        var avgGap = trackedProducts.Count > 0 ? Math.Round(trackedProducts.Average(p => p.Gap), 1) : 0;
        var opportunity = trackedProducts.Sum(p => p.EstimatedGain);

        var history = BuildHistory(matches, products, since);
        var actions = trackedProducts
            .Where(p => p.Position != "Parity")
            .OrderByDescending(p => Math.Abs(p.Gap))
            .Take(8)
            .Select(p => new
            {
                ProductId = p.Id,
                p.Name,
                p.SKU,
                p.Position,
                p.Gap,
                p.MyPrice,
                p.MarketMin,
                p.SuggestedPrice,
                p.EstimatedGain,
                Action = p.Position == "Overpriced" ? "ReducePrice" : "HoldOrRaise",
                Rationale = p.Position == "Overpriced"
                    ? $"Market floor is Rs {p.MarketMin:n2}; suggested price protects margin while closing the gap."
                    : "You are below the market floor; hold price for share capture or test a small lift."
            });

        return Ok(new
        {
            Metrics = new
            {
                MarketPosition = $"{(trackedProducts.Count == 0 ? 0 : Math.Round((double)parity / trackedProducts.Count * 100))}% Parity",
                PriceViolations = over,
                CriticalViolations = critical,
                AvgMarketGap = avgGap,
                OpportunityGain = Math.Round(opportunity, 2),
                TrackedProducts = trackedProducts.Count,
                ActiveCompetitors = competitors.Count(c => c.Status == "Tracking")
            },
            Competitors = competitors.Select(c => new
            {
                c.Id,
                c.Name,
                c.WebsiteUrl,
                c.Status,
                c.MatchRate,
                c.LastScannedAt,
                LastSeen = FormatRelative(c.LastScannedAt)
            }),
            TrackedProducts = trackedProducts,
            PriceHistory = history,
            SuggestedActions = actions,
            Distribution = new { Overpriced = over, Parity = parity, Undercut = under }
        });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CompetitorCreateDto input)
    {
        if (string.IsNullOrWhiteSpace(input.Name) || string.IsNullOrWhiteSpace(input.WebsiteUrl))
            return BadRequest(new { message = "Name and WebsiteUrl are required" });

        var competitor = new Competitor
        {
            Name = input.Name.Trim(),
            WebsiteUrl = input.WebsiteUrl.Trim(),
            Status = "Tracking",
            MatchRate = 0,
            CreatedAt = DateTime.UtcNow
        };
        _db.Competitors.Add(competitor);
        await _db.SaveChangesAsync();
        await MatchCompetitorAsync(competitor);
        await ScanCompetitorAsync(competitor);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetOverview), new { id = competitor.Id }, competitor);
    }

    [HttpPost("{id}/toggle")]
    public async Task<IActionResult> Toggle(int id)
    {
        var competitor = await _db.Competitors.FindAsync(id);
        if (competitor == null) return NotFound();
        competitor.Status = competitor.Status == "Tracking" ? "Paused" : "Tracking";
        await _db.SaveChangesAsync();
        return Ok(competitor);
    }

    [HttpPost("match")]
    public async Task<IActionResult> MatchProducts()
    {
        await EnsureSeedAsync();
        var competitors = await _db.Competitors.ToListAsync();
        foreach (var competitor in competitors)
            await MatchCompetitorAsync(competitor);

        await _db.SaveChangesAsync();
        return Ok(new { message = "Competitor product matching refreshed" });
    }

    [HttpPost("scan")]
    public async Task<IActionResult> ScanMarket()
    {
        await EnsureSeedAsync();
        var competitors = await _db.Competitors.Where(c => c.Status == "Tracking").ToListAsync();
        foreach (var competitor in competitors)
            await ScanCompetitorAsync(competitor);

        await _db.SaveChangesAsync();
        return Ok(new { message = "Market scan completed", scanned = competitors.Count });
    }

    [HttpPost("actions/{productId}/apply")]
    public async Task<IActionResult> ApplySuggestion(int productId, [FromBody] CompetitorActionDto input)
    {
        var product = await _db.Products.FindAsync(productId);
        if (product == null) return NotFound();
        if (input.NewPrice <= 0) return BadRequest(new { message = "NewPrice must be greater than zero" });

        var oldPrice = product.Price;
        product.Price = input.NewPrice;
        product.UpdatedAt = DateTime.UtcNow;
        _db.Decisions.Add(new Decision
        {
            Section = "Competitors",
            ItemId = product.Id,
            ItemName = product.Name,
            DecisionType = "CompetitorPriceUpdate",
            DecisionDetails = $"Price changed from Rs {oldPrice:n2} to Rs {product.Price:n2}. {input.Reason}",
            ImpactBefore = $"Price: Rs {oldPrice:n2}",
            ImpactAfter = $"Price: Rs {product.Price:n2}",
            AppliedBy = "Admin",
            Status = "Applied",
            CreatedAt = DateTime.UtcNow
        });
        await _db.SaveChangesAsync();
        return Ok(new { message = "Suggested competitor price applied", product.Id, product.Price });
    }

    [HttpGet("decisions")]
    public async Task<IActionResult> GetDecisions()
    {
        var decisions = await _db.Decisions
            .Where(d => d.Section == "Competitors")
            .OrderByDescending(d => d.CreatedAt)
            .Take(50)
            .ToListAsync();
        return Ok(decisions);
    }

    private async Task EnsureSeedAsync()
    {
        if (!await _db.Competitors.AnyAsync())
        {
            _db.Competitors.AddRange(
                new Competitor { Name = "Daraz", WebsiteUrl = "daraz.pk", Status = "Tracking", MatchRate = 96 },
                new Competitor { Name = "PriceOye", WebsiteUrl = "priceoye.pk", Status = "Tracking", MatchRate = 91 },
                new Competitor { Name = "Telemart", WebsiteUrl = "telemart.pk", Status = "Tracking", MatchRate = 84 },
                new Competitor { Name = "Mega.pk", WebsiteUrl = "mega.pk", Status = "Paused", MatchRate = 77 }
            );
            await _db.SaveChangesAsync();
        }

        var competitors = await _db.Competitors.ToListAsync();
        foreach (var competitor in competitors)
            await MatchCompetitorAsync(competitor);

        await _db.SaveChangesAsync();

        if (!await _db.CompetitorPriceSnapshots.AnyAsync())
        {
            foreach (var competitor in competitors)
                await ScanCompetitorAsync(competitor, 10);
        }
        await _db.SaveChangesAsync();
    }

    private async Task MatchCompetitorAsync(Competitor competitor)
    {
        var products = await _db.Products.Where(p => p.IsActive == true).Take(30).ToListAsync();
        var existingProductIds = await _db.CompetitorProductMatches
            .Where(m => m.CompetitorId == competitor.Id)
            .Select(m => m.ProductId)
            .ToListAsync();

        foreach (var product in products.Where(p => !existingProductIds.Contains(p.Id)))
        {
            var slug = product.SKU.ToLowerInvariant();
            _db.CompetitorProductMatches.Add(new CompetitorProductMatch
            {
                CompetitorId = competitor.Id,
                ProductId = product.Id,
                CompetitorProductName = $"{product.Name} - {competitor.Name}",
                CompetitorProductUrl = $"https://{competitor.WebsiteUrl}/products/{slug}",
                Confidence = competitor.Name.Length % 2 == 0 ? 94 : 88,
                Status = "Matched",
                CreatedAt = DateTime.UtcNow
            });
        }

        competitor.MatchRate = products.Count == 0 ? 0 : Math.Round((decimal)(await _db.CompetitorProductMatches.CountAsync(m => m.CompetitorId == competitor.Id)) / products.Count * 100, 2);
    }

    private async Task ScanCompetitorAsync(Competitor competitor, int days = 1)
    {
        var matches = await _db.CompetitorProductMatches
            .Include(m => m.Product)
            .Where(m => m.CompetitorId == competitor.Id && m.Status == "Matched")
            .ToListAsync();

        for (var offset = days - 1; offset >= 0; offset--)
        {
            foreach (var match in matches)
            {
                if (match.Product == null) continue;
                var seed = competitor.Id * 31 + match.ProductId * 17 + offset * 7;
                var swing = ((seed % 19) - 9) / 100m;
                var price = Math.Max(match.Product.Cost * 1.12m, match.Product.Price * (1 + swing));
                _db.CompetitorPriceSnapshots.Add(new CompetitorPriceSnapshot
                {
                    CompetitorProductMatchId = match.Id,
                    Price = Math.Round(price, 2),
                    ShippingCost = seed % 5 == 0 ? 150 : 0,
                    InStock = seed % 11 != 0,
                    PromoText = seed % 6 == 0 ? "Flash Sale" : seed % 7 == 0 ? "Bundle Deal" : null,
                    CapturedAt = DateTime.UtcNow.Date.AddDays(-offset).AddHours(10 + competitor.Id)
                });
            }
        }
        competitor.LastScannedAt = DateTime.UtcNow;
    }

    private static decimal CalculateSuggestedPrice(Product product, decimal marketMin)
    {
        var floor = product.Cost * 1.15m;
        var target = marketMin > 0 ? marketMin - 1 : product.Price;
        return Math.Max(floor, Math.Min(product.Price, target));
    }

    private static string GetPosition(double gapPct, decimal myPrice, decimal marketMin)
    {
        if (marketMin <= 0 || Math.Abs(gapPct) <= 2) return "Parity";
        if (myPrice > marketMin) return "Overpriced";
        return "Undercut";
    }

    private static List<object> BuildHistory(List<CompetitorProductMatch> matches, List<Product> products, DateTime since)
    {
        return Enumerable.Range(0, 14).Select(i =>
        {
            var date = DateTime.UtcNow.Date.AddDays(-13 + i);
            var daySnapshots = matches
                .SelectMany(m => m.PriceSnapshots.Where(s => s.CapturedAt.Date == date).Select(s => new { m.Competitor!.Name, s.Price }))
                .ToList();
            return new
            {
                Date = date.ToString("MMM dd"),
                Mine = products.Count > 0 ? Math.Round(products.Average(p => p.Price), 2) : 0,
                Daraz = Math.Round(daySnapshots.Where(s => s.Name == "Daraz").Select(s => s.Price).DefaultIfEmpty(0).Average(), 2),
                PriceOye = Math.Round(daySnapshots.Where(s => s.Name == "PriceOye").Select(s => s.Price).DefaultIfEmpty(0).Average(), 2),
                Telemart = Math.Round(daySnapshots.Where(s => s.Name == "Telemart").Select(s => s.Price).DefaultIfEmpty(0).Average(), 2)
            } as object;
        }).ToList();
    }

    private static string FormatRelative(DateTime? value)
    {
        if (!value.HasValue) return "never";
        var span = DateTime.UtcNow - value.Value;
        if (span.TotalMinutes < 1) return "just now";
        if (span.TotalMinutes < 60) return $"{(int)span.TotalMinutes}m ago";
        if (span.TotalHours < 24) return $"{(int)span.TotalHours}h ago";
        return $"{(int)span.TotalDays}d ago";
    }
}

public class CompetitorCreateDto
{
    public string Name { get; set; } = "";
    public string WebsiteUrl { get; set; } = "";
}

public class CompetitorActionDto
{
    public decimal NewPrice { get; set; }
    public string? Reason { get; set; }
}
