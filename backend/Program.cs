using Microsoft.EntityFrameworkCore;
using NeuroEcom.BI.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddControllers().AddJsonOptions(opt =>
{
    opt.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    opt.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    opt.JsonSerializerOptions.PropertyNamingPolicy = null;
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        // Always allow localhost (any port, http/https) for local development,
        // plus optional configured origins (set in appsettings under Cors:AllowedOrigins).
        var configuredOrigins = builder.Configuration
            .GetSection("Cors:AllowedOrigins")
            .Get<string[]>() ?? Array.Empty<string>();

        policy
            .SetIsOriginAllowed(origin =>
            {
                if (!Uri.TryCreate(origin, UriKind.Absolute, out var uri)) return false;
                if (string.Equals(uri.Host, "localhost", StringComparison.OrdinalIgnoreCase)) return true;
                if (string.Equals(uri.Host, "127.0.0.1", StringComparison.OrdinalIgnoreCase)) return true;
                return configuredOrigins.Any(o => string.Equals(o, origin, StringComparison.OrdinalIgnoreCase));
            })
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "NeuroEcom.BI API", Version = "v1" });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await EnsureCompetitorSchemaAsync(db);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "NeuroEcom.BI v1"));
}
app.UseStaticFiles();
app.UseCors("AllowFrontend");

// Health check endpoint — now verifies DB connectivity
app.MapGet("/api/health", async (NeuroEcom.BI.Data.AppDbContext db) => {
    try {
        // Try a simple operation to verify the connection
        bool canConnect = await db.Database.CanConnectAsync();
        if (canConnect) {
            return Results.Ok(new { status = "Healthy", database = "Connected", timestamp = DateTime.UtcNow });
        }
        return Results.Json(new { status = "Degraded", database = "Disconnected" }, statusCode: 503);
    }
    catch (Exception ex) {
        return Results.Json(new { status = "Unhealthy", error = ex.Message }, statusCode: 503);
    }
});

app.UseAuthorization();
app.MapControllers();
app.Run();

static async Task EnsureCompetitorSchemaAsync(AppDbContext db)
{
    await db.Database.ExecuteSqlRawAsync("""
IF OBJECT_ID(N'Competitors', N'U') IS NULL
BEGIN
    CREATE TABLE Competitors (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(120) NOT NULL,
        WebsiteUrl NVARCHAR(300) NOT NULL,
        Status NVARCHAR(50) NOT NULL DEFAULT 'Tracking',
        MatchRate DECIMAL(5,2) NOT NULL DEFAULT 0,
        LastScannedAt DATETIME2 NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
    );
END

IF OBJECT_ID(N'CompetitorProductMatches', N'U') IS NULL
BEGIN
    CREATE TABLE CompetitorProductMatches (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        CompetitorId INT NOT NULL REFERENCES Competitors(Id),
        ProductId INT NOT NULL REFERENCES Products(Id),
        CompetitorProductName NVARCHAR(300) NOT NULL,
        CompetitorProductUrl NVARCHAR(500) NULL,
        Confidence DECIMAL(5,2) NOT NULL DEFAULT 90,
        Status NVARCHAR(50) NOT NULL DEFAULT 'Matched',
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
    );
END

IF OBJECT_ID(N'CompetitorPriceSnapshots', N'U') IS NULL
BEGIN
    CREATE TABLE CompetitorPriceSnapshots (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        CompetitorProductMatchId INT NOT NULL REFERENCES CompetitorProductMatches(Id),
        Price DECIMAL(18,2) NOT NULL,
        ShippingCost DECIMAL(18,2) NOT NULL DEFAULT 0,
        InStock BIT NOT NULL DEFAULT 1,
        PromoText NVARCHAR(100) NULL,
        CapturedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
    );
END

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_CompetitorProductMatches_ProductId')
    CREATE NONCLUSTERED INDEX IX_CompetitorProductMatches_ProductId ON CompetitorProductMatches(ProductId);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_CompetitorPriceSnapshots_MatchId_CapturedAt')
    CREATE NONCLUSTERED INDEX IX_CompetitorPriceSnapshots_MatchId_CapturedAt ON CompetitorPriceSnapshots(CompetitorProductMatchId, CapturedAt DESC);
""");
}
