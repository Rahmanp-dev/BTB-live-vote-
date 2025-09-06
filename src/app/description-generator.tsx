'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { handleGenerateDescription, type FormState } from './actions';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

const initialState: FormState = {
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full text-lg py-6">
      {pending ? (
        'Generating...'
      ) : (
        <>
          <Wand2 className="mr-2 h-5 w-5" /> Generate Description
        </>
      )}
    </Button>
  );
}

export function DescriptionGenerator() {
  const [state, formAction] = useFormState(
    handleGenerateDescription,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (state.description) {
      if (textareaRef.current) {
        textareaRef.current.value = state.description;
      }
      toast({
        title: 'Success!',
        description: 'A new description has been generated.',
      });
    }
  }, [state.description, toast]);

  return (
    <>
      <Toaster />
      <Card className="w-full max-w-2xl shadow-2xl bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">
            AI Description Generator
          </CardTitle>
          <CardDescription>
            Refine existing or create new, engaging descriptions for your
            presenters.
          </CardDescription>
        </CardHeader>
        <form ref={formRef} action={formAction}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Presenter Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Jane Doe"
                  required
                  defaultValue={state.fields?.name}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product">Product/Topic</Label>
                <Input
                  id="product"
                  name="product"
                  placeholder="e.g., AI-Powered Analytics"
                  required
                  defaultValue={state.fields?.product}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                name="category"
                placeholder="e.g., SaaS, Developer Tools"
                required
                defaultValue={state.fields?.category}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="existingDescription">
                Existing Description (Optional)
              </Label>
              <Textarea
                ref={textareaRef}
                id="existingDescription"
                name="existingDescription"
                placeholder="Enter an existing description to refine, or leave blank to generate a new one."
                rows={5}
                defaultValue={state.fields?.existingDescription}
              />
            </div>

            {state.issues && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3">
                <ul className="list-disc list-inside text-sm text-destructive-foreground">
                  {state.issues.map((issue, i) => (
                    <li key={i}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}
            {state.message && !state.issues && !state.description && (
              <p className="text-sm text-destructive">{state.message}</p>
            )}
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
    </>
  );
}
