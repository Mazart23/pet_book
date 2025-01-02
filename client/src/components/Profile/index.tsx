"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchProfilePicture, fetchUserByUsername, fetchPosts, uploadProfilePicture } from "@/app/Api";
import useToken from "../contexts/TokenContext";
import SectionTitle from "../Common/SectionTitle";
import Post from "../Blog/Post";
import jwtDecode from "jwt-decode";

const Profile = () => {
  const { username } = useParams();
  const [profilePicture, setProfilePicture] = useState<string | null | undefined>(undefined);
  const [userData, setUserData] = useState({
    id: "",
    username: "",
    bio: "",
    email: "",
    phone: "",
    location: "",
  });
  const [userPosts, setUserPosts] = useState([]); // No change
  const [loadingPosts, setLoadingPosts] = useState(false); // No change
  const { token } = useToken();

  // Fetch user data when `username` changes
  useEffect(() => {
    if (username) {
      fetchUserByUsername(username)
        .then((data) => {
          setUserData({
            id: data._id,
            username: data.username,
            bio: data.bio,
            email: data.email || "Email not provided.",
            phone: data.phone || "Phone number not provided.",
            location: data.location || "Location not provided.",
          });
        })
        .catch((err) => {
          console.error("Failed to fetch user data", err);
        });
    }
  }, [username]);

  // Fetch profile picture when user ID is available
  useEffect(() => {
    if (userData.id) {
      setProfilePicture(undefined); // Added loading state reset
      fetchProfilePicture(userData.id)
        .then((url) => setProfilePicture(url))
        .catch(() => setProfilePicture(null)); // Error handling
    }
  }, [userData.id]);

  // Fetch user posts when user ID is available
  useEffect(() => {
    if (userData.id) {
      setLoadingPosts(true); // Added loading state reset
      fetchPosts({ userId: userData.id })
        .then((posts) => setUserPosts(posts))
        .catch((err) => console.error("Failed to fetch posts:", err))
        .finally(() => setLoadingPosts(false));
    }
  }, [userData.id]);

  // Handle profile picture upload
  const handleChangeProfilePicture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!token) {
      console.error("No token available");
      return;
    }
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      try {
        const newProfilePictureUrl = await uploadProfilePicture(token, selectedFile);
        setProfilePicture(newProfilePictureUrl); // Update profile picture state with new URL
      } catch (error) {
        console.error("Failed to upload profile picture:", error);
      }
    }
  };

  return (
    <section
      id="profile"
      className="bg-gray-light dark:bg-bg-color-dark py-16 md:py-20 lg:py-28"
    >
      <div className="container">
        {/* Section Title */}
        <SectionTitle title="Profile" paragraph="Account details and posts." center />

        <div className="flex flex-col items-center">
          <div className="relative h-32 w-32 mb-4">
            {profilePicture === undefined ? (
              <div className="rounded-full bg-gray-300 h-full w-full flex items-center justify-center">
                <span className="text-gray-600">Loading...</span>
              </div>
            ) : profilePicture ? (
              <img
                src={profilePicture}
                alt="Profile"
                className="rounded-full object-cover shadow-md h-full w-full"
              />
            ) : (
              <div className="rounded-full bg-gray-300 h-full w-full flex items-center justify-center">
                <span className="text-gray-600">No Image</span>
              </div>
            )}
            {token && userData.id === jwtDecode(token).sub && (
              <label
                htmlFor="profile-picture-upload"
                className="absolute bottom-0 right-0 bg-green-600 text-white text-sm font-medium py-1 px-3 rounded-full shadow-lg hover:bg-green-500 transition duration-300 cursor-pointer"
              >
                Change
                {/* Changed button to use file input */}
                <input
                  type="file"
                  id="profile-picture-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleChangeProfilePicture}
                />
              </label>
            )}
          </div>

          {/* User details */}
          <h3 className="text-xl font-semibold text-dark dark:text-white text-center">
            {userData.username || "Loading username..."}
          </h3>
          <p className="text-sm text-body-color dark:text-gray-400 mt-2 text-center">
            {userData.bio || "Loading bio..."}
          </p>
          <p className="text-sm text-body-color dark:text-gray-400 mt-2 text-center">
            <strong>Location: </strong>{userData.location}
          </p>
          <p className="text-sm text-body-color dark:text-gray-400 mt-2 text-center">
            <strong>Email: </strong>{userData.email}
          </p>
          <p className="text-sm text-body-color dark:text-gray-400 mt-2 text-center">
            <strong>Phone: </strong>{userData.phone}
          </p>
        </div>

        {/* Posts Section */}
        {token ? (
          <div className="w-full">
            <SectionTitle title="Posts" paragraph="See all posts." />
            {loadingPosts ? (
              <div className="text-center text-gray-600 dark:text-gray-400 mt-8">
                <p>Loading posts...</p>
              </div>
            ) : userPosts.length > 0 ? (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2">
                {userPosts.map((post) => (
                  <div key={post.id} className="w-full">
                    <Post post={post} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-600 dark:text-gray-400 mt-8">
                <p>No posts found.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-600 dark:text-gray-400 mt-8">
            <p>Please sign in to see posts.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Profile;
