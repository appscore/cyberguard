import {
  ModelConfigSchema,
  fetchModelConfig,
  getDefaultProviderConfig,
  supportedProviders,
  updateModelConfig,
} from "@/app/client/providers";
import { ExpandableSection } from "@/app/components/ui/expandableSection";
import { SubmitButton } from "@/app/components/ui/submitButton";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/app/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { toast } from "@/app/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { AzureOpenAIForm } from "@/app/configure/providers/azureOpenai";
import { GeminiForm } from "@/app/configure/providers/gemini";
import { GroqForm } from "@/app/configure/providers/groq";
import { MistralForm } from "@/app/configure/providers/mistral";
import { OllamaForm } from "@/app/configure/providers/ollama";
import { OpenAIForm } from "@/app/configure/providers/openai";
import { TSystemsForm } from "@/app/configure/providers/t-systems";

export const ModelConfig = ({
  sectionTitle,
  sectionDescription,
  config,
  onConfigChange,
  //refetch,
  queryClient,
  isLoading
}: {
  sectionTitle: string;
  sectionDescription: string;
  config: any;
  onConfigChange: () => void;
  //refetch: () => void;
  queryClient: any;
  isLoading: boolean
}) => {
  const form = useForm({
    resolver: zodResolver(ModelConfigSchema),
    defaultValues: {
      ...getDefaultProviderConfig("openai"),
    },
    values: config,
  });

  const { mutate: updateConfig, isLoading: isSubmitting } = useMutation(
    updateModelConfig,
    {
      onError: (error: Error) => {
        console.error(error);
        toast({
          title: error.message,
          variant: "destructive",
          duration: 5000,
        });
        // Fetch the model config again to reset the form
        // refetch().then(() => {
        //   form.reset(config);
        // });
      },
      onSuccess: () => {
        toast({
          title: "Model config updated successfully",
        });
        //refetch();
        onConfigChange();
        // Invalidate the checkSupportedModel query
        queryClient.invalidateQueries("checkSupportedModel");
      },
    },
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Run zod form validation
    await form.trigger().then((isValid) => {
      if (isValid) {
        const updatedConfig = form.getValues();
        updateConfig(updatedConfig);
      }
    });
  }

  const getModelForm = (form: any, defaultValues: any) => {
    switch (defaultValues.model_provider ?? "") {
      case "openai":
        return <OpenAIForm form={form} defaultValues={defaultValues} />;
      case "ollama":
        return <OllamaForm form={form} defaultValues={defaultValues} />;
      case "gemini":
        return <GeminiForm form={form} defaultValues={defaultValues} />;
      case "azure-openai":
        return <AzureOpenAIForm form={form} defaultValues={defaultValues} />;
      case "t-systems":
        return <TSystemsForm form={form} defaultValues={defaultValues} />;
      case "mistral":
        return <MistralForm form={form} defaultValues={defaultValues} />;
      case "groq":
        return <GroqForm form={form} defaultValues={defaultValues} />;
      default:
        return null;
    }
  };

  const changeModelProvider = async (modelProvider: string) => {
    // If user changes the model provider
    // we need to reset the model config to the default value of the provider
    const newConfig = {
      ...form.getValues(),
      ...getDefaultProviderConfig(modelProvider),
    };
    // Assign the configured state to the new provider to keep the state (showing the Chat config or not)
    form.reset(newConfig);
  };

  return (
    <ExpandableSection
      open={true}
      isLoading={isLoading}
      name="update-model"
      title={sectionTitle}
      description={sectionDescription}
    >
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-4 mb-4">
          <FormField
            control={form.control}
            name="model_provider"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Model Provider</FormLabel>
                <FormControl>
                  <Select
                    defaultValue={form.getValues().model_provider ?? "openai"}
                    onValueChange={changeModelProvider}
                    {...field}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="OpenAI" />
                    </SelectTrigger>
                    <SelectContent>
                      {supportedProviders.map((provider: any) => (
                        <SelectItem
                          key={provider.value}
                          value={provider.value}
                        >
                          {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>
                  * Note: Only OpenAI, Groq, Azure-OpenAI support
                  multi-agents.
                </FormDescription>
              </FormItem>
            )}
          />

          {getModelForm(form, form.getValues())}
          <div className="mt-4">
            <SubmitButton isSubmitting={isSubmitting} />
          </div>
        </form>
      </Form>
    </ExpandableSection>
  );
};
