import AboutSectionOne from "@/components/About/AboutSectionOne";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Page | PetBook",
  description: "About page for PetBook app",
  // other metadata
};

const AboutPage = () => {
  return (
    <>
      <AboutSectionOne />
    </>
  );
};

export default AboutPage;