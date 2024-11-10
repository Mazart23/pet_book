import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import AppRouter from './AppRouter';
import useToken from './components/hooks/useToken';
import { postLogin } from './Api';


export default function App() {
  const { token, removeToken, setToken } = useToken(null);
  const [ socket, setSocket ] = useState(null);

  useEffect(() => {
    postLogin('test', 'password').then((access_token) => {
      setToken(access_token);
    });
  }, [])

  useEffect(() => {
    if (token) {
      const websocket = io('localhost:5003/', {
        query: {token: token}, 
        transports: ["websocket"],
        cors: {
          origin: "http://localhost:3000/",
        },
        timeout: 5000
      });

      setSocket(websocket);

      websocket.on('connect', () => {
        console.log('Connected to WebSocket');
      });

      websocket.on('notification_scan', (data) => {
        console.log(data);
      });
  
      return () => {
        if (websocket) websocket.disconnect();
      };
    }
  }, [token, setSocket])

  return (
    <>
      { socket ? (
          <AppRouter />
      ) : (
        <h1>Waiting</h1>
      )}
    </>
  );
};