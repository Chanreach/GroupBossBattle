import React, { useState } from "react";
import { MessageContext } from "./MessageContext";

export const MessageProvider = ({ children }) => {
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  const showMessage = (msg, type = "info") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("info");
    }, 3000); // Clear message after 3 seconds
  };

  const clearMessage = () => {
    setMessage("");
    setMessageType("info");
  };

  return (
    <MessageContext.Provider value={{ message, messageType, showMessage, clearMessage }}>
      {children}
    </MessageContext.Provider>
  );
};
