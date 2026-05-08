using Microsoft.EntityFrameworkCore;
using NeuroEcom.BI.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddControllers().AddJsonOptions(opt =>
{
    opt.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    opt.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    opt.JsonSerializerOptions.PropertyNamingPolicy = null; // Use original property names (PascalCase)
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "NeuroEcom.BI API", Version = "v1" });
});

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "NeuroEcom.BI v1"));
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
