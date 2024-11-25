"use client";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useClientConfig } from "./components/ui/chat/hooks/use-config";
type Result = {
  model: string;
  data: {
    classification?: {
      category: string;
      confidenceLevel: string;
      description: string;
    };
    metrics?: {
      severity: number;
      urgency: number;
      sophistication: number;
      potentialImpact: number;
      credibility: number;
      justification: string;
    };
  };
};
interface Response {
  text: string;
  result: Result[];
}
const example = {
  text: "WINNER!! As a valued network customer you have been selected to receivea ¬£900 prize reward! To claim call 09061701461. Claim code KL341. Valid 12 hours only.",
  result: [
    {
      model: "openai",
      data: {
        classification: {
          category: "Scam",
          confidenceLevel: "high",
          description:
            "The message exhibits multiple characteristics of a scam, including an enticing but unrealistic reward, a sense of urgency, a premium rate phone number, and poor grammar/formatting. These signs strongly suggest it is a fraudulent scheme designed to deceive for financial gain.",
        },
        metrics: {
          severity: 75,
          urgency: 85,
          sophistication: 40,
          potentialImpact: 70,
          credibility: 50,
          justification:
            "The scam poses a significant threat due to its financial implications (premium rate charges) and use of urgency to compel action. However, the poor grammar, lack of personalization, and formatting errors reduce its sophistication and credibility. The impact could be moderate to high depending on the victim's response.",
        },
      },
    },
    // {
    //   model: "gemini",
    //   data: {
    //     classification: {
    //       category: "Scam",
    //       confidenceLevel: "high",
    //       description:
    //         "The message is a fraudulent scheme designed to deceive recipients into paying for phone calls to a premium rate number. The unexpected prize notification, premium rate number, short claim period, and generic greeting are all strong indicators of a scam attempt.",
    //     },
    //     metrics: {
    //       Severity: 70,
    //       Urgency: 85,
    //       Sophistication: 20,
    //       "Potential Impact": 60,
    //       Credibility: 30,
    //       justification:
    //         "Severity reflects the high potential for financial loss through premium rate calls. Urgency is high due to the 12-hour claim window. Sophistication is low as the technique is a common phishing tactic. Potential impact is moderate, focused on financial harm. Credibility is low due to the generic greeting, unexpected prize, and premium rate number.",
    //     },
    //   },
    // },
    // {
    //   model: "claude",
    //   data: {
    //     classification: {
    //       category: "Scam",
    //       confidenceLevel: "high",
    //       description:
    //         "Unsolicited message claiming a prize reward with suspicious contact method, designed to deceive recipient into calling a premium rate number for financial gain, exhibiting classic scam characteristics of creating false urgency and promising unearned monetary reward",
    //     },
    //     metrics: {
    //       Severity: 75,
    //       Urgency: 85,
    //       Sophistication: 40,
    //       "Potential Impact": 65,
    //       Credibility: 30,
    //       justification:
    //         "High-risk phishing attempt using classic social engineering tactics, time-sensitive messaging, premium rate number scam with moderate potential financial damage, but relatively low technical complexity and low credibility due to generic communication",
    //     },
    //   },
    // },
  ],
};
export default function Home() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<Partial<Response>>({});
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setQuery(value);
  };

  const handleSubmit = () => {
    const { backend } = useClientConfig();
    const requestBody = {
      messages: [{ content: query, role: "user" }],
    };

    fetch(`${backend}/api/chat`, {
      method: "POST",
      body: JSON.stringify(requestBody),
    })
      .then((res) => res.json())
      .then((res) => {
        console.log("res:", res);
        setResponse(res.data);
      });
  };

  return (
    <main className="h-screen w-screen flex justify-center items-center background-gradient">
      <div className="space-y-2 lg:space-y-10 w-[90%] lg:w-[60rem]">
        <Box height="65vh" borderRadius={4}>
          <Box
            component={Paper}
            width={"100%"}
            borderRadius={4}
            height={"100%"}
            boxShadow={2}
            sx={{ overflowY: "scroll" }}
            mb={4}
            px={4}
            py={3}
          >
            <Typography mb={2} variant="body1">{response.text}</Typography>
            {response.result && (
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Model</TableCell>
                      <TableCell align="right">Category</TableCell>
                      <TableCell align="right">Serverity</TableCell>
                      <TableCell align="right">Credibility</TableCell>
                      <TableCell align="right">Potential Impact</TableCell>
                      <TableCell align="right">Confidence</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {response.result?.map((row, index) => (
                      <TableRow
                        key={index + "-" + row.model}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {row.model}
                        </TableCell>
                        <TableCell align="right">
                          {row.data.classification?.category}
                        </TableCell>
                        <TableCell align="right">
                          {row.data.metrics?.severity}
                        </TableCell>
                        <TableCell align="right">
                          {row.data.metrics?.credibility}
                        </TableCell>
                        <TableCell align="right">
                          {row.data.metrics?.potentialImpact}
                        </TableCell>
                        <TableCell align="right">
                          {row.data.classification?.confidenceLevel}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            <Box>
              <Typography>{response.re}</Typography>
            </Box>
          </Box>
          <Box display={"flex"} gap={2} flexDirection={"row"}>
            <TextField
              fullWidth
              id="outlined-basic"
              placeholder="Type here"
              variant="outlined"
              value={query}
              onChange={handleChange}
            />
            <Button variant="contained" onClick={handleSubmit}>
              Submit
            </Button>
          </Box>
        </Box>
      </div>
    </main>
  );
}
