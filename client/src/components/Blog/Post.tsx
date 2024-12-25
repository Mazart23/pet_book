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
  const reactionsArray = [{"type": "good", "text": "Good"}, {"type": "heart", "text": "Heart"}, {"type": "haha", "text": "Haha"}, {"type": "wow", "text": "Wow"}, {"type": "p", "text": "Playful"}, {"type": "cry", "text": "Sad"}];

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
        <div className="flex items-center justify-around mt-1">
          <div className="flex flex-col items-center justify-center">
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
                  className="h-full w-full rounded-full object-cover transition-all duration-300 ease-in-out hover:scale-110 cursor-pointer border-2 border-solid border-indigo-900 shadow-md hover:shadow-lg shadow-indigo-900"
                />
              ) : (
                <SiDatadog 
                  className="h-full w-full rounded-full object-cover transition-all duration-300 ease-in-out hover:scale-110 cursor-pointer border-2 border-solid border-indigo-900 shadow-md hover:shadow-lg shadow-indigo-900" 
                  style={{
                    color: getColorFromUsername(user.username),
                  }}
                />
              )}
            </div>
            <h4 className="mt-1 text-sm font-medium text-dark dark:text-white">
              {user.username}
            </h4>
          </div>
          <div className="mx-1 h-16 w-px bg-body-color dark:bg-white opacity-10"></div>
          <div className="flex flex-col items-center justify-center">
            <h4 className="mb-1 text-sm font-small text-dark dark:text-white">
              Date
            </h4>
            {timestamp.split(' ').map((t) => (
              <p className="text-xs text-body-color">{t}</p>
            ))}
          </div>
          <div className="mx-1 h-16 w-px bg-body-color dark:bg-white opacity-10"></div>
          {reactionsArray.map((reaction) => (
            <div className="ml-1 flex flex-col items-center justify-center">
              <p className="mb-[2px] text-xs text-body-color">
                {reaction.text}
              </p>
              {reaction.count ? (
                <p className="mb-1 text-xs text-body-color">{reaction.count}</p>
              ):(
                <p className="mb-1 text-xs text-body-color">0</p>
              )}
              <div className="relative h-8 w-8">
                <Image
                  src={`/images/reactions/${reaction.type}.svg`}
                  fill
                  alt={reaction.text}
                  className="h-full w-full rounded-full object-cover transition-all duration-300 ease-in-out hover:scale-150 hover:translate-y-2 cursor-pointer border-2 border-solid border-indigo-900 shadow-xs hover:shadow-sm shadow-indigo-900"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Post;
