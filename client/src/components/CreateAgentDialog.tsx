import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAgentSchema } from "@shared/schema";
import { useCreateAgent } from "@/hooks/use-agents";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = insertAgentSchema.extend({
  capabilitiesString: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function CreateAgentDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const createAgent = useCreateAgent();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      status: "idle",
      currentTask: "",
      progress: 0,
      capabilities: [],
      capabilitiesString: "",
    },
  });

  const onSubmit = (data: FormData) => {
    // Transform string input to array for capabilities
    const capabilities = data.capabilitiesString
      ? data.capabilitiesString.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    createAgent.mutate(
      {
        ...data,
        capabilities,
        status: "idle", // Default to idle
        progress: 0,
      },
      {
        onSuccess: () => {
          setOpen(false);
          form.reset();
          toast({
            title: "Agent Initialized",
            description: `${data.name} is now online and ready for tasks.`,
          });
        },
        onError: (error) => {
          toast({
            title: "Initialization Failed",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_-5px_hsla(var(--primary)/0.5)] transition-all hover:scale-105 font-semibold">
          <Plus className="w-4 h-4 mr-2" />
          Deploy New Agent
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card border-border/50 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl">
            <Sparkles className="w-5 h-5 text-primary" />
            Initialize Agent
          </DialogTitle>
          <DialogDescription>
            Configure a new AI agent node. Define capabilities and assign an identity.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Designation Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Nexus-7, Alpha-Core" {...field} className="bg-secondary/20" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="capabilitiesString"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capabilities</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. Image Gen, Code Analysis, Data Mining" 
                      {...field} 
                      className="bg-secondary/20"
                    />
                  </FormControl>
                  <FormDescription>
                    Comma-separated list of functional modules.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                className="border-white/10 hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createAgent.isPending}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {createAgent.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  "Deploy Unit"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
