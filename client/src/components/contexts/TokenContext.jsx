import React, { createContext, useContext, useState } from "react";
import Cookies from 'js-cookie'

const TokenContext = createContext();

const useToken = () => useContext(TokenContext);

export const TokenProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    return Cookies.get("token") || null;
  });

  const saveToken = (newToken) => {
    Cookies.set("token", newToken);
    setToken(newToken);
  };

  const removeToken = () => {
    Cookies.remove("token");
    setToken(null);
  };

  const contextValue = {
    token,
    setToken: saveToken,
    removeToken
  };

  return (
    <TokenContext.Provider value={contextValue}>
      {children}
    </TokenContext.Provider>
  );
};

export default useToken;