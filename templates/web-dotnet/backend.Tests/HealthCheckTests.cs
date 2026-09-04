using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace {{pascalCase projectName}}.Tests;

public class HealthCheckTests(WebApplicationFactory<Program> factory)
    : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task Health_ReturnsOk()
    {
        var response = await _client.GetAsync("/health");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Health_ReturnsExpectedPayload()
    {
        var response = await _client.GetAsync("/health");
        var body = await response.Content.ReadAsStringAsync();
        var doc = JsonDocument.Parse(body);
        Assert.Equal("ok", doc.RootElement.GetProperty("status").GetString());
        Assert.Equal("{{stack}}", doc.RootElement.GetProperty("stack").GetString());
    }

    [Fact]
    public async Task Health_DoesNotRequireExternalServices()
    {
        // Arrange — no database or Redis connection configured
        // Act
        var response = await _client.GetAsync("/health");
        // Assert — endpoint responds regardless of infrastructure
        Assert.True(
            response.StatusCode == HttpStatusCode.OK,
            $"Expected 200, got {(int)response.StatusCode}");
    }
}
