"use client";

import { ModelConfigList } from "@/app/components/modelConfigList";
import { Button } from "@/app/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

export default function ConfigurePage() {
  const [modelConfigs, setModelConfigs] = useState([{ id: "default" }]);

  const handleModelConfigChange = () => {
    console.log(`Model config changed`);
  };

  const addModelConfig = () => {
    setModelConfigs([...modelConfigs, { id: `model-${Date.now()}` }]);
  };

  const removeModelConfig = (id: string) => {
    if (modelConfigs.length > 1) {
      setModelConfigs(modelConfigs.filter(config => config.id !== id));
    }
  };

  return (
    <>
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Configure
            </h1>
          </div>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <QueryClientProvider client={queryClient}>
            <div className="space-y-6">
              <ModelConfigList
                sectionTitle="Model Configurations"
                sectionDescription="Configure model settings and API keys"
                onConfigChange={handleModelConfigChange}
              />
            </div>
          </QueryClientProvider>
        </div>
      </main>
    </>
  );
}
