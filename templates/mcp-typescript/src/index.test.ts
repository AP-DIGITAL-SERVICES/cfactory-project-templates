import { describe, it, expect } from '@jest/globals';
import { server, healthHandler } from './index.js';

describe('MCP Server — {{projectName}}', () => {
  it('server instance is defined', () => {
    expect(server).toBeDefined();
  });

  it('health handler returns ok status', async () => {
    const result = await healthHandler();
    expect(result.content).toHaveLength(1);
    const payload = JSON.parse(result.content[0].text) as { status: string; server: string };
    expect(payload.status).toBe('ok');
    expect(payload.server).toBe('{{projectName}}');
  });
});
