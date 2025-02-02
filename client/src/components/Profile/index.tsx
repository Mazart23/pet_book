"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchProfilePicture, fetchUserByUsername, fetchPosts, uploadProfilePicture, updateUserInfo } from "@/app/Api";
import useToken from "../contexts/TokenContext";
import SectionTitle from "../Common/SectionTitle";
import Post from "../Blog/Post";
import Lottie from "react-lottie";
import loaderAnimation from "@/static/animations/loader.json";
import useUser from "../contexts/UserContext";
import ProfileEditor from "./profile-editor";
import { SiDatadog } from "react-icons/si";
import { getColorFromUsername } from "@/app/layout";

const Profile = () => {
  const { username } = useParams();
  const [profilePicture, setProfilePicture] = useState<string | null | undefined>(undefined);
  const [userData, setUserData] = useState({});
  const [userPosts, setUserPosts] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [lastFetchedTimestamp, setLastFetchedTimestamp] = useState<string | null>(null);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const { token } = useToken();
  const { userSelf } = useUser();

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
    fetchPosts(userData.id, lastFetchedTimestamp)
      .then((posts) => {
        if (posts.length > 0) {
          setUserPosts((prevPosts) => [...prevPosts, ...posts]);
          setLastFetchedTimestamp(posts[posts.length - 1].timestamp);
        } else {
          setHasMorePosts(false);
        }
      })
      .catch((err) => console.error("Failed to fetch posts:", err))
      .finally(() => setLoadingPosts(false));
  };

  useEffect(() => {
    if (username) {
      setLoadingUser(true);
      fetchUserByUsername(username)
        .then((data) => setUserData(data))
        .catch((err) => console.error("Failed to fetch user data:", err))
        .finally(() => setLoadingUser(false));
    }
  }, [username]);

  useEffect(() => {
    if (userData?.id) {
      setProfilePicture(undefined);
      fetchProfilePicture(userData.id)
        .then((url) => setProfilePicture(url))
        .catch(() => setProfilePicture(null));
    }
  }, [userData]);

  useEffect(() => {
    fetchMorePosts();
  }, [userData]);

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

  const handleProfileUpdate = async (updatedData: any) => {
    if (!token) {
      console.error("No token available");
      return;
    }

    try {
      const response = await updateUserInfo(token, updatedData);
      setIsEditing(false);
      if (response.status === 200) {
        setUserData({ ...userData, ...updatedData });
      } else {
        console.error("Failed to update profile: Non-200 response status", response.status);
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  return (
    <section
      id="profile"
      className="bg-gray-light dark:bg-bg-color-dark py-16 md:py-20 lg:py-28"
    >
      <div className="container">
        <SectionTitle title="Profile" paragraph="Account details and posts." center />

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
              <SiDatadog
                className="h-full w-full rounded-full object-cover border-2 border-solid border-indigo-900 shadow-md"
                style={{
                  color: getColorFromUsername(userData?.username || "default"),
                }}
              />
            )}
            {/* Profile Picture Upload Button */}
            {token && userData?.id === userSelf?.id && (
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

          {loadingUser ? (
            <Lottie options={loaderOptions} height={64} width={64} />
          ) : (
            <div className="space-y-2 mt-4 text-center">
              <h3 className="text-xl font-semibold text-dark dark:text-white">
                {userData?.username || "Unknown User"}
              </h3>
              <p className="text-sm text-body-color dark:text-gray-400">
                {userData?.bio || "No bio provided."}
              </p>
              <p className="text-sm text-body-color dark:text-gray-400">
                <strong>Location: </strong>
                {userData?.is_private && (!token || userData?.id !== userSelf?.id)
                  ? "Private"
                  : userData?.location || "Location not provided."}
              </p>
              <p className="text-sm text-body-color dark:text-gray-400">
                <strong>Email: </strong>
                {userData?.is_private && (!token || userData?.id !== userSelf?.id)
                  ? "Private"
                  : userData?.email || "Email not provided."}
              </p>
              <p className="text-sm text-body-color dark:text-gray-400">
                <strong>Phone: </strong>
                {userData?.is_private && (!token || userData?.id !== userSelf?.id)
                  ? "Private"
                  : userData?.phone || "Phone number not provided."}
              </p>
            </div>
          )}

          {!loadingUser && token && userData?.id === userSelf?.id && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="mt-2 text-sm text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300"
            >
              {isEditing ? "Cancel Editing" : "Edit Profile"}
            </button>
          )}

          {isEditing && (
            <div className="w-full max-w-md mt-4">
              <ProfileEditor
                initialData={{
                  bio: userData?.bio,
                  email: userData?.email,
                  location: userData?.location,
                  phone: userData?.phone,
                  is_private: userData?.is_private,
                }}
                onSave={handleProfileUpdate}
                onCancel={() => setIsEditing(false)}
              />
            </div>
          )}
        </div>

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
                    className="bg-green-600 text-white py-2 px-4 rounded-md shadow-md hover:bg-green-500 transition duration-300"
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
