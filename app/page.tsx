"use client";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useClientConfig } from "./components/ui/chat/hooks/use-config";

export default function Home() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
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
      .then((res) => setResponse(res.result));
  };

  return (
    <main className="h-screen w-screen flex justify-center items-center background-gradient">
      <div className="space-y-2 lg:space-y-10 w-[90%] lg:w-[60rem]">
        <Box height="65vh">
          <Box
            width={"100%"}
            borderRadius={4}
            height={"100%"}
            boxShadow={2}
            mb={4}
            px={4}
            py={3}
          >
            <Typography variant="body1">{response}</Typography>
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
