const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

/* =======================
   ENV
======================= */
const PORT = process.env.PORT || 5001;
const PYTHON_SERVER_URL = process.env.PYTHON_SERVER_URL;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY is missing in .env");
  process.exit(1);
}

/* =======================
   ROUTES
======================= */
app.get('/', (req, res) => {
  res.status(200).send('OK');
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.post('/get-welcome-message', async (req, res) => {
  const { fullname } = req.body;

  if (!fullname || typeof fullname !== 'string') {
    return res.status(400).json({ message: "fullname is required" });
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a friendly, funny assistant."
          },
          {
            role: "user",
            content: `Write a short, funny, and welcoming 1-sentence welcome message for a new user named ${fullname}.`
          }
        ],
        max_tokens: 50,
        temperature: 0.8
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 10000
      }
    );

    res.json({
      message: response.data.choices[0].message.content
    });

  } catch (error) {
    console.error(
      "❌ OpenAI Error:",
      error.response?.data || error.message
    );

    // graceful fallback
    res.json({
      message: `Welcome to the app, ${fullname}! 🚀`
    });
  }
});

/* =======================
   SERVER
======================= */
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Node server running on port ${PORT}`);
  console.log(`🔗 Python server URL: ${PYTHON_SERVER_URL}`);
});
