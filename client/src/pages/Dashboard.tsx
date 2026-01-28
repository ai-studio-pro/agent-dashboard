import { useAgents } from "@/hooks/use-agents";
import { AgentCard } from "@/components/AgentCard";
import { CreateAgentDialog } from "@/components/CreateAgentDialog";
import { StatsOverview } from "@/components/StatsOverview";
import { Chat } from "@/components/Chat";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, LayoutGrid, List } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Dashboard() {
  const { data: agents, isLoading, error, refetch } = useAgents();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert
          variant="destructive"
          className="max-w-md bg-destructive/10 border-destructive/20"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>
            Failed to synchronize with the agent network.
            <Button
              variant="link"
              onClick={() => refetch()}
              className="text-destructive-foreground pl-1 h-auto p-0"
            >
              Retry connection?
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-background to-background text-foreground p-6 md:p-12 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="fixed top-0 left-0 w-full h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -translate-y-1/2" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl md:text-5xl font-bold font-display tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50 mb-2"
            >
              Maya UI
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-lg"
            >
              Autonomous Agent Network Monitor
            </motion.p>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-card/50 p-1 rounded-lg border border-white/5 hidden md:flex">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode("grid")}
                className={
                  viewMode === "grid"
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground"
                }
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode("list")}
                className={
                  viewMode === "list"
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground"
                }
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
            <CreateAgentDialog />
          </div>
        </header>

        {/* Stats */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton
                key={i}
                className="h-24 w-full rounded-2xl bg-card/50"
              />
            ))}
          </div>
        ) : (
          <StatsOverview agents={agents || []} />
        )}

        {/* Grid Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton
                key={i}
                className="h-[280px] w-full rounded-2xl bg-card/50"
              />
            ))}
          </div>
        ) : agents && agents.length > 0 ? (
          <>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
            >
              {agents.map((agent) => (
                <motion.div
                  key={agent.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 },
                  }}
                >
                  <AgentCard agent={agent} />
                </motion.div>
              ))}
            </motion.div>

            {/* Chat Component */}
            <div className="mt-8">
              <Chat />
            </div>
          </>
        ) : (
          <div className="text-center py-24 bg-card/20 rounded-3xl border border-white/5 border-dashed">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 mb-4">
              <LayoutGrid className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium mb-2">
              No active agents detected
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              The neural network is currently dormant. Deploy a new agent to
              begin processing tasks.
            </p>
            <CreateAgentDialog />
          </div>
        )}
      </div>
    </div>
  );
}
