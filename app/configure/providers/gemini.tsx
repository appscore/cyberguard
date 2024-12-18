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

export const GeminiForm = ({
  form,
  defaultValues,
}: {
  form: UseFormReturn;
  defaultValues: any;
}) => {
  const supportingModels = ["google/gemini-exp-1121:free", "google/gemini-flash-1.5-8b", "google/gemini-pro-1.5"]; //["gemini-1.0-pro", "gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-1.5-pro", "gemini-1.5-pro-latest"];

  return (
    <>
      <FormField
        control={form.control}
        name="api_key"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Google API Key (*)</FormLabel>
            <FormControl>
              <PasswordInput
                placeholder={defaultValues.api_key ?? ""}
                showCopy
                {...field}
              />
            </FormControl>
            <FormDescription>
              Please follow this page to get an API key{" "}
              <a
                href="https://ai.google.dev/gemini-api/docs/api-key"
                target="_blank"
              >
                https://ai.google.dev/gemini-api/docs/api-key
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
