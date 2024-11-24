import { useQuery, useQueryClient } from "react-query";
import { fetchModelConfig, updateModelConfig, deleteModelConfig } from "../client/providers";
import { ModelConfig } from "./model";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";

export const ModelConfigList = ({
  sectionTitle,
  sectionDescription,
  onConfigChange,
}: {
  sectionTitle: string;
  sectionDescription: string;
  onConfigChange: () => void;
}) => {
  const queryClient = useQueryClient();
  const [configs, setConfigs] = useState<any[]>([]);
  const {
    data: fetchedConfigs = [],
    isLoading: isFetching,
    isRefetching,
  } = useQuery("modelConfig", fetchModelConfig, {
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      if (Array.isArray(data)) {
        setConfigs(data);
      } else {
        console.error("Fetched data is not an array");
      }
    },
  });

  const isLoading = isFetching || isRefetching;

  const addModelConfig = () => {
    const newConfig = {
      id: (configs.length + 1).toString(),
      model_provider: "openai",
      model: null,
      embedding_model: null,
      embedding_dim: null,
      configured: false,
      api_key: null,
      openai_api_base: null,
    };
    setConfigs([...configs, newConfig]);
  };

  const updateConfig = async (config: any) => {
    try {
      await updateModelConfig(config);
      onConfigChange();
      queryClient.invalidateQueries("modelConfig");
    } catch (error) {
      console.error("Failed to update model config", error);
    }
  };

  const deleteConfig = async (id: string) => {
    try {
      await deleteModelConfig(id);
      setConfigs(configs.filter(config => config.id !== id));
      onConfigChange();
      queryClient.invalidateQueries("modelConfig");
    } catch (error) {
      console.error("Failed to delete model config", error);
    }
  };

  return (
    <div>
      <div>
        {Array.isArray(configs) && configs.map((config: any, index: number) => (
          <ModelConfig
            key={index}
            sectionTitle={sectionTitle}
            sectionDescription={sectionDescription}
            config={config}
            onConfigChange={() => updateConfig(config)}
            queryClient={queryClient}
            isLoading={isLoading}
            onDelete={() => deleteConfig(config.id)}
          />
        ))}
      </div>
      <Button onClick={addModelConfig} className="flex items-center gap-2" variant="outline">
        <Plus className="h-4 w-4" />
        Add Model
      </Button>
    </div>
  );
};
