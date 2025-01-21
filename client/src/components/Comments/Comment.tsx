"use client";

import Image from "next/image";
import Link from "next/link";
import { FaTrashAlt } from "react-icons/fa";
import { SiDatadog } from "react-icons/si";
import { getColorFromUsername } from "@/app/layout";

const Comment = ({
  id,
  timestamp,
  content,
  user,
  onRemove,
  userSelfId
}: {
  id: string;
  timestamp: string;
  content: string;
  user: {
    id: string;
    username: string;
    image: string;
  };
  onRemove: (id: string) => void;
  userSelfId: string;
}) => {

  return (
    <div className="flex items-center">
      <div className="mr-5 xl:mb-0">
        <div className="relative h-[60px] w-[60px] rounded-md flex justify-center items-center">
          <div className={"w-10 h-10 animate__animated animate__fadeInLeft"}>
            <Link
              href={`/profile/${user.username}`}
            >
              {user.image ? (
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
            </Link>
          </div>
        </div>
      </div>
      <div className="w-full text-black dark:text-white">
        <p className="text-black dark:text-white">
        <Link
            href={`/profile/${user.username}`}
            className="mb-[6px] text-s font-small leading-snug text-green-400 hover:text-green-500 cursor-pointer outline-none border-none"
        >
            {user.username}
        </Link>
        </p>
        <p>
            {content}
        </p>
        <p className="text-xs font-medium text-body-color">{timestamp}</p>
      </div>
      {user.id === userSelfId && 
        <div className="relative flex items-center ml-auto pr-4">
          <FaTrashAlt
            onClick={() => onRemove(id)}
            className="text-gray-500 text-lg w-5 h-5 transition-all duration-200 ease-out-elastic hover:text-red-500 hover:translate-x-[2px] cursor-pointer"
          />
        </div>
      }
    </div>
  );
};

export default Comment;
