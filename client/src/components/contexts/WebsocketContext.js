import React, { createContext, useContext, useState, useEffect } from "react";
import { io } from "socket.io-client";
import useToken from "./TokenContext";
import useConfig from "./ConfigContext";

const WebsocketContext = createContext(null);

const useWebsocket = () => useContext(WebsocketContext);

export const WebsocketProvider = ({ children }) => {
  const { config } = useConfig();
  const { token } = useToken();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (token && config) {
      const websocket = io(config.notifier.url, {
        query: { token: token },
        transports: ["websocket"],
        cors: {
          origin: config.client.url,
        },
        timeout: 5000,
      });

      setSocket(websocket);

      websocket.on("connect", () => {
        console.log("Connected to WebSocket");
      });

      websocket.on("notification_scan", (data) => {
        console.log("Scan", data);
      });

      websocket.on("notification_reaction", (data) => {
        console.log("Reaction", data);
      });

      websocket.on("notification_comment", (data) => {
        console.log("Comment", data);
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
  }, [token, config]);

  return (
    <WebsocketContext.Provider value={socket}>
      {children}
    </WebsocketContext.Provider>
  );
};

export default useWebsocket;
