import { motion } from "framer-motion";
import { type Agent } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Cpu, 
  Activity, 
  WifiOff, 
  AlertTriangle, 
  Zap, 
  Clock 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface AgentCardProps {
  agent: Agent;
}

const statusConfig = {
  working: {
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
    icon: Activity,
    label: "Active",
    glow: "shadow-[0_0_15px_-3px_rgba(52,211,153,0.3)]"
  },
  idle: {
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
    icon: Clock,
    label: "Idle",
    glow: "shadow-[0_0_15px_-3px_rgba(96,165,250,0.3)]"
  },
  offline: {
    color: "text-slate-400",
    bg: "bg-slate-400/10",
    border: "border-slate-400/20",
    icon: WifiOff,
    label: "Offline",
    glow: "shadow-none"
  },
  error: {
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/20",
    icon: AlertTriangle,
    label: "Error",
    glow: "shadow-[0_0_15px_-3px_rgba(248,113,113,0.3)]"
  }
};

export function AgentCard({ agent }: AgentCardProps) {
  const status = (agent.status as keyof typeof statusConfig) || 'idle';
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className={`glass-card h-full overflow-hidden border transition-all duration-300 ${config.border} hover:${config.glow}`}>
        <div className={`absolute top-0 left-0 w-full h-1 ${status === 'working' ? 'bg-gradient-to-r from-emerald-500 to-primary animate-pulse' : 'bg-transparent'}`} />
        
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 border border-white/10">
              <AvatarImage src={agent.avatar || undefined} />
              <AvatarFallback className="bg-primary/20 text-primary font-bold font-display">
                {agent.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-lg font-display tracking-wide">{agent.name}</h3>
              <p className="text-xs text-muted-foreground flex items-center">
                <Cpu className="w-3 h-3 mr-1" /> ID: #{agent.id.toString().padStart(4, '0')}
              </p>
            </div>
          </div>
          
          <Badge 
            variant="outline" 
            className={`${config.bg} ${config.color} ${config.border} flex items-center gap-1.5 px-3 py-1`}
          >
            <StatusIcon className="w-3.5 h-3.5" />
            {config.label}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground font-medium">Current Status</span>
              <span className="text-xs text-muted-foreground">
                {agent.lastActive ? formatDistanceToNow(new Date(agent.lastActive), { addSuffix: true }) : 'Never'}
              </span>
            </div>
            
            <div className="p-3 rounded-lg bg-black/20 border border-white/5 backdrop-blur-sm">
              <p className="text-sm font-medium leading-relaxed truncate">
                {agent.currentTask || "No active task assigned."}
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Task Progress</span>
              <span>{agent.progress}%</span>
            </div>
            <Progress 
              value={agent.progress || 0} 
              className="h-1.5 bg-secondary" 
            />
          </div>
        </CardContent>

        <CardFooter className="pt-2">
          <div className="flex flex-wrap gap-2 w-full">
            {agent.capabilities && agent.capabilities.map((cap, i) => (
              <Badge 
                key={i} 
                variant="secondary" 
                className="bg-secondary/50 hover:bg-secondary/70 text-secondary-foreground text-[10px] px-2"
              >
                <Zap className="w-3 h-3 mr-1 text-primary" />
                {cap}
              </Badge>
            ))}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
