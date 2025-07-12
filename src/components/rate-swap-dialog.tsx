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
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import type { SwapRequest } from "@/lib/types";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { useState } from "react";

const formSchema = z.object({
  rating: z.number().min(1).max(5),
  feedback: z.string().optional(),
});

interface RateSwapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  swap: SwapRequest;
  onRateSwap: (swapId: string, rating: number, feedback: string) => void;
}

export function RateSwapDialog({
  open,
  onOpenChange,
  swap,
  onRateSwap,
}: RateSwapDialogProps) {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [ratingValue, setRatingValue] = useState(3);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rating: 3,
      feedback: "",
    },
  });

  if (!currentUser) return null;

  const otherUser = swap.fromUser.id === currentUser.id ? swap.toUser : swap.fromUser;

  function onSubmit(values: z.infer<typeof formSchema>) {
    onRateSwap(swap.id, values.rating, values.feedback || "");
    toast({
      title: "Feedback Submitted!",
      description: `Your rating for the swap with ${otherUser.name} has been recorded.`,
    });
    onOpenChange(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate Your Swap with {otherUser.name}</DialogTitle>
          <DialogDescription>
            Share your experience to help other users.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating: {ratingValue} / 5</FormLabel>
                  <FormControl>
                    <Slider
                      min={1}
                      max={5}
                      step={1}
                      defaultValue={[field.value]}
                      onValueChange={(value) => {
                        field.onChange(value[0]);
                        setRatingValue(value[0]);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="feedback"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Feedback (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={`How was your experience swapping skills with ${otherUser.name}?`}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">
                <Star className="mr-2 h-4 w-4" />
                Submit Rating
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
