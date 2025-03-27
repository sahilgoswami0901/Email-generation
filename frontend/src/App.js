import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

function App() {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [prompt, setPrompt] = useState("");
  const [emailText, setEmailText] = useState("");
  const [showSend, setShowSend] = useState(false);

  const handleGenerate = async () => {
    const res = await fetch("https://email-sender-d4mq.onrender.com/api/generate-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipient: recipientEmail, prompt })
    });

    const data = await res.json();
    setEmailText(data.email);
    setShowSend(true);
  };

  const handleSend = async () => {
    const res = await fetch("https://email-sender-d4mq.onrender.com/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: recipientEmail,
        subject: "Generated Email",
        text: emailText
      })
    });

    if (res.ok) {
      alert("Email sent successfully!");
      setShowSend(false);
    } else {
      alert("Failed to send email.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Email Generator</h1>

      <input
        type="email"
        placeholder="Recipient Email"
        value={recipientEmail}
        onChange={(e) => setRecipientEmail(e.target.value)}
        style={{ width: "300px", marginBottom: "10px", display: "block" }}
      />

      <input
        type="text"
        placeholder="Prompt"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        style={{ width: "300px", marginBottom: "10px", display: "block" }}
      />

      <button onClick={handleGenerate}>Generate Email</button>

      <div style={{ marginTop: "20px" }}>
        <ReactQuill value={emailText} onChange={setEmailText} />
      </div>

      {showSend && (
        <button onClick={handleSend} style={{ marginTop: "20px" }}>
          Send Email
        </button>
      )}
    </div>
  );
}

export default App;