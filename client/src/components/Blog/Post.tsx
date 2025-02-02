"use client";

import {useState, useEffect} from "react";
import Image from "next/image";
import Link from "next/link";
import Lottie from "react-lottie";
import loaderAnimation from "@/static/animations/loader.json";
import { Post } from "@/types/post";
import { deleteReaction, putReaction } from "@/app/Api";
import { getColorFromUsername } from "@/app/layout";
import { SiDatadog } from "react-icons/si";
import ImageSlider from "../ImageSlider";
import { ImageOff } from 'lucide-react';
import useToken from "../contexts/TokenContext";
import useUser from "../contexts/UserContext";

const reactionsArray = [
  {"type": "good", "text": "Good", "count": 0}, 
  {"type": "heart", "text": "Heart", "count": 0}, 
  {"type": "haha", "text": "Haha", "count": 0}, 
  {"type": "wow", "text": "Wow", "count": 0}, 
  {"type": "p", "text": "Playful", "count": 0}, 
  {"type": "cry", "text": "Sad", "count": 0}
];

const updateReactionsCount = (reactions) => {
  const counts = reactions.reduce((acc, reaction) => {
    acc[reaction.reaction_type] = (acc[reaction.reaction_type] || 0) + 1;
    return acc;
  }, {});

  return reactionsArray.map((reaction) => ({
    ...reaction,
    count: counts[reaction.type] || 0,
  }));
};

const Post = ({ post, index, handleAnimations }: { post: Post, index: Number, handleAnimations: CallableFunction }) => {
  const { id, content, images, user, location, timestamp, reactions } = post;
  const [selectedReactionNum, setSelectedReactionNum] = useState<number | null>(null);
  const [reactionsCounts, setReactionsCounts] = useState(reactionsArray);
  const { token } = useToken();
  const { userSelf } = useUser();

  useEffect(() => {
    if (token && reactions) {
      const updatedReactions = updateReactionsCount(reactions); 
      const userReactionType = reactions.find((reaction) => reaction.user_id === userSelf?.id)?.reaction_type;

      if (userReactionType) {
        const userReactionIndex = updatedReactions.findIndex((reaction) => reaction.type === userReactionType);

        if (userReactionIndex !== -1) {
          updatedReactions[userReactionIndex].count -= 1;
          setSelectedReactionNum(userReactionIndex);
        }
      } else {
        setSelectedReactionNum(null);
      }

      setReactionsCounts(updatedReactions);
  }}, [token, reactions]);

  const changeReaction = (reactionNum) => {
    if (reactionNum === selectedReactionNum) {
      setSelectedReactionNum(null);
      deleteReaction(token, id);
    } else {
      setSelectedReactionNum(reactionNum);
      putReaction(token, reactionsArray.at(reactionNum).type, id);
    }
  }

  const onArrowClick = () => {
    if (index && handleAnimations) {
      setTimeout(() => {
        handleAnimations(index);
      }, 500); 
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-sm bg-white shadow-one duration-300 hover:shadow-two dark:bg-dark dark:hover:shadow-gray-dark">
      <div
        className="relative block aspect-[37/22] w-full"
      >
        {/* Green Tag */}
        { location && 
          <span className="absolute right-6 top-6 z-20 inline-flex items-center justify-center rounded-full bg-green-500 px-4 py-2 text-xs font-semibold capitalize text-white">
            {location}
          </span>
        }
        {images && images.length > 0 ? (
          <ImageSlider images={images} onArrowClick={onArrowClick}/>
        ) : (
          <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <div className="text-center">
              <ImageOff className="w-12 h-12 mx-auto mb-2 text-gray-400 dark:text-gray-600" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No image attached</p>
            </div>
          </div>
        )}
      </div>
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
              {user === undefined ? (
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
              ) : user?.image ? (
                <Image
                  src={user.image}
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
            {user?.username &&
              <h4 className="mt-1 text-sm font-medium text-dark dark:text-white">
                {user.username}
              </h4>
            }
          </div>
          <div className="mx-1 h-16 w-px bg-body-color dark:bg-white opacity-10"></div>
          <div className="flex flex-col items-center justify-center">
            <h4 className="mb-1 text-sm font-small text-dark dark:text-white">
              Date
            </h4>
            {timestamp && timestamp.split(' ').map((t, i) => (
              <p key={i} className="text-xs text-body-color">{t}</p>
            ))}
          </div>
          <div className="mx-1 h-16 w-px bg-body-color dark:bg-white opacity-10"></div>
          {reactionsCounts.map((reaction, index) => (
            <div key={reaction.type} className="ml-1 flex flex-col items-center justify-center">
              <p className={`mb-[2px] text-xs ${selectedReactionNum === index ? "text-dark dark:text-white" : "text-body-color"}`}>
                {reaction.text}
              </p>
              <p className={`mb-1 text-xs ${selectedReactionNum === index ? "text-dark dark:text-white" : "text-body-color"}`}>
                {reaction.count + (selectedReactionNum === index ? 1 : 0)}
              </p>
              <div className="relative h-8 w-8">
                <Image
                  src={`/images/reactions/${reaction.type}.svg`}
                  fill
                  alt={reaction.text}
                  onClick={() => changeReaction(index)}
                  className={`h-full w-full rounded-full object-cover transition-all duration-300 ease-in-out cursor-pointer border-2 border-solid
                    ${selectedReactionNum === index ? "scale-150 translate-y-2 border-green-600 shadow-green-600 shadow-md" : "hover:scale-150 hover:translate-y-2 border-indigo-900 shadow-indigo-900 shadow-xs hover:shadow-sm "}`
                  }
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

