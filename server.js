import express from "express";
import fs from "fs";

const app = express();
app.use(express.json());

// =====================
// 🔧 SIMPLE DATABASE
// =====================
const DB_FILE = "./data.json";

let db = {
  flashcards: {}
};

if (fs.existsSync(DB_FILE)) {
  db = JSON.parse(fs.readFileSync(DB_FILE));
}

function saveDB() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// =====================
// 🏠 ROOT ROUTE (FIXES "CANNOT GET /")
// =====================
app.get("/", (req, res) => {
  res.send("✅ Backend is running");
});

// =====================
// 🧠 CHAT (MAIN AI)
// =====================
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ reply: "❌ No message provided" });
    }

    // Simple math detection
    if (/^[0-9+\-*/(). x^]+$/.test(message)) {
      const result = eval(message.replace("x^2", "**2"));
      return res.json({ reply: `🧠 Answer: ${result}` });
    }

    // Default structured reply (replace with real AI later)
    return res.json({
      reply: `🧠 Answer:\n${message}\n\n📘 Explanation:\nThis is a structured response.`
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "❌ AI failed" });
  }
});

// =====================
// 📸 IMAGE ENDPOINT
// =====================
app.post("/image", async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ reply: "❌ No image provided" });
    }

    // Placeholder (plug real vision AI here)
    return res.json({
      reply: `📸 Image received:\n${image}\n\n(Connect vision AI here)`
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "❌ Image processing failed" });
  }
});

// =====================
// 📚 FLASHCARDS
// =====================
app.post("/flashcard/add", (req, res) => {
  const { userId, question, answer } = req.body;

  if (!userId || !question || !answer) {
    return res.status(400).json({ reply: "❌ Missing data" });
  }

  if (!db.flashcards[userId]) {
    db.flashcards[userId] = [];
  }

  db.flashcards[userId].push({ question, answer });
  saveDB();

  res.json({ reply: "✅ Flashcard saved" });
});

app.post("/flashcard/random", (req, res) => {
  const { userId } = req.body;

  const cards = db.flashcards[userId] || [];

  if (cards.length === 0) {
    return res.json({ reply: "❌ No flashcards found" });
  }

  const card = cards[Math.floor(Math.random() * cards.length)];

  res.json({
    question: card.question,
    answer: card.answer
  });
});

// =====================
// 🧪 QUIZ CHECK
// =====================
app.post("/quiz/check", (req, res) => {
  const { correct, answer } = req.body;

  if (!correct) {
    return res.json({ reply: "❌ No active quiz" });
  }

  if (!answer) {
    return res.json({ reply: "❌ No answer provided" });
  }

  if (answer.toLowerCase() === correct.toLowerCase()) {
    return res.json({ reply: "✅ Correct!" });
  }

  res.json({
    reply: `❌ Wrong!\nCorrect answer: ${correct}`
  });
});

// =====================
// 🚀 START SERVER
// =====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});