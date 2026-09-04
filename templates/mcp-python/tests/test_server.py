"""Smoke tests — server tool registration and health check. No network required."""
import asyncio
import pytest

from src.server import mcp, health


def test_server_has_tools():
    """MCP server must expose at least one registered tool."""
    tools = asyncio.run(mcp.list_tools())
    assert len(tools) > 0, "Server has no registered tools"


def test_health_tool_registered():
    """The health tool must be registered by name."""
    tools = asyncio.run(mcp.list_tools())
    tool_names = [t.name for t in tools]
    assert "health" in tool_names


def test_health_tool_returns_ok():
    """Health tool must return status=ok without any external service."""
    result = health()
    assert result["status"] == "ok"
    assert result["server"] == "{{projectName}}"
