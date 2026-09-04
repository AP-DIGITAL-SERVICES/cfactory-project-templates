"""{{projectName}} MCP server — FastMCP."""
from __future__ import annotations

import os
from typing import Any

from fastmcp import FastMCP

mcp = FastMCP("{{projectName}}")


# ---------------------------------------------------------------------------
# Tools — add your tools here following the pattern below
# ---------------------------------------------------------------------------

@mcp.tool()
def health() -> dict[str, Any]:
    """Return server health status. No external dependencies required."""
    return {"status": "ok", "server": "{{projectName}}", "stack": "{{stack}}"}


# ---------------------------------------------------------------------------
# Resources (optional) — add read-only data sources here
# ---------------------------------------------------------------------------

# @mcp.resource("resource://example")
# def example_resource() -> str:
#     return "example content"


# ---------------------------------------------------------------------------
# Prompts (optional) — add reusable prompt templates here
# ---------------------------------------------------------------------------

# @mcp.prompt()
# def example_prompt(topic: str) -> str:
#     return f"Tell me about {topic}"


def main() -> None:
    transport = os.getenv("MCP_TRANSPORT", "{{decision_mcpTransport}}")

    # path="/" mounts the endpoint at the server root (FastMCP defaults to
    # "/mcp") so it lines up with the other stacks, which are all reachable
    # at their stripped-prefix root when served behind a reverse proxy.
    if transport == "http":
        mcp.run(
            transport="streamable-http",
            host="0.0.0.0",
            port=int(os.getenv("PORT", "8000")),
            path="/",
        )
    elif transport == "sse":
        mcp.run(transport="sse", host="0.0.0.0", port=int(os.getenv("PORT", "8000")), path="/")
    else:
        mcp.run(transport="stdio")


if __name__ == "__main__":
    main()
