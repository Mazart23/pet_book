import React, { useState, useRef } from "react";
import useToken from "../contexts/TokenContext";
import {
  fetchProfilePicture,
  uploadProfilePicture,
  deleteProfilePicture,
} from "/client/src/Api";
import jwtDecode from "jwt-decode";

const Profile = () => {
  const [profilePicture, setProfilePicture] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [animationClass, setAnimationClass] = useState("animate__fadeInUp");

  const fadeTimeout = useRef(null);
  const { token } = useToken();

  const fadeCycle = () => {
    fadeTimeout.current = setTimeout(() => {
      setAnimationClass("animate__fadeOutUp");

      fadeTimeout.current = setTimeout(() => {
        setShowMessage(false);
        setAnimationClass("animate__fadeInUp");
      }, 500);
    }, 3000);
  };

  const handleFetchProfilePicture = () => {
    clearTimeout(fadeTimeout.current);
    setError("");
    setSuccessMessage("");
    setShowMessage(false);
  
    if (!token) {
      setError("User is not authenticated. Please log in.");
      setShowMessage(true);
      fadeCycle();
      return;
    }
  
    let userId;
    try {
      const decodedToken = jwtDecode(token);
      userId = decodedToken.sub;
      if (!userId) throw new Error("Invalid token: User ID is missing.");
    } catch (err) {
      setError(`Failed to decode token: ${err.message}`);
      setShowMessage(true);
      fadeCycle();
      return;
    }
  
    fetchProfilePicture(userId)
      .then((profileUrl) => {
        setProfilePicture(profileUrl);
        setSuccessMessage("Profile picture fetched successfully!");
        setShowMessage(true);
        fadeCycle();
      })
      .catch((error) => {
        const errorMsg = error.response?.data?.message || error.message || "An error occurred.";
        setError(`Failed to fetch profile picture: ${errorMsg}`);
        setShowMessage(true);
        fadeCycle();
      });
  };
  
  

  const handleUploadProfilePicture = () => {
    if (!selectedFile) {
      setError("Please select a file before uploading.");
      setShowMessage(true);
      fadeCycle();
      return;
    }
  
    clearTimeout(fadeTimeout.current);
    setError("");
    setSuccessMessage("");
    setShowMessage(false);
  
    if (!token) {
      setError("User is not authenticated. Please log in.");
      setShowMessage(true);
      fadeCycle();
      return;
    }
  
    uploadProfilePicture(token, selectedFile)
      .then((profileUrl) => {
        setProfilePicture(profileUrl);
        setSuccessMessage("Profile picture updated successfully!");
        setShowMessage(true);
        fadeCycle();
      })
      .catch((error) => {
        const errorMsg = error.response?.data?.message || error.message || "An error occurred.";
        setError(`Failed to upload profile picture: ${errorMsg}`);
        setShowMessage(true);
        fadeCycle();
      });
  };
  

  const handleDeleteProfilePicture = () => {
    clearTimeout(fadeTimeout.current);
    setError("");
    setSuccessMessage("");
    setShowMessage(false);
  
    deleteProfilePicture(token)
      .then(() => {
        setProfilePicture(null);
        setSuccessMessage("Profile picture deleted successfully!");
        setShowMessage(true);
        fadeCycle();
      })
      .catch((error) => {
        const errorMsg = error.response?.data?.message || error.message || "An error occurred.";
        setError(`Failed to delete profile picture: ${errorMsg}`);
        setShowMessage(true);
        fadeCycle();
      });
  };
  

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  return (
    <div>
      <h1>Profile</h1>
      <div>
        {profilePicture ? (
          <div>
            <img
              src={profilePicture}
              alt="Profile"
              style={{ width: "200px", height: "200px", borderRadius: "50%" }}
            />
            <p>Current Profile Picture</p>
          </div>
        ) : (
          <p>No profile picture set.</p>
        )}
      </div>

      <button onClick={handleFetchProfilePicture}>Fetch Profile Picture</button>

      <div>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUploadProfilePicture} disabled={!selectedFile}>
          Upload/Update Profile Picture
        </button>
      </div>

      {profilePicture && (
        <button onClick={handleDeleteProfilePicture}>Delete Profile Picture</button>
      )}

      {showMessage && (
        <div className={`animate__animated ${animationClass} animate__faster`}>
          {error && <p className="error">{error}</p>}
          {successMessage && <p className="success">{successMessage}</p>}
        </div>
      )}
    </div>
  );
};

export default Profile;
