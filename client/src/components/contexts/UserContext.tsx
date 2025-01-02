import React, { createContext, useContext, useState, useEffect } from "react";
import useToken from "./TokenContext";
import useWebsocket from "./WebsocketContext";
import { fetchUserSelfData } from "@/app/Api";

const UserContext = createContext();

const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const { token } = useToken();
  const { socket } = useWebsocket();

  useEffect(() => {
    if (token && socket) {
      fetchUserSelfData(token).then((data) => {
        setCurrentUser(data);
      })
    } else {
      setCurrentUser(null);
    }
  }, [token, socket]);

  const contextValue = {
    currentUser,
    setCurrentUser
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export default useUser;