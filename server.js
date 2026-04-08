const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// 🧠 AI FUNCTION
async function askAI(message) {
  const res = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a study tutor. Always respond with Answer and Explanation."
        },
        {
          role: "user",
          content: message
        }
      ]
    },
    {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`
      }
    }
  );

  return res.data.choices[0].message.content;
}

// 💬 CHAT ENDPOINT
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const reply = await askAI(message);

    res.json({ reply });

  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "AI failed" });
  }
});

// 🧪 QUIZ
app.post("/quiz", async (req, res) => {
  const { topic } = req.body;

  const reply = await askAI(
    `Create a quiz question with answer and explanation about: ${topic}`
  );

  res.json({ reply });
});

// 🃏 FLASHCARD
app.post("/flashcard", async (req, res) => {
  const { topic } = req.body;

  const reply = await askAI(
    `Create a flashcard (question + answer) about: ${topic}`
  );

  res.json({ reply });
});

// 📸 IMAGE (basic)
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
              {
                type: "image_url",
                image_url: { url: imageUrl }
              }
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

    res.json({ reply: response.data.choices[0].message.content });

  } catch (err) {
    res.status(500).json({ error: "Image failed" });
  }
});

// 🚀 START
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});