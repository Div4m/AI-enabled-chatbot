import React, { useState,useEffect } from "react";
import { userId } from '../service/socketService.ts';
import type { MessageFormat } from "../types/message.ts";
import './Chat.css';
import {socket} from '../service/socketService.ts';
import ReactMarkdown from 'react-markdown';

const ChatMessages = () => {
    const [messages, setMessages] = useState<MessageFormat[]>([]);
    const [input, setInput] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const handlePreviousChat = (msg: MessageFormat[]) => {
      console.log("Previous chat received:", msg);
      setMessages(msg);
    }
    const handleBotResponse = (msg: MessageFormat) => {
      console.log("Bot response received:", msg);
      setMessages((prev) => [...prev, msg]);
      setLoading(false);
    };
    // i need to understand here
    socket.on("connect", () => {
      console.log("Socket connected");
    });
    const handleError = (err: string) => {
      console.log("Error received:", err);
      alert(err);
      setLoading(false);
    };
    socket.on("previousChat", handlePreviousChat);
    socket.on("botResponse", handleBotResponse);
    socket.on("error", handleError);

    return () => {
      socket.off("previousChat", handlePreviousChat);
      socket.off("botResponse", handleBotResponse);
      socket.off("error", handleError);
    };
  },[]);

    const sendMessage = () => {
      if (!input.trim()) return;

      const userMessage: MessageFormat = {
        message: input,
        userId:userId,
        sender: 'user',
      };

      setMessages((prev) => [...prev, userMessage]);
      setLoading(true);
      socket.emit("sendMessage", input);
      setInput("");
    };

    return (
      <div className="chat-container">
        <h2>AI-Jinn</h2>
        <div className="messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
            <ReactMarkdown>{msg.message}</ReactMarkdown>
            </div>
          ))}

          {loading && (
            <div className="message bot typing">
              <span></span><span></span><span></span>
            </div>
          )}
        </div>

        <div className="input-box">
          <input
            type="text"
            value={input}
            placeholder="Type your message..."
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setInput(e.target.value)
            }
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button className ="send-button" onClick={sendMessage}>Send</button>
        </div>
      </div>
    );
  };

  export default ChatMessages;