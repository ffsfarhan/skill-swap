"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { suggestSkills } from "@/ai/flows/suggest-skills";
import type { SuggestSkillsInput } from "@/ai/flows/suggest-skills";
import { Loader2, Wand2 } from "lucide-react";
import { Badge } from "./ui/badge";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  interests: z.string().min(10, "Please describe your interests in a bit more detail."),
});

interface SuggestSkillsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingSkills: string[];
  onAddSkill: (skill: string) => void;
}

export function SuggestSkillsDialog({
  open,
  onOpenChange,
  existingSkills,
  onAddSkill,
}: SuggestSkillsDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedSkills, setSuggestedSkills] = useState<string[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      interests: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setSuggestedSkills([]);
    try {
      const input: SuggestSkillsInput = {
        existingSkills,
        interests: values.interests,
      };
      const result = await suggestSkills(input);
      setSuggestedSkills(result.suggestedSkills);
    } catch (error) {
      console.error("Failed to suggest skills:", error);
      toast({
        title: "Error",
        description: "Could not fetch skill suggestions. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleAddSkill = (skill: string) => {
    onAddSkill(skill);
    setSuggestedSkills(currentSkills => currentSkills.filter(s => s !== skill));
    toast({
        title: "Skill Added!",
        description: `"${skill}" has been added to your profile.`,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Get Skill Suggestions</DialogTitle>
          <DialogDescription>
            Let our AI suggest new skills for you to offer or learn based on your interests.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="interests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Interests & Goals</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., 'I'm a graphic designer interested in learning 3D modeling to expand my services...' or 'I enjoy outdoor activities and want to learn rock climbing.'"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Suggest Skills
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
        {suggestedSkills.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="font-medium">Suggestions:</h4>
            <div className="flex flex-wrap gap-2">
              {suggestedSkills.map((skill, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary/20"
                  onClick={() => handleAddSkill(skill)}
                >
                  {skill} +
                </Badge>
              ))}
            </div>
             <p className="text-xs text-muted-foreground">Click on a skill to add it to your list.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
