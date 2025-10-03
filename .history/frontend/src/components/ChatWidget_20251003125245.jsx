import React, { useState } from "react";

const ChatWidget = () => {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hello Ritesh! How can I assist you today?" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    // add user message
    const newMessages = [...messages, { role: "user", text: input }];
    setMessages(newMessages);

    // simulate bot reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            "Sure, Ritesh! The Master of Computer Applications (MCA) is a three-year postgraduate program designed to provide you with advanced knowledge in software development, computer science, and IT. Here's a brief overview:\n\n1. Core Subjects: You'll study subjects like Data Structures, Database Management Systems, Software Engineering, and Web Technologies.\n2. Focus Areas: The program emphasizes practical skills with programming languages, networking, and application development.\n3. Projects: You'll be required to complete projects, which help you apply theoretical knowledge to real-world situations.\n4. Career Opportunities: Graduates can pursue careers in software development, IT consultancy, systems management and more.",
        },
      ]);
    }, 1200);

    setInput("");
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "320px",
        height: "450px",
        background: "#fff",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#2563eb",
          color: "white",
          padding: "10px",
          fontWeight: "bold",
          fontSize: "16px",
        }}
      >
        Ask AI 🤖
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          padding: "10px",
          overflowY: "auto",
          background: "#f9fafb",
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                padding: "8px 12px",
                borderRadius: "16px",
                background: m.role === "user" ? "#2563eb" : "#e5e7eb",
                color: m.role === "user" ? "white" : "#111827",
                maxWidth: "75%",
                fontSize: "14px",
                lineHeight: 1.4,
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                whiteSpace: "pre-wrap", // keep line breaks
                wordBreak: "break-word", // wrap long words
                overflowWrap: "anywhere",
              }}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div
        style={{
          display: "flex",
          borderTop: "1px solid #ddd",
          padding: "8px",
          background: "#fff",
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{
            flex: 1,
            border: "1px solid #ccc",
            borderRadius: "20px",
            padding: "8px 12px",
            outline: "none",
            fontSize: "14px",
          }}
          placeholder="Type a message..."
        />
        <button
          onClick={handleSend}
          style={{
            marginLeft: "8px",
            background: "#2563eb",
            border: "none",
            color: "white",
            borderRadius: "20px",
            padding: "8px 14px",
            cursor: "pointer",
            transition: "0.2s",
          }}
          onMouseOver={(e) => (e.target.style.background = "#1d4ed8")}
          onMouseOut={(e) => (e.target.style.background = "#2563eb")}
        >
          ➤
        </button>
      </div>
    </div>
  );
};

export default ChatWidget;
