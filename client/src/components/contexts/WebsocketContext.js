import React, { createContext, useContext, useState, useEffect } from "react";
import { io } from "socket.io-client";
import useToken from './TokenContext';

const WebsocketContext = createContext(null);

const useWebsocket = () => useContext(WebsocketContext);

export const WebsocketProvider = ({ children }) => {
  const { token } = useToken();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (token) {
      const websocket = io("http://localhost:5003/", {
        query: { token: token },
        transports: ["websocket"],
        cors: {
          origin: "http://localhost:3000/",
        },
        timeout: 5000,
      });

      setSocket(websocket);

      websocket.on("connect", () => {
        console.log("Connected to WebSocket");
      });

      websocket.on("notification_scan", (data) => {
        console.log(data);
      });

      return () => {
        websocket.disconnect();
        console.log("Disconnected with WebSocket");
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [token]);

  return (
    <WebsocketContext.Provider value={socket}>
      {children}
    </WebsocketContext.Provider>
  );
};

export default useWebsocket;
