using Microsoft.EntityFrameworkCore;
using NeuroEcom.BI.Models;

namespace NeuroEcom.BI.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductSalesHistory> ProductSalesHistory => Set<ProductSalesHistory>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<CustomerFlag> CustomerFlags => Set<CustomerFlag>();
    public DbSet<CustomerNote> CustomerNotes => Set<CustomerNote>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<OrderTimeline> OrderTimelines => Set<OrderTimeline>();
    public DbSet<Return> Returns => Set<Return>();
    public DbSet<AdCampaign> AdCampaigns => Set<AdCampaign>();
    public DbSet<AdPerformance> AdPerformance => Set<AdPerformance>();
    public DbSet<Decision> Decisions => Set<Decision>();
    public DbSet<SystemRule> SystemRules => Set<SystemRule>();
    public DbSet<RTOAssessment> RTOAssessments => Set<RTOAssessment>();
    public DbSet<CustomerDiscount> CustomerDiscounts => Set<CustomerDiscount>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Customer>()
            .HasMany(c => c.Flags)
            .WithOne(f => f.Customer)
            .HasForeignKey(f => f.CustomerId);

        modelBuilder.Entity<Order>()
            .HasMany(o => o.Items)
            .WithOne(i => i.Order)
            .HasForeignKey(i => i.OrderId);

        modelBuilder.Entity<Order>()
            .HasMany(o => o.Timeline)
            .WithOne(t => t.Order)
            .HasForeignKey(t => t.OrderId);

        modelBuilder.Entity<AdCampaign>()
            .HasMany(c => c.Performance)
            .WithOne(p => p.Campaign)
            .HasForeignKey(p => p.CampaignId);
    }
}
