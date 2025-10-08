import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import BossBattleContext from "./BossBattleContext";

const BossBattleProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(
      import.meta.env.VITE_API_URL || "http://localhost:3000",
      {
        withCredentials: true,
        transports: ["websocket"],
      }
    );

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
    });

    newSocket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      newSocket.off("connect");
      newSocket.off("error");
    };
  }, []);

  return (
    <BossBattleContext.Provider value={{ socket }}>
      {children}
    </BossBattleContext.Provider>
  );
};

export default BossBattleProvider;
