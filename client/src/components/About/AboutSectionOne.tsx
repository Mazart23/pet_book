import Image from "next/image";
import SectionTitle from "../Common/SectionTitle";

const checkIcon = (
  <svg width="16" height="13" viewBox="0 0 16 13" className="fill-current text-green-500">
    <path d="M5.8535 12.6631C5.65824 12.8584 5.34166 12.8584 5.1464 12.6631L0.678505 8.1952C0.483242 7.99994 0.483242 7.68336 0.678505 7.4881L2.32921 5.83739C2.52467 5.64193 2.84166 5.64216 3.03684 5.83791L5.14622 7.95354C5.34147 8.14936 5.65859 8.14952 5.85403 7.95388L13.3797 0.420561C13.575 0.22513 13.8917 0.225051 14.087 0.420383L15.7381 2.07143C15.9333 2.26669 15.9333 2.58327 15.7381 2.77854L5.8535 12.6631Z" fill="currentColor" />
  </svg>
);

const AboutSectionOne = () => {
  const List = ({ text }) => (
    <p className="mb-5 flex items-center text-lg font-medium text-body-color">
      <span className="mr-4 flex h-[30px] w-[30px] items-center justify-center rounded-md bg-primary bg-opacity-10 text-primary">
        {checkIcon}
      </span>
      {text}
    </p>
  );

  return (
    <section id="about" className="pt-16 md:pt-20 lg:pt-28">
      <div className="container">
        <div className="border-b border-body-color/[.15] pb-16 dark:border-white/[.15] md:pb-20 lg:pb-28">
          <div className="-mx-4 flex flex-wrap items-center">
            <div className="w-full px-4 lg:w-1/2">
              <SectionTitle
                title="Welcome to PetBook!"
                paragraph="At PetBook, we celebrate the joy of being a pet owner. Our platform is a hub for passionate pet lovers to share stories, find helpful tips, and connect with like-minded individuals.
                We prioritize your pet’s safety by offering innovative features like QR codes for easy identification and recovery if they get lost. Our community thrives on support and shared experiences, providing a space to learn, grow, and enjoy everything about pet ownership.
                Whether you’re here to discover training tips, find inspiration, or join a caring community, PetBook is the right place. Together, we can make the journey of pet ownership safer, happier, and more rewarding!"
                mb="44px"
              />
              <div
                className="mb-12 max-w-[570px] lg:mb-0"
                data-wow-delay=".15s"
              >
                <div className="mx-[-12px] flex flex-wrap">
                  <div className="w-full px-3 sm:w-1/2 lg:w-full xl:w-1/2">
                    <List text="Enhanced pet safety" />
                    <List text="Convenience" />
                  </div>
                  <div className="w-full px-3 sm:w-1/2 lg:w-full xl:w-1/2">
                    <List text="Support of community" />
                    <List text="Enjoyment" />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-lg text-body-color">
                We value your feedback! Help us improve by taking a moment to complete our short survey.
              </p>
              <a
                href="https://forms.gle/AoWpEpLbtEErs3e96"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 rounded-lg bg-green-500 px-6 py-3 text-white hover:bg-green-600"
              >
                Take the Survey
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSectionOne;