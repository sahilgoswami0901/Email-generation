const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const nodemailer = require("nodemailer");
require("dotenv").config(); // Loads .env from backend folder

const app = express();
app.use(cors());
app.use(bodyParser.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY;

app.post("/api/generate-email", async (req, res) => {
  const { recipient, prompt } = req.body;
  const userPrompt = `Write a professional email to ${recipient} about: ${prompt}`;

  try {
    console.log("Generating email using Groq...");

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          { role: "system", content: "You are an expert email writer." },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    const data = await response.json();
    console.log("Groq raw response:", JSON.stringify(data));

    if (data.choices && data.choices.length > 0) {
      res.json({ email: data.choices[0].message.content });
    } else {
      res.status(500).json({ error: "Groq API returned no response" });
    }
  } catch (err) {
    console.error("Groq Error:", err.message);
    res.status(500).json({ error: "Failed to generate email" });
  }
});

app.post("/api/send-email", async (req, res) => {
  const { to, subject, text } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    res.status(200).send("Email sent");
  } catch (err) {
    console.error("Send Error:", err.message);
    res.status(500).send("Failed to send email");
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on http://localhost:${PORT}");
});