import { z } from 'zod';
import { insertAgentSchema, agents } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  agents: {
    list: {
      method: 'GET' as const,
      path: '/api/agents',
      responses: {
        200: z.array(z.custom<typeof agents.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/agents/:id',
      responses: {
        200: z.custom<typeof agents.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/agents',
      input: insertAgentSchema,
      responses: {
        201: z.custom<typeof agents.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/agents/:id',
      input: insertAgentSchema.partial(),
      responses: {
        200: z.custom<typeof agents.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type AgentInput = z.infer<typeof api.agents.create.input>;
export type AgentResponse = z.infer<typeof api.agents.create.responses[201]>;
