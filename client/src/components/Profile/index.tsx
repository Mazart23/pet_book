"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchProfilePicture, fetchUserByUsername, fetchPosts, uploadProfilePicture } from "@/app/Api";
import useToken from "../contexts/TokenContext";
import SectionTitle from "../Common/SectionTitle";
import Post from "../Blog/Post";
import jwtDecode from "jwt-decode";
import Lottie from "react-lottie";
import loaderAnimation from "@/static/animations/loader.json";

const Profile = () => {
  const { username } = useParams();
  const [profilePicture, setProfilePicture] = useState<string | null | undefined>(undefined);
  const [userData, setUserData] = useState({});
  const [userPosts, setUserPosts] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [lastFetchedTimestamp, setLastFetchedTimestamp] = useState<string | null>(null);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const { token } = useToken();

  const loaderOptions = {
    loop: true,
    autoplay: true,
    animationData: loaderAnimation,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const fetchMorePosts = () => {
    if (!userData?.id || !hasMorePosts || loadingPosts) return;

    setLoadingPosts(true);
    fetchPosts(userData.id, lastFetchedTimestamp) // Pass last fetched timestamp for pagination
      .then((posts) => {
        if (posts.length > 0) {
          setUserPosts((prevPosts) => [...prevPosts, ...posts]); // Append new posts
          setLastFetchedTimestamp(posts[posts.length - 1].timestamp); // Update timestamp
        } else {
          setHasMorePosts(false); // No more posts available
        }
      })
      .catch((err) => console.error("Failed to fetch posts:", err))
      .finally(() => setLoadingPosts(false));
  };


  // Fetch user data
  useEffect(() => {
    if (username) {
      setLoadingUser(true);
      fetchUserByUsername(username)
        .then((data) => setUserData(data))
        .catch((err) => console.error("Failed to fetch user data:", err))
        .finally(() => setLoadingUser(false));
    }
  }, [username]);

  // Fetch profile picture
  useEffect(() => {
    if (userData?.id) {
      setProfilePicture(undefined); // Show loader while fetching profile picture
      fetchProfilePicture(userData.id)
        .then((url) => setProfilePicture(url))
        .catch(() => setProfilePicture(null)); // Handle error by setting profile picture as null
    }
  }, [userData]);

  useEffect(() => {
    fetchMorePosts(); // Initial post fetch
  }, [userData]);

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
        setProfilePicture(newProfilePictureUrl);
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
        <SectionTitle title="Profile" paragraph="Account details and posts." center />

        {/* Profile Picture Section */}
        <div className="flex flex-col items-center">
          <div className="relative h-32 w-32 mb-4">
            {profilePicture === undefined ? (
              <Lottie options={loaderOptions} height={128} width={128} />
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
            {/* Profile Picture Upload Button */}
            {token && userData?.id === jwtDecode(token).sub && (
              <label
                htmlFor="profile-picture-upload"
                className="absolute bottom-0 right-0 bg-green-600 text-white text-sm font-medium py-1 px-3 rounded-full shadow-lg hover:bg-green-500 transition duration-300 cursor-pointer"
              >
                Change
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

          {/* User Details */}
          <h3 className="text-xl font-semibold text-dark dark:text-white text-center">
            {loadingUser ? (
              <Lottie options={loaderOptions} height={24} width={24} />
            ) : (
              userData?.username || "Unknown User"
            )}
          </h3>
          <p className="text-sm text-body-color dark:text-gray-400 mt-2 text-center">
            {loadingUser ? (
              <Lottie options={loaderOptions} height={24} width={24} />
            ) : (
              userData?.bio || "No bio provided."
            )}
          </p>
          <p className="text-sm text-body-color dark:text-gray-400 mt-2 text-center">
            <strong>Location: </strong>
            {loadingUser ? (
              <Lottie options={loaderOptions} height={24} width={24} />
            ) : (
              userData?.location || "Location not provided."
            )}
          </p>
          <p className="text-sm text-body-color dark:text-gray-400 mt-2 text-center">
            <strong>Email: </strong>
            {loadingUser ? (
              <Lottie options={loaderOptions} height={24} width={24} />
            ) : (
              userData?.email || "Email not provided."
            )}
          </p>
          <p className="text-sm text-body-color dark:text-gray-400 mt-2 text-center">
            <strong>Phone: </strong>
            {loadingUser ? (
              <Lottie options={loaderOptions} height={24} width={24} />
            ) : (
              userData?.phone || "Phone number not provided."
            )}
          </p>
        </div>

        {/* Posts Section */}
        <div className="w-full mt-8">
          <SectionTitle title="Posts" paragraph="See all posts." />
          {token ? (
            <div>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2">
                {userPosts.map((post) => (
                  <div key={post.id} className="w-full">
                    <Post post={post} />
                  </div>
                ))}
              </div>
              {loadingPosts && (
                <div className="flex justify-center">
                  <Lottie options={loaderOptions} height={128} width={128} />
                </div>
              )}
              {!loadingPosts && hasMorePosts && (
                <div className="flex justify-center mt-8">
                  <button
                    className="bg-blue-600 text-white py-2 px-4 rounded-md shadow-md hover:bg-blue-500 transition duration-300"
                    onClick={fetchMorePosts}
                  >
                    Load More
                  </button>
                </div>
              )}
              {!loadingPosts && !hasMorePosts && (
                <div className="text-center text-gray-600 dark:text-gray-400 mt-8">
                  <p>No more posts to load.</p>
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
