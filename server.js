const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// 🧠 MEMORY
const memory = new Map();

// 🧠 STRICT AI
async function askAI(messages) {
  const res = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4o-mini",
      messages,
      temperature: 0
    },
    {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`
      }
    }
  );

  return res.data.choices[0].message.content;
}

// 💬 CHAT
app.post("/chat", async (req, res) => {
  try {
    const { userId, message } = req.body;

    if (!memory.has(userId)) {
      memory.set(userId, []);
    }

    const history = memory.get(userId);

    const messages = [
      {
        role: "system",
        content: `
You are a STRICT study AI.

Rules:
- NEVER guess
- If unsure → say "I don't know"
- Be accurate
- Show full math steps
- Format:

Answer:
Explanation:
`
      },
      ...history,
      { role: "user", content: message }
    ];

    const reply = await askAI(messages);

    history.push({ role: "user", content: message });
    history.push({ role: "assistant", content: reply });

    if (history.length > 20) history.splice(0, 2);

    res.json({ reply });

  } catch (err) {
    console.log(err.response?.data || err.message);
    res.status(500).json({ error: "AI failed" });
  }
});

// 🔥 RESET MEMORY
app.post("/reset", (req, res) => {
  const { userId } = req.body;

  memory.delete(userId);

  res.json({ message: "Memory cleared" });
});

// 🧪 QUIZ
app.post("/quiz", async (req, res) => {
  const { topic } = req.body;

  const reply = await askAI([
    { role: "system", content: "Create a quiz with answer and explanation." },
    { role: "user", content: topic }
  ]);

  res.json({ reply });
});

// 🃏 FLASHCARD
app.post("/flashcard", async (req, res) => {
  const { topic } = req.body;

  const reply = await askAI([
    { role: "system", content: "Create a flashcard (Q&A)." },
    { role: "user", content: topic }
  ]);

  res.json({ reply });
});

// 📸 IMAGE
app.post("/image", async (req, res) => {
  const { imageUrl, prompt } = req.body;

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt || "Explain this image" },
              { type: "image_url", image_url: { url: imageUrl } }
            ]
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`
        }
      }
    );

    res.json({
      reply: response.data.choices[0].message.content
    });

  } catch {
    res.status(500).json({ error: "Image failed" });
  }
});

// 🚀 START
app.listen(PORT, () => {
  console.log("🚀 Backend running (FINAL)");
});