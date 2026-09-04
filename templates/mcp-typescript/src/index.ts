import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
{{#if (or (eq decision_mcpTransport "http") (eq decision_mcpTransport "sse"))}}import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import http from 'node:http';
{{/if}}import { z } from 'zod';

export const server = new McpServer({
  name: '{{projectName}}',
  version: '0.0.1',
});

// ---------------------------------------------------------------------------
// Tool handlers — exported for unit testing without importing transport side-effects
// ---------------------------------------------------------------------------

export async function healthHandler(): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({ status: 'ok', server: '{{projectName}}', stack: '{{stack}}' }),
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Tool registrations
// ---------------------------------------------------------------------------

server.tool(
  'health',
  'Return server health status. No external dependencies required.',
  {},
  healthHandler,
);

// ---------------------------------------------------------------------------
// Resources (optional) — add read-only data sources here
// ---------------------------------------------------------------------------

// server.resource('resource://example', 'example', {}, async () => ({
//   contents: [{ uri: 'resource://example', text: 'example content', mimeType: 'text/plain' }],
// }));

// ---------------------------------------------------------------------------
// Transport selection — only runs when this file is the entry point, not during tests
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const transport = process.env['MCP_TRANSPORT'] ?? '{{decision_mcpTransport}}';

{{#if (or (eq decision_mcpTransport "http") (eq decision_mcpTransport "sse"))}}  if (transport === 'http' || transport === 'sse') {
    const port = parseInt(process.env['PORT'] ?? '8000', 10);
    const methodNotAllowed = (res: http.ServerResponse) =>
      res.writeHead(405, { 'Content-Type': 'application/json' }).end(
        JSON.stringify({ jsonrpc: '2.0', error: { code: -32000, message: 'Method not allowed.' }, id: null }),
      );
    const httpServer = http.createServer((req, res) => {
      // Stateless mode (sessionIdGenerator: undefined) only supports POST — GET/DELETE
      // are for session-based SSE streams and resumption, which this server doesn't use.
      if (req.method !== 'POST') {
        methodNotAllowed(res);
        return;
      }
      // A fresh transport per request (rather than one shared instance) is required in
      // stateless mode: the SDK ties each transport to a single request/response cycle.
      const httpTransport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
      res.on('close', () => httpTransport.close());
      server
        .connect(httpTransport)
        .then(() => httpTransport.handleRequest(req, res))
        .catch((err: unknown) => {
          process.stderr.write(`MCP request error: ${err instanceof Error ? err.stack : err}\n`);
          if (!res.headersSent) {
            res.writeHead(500, { 'Content-Type': 'application/json' }).end(
              JSON.stringify({ jsonrpc: '2.0', error: { code: -32603, message: 'Internal server error' }, id: null }),
            );
          }
        });
    });
    httpServer.listen(port, () => {
      process.stderr.write(`{{projectName}} MCP server listening on port ${port}\n`);
    });
    return;
  }

{{/if}}  const stdioTransport = new StdioServerTransport();
  await server.connect(stdioTransport);
}

// Only start the server when this module is run directly, not when imported by tests
const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  main().catch((err) => {
    process.stderr.write(`Fatal: ${err}\n`);
    process.exit(1);
  });
}
