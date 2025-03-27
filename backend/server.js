const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY; // Make sure it's set on Render

// === Generate Email using Groq ===
app.post("/api/generate-email", async (req, res) => {
  const { recipient, prompt } = req.body;
  const userPrompt = `Write a professional email to ${recipient} about: ${prompt}`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          { role: "system", content: "You are an expert email writer." },
          { role: "user", content: userPrompt }
        ]
      })
    });

    const data = await response.json();

    if (data.choices && data.choices.length > 0) {
      const email = data.choices[0].message.content;
      res.json({ email });
    } else {
      res.status(500).json({ error: "No valid response from Groq API" });
    }
  } catch (err) {
    console.error("Groq API Error:", err);
    res.status(500).json({ error: "Email generation failed" });
  }
});

// === Send Email using Nodemailer ===
app.post("/api/send-email", async (req, res) => {
  const { to, subject, text } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,       // Gmail address
      pass: process.env.EMAIL_PASS        // Gmail App Password
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send("Email sent");
  } catch (err) {
    console.error("Email Send Error:", err);
    res.status(500).send("Failed to send email");
  }
});

// === Start Server ===
// const PORT = process.env.PORT || 5000;
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});