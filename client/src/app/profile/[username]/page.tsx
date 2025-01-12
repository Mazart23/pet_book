import Profile from "@/components/Profile";
import ScrollUp from "@/components/Common/ScrollUp";
import Sidebar from "@/components/Sidebar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile - PetBook",
  description: "View your profile and posts!",
};

export default function ProfilePage() {
  return (
    <>
      <ScrollUp />
      <div className="w-full">
          <Profile />
      </div>
    
    </>
  );
}
