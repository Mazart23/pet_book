import React, { useState, useRef, useEffect } from "react";
import useToken from "../contexts/TokenContext";
import {
  fetchProfilePicture,
  uploadProfilePicture,
  deleteProfilePicture,
  fetchPosts,
  deletePost,
} from "/client/src/Api";
import jwtDecode from "jwt-decode";

const Profile = () => {
  const [profilePicture, setProfilePicture] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [animationClass, setAnimationClass] = useState("animate__fadeInUp");
  const [userPosts, setUserPosts] = useState([]); // New state for user posts

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

  // Decode user ID from token
  const getUserIdFromToken = () => {
    if (!token) {
      setError("User is not authenticated. Please log in.");
      setShowMessage(true);
      fadeCycle();
      return null;
    }

    try {
      const decodedToken = jwtDecode(token);
      return decodedToken.sub;
    } catch (err) {
      setError(`Failed to decode token: ${err.message}`);
      setShowMessage(true);
      fadeCycle();
      return null;
    }
  };

  const handleFetchProfilePicture = () => {
    clearTimeout(fadeTimeout.current);
    setError("");
    setSuccessMessage("");
    setShowMessage(false);

    const userId = getUserIdFromToken();
    if (!userId) return;

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

  const handleFetchUserPosts = () => {
    clearTimeout(fadeTimeout.current);
    setError("");
    setSuccessMessage("");
    setShowMessage(false);

    const userId = getUserIdFromToken();
    if (!userId) return;

    fetchPosts({ userId })
      .then((posts) => {
        setSuccessMessage("Posts fetched successfully!");
        setShowMessage(true);
        fadeCycle();
      })
      .catch((error) => {
        const errorMsg = error.response?.data?.message || error.message || "An error occurred.";
        setError(`Failed to fetch posts: ${errorMsg}`);
        setShowMessage(true);
        fadeCycle();
      });
  };

  useEffect(() => {
    // Fetch user posts when component loads
    handleFetchUserPosts();
  }, []);

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

  const handleDeletePost = (postId) => {
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
  
    deletePost(token, postId)
      .then((message) => {
        setUserPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
        setSuccessMessage(message || "Post deleted successfully!");
        setShowMessage(true);
        fadeCycle();
      })
      .catch((error) => {
        const errorMsg = error.response?.data?.message || error.message || "An error occurred.";
        setError(`Failed to delete post: ${errorMsg}`);
        setShowMessage(true);
        fadeCycle();
      });
  };

  useEffect(() => {
    handleFetchUserPosts();
  }, []);

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

<h2>Your Posts</h2>
      <button onClick={handleFetchUserPosts}>Refresh Posts</button>
      
      {console.log("Rendering userPosts:", userPosts)}
      
      {userPosts.length > 0 ? (
        <ul>
          
          {userPosts.map((post) => (
            <li key={post._id}>
              
              <p><strong>{post.description}</strong></p>
              {post.images_urls && post.images_urls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Post ${post._id} - ${index}`}
                  style={{ width: "100px", height: "100px", marginRight: "10px" }}
                />
              ))}
              <p>Location: {post.location || "N/A"}</p>
              <p>Posted on: {new Date(post.timestamp).toLocaleString()}</p>
              <button   onClick={() => {
                console.log("Deleting post with ID:", post._id);
                handleDeletePost(post._id);
              }}
          >Delete</button> 
            </li>
          ))}
        </ul>
      ) : (
        <p>No posts to display.</p>
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
