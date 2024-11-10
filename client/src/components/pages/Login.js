import React, { useState, useRef } from "react";
import { postLogin } from "/client/src/Api";
import useToken from "../contexts/TokenContext";


const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [animationClass, setAnimationClass] = useState("animate__fadeInUp");
  const { setToken } = useToken();

  const fadeTimeout = useRef(null);

  const fadeCycle = () => {
    fadeTimeout.current = setTimeout(() => {
      setAnimationClass("animate__fadeOutUp");

      fadeTimeout.current = setTimeout(() => {
        setShowMessage(false);
        setAnimationClass("animate__fadeInUp");
      }, 500);

    }, 3000);
  };

  const handleLogin = () => {
    if (fadeTimeout.current) {
      clearTimeout(fadeTimeout.current);
    }

    setAnimationClass("animate__fadeInUp");
    setError("");
    setSuccessMessage("");
    setShowMessage(false);

    postLogin(username, password)
      .then((access_token) => {
        setToken(access_token);
        setSuccessMessage("Logged in successfully!");
        setShowMessage(true);
        fadeCycle();
      })
      .catch((error) => {
        setError(`Login failed: ${error.message}`);
        setShowMessage(true);
        fadeCycle();
      });
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="button" onClick={handleLogin}>Login</button>
      </form>

      {showMessage && (
        <div className={`animate__animated ${animationClass} animate__faster`}>
          {error && <p className="error">{error}</p>}
          {successMessage && <p className="success">{successMessage}</p>}
        </div>
      )}
    </div>
  );
};

export default Login;