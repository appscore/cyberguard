import { StartEvent } from "@llamaindex/core/workflow";
import { createFlexibleWorkflow } from "./workflowMgr";

const main = async () => {
  const workflow = await createFlexibleWorkflow("test", "custom_workflow");
  const input =
    "Free entry in 2 a wkly comp to win FA Cup final tkts 21st May 2005. Text FA to 87121 to receive entry question(std txt rate)T&C's apply 08452810075over18's";
  const startEvent = new StartEvent({ input });
  workflow.run(startEvent);
};

main();
