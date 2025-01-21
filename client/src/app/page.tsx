import Blog from "@/components/Blog";
import ScrollUp from "@/components/Common/ScrollUp";
import Sidebar from "@/components/Sidebar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "PetBook",
  description: "This is an app for pet lovers!",
  // other metadata
};

export default function Home() {
  return (
    <>
      <ScrollUp />
      <div className="flex min-h-[100vh]">
        <Sidebar />
        <div className="flex-1">
          <Blog />
        </div>
      </div>
    </>
  );
}