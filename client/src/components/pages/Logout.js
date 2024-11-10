import React from "react";
import useToken from '../contexts/TokenContext';

const Logout = () => {
  const { removeToken } = useToken();

  const handleLogout = () => {
    removeToken();
  }

  return (
    <div>
      <h1>Logout</h1>
      <button type="button" onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Logout;