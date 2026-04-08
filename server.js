import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const SAMBANOVA_API_KEY = process.env.SAMBANOVA_API_KEY;

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.json({ error: "No message provided" });
    }

    const response = await fetch("https://api.sambanova.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SAMBANOVA_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "Meta-Llama-3.1-70B-Instruct", // example model
        temperature: 0.3,
        max_tokens: 200,

        messages: [
          {
            role: "system",
            content: `
You are a strict study AI.

RULES:
- Always return:
  Answer: ...
  Explanation: ...
- Never repeat the question.
- Solve math correctly (factorisation, algebra, identities).
- Be clear and structured.
- Answer all subjects.
            `
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const data = await response.json();

    const text = data?.choices?.[0]?.message?.content;

    if (!text) {
      return res.json({ error: "AI failed" });
    }

    res.json({
      answer: text
    });

  } catch (err) {
    console.error(err);
    res.json({ error: "AI error" });
  }
});

app.listen(3000, () => {
  console.log("SambaNova backend running");
});