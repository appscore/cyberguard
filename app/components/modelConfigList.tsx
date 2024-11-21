import { useQuery, useQueryClient } from "react-query";
import { fetchModelConfig } from "../client/providers";
import { ModelConfig } from "./model";

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
    const {
      data: configs = [],
      isLoading: isFetching,
      //refetch,
      isRefetching,
    } = useQuery("modelConfig", fetchModelConfig, {
      refetchOnWindowFocus: false,
    });
  
    const isLoading = isFetching || isRefetching;
  
    return (
      <div>
        {Array.isArray(configs) && configs.map((config: any, index: number) => (
          <ModelConfig
            key={index}
            sectionTitle={sectionTitle}
            sectionDescription={sectionDescription}
            config={config}
            onConfigChange={onConfigChange}
            //refetch={refetch}
            queryClient={queryClient}
            isLoading={isLoading}
          />
        ))}
      </div>
    );
  };