import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/components/ui/form";
import { Input } from "@/app/components/ui/input";
import { PasswordInput } from "@/app/components/ui/password-input";
import { UseFormReturn } from "react-hook-form";
import { ModelForm } from "./shared";

export const OpenAIForm = ({
  form,
  defaultValues,
}: {
  form: UseFormReturn;
  defaultValues: any;
}) => {
  const supportingModels = ["openai/gpt-4o-2024-11-20", "openai/o1-mini", "openai/chatgpt-4o-latest"]; //["gpt-4o-mini", "gpt-4o", "gpt-3.5-turbo", "gpt-4"];
  const embeddingModels = ["text-embedding-3-small", "text-embedding-3-large"];

  return (
    <>
      <FormField
        control={form.control}
        name="api_key"
        render={({ field }) => (
          <FormItem>
            <FormLabel>OpenAI API Key (*)</FormLabel>
            <FormControl>
              <PasswordInput
                placeholder={defaultValues.api_key ?? "sk-xxx"}
                showCopy
                {...field}
              />
            </FormControl>
            <FormDescription>
              Get your API key from{" "}
              <a href="https://platform.openai.com/api-keys" target="_blank">
                https://platform.openai.com/api-keys
              </a>
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="flex space-x-4">
        <div className="w-1/2">
          <ModelForm
            form={form}
            defaultValue={defaultValues.model}
            supportedModels={supportingModels}
          />
        </div>
        <div className="w-1/2">
          <ModelForm
            form={form}
            defaultValue={defaultValues.embedding_model}
            supportedModels={embeddingModels}
            title="Embedding Model"
            description="Select a text embedding model to embed text."
            name="embedding_model"
          />
        </div>
      </div>
      <FormField
        control={form.control}
        name="openai_api_base"
        render={({ field }) => (
          <FormItem>
            <FormLabel>OpenAI API Base URL</FormLabel>
            <FormControl>
              <Input
                placeholder={
                  defaultValues.openai_api_base ?? "https://api.openai.com/v1"
                }
                {...field}
              />
            </FormControl>
            <FormDescription>
              Optional, set this if you are using a custom OpenAI API endpoint.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
