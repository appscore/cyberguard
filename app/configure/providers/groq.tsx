import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/components/ui/form";
import { PasswordInput } from "@/app/components/ui/password-input";
import { UseFormReturn } from "react-hook-form";
import { ModelForm } from "./shared";

export const GroqForm = ({
  form,
  defaultValues,
}: {
  form: UseFormReturn;
  defaultValues: any;
}) => {
  const supportingModels = ["x-ai/grok-2-mini", "x-ai/grok-2", "x-ai/grok-vision-beta"];
    // Llama
    // "llama-3.1-70b-versatile",
    // "llama-3.1-8b-instant",
    // "llama3-8b-8192",
    // "llama3-70b-8192",
    // "llama3-groq-70b-8192-tool-use-preview",
    // "llama3-groq-8b-8192-tool-use-preview",
    // // Mixtral
    // "mixtral-8x7b-32768",
    // // Gemma
    // "gemma2-9b-it",
    // "gemma-7b-it",
    // // LLaVA
    // "llava-v1.5-7b-4096-preview",


  return (
    <>
      <FormField
        control={form.control}
        name="api_key"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Groq API Key (*)</FormLabel>
            <FormControl>
              <PasswordInput
                placeholder={defaultValues.api_key ?? "sk-xxx"}
                showCopy
                {...field}
              />
            </FormControl>
            <FormDescription>
              Get your API key from{" "}
              <a href="https://console.groq.com/keys" target="_blank">
                https://console.groq.com/keys
              </a>
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <ModelForm
        form={form}
        defaultValue={defaultValues.model}
        supportedModels={supportingModels}
      />
    </>
  );
};
