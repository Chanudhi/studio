
"use client";

import React, { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { getRecipeSuggestionsAction, type FormState } from "@/app/actions";
import { Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  ingredients: z.string().min(3, {
    message: "Please enter at least one ingredient (minimum 3 characters).",
  }),
  dietaryRestrictions: z.string().optional(),
  cuisinePreferences: z.string().optional(),
});

type IngredientFormProps = {
  onFormSubmitResult: (state: FormState) => void;
  setIsLoading: (isLoading: boolean) => void;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto text-base py-3 px-6">
      {pending ? (
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      ) : (
        <Sparkles className="mr-2 h-5 w-5" />
      )}
      Suggest Recipes
    </Button>
  );
}

export default function IngredientForm({ onFormSubmitResult, setIsLoading }: IngredientFormProps) {
  const [state, formAction] = useFormState(getRecipeSuggestionsAction, {recipes: [], error: undefined, message: undefined});
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ingredients: "",
      dietaryRestrictions: "",
      cuisinePreferences: "",
    },
  });
  
  const { formState: { isSubmitting } } = form;

  useEffect(() => {
    setIsLoading(isSubmitting);
  }, [isSubmitting, setIsLoading]);
  
  useEffect(() => {
    // This effect handles the result from the server action
    // It ensures onFormSubmitResult is called after the state is updated
    onFormSubmitResult(state);
    if (state.error) {
      toast({
        title: "Oops!",
        description: state.error,
        variant: "destructive",
      });
    } else if (state.message) {
       toast({
        title: "Success!",
        description: state.message,
       });
       if(state.recipes && state.recipes.length > 0) {
         form.reset(); // Reset form fields on successful recipe generation
       }
    }
  }, [state, onFormSubmitResult, toast, form]);


  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    formData.append("ingredients", values.ingredients);
    if (values.dietaryRestrictions) {
      formData.append("dietaryRestrictions", values.dietaryRestrictions);
    }
    if (values.cuisinePreferences) {
      formData.append("cuisinePreferences", values.cuisinePreferences);
    }
    setIsLoading(true); // Set loading true immediately on submit
    formAction(formData); // Call the server action
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-6 bg-card shadow-lg rounded-lg border border-border">
        <FormField
          control={form.control}
          name="ingredients"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold">Available Ingredients</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., chicken breast, broccoli, soy sauce, rice"
                  className="resize-none text-base"
                  {...field}
                  rows={3}
                />
              </FormControl>
              <FormDescription>
                Enter ingredients you have, separated by commas.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="dietaryRestrictions"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold">Dietary Restrictions (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., vegetarian, gluten-free, vegan" {...field} className="text-base" />
                </FormControl>
                <FormDescription>
                  Any dietary needs?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cuisinePreferences"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold">Cuisine Preferences (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Italian, Mexican, Asian" {...field} className="text-base"/>
                </FormControl>
                 <FormDescription>
                  Craving a specific cuisine?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-center pt-2">
           <SubmitButton />
        </div>
      </form>
    </Form>
  );
}
