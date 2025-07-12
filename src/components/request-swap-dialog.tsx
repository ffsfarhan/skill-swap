"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { GitFork, ArrowDown } from "lucide-react";
import type { User, Skill, SwapRequest } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { useData } from "@/context/data-context";

const formSchema = z.object({
  wantedSkillId: z.string({ required_error: "Please select a skill you want." }),
  offeredSkillId: z.string({ required_error: "Please select a skill to offer." }),
  message: z.string().optional(),
});

interface RequestSwapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetUser: User;
}

export function RequestSwapDialog({
  open,
  onOpenChange,
  targetUser,
}: RequestSwapDialogProps) {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const { addSwapRequest } = useData();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        message: `Hi ${targetUser.name}, I'm interested in learning one of your skills and would love to swap!`
    }
  });
  
  if (!currentUser) return null;

  function onSubmit(values: z.infer<typeof formSchema>) {
    const wantedSkill = targetUser.skillsOffered.find(s => s.id === values.wantedSkillId);
    const offeredSkill = currentUser!.skillsOffered.find(s => s.id === values.offeredSkillId);

    if (!wantedSkill || !offeredSkill) {
        toast({
            title: "Error",
            description: "Selected skill not found. Please try again.",
            variant: "destructive"
        });
        return;
    }

    const newSwapRequest: Omit<SwapRequest, 'id'> = {
        fromUser: currentUser!,
        toUser: targetUser,
        offeredSkill,
        wantedSkill,
        status: 'pending',
        createdAt: new Date(),
        message: values.message,
    };
    
    addSwapRequest(newSwapRequest);

    toast({
        title: "Swap Request Sent!",
        description: `Your request has been sent to ${targetUser.name}.`,
    });
    onOpenChange(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request a Skill Swap</DialogTitle>
          <DialogDescription>
            Propose a skill exchange with {targetUser.name}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <FormField
              control={form.control}
              name="wantedSkillId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skill you want from {targetUser.name}</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a skill to learn" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {targetUser.skillsOffered.map(skill => (
                        <SelectItem key={skill.id} value={skill.id}>{skill.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-center items-center">
                <ArrowDown className="h-5 w-5 text-muted-foreground" />
            </div>

            <FormField
              control={form.control}
              name="offeredSkillId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skill you'll offer in return</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a skill to teach" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {currentUser.skillsOffered.map(skill => (
                        <SelectItem key={skill.id} value={skill.id}>{skill.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Introduce yourself and explain why you're interested in this swap."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">
                 <GitFork className="mr-2 h-4 w-4" />
                 Send Request
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
