"use client";

import { ModelConfig } from "@/app/components/model";

const navigation = [
    { name: "Dashboard", href: "#", current: true },
    { name: "Configure", href: "#", current: false },
    { name: "Try it now", href: "#", current: false },
  ];
  const userNavigation = [
    { name: "Your Profile", href: "#" },
    { name: "Settings", href: "#" },
    { name: "Sign out", href: "#" },
  ];
  
  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }
  
  export default function Example() {

    function handleModelConfigChange() {
      // Fetch the app configuration again to update the state
      // fetchIsAppConfigured().then((data) => {
      //   setConfigured(data);
      // });
    }

    return (
      <>
        <header className="bg-white shadow">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Configure 
            </h1>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <ModelConfig
                sectionTitle="Start" //{configured ? "Update model" : "Start"}
                sectionDescription= "Set up an AI model to start the app."
                // {
                //   configured
                //     ? "Change to a different model or use another provider"
                //     : "Set up an AI model to start the app."
                // }
                configured={false}
                onConfigChange={handleModelConfigChange}
              />
          </div>
        </main>
      </>
    );
  }
  