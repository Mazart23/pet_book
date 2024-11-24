import React, { useState, useRef } from "react";
import axios from "axios";
import useToken from "../contexts/TokenContext";

const Profile = () => {
  const [profilePicture, setProfilePicture] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [animationClass, setAnimationClass] = useState("animate__fadeInUp");

  const fadeTimeout = useRef(null);
  const { token } = useToken();

  const API_BASE_URL = "http://localhost:5001"; 

  const fadeCycle = () => {
    fadeTimeout.current = setTimeout(() => {
      setAnimationClass("animate__fadeOutUp");

      fadeTimeout.current = setTimeout(() => {
        setShowMessage(false);
        setAnimationClass("animate__fadeInUp");
      }, 500);
    }, 3000);
  };

  const fetchProfilePicture = async () => {
    clearTimeout(fadeTimeout.current);
    setError("");
    setSuccessMessage("");
    setShowMessage(false);

    try {
      const response = await axios.get(`${API_BASE_URL}/user/user-picture`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProfilePicture(response.data.profile_picture_url);
      setSuccessMessage("Profile picture fetched successfully!");
      setShowMessage(true);
      fadeCycle();
    } catch (error) {
      setError(`Failed to fetch profile picture: ${error.message}`);
      setShowMessage(true);
      fadeCycle();
    }
  };

  const uploadProfilePicture = async () => {
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

    const formData = new FormData();
    formData.append("picture", selectedFile);

    try {
      const response = await axios.put(`${API_BASE_URL}/user/user-picture`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setProfilePicture(response.data.profile_picture_url);
      setSuccessMessage("Profile picture updated successfully!");
      setShowMessage(true);
      fadeCycle();
    } catch (error) {
      setError(`Failed to upload profile picture: ${error.message}`);
      setShowMessage(true);
      fadeCycle();
    }
  };

  const deleteProfilePicture = async () => {
    clearTimeout(fadeTimeout.current);
    setError("");
    setSuccessMessage("");
    setShowMessage(false);

    try {
      await axios.delete(`${API_BASE_URL}/user/user-picture`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProfilePicture(null);
      setSuccessMessage("Profile picture deleted successfully!");
      setShowMessage(true);
      fadeCycle();
    } catch (error) {
      setError(`Failed to delete profile picture: ${error.message}`);
      setShowMessage(true);
      fadeCycle();
    }
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

      <button onClick={fetchProfilePicture}>Fetch Profile Picture</button>

      <div>
        <input type="file" onChange={handleFileChange} />
        <button onClick={uploadProfilePicture} disabled={!selectedFile}>
          Upload/Update Profile Picture
        </button>
      </div>

      {profilePicture && (
        <button onClick={deleteProfilePicture}>Delete Profile Picture</button>
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
