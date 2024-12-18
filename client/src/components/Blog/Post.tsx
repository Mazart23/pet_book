"use client";

import {useState, useEffect} from "react";
import Image from "next/image";
import Link from "next/link";
import Lottie from "react-lottie";
import loaderAnimation from "@/static/animations/loader.json"
import { Post } from "@/types/post";
import { fetchProfilePicture } from "@/app/Api";
import { getColorFromUsername } from "@/app/layout";
import { SiDatadog } from "react-icons/si";

const Post = ({ post }: { post: Post }) => {
  const { id, content, images, user, location, timestamp, comments, reactions } = post;

  const [imageUrl, setImageUrl] = useState<string | null | undefined>(undefined);
  
  useEffect(() => {
    fetchProfilePicture(user.id)
      .then((profileUrl) => {
        if (profileUrl === "") {
          setImageUrl(null);
        } else {
          setImageUrl(profileUrl);
        }
      })
      .catch((error) => {
        setImageUrl(null);
      });
  }, []);

  return (
    <div className="group relative overflow-hidden rounded-sm bg-white shadow-one duration-300 hover:shadow-two dark:bg-dark dark:hover:shadow-gray-dark">
      <Link
        href="/blog-details"
        className="relative block aspect-[37/22] w-full"
      >
        {/* Green Tag */}
        { location && 
          <span className="absolute right-6 top-6 z-20 inline-flex items-center justify-center rounded-full bg-green-500 px-4 py-2 text-xs font-semibold capitalize text-white">
            {location}
          </span>
        }
        <Image src={images[0]} alt="image" fill />
      </Link>
      <div className="p-6 sm:p-8 md:px-6 md:py-8 lg:p-8 xl:px-5 xl:py-8 2xl:p-8">
        <p className="mb-6 border-b border-body-color border-opacity-10 pb-6 text-base font-medium text-body-color dark:border-white dark:border-opacity-10">
          {content}
          <Link
            href={`/post/${id}`}
            className="block mt-2 text-xs font-bold leading-snug text-green-400 hover:text-green-500 cursor-pointer outline-none border-none"
          >
            See more
          </Link>
        </p>
        <div className="flex items-center mt-1">
          <div className="mr-5 flex items-center border-r border-body-color border-opacity-10 pr-5 dark:border-white dark:border-opacity-10 xl:mr-3 xl:pr-3 2xl:mr-5 2xl:pr-5">
            <div className="mr-4">
              <div className="relative h-10 w-10">
                {imageUrl === undefined ? (
                  <Lottie 
                    options={{
                      loop: true,
                      autoplay: true,
                      animationData: loaderAnimation,
                      rendererSettings: {
                        preserveAspectRatio: 'xMidYMid slice'
                      }
                    }}
                    height={40} 
                    width={40} 
                  />
                ) : imageUrl ? (
                  <Image
                    src={imageUrl}
                    fill
                    alt="User profile picture"
                    className="h-full w-full rounded-full object-cover transition-all duration-300 ease-in-out hover:scale-110 cursor-pointer border-2 border-solid border-indigo-900 shadow-lg hover:shadow-xl shadow-gradient"
                  />
                ) : (
                  <SiDatadog 
                    className="h-full w-full rounded-full object-cover transition-all duration-300 ease-in-out hover:scale-110 cursor-pointer border-2 border-solid border-indigo-900 shadow-lg hover:shadow-xl shadow-gradient" 
                    style={{
                      color: getColorFromUsername(user.username),
                    }}
                  />
                )}
              </div>
            </div>
            <div className="w-full">
              <h4 className="mb-1 text-sm font-medium text-dark dark:text-white">
                {user.username}
              </h4>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <h4 className="mb-1 text-sm font-medium text-dark dark:text-white">
              Date
            </h4>
            <p className="text-xs text-body-color">{timestamp}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;
