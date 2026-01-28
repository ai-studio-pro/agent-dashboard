import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  app.get(api.agents.list.path, async (req, res) => {
    const agents = await storage.getAgents();
    res.json(agents);
  });

  app.get(api.agents.get.path, async (req, res) => {
    const agent = await storage.getAgent(Number(req.params.id));
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }
    res.json(agent);
  });

  app.post(api.agents.create.path, async (req, res) => {
    try {
      const input = api.agents.create.input.parse(req.body);
      const agent = await storage.createAgent(input);
      res.status(201).json(agent);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      throw err;
    }
  });

  app.put(api.agents.update.path, async (req, res) => {
    try {
      const input = api.agents.update.input.parse(req.body);
      const agent = await storage.updateAgent(Number(req.params.id), input);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      res.json(agent);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      throw err;
    }
  });

  await seedDatabase();

  // 🔄 Fetch Maya system state from external API
  app.get("/api/maya/state", async (req, res) => {
    try {
      const response = await fetch(
        "https://paint-farming-rocky-street.trycloudflare.com/webhook-test/maya/state",
      );
      const data = await response.json();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 💬 Chat with Dispatcher - Send message/task to Maya
  app.post("/api/dispatcher/chat", async (req, res) => {
    try {
      const { message, taskType = "general", priority = "medium" } = req.body;

      // Send to Maya Dispatcher
      const response = await fetch(
        "https://paint-farming-rocky-street.trycloudflare.com/webhook-test/maya/dispatcher",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, taskType, priority }),
        },
      );

      const result = await response.json();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 📡 SSE endpoint for real-time system state updates
  app.get("/api/sse/state", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Send initial state
    const sendUpdate = async () => {
      try {
        const response = await fetch(
          "https://paint-farming-rocky-street.trycloudflare.com/webhook-test/maya/state",
        );
        const data = await response.json();
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      } catch (err) {
        console.error("SSE error:", err);
      }
    };

    sendUpdate();

    // Poll every 5 seconds
    const interval = setInterval(sendUpdate, 5000);

    req.on("close", () => {
      clearInterval(interval);
    });
  });

  // ✅ Create new task
  app.post("/api/tasks/create", async (req, res) => {
    try {
      const {
        taskType,
        issue,
        priority = "medium",
        urgency = "normal",
      } = req.body;

      const response = await fetch(
        "https://paint-farming-rocky-street.trycloudflare.com/webhook-test/maya/tasks",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            taskType,
            payload: { issue, priority, urgency },
          }),
        },
      );

      const task = await response.json();
      res.status(201).json(task);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 🔄 Update task status
  app.put("/api/tasks/:id/status", async (req, res) => {
    try {
      const { status, result } = req.body;

      const response = await fetch(
        `https://paint-farming-rocky-street.trycloudflare.com/webhook-test/maya/tasks/${req.params.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status, result }),
        },
      );

      const task = await response.json();
      res.json(task);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
  return httpServer;
}

async function seedDatabase() {
  const existingAgents = await storage.getAgents();
  if (existingAgents.length === 0) {
    const seeds = [
      {
        name: "Omni-1",
        status: "working",
        currentTask: "Analyzing financial reports for Q4",
        capabilities: ["Data Analysis", "Financial Modeling", "Reporting"],
        progress: 65,
        avatar: "https://i.pravatar.cc/150?u=omni",
      },
      {
        name: "Coder-X",
        status: "idle",
        currentTask: null,
        capabilities: ["Python", "JavaScript", "Code Review"],
        progress: 0,
        avatar: "https://i.pravatar.cc/150?u=coder",
      },
      {
        name: "SupportBot-Alpha",
        status: "working",
        currentTask: "Resolving ticket #49221 - Payment Issue",
        capabilities: ["Customer Support", "Ticketing", "Email"],
        progress: 32,
        avatar: "https://i.pravatar.cc/150?u=support",
      },
      {
        name: "Vision-Pro",
        status: "offline",
        currentTask: null,
        capabilities: ["Image Recognition", "Video Processing"],
        progress: 0,
        avatar: "https://i.pravatar.cc/150?u=vision",
      },
      {
        name: "Writer-Gpt",
        status: "working",
        currentTask: "Drafting blog post: 'The Future of AI'",
        capabilities: ["Content Writing", "SEO", "Editing"],
        progress: 88,
        avatar: "https://i.pravatar.cc/150?u=writer",
      },
    ];

    for (const seed of seeds) {
      await storage.createAgent(seed);
    }
    console.log("Seeded database with initial agents");
  }
}
