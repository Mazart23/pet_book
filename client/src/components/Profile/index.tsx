"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchProfilePicture, fetchUserByUsername, fetchPosts } from "@/app/Api";
import useToken from "../contexts/TokenContext";
import SectionTitle from "../Common/SectionTitle";
import Post from "../Blog/Post";

const Profile = () => {
  const { username } = useParams();
  const [profilePicture, setProfilePicture] = useState<string | null | undefined>(undefined); // Loading state
  const [userData, setUserData] = useState({
    id: "",
    username: "",
    bio: "",
  });
  const [userPosts, setUserPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const { token } = useToken();

  // Fetch user data
  useEffect(() => {
    if (username) {
      fetchUserByUsername(username)
        .then((data) => {
          console.log("Fetched user data:", data);
          setUserData({ id: data._id, username: data.username, bio: data.bio });
        })
        .catch((err) => {
          console.error("Failed to fetch user data", err);
          setUserData({ id: "", username: "Unknown", bio: "Error loading bio." });
        });
    }
  }, [username]);

  // Fetch profile picture
  useEffect(() => {
    if (userData.id) {
      setProfilePicture(undefined); // Loading state
      fetchProfilePicture(userData.id)
        .then((url) => setProfilePicture(url))
        .catch(() => setProfilePicture(null)); // Error handling
    }
  }, [userData.id]);

  // Fetch user posts
  useEffect(() => {
    if (userData.id) {
      setLoadingPosts(true);
      fetchPosts({ userId: userData.id })
        .then((posts) => {
          setUserPosts(posts);
        })
        .catch((err) => {
          console.error("Failed to fetch posts:", err);
        })
        .finally(() => {
          setLoadingPosts(false);
        });
    }
  }, [userData.id]);

  return (
    <section
      id="profile"
      className="bg-gray-light dark:bg-bg-color-dark py-16 md:py-20 lg:py-28"
    >
      <div className="container">
        {/* Section Title */}
        <SectionTitle
          title="Profile"
          paragraph="Your account details and posts."
          center
        />

        {/* Profile and Posts */}
        <div className="flex flex-col items-center">
          <div className="flex flex-col items-center mb-12">
            {/* Profile Picture */}
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
            </div>

            {/* Username */}
            <h3 className="text-xl font-semibold text-dark dark:text-white text-center">
              {userData.username || "Loading username..."}
            </h3>

            {/* Bio */}
            <p className="text-sm text-body-color dark:text-gray-400 mt-2 text-center">
              {userData.bio || "Loading bio..."}
            </p>
          </div>

          {/* User Posts */}
          {token ? (
            <div className="w-full">
              <SectionTitle title="Posts" paragraph="See all your posts." />
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
      </div>
    </section>
  );
};

export default Profile;
