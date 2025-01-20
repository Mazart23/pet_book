"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { fetchUserByUsername } from "../../app/Api";
import { getColorFromUsername } from "@/app/layout"; // Assuming this helper function is defined as in your earlier code
import { SiDatadog } from "react-icons/si"; // Icon for the dog placeholder

interface UserCardProps {
  user: {
    username: string;
    profile_picture_url?: string;
  };
}

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const router = useRouter();
  const colorStyle = getColorFromUsername(user.username || "default");

  const handleClick = async () => {
    try {
      const userData = await fetchUserByUsername(user.username);
      router.push(`/profile/${userData.username}`);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  return (
    <div
    className="p-6 shadow-md rounded-lg transition-shadow duration-300 flex flex-col items-center cursor-pointer hover:shadow-lg"
    onClick={handleClick}
    >
      <div
        className="w-32 h-32 rounded-full overflow-hidden mb-4 flex items-center border-2 border-solid border-indigo-900 shadow-md hover:shadow-lg shadow-indigo-900 justify-center"
      >
        {user.profile_picture_url ? (
          <img
            src={user.profile_picture_url}
            alt={user.username}
            className="w-full h-full object-cover"
          />
        ) : (
          <SiDatadog className="text-6xl" style={{ color: colorStyle }} />
        )}
      </div>
      <h3 className="text-xl font-semibold text-center">{user.username}</h3>
    </div>
  );
};

export default UserCard;
