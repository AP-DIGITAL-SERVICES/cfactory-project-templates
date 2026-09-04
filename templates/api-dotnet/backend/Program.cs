using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
{{#if (eq decision_caching "redis")}}
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Redis");
    options.InstanceName = "{{projectName}}:";
});
{{/if}}
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors();
app.UseAuthorization();
app.MapControllers();

// Health check — no external dependencies required
app.MapGet("/health", () => Results.Ok(new { status = "ok", stack = "{{stack}}" }))
   .WithName("Health")
   .WithTags("health");

app.Run();

// Partial class to allow test project access via WebApplicationFactory
public partial class Program { }

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options);
