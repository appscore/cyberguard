import csv from "csv-parser";
import fs from "fs";
import path from "path";
import { runWorkflowsForAllModels } from "../workflow/utils";
interface CsvRow {
  category: string;
  message: string;
}

function loadCsv(filePath: string): Promise<CsvRow[]> {
  return new Promise((resolve, reject) => {
    const results: CsvRow[] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => {
        // Ensure type compatibility
        const row: CsvRow = {
          category: data.Category,
          message: data.Message,
        };
        results.push(row);
      })
      .on("end", () => resolve(results))
      .on("error", (error) => reject(error));
  });
}

async function main() {
  const csvFilePath = path.join(__dirname, "spam.csv"); // Adjust file path
  try {
    const rows: CsvRow[] = await loadCsv(csvFilePath);

    const topRows = rows.slice(0, 50);
    // console.log("CSV Data:", topRows);
    const comparision: any = {
      totalHumanSpam: 0,
      totalHumanHam: 0,
    };
    const metric = {
      totalAISpam: 0,
      totalAIHam: 0,

      totalFalseSpam: 0,
      totalFalseHam: 0,
    };
    for (const row of topRows) {
      const workflowResponse = await runWorkflowsForAllModels(row.message);
      console.log("Result:", workflowResponse);
      if (row.category === "ham") comparision.totalHumanHam += 1;
      if (row.category === "spam") comparision.totalHumanSpam += 1;
      for (const res of workflowResponse) {
        const model = res.model;
        if (!comparision[model]) comparision[model] = { ...metric };

        if (res.data.classification.category === "ham")
          comparision[model].totalAIHam += 1;
        if (res.data.classification.category !== "ham") {
          console.log("model", model);
          comparision[model].totalAISpam += 1;
        }
        if (
          row.category === "ham" &&
          res.data.classification.category !== "ham"
        )
          comparision[model].totalFalseHam += 1;
        if (
          row.category === "spam" &&
          res.data.classification.category === "ham"
        )
          comparision[model].totalFalseSpam += 1;
      }
    }
    console.log("Comparision:", comparision);
  } catch (error) {
    console.error("Error loading CSV:", error);
  }
}

main();
