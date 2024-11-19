import React, { createContext, useContext, useState } from "react";

const TokenContext = createContext();

const useToken = () => useContext(TokenContext);

export const TokenProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    return sessionStorage.getItem("token") || null;
  });

  const saveToken = (newToken) => {
    sessionStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const removeToken = () => {
    sessionStorage.removeItem("token");
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