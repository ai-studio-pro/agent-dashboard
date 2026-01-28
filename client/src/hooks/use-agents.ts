import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type AgentInput } from "@shared/routes";

// External Maya State API endpoint
const MAYA_STATE_API =
"http://76.13.2.214:5678/webhook/maya/state";
export function useAgents() {
  return useQuery({
    queryKey: ["agents", "maya-state"],
    queryFn: async () => {
      const res = await fetch(MAYA_STATE_API, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch Maya state");
      const data = await res.json();
      // Extract agents array from the response
      return data.agents || [];
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
          throw new Error(await res.text());
        }
        throw new Error("Failed to create agent");
      }
      return api.agents.create.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });
}
