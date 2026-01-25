import { motion } from "framer-motion";
import { type Agent } from "@shared/schema";
import { Activity, Server, Cpu, Database } from "lucide-react";

interface StatsOverviewProps {
  agents: Agent[];
}

export function StatsOverview({ agents }: StatsOverviewProps) {
  const totalAgents = agents.length;
  const activeAgents = agents.filter(a => a.status === 'working').length;
  const idleAgents = agents.filter(a => a.status === 'idle').length;
  const avgProgress = totalAgents > 0 
    ? Math.round(agents.reduce((acc, curr) => acc + (curr.progress || 0), 0) / totalAgents) 
    : 0;

  const stats = [
    {
      label: "Total Units",
      value: totalAgents,
      icon: Server,
      color: "text-blue-400",
      bg: "bg-blue-400/10"
    },
    {
      label: "Active Processes",
      value: activeAgents,
      icon: Activity,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10"
    },
    {
      label: "System Idle",
      value: idleAgents,
      icon: Cpu,
      color: "text-purple-400",
      bg: "bg-purple-400/10"
    },
    {
      label: "Avg Efficiency",
      value: `${avgProgress}%`,
      icon: Database,
      color: "text-primary",
      bg: "bg-primary/10"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-card/40 backdrop-blur border border-white/5 rounded-2xl p-4 flex items-center space-x-4 hover:bg-card/60 transition-colors"
        >
          <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
            <stat.icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{stat.label}</p>
            <h4 className="text-2xl font-bold font-display">{stat.value}</h4>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
