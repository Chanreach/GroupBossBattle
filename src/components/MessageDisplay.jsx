import React, { useEffect } from "react";
import { useMessage } from "@/context/useMessage";

export const MessageDisplay = () => {
  const { message, messageType, clearMessage } = useMessage();

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        clearMessage();
      }, 3000); // Clear message after 3 seconds

      return () => clearTimeout(timer); // Cleanup on unmount
    }
  }, [message, clearMessage]);

  if (!message) return null;

  const messageBgColor =
    {
      info: "bg-blue-100 text-blue-800",
      success: "bg-green-100 text-green-800",
      error: "bg-red-100 text-red-800",
      warning: "bg-yellow-100 text-yellow-800",
    }[messageType] || "bg-gray-100 text-gray-800";

  return (
    <div
      className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg transition-all duration-300 ${messageBgColor}`}
    >
      {message}
    </div>
  );
};
