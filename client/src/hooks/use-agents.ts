import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type AgentInput } from "@shared/routes";

// GET /api/agents
export function useAgents() {
  return useQuery({
    queryKey: [api.agents.list.path],
    queryFn: async () => {
      const res = await fetch(api.agents.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch agents");
      return api.agents.list.responses[200].parse(await res.json());
    },
  });
}

// GET /api/agents/:id
export function useAgent(id: number) {
  return useQuery({
    queryKey: [api.agents.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.agents.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch agent");
      return api.agents.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

// POST /api/agents
export function useCreateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: AgentInput) => {
      const validated = api.agents.create.input.parse(data);
      const res = await fetch(api.agents.create.path, {
        method: api.agents.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.agents.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create agent");
      }
      return api.agents.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.agents.list.path] });
    },
  });
}

// PUT /api/agents/:id
export function useUpdateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<AgentInput>) => {
      const validated = api.agents.update.input.parse(updates);
      const url = buildUrl(api.agents.update.path, { id });
      const res = await fetch(url, {
        method: api.agents.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 404) throw new Error("Agent not found");
        throw new Error("Failed to update agent");
      }
      return api.agents.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.agents.list.path] });
    },
  });
}
