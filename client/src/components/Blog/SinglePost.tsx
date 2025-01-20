"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Lottie from "react-lottie";
import loaderAnimation from "@/static/animations/loader.json";
import useToken from "../contexts/TokenContext";
import ScrollUp from "../Common/ScrollUp";
import Post from "./Post";
import Comments from "../Comments";
import { getPost } from "@/app/Api";

const SinglePost = () => {
  const { postId } = useParams();
  const [post, setPost] = useState();
  const [loadingPost, setLoadingPost] = useState(true);
  const { token } = useToken();

  useEffect(() => {
    if (token) {
      setLoadingPost(true);
      getPost(token, postId)
        .then((post) => setPost(post))
        .catch((err) => console.error("Failed to fetch post:", err))
        .finally(() => setLoadingPost(false));
    }
  }, [token]);
  
  return (
    <>
      <ScrollUp />
      <div className="flex min-h-[100vh]">
        <aside className="w-1/2 h-[calc(100vh-10rem)] bg-gray-light dark:bg-bg-color-dark text-white sticky top-28 mt-30 mb-16 ml-2 mr-8 p-4 rounded-lg overflow-y-auto">
          {loadingPost ? (
            <Lottie 
              options={{
                loop: true,
                autoplay: true,
                animationData: loaderAnimation,
                rendererSettings: {
                  preserveAspectRatio: 'xMidYMid slice'
                }
              }}
              height={200} 
              width={200} 
            />
          ):(
            <Post post={post}/>
          )}
        </aside>
        <div className="flex-1 h-[calc(100vh-10rem)] sticky top-28">
          {loadingPost ? (
            <Lottie 
              options={{
                loop: true,
                autoplay: true,
                animationData: loaderAnimation,
                rendererSettings: {
                  preserveAspectRatio: 'xMidYMid slice'
                }
              }}
              height={200} 
              width={200} 
            />
          ):(
            <Comments postId={postId}/>
          )}
        </div>
      </div>
    </>
  );
};

export default SinglePost;
