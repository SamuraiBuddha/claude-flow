// Type definitions for Model Context Protocol SDK
declare module '@modelcontextprotocol/sdk/types.js' {
  import { z } from 'zod';

  export interface Tool {
    name: string;
    description: string;
    inputSchema: {
      type: string;
      properties?: Record<string, any>;
      required?: string[];
    };
  }

  export interface CallToolRequest {
    method: string;
    params: {
      name: string;
      arguments?: Record<string, any>;
    };
  }

  export interface CallToolResult {
    content: Array<TextContent | ImageContent | EmbeddedResource>;
    isError?: boolean;
    structuredContent?: Record<string, unknown>;
  }

  export interface ListToolsResult {
    tools: Tool[];
  }

  // Content types
  export interface TextContent {
    type: 'text';
    text: string;
    _meta?: Record<string, unknown>;
  }

  export interface ImageContent {
    type: 'image';
    data: string;
    mimeType: string;
    _meta?: Record<string, unknown>;
  }

  export interface EmbeddedResource {
    type: 'resource';
    resource: {
      uri: string;
      mimeType?: string;
      text?: string;
      blob?: string;
    };
    _meta?: Record<string, unknown>;
  }

  // Zod schemas - these are the request schemas used with setRequestHandler
  export const ListToolsRequestSchema: z.ZodObject<any>;
  export const CallToolRequestSchema: z.ZodObject<any>;
}

declare module '@modelcontextprotocol/sdk/server/index.js' {
  import { z } from 'zod';
  import {
    Tool,
    CallToolRequest,
    CallToolResult,
    ListToolsResult,
  } from '@modelcontextprotocol/sdk/types.js';

  export interface ServerInfo {
    name: string;
    version: string;
  }

  export interface ServerCapabilities {
    tools?: Record<string, unknown>;
    resources?: Record<string, unknown>;
    prompts?: Record<string, unknown>;
    logging?: Record<string, unknown>;
  }

  export interface ServerOptions {
    capabilities?: ServerCapabilities;
    instructions?: string;
  }

  export class Server {
    constructor(serverInfo: ServerInfo, options?: ServerOptions);
    setRequestHandler<T extends z.ZodTypeAny>(
      schema: T,
      handler: (request: z.infer<T>) => Promise<any>
    ): void;
    connect(transport: any): Promise<void>;
    close(): Promise<void>;
  }
}

declare module '@modelcontextprotocol/sdk/server/stdio.js' {
  export class StdioServerTransport {
    constructor();
  }
}

declare module '@modelcontextprotocol/sdk/client/index.js' {
  export class Client {
    constructor(config: { name: string; version: string });
    connect(transport: any): Promise<void>;
    request(method: string, params?: any): Promise<any>;
    close(): Promise<void>;
  }
}

declare module '@modelcontextprotocol/sdk/client/stdio.js' {
  export class StdioClientTransport {
    constructor(config: { command: string; args?: string[]; env?: Record<string, string> });
  }
}
