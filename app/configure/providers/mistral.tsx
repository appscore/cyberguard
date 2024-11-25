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

export const MistralForm = ({
  form,
  defaultValues,
}: {
  form: UseFormReturn;
  defaultValues: any;
}) => {
  const supportingModels = ["mistralai/mistral-large-2411", "mistralai/mistral-nemo", "mistralai/ministral-8b" ]; // ["mistral-tiny", "mistral-small", "mistral-medium"];

  return (
    <>
      <FormField
        control={form.control}
        name="api_key"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Mistral API Key (*)</FormLabel>
            <FormControl>
              <PasswordInput
                placeholder={defaultValues.mistral_api_key ?? ""}
                showCopy
                {...field}
              />
            </FormControl>
            <FormDescription>
              You can get your API key from{" "}
              <a href="https://console.mistral.ai/api-keys/" target="_blank">
                https://console.mistral.ai/api-keys/
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
