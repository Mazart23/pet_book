import Blog from "@/components/Blog";
import ScrollUp from "@/components/Common/ScrollUp";
import Contact from "@/components/Contact";
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
      <Blog />
      <Contact />
    </>
  );
}