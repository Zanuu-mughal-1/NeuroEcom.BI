using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NeuroEcom.BI.Models;

// ===================== PRODUCT =====================
public class Product
{
    public int Id { get; set; }
    [Required, MaxLength(200)] public string Name { get; set; } = "";
    [Required, MaxLength(50)] public string SKU { get; set; } = "";
    [MaxLength(100)] public string? Category { get; set; }
    public string? Description { get; set; }
    [Column(TypeName = "decimal(18,2)")] public decimal Price { get; set; }
    [Column(TypeName = "decimal(18,2)")] public decimal Cost { get; set; }
    public int Stock { get; set; }
    public int ReorderLevel { get; set; } = 10;
    public DateTime? LastRestockDate { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDiscontinued { get; set; } = false;
    public string? ImageUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [NotMapped] public decimal Margin => Price > 0 ? ((Price - Cost) / Price) * 100 : 0;
    [NotMapped] public string HealthStatus => GetHealthStatus();
    [NotMapped] public int HealthScore => CalculateHealthScore();

    private string GetHealthStatus()
    {
        if (IsDiscontinued) return "Discontinued";
        if (HealthScore >= 80) return "Healthy";
        if (HealthScore >= 50) return "Warning";
        return "Critical";
    }

    private int CalculateHealthScore()
    {
        int score = 100;
        if (Stock == 0) score -= 40;
        else if (Stock < ReorderLevel) score -= 20;
        if (IsDiscontinued) return 0;
        return Math.Max(0, score);
    }
}

public class ProductSalesHistory
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public Product? Product { get; set; }
    public DateTime SaleDate { get; set; }
    public int UnitsSold { get; set; }
    [Column(TypeName = "decimal(18,2)")] public decimal Revenue { get; set; }
    public int Returns { get; set; }
}

// ===================== CUSTOMER =====================
public class Customer
{
    public int Id { get; set; }
    [Required, MaxLength(100)] public string FirstName { get; set; } = "";
    [Required, MaxLength(100)] public string LastName { get; set; } = "";
    [Required, MaxLength(200)] public string Email { get; set; } = "";
    [MaxLength(20)] public string? Phone { get; set; }
    [MaxLength(20)] public string? AlternatePhone { get; set; }
    [MaxLength(10)] public string? Gender { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? ShippingAddress { get; set; }
    public string? BillingAddress { get; set; }
    [MaxLength(100)] public string? City { get; set; }
    [MaxLength(20)] public string? Pincode { get; set; }
    [MaxLength(20)] public string LoyaltyTier { get; set; } = "New";
    public int LoyaltyPoints { get; set; }
    [Column(TypeName = "decimal(18,2)")] public decimal TotalSpent { get; set; }
    public int TotalOrders { get; set; }
    public bool IsBlocked { get; set; }
    public string? BlockReason { get; set; }
    public DateTime JoinedDate { get; set; } = DateTime.UtcNow;
    public DateTime? LastOrderDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [NotMapped] public string FullName => $"{FirstName} {LastName}";
    public ICollection<CustomerFlag> Flags { get; set; } = [];
    public ICollection<Order> Orders { get; set; } = [];
}

public class CustomerFlag
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public Customer? Customer { get; set; }
    [Required, MaxLength(50)] public string FlagType { get; set; } = "";
    public string? Reason { get; set; }
    public DateTime FlaggedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;
}

public class CustomerNote
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public string? Note { get; set; }
    [MaxLength(100)] public string? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

// ===================== ORDER =====================
public class Order
{
    public int Id { get; set; }
    [Required, MaxLength(50)] public string OrderNumber { get; set; } = "";
    public int CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    [Column(TypeName = "decimal(18,2)")] public decimal TotalAmount { get; set; }
    [MaxLength(50)] public string? PaymentMethod { get; set; }
    [MaxLength(50)] public string PaymentStatus { get; set; } = "Pending";
    [MaxLength(50)] public string FulfillmentStatus { get; set; } = "Pending";
    [MaxLength(100)] public string? TrackingNumber { get; set; }
    public string? ShippingAddress { get; set; }
    public int RTORiskScore { get; set; }
    [MaxLength(50)] public string? RTODecision { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<OrderItem> Items { get; set; } = [];
    public ICollection<OrderTimeline> Timeline { get; set; } = [];
}

public class OrderItem
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public Order? Order { get; set; }
    public int ProductId { get; set; }
    public Product? Product { get; set; }
    public int Quantity { get; set; }
    [Column(TypeName = "decimal(18,2)")] public decimal UnitPrice { get; set; }
    [Column(TypeName = "decimal(18,2)")] public decimal TotalPrice { get; set; }
    [MaxLength(50)] public string ReturnStatus { get; set; } = "None";
}

public class OrderTimeline
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public Order? Order { get; set; }
    [Required, MaxLength(100)] public string Status { get; set; } = "";
    public string? Description { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

// ===================== RETURN =====================
public class Return
{
    public int Id { get; set; }
    [Required, MaxLength(50)] public string ReturnNumber { get; set; } = "";
    public int OrderId { get; set; }
    public Order? Order { get; set; }
    public int CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public int ProductId { get; set; }
    public Product? Product { get; set; }
    public int Quantity { get; set; }
    [MaxLength(100)] public string? ReturnReason { get; set; }
    public string? AdditionalComments { get; set; }
    [MaxLength(50)] public string Status { get; set; } = "Pending";
    [Column(TypeName = "decimal(18,2)")] public decimal? RefundAmount { get; set; }
    [MaxLength(50)] public string? RefundMethod { get; set; }
    public DateTime RequestDate { get; set; } = DateTime.UtcNow;
    public DateTime? ProcessedDate { get; set; }
    public string? Notes { get; set; }
}

// ===================== ADS =====================
public class AdCampaign
{
    public int Id { get; set; }
    [Required, MaxLength(200)] public string Name { get; set; } = "";
    [Required, MaxLength(50)] public string Platform { get; set; } = "";
    public int? ProductId { get; set; }
    public Product? Product { get; set; }
    [Column(TypeName = "decimal(18,2)")] public decimal Budget { get; set; }
    [Column(TypeName = "decimal(18,2)")] public decimal? DailyBudget { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    [MaxLength(50)] public string Status { get; set; } = "Draft";
    public string? TargetAudience { get; set; }
    [Column(TypeName = "decimal(5,2)")] public decimal ROIAlertThreshold { get; set; } = -10;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<AdPerformance> Performance { get; set; } = [];
}

public class AdPerformance
{
    public int Id { get; set; }
    public int CampaignId { get; set; }
    public AdCampaign? Campaign { get; set; }
    public DateTime PerformanceDate { get; set; }
    [Column(TypeName = "decimal(18,2)")] public decimal Spend { get; set; }
    [Column(TypeName = "decimal(18,2)")] public decimal Revenue { get; set; }
    public int Impressions { get; set; }
    public int Clicks { get; set; }
    public int Conversions { get; set; }
}

// ===================== DECISIONS & RULES =====================
public class Decision
{
    public int Id { get; set; }
    [MaxLength(50)] public string Section { get; set; } = "";
    public int? ItemId { get; set; }
    [MaxLength(200)] public string? ItemName { get; set; }
    [Required, MaxLength(100)] public string DecisionType { get; set; } = "";
    public string? DecisionDetails { get; set; }
    [MaxLength(100)] public string AppliedBy { get; set; } = "System";
    [MaxLength(50)] public string Status { get; set; } = "Applied";
    public string? ImpactBefore { get; set; }
    public string? ImpactAfter { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class SystemRule
{
    public int Id { get; set; }
    [MaxLength(50)] public string Category { get; set; } = "";
    [MaxLength(200)] public string RuleName { get; set; } = "";
    [MaxLength(200)] public string CurrentValue { get; set; } = "";
    [MaxLength(200)] public string DefaultValue { get; set; } = "";
    public string? Description { get; set; }
    public bool IsEditable { get; set; } = true;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class RTOAssessment
{
    public int Id { get; set; }
    public int? OrderId { get; set; }
    public Order? Order { get; set; }
    public int RiskScore { get; set; }
    [Required, MaxLength(50)] public string Decision { get; set; } = "";
    public string? TriggeredRules { get; set; }
    public DateTime AssessedAt { get; set; } = DateTime.UtcNow;
}

public class CustomerDiscount
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public Customer? Customer { get; set; }
    [MaxLength(20)] public string? DiscountType { get; set; }
    [Column(TypeName = "decimal(10,2)")] public decimal DiscountValue { get; set; }
    [MaxLength(50)] public string? VoucherCode { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public bool IsUsed { get; set; }
    public string? Reason { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
