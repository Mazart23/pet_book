"use client";

import { useEffect, useState } from "react";
import SectionTitle from "../Common/SectionTitle";
import Post from "./Post";
import { fetchPosts } from "@/app/Api";
import Lottie from "react-lottie";
import catAnimation from "@/static/animations/cat.json";
import useToken from "../contexts/TokenContext";

const Blog = () => {
  const [postData, setPostData] = useState([]);
  const [lastTimestamp, setLastTimestamp] = useState();
  const [isAllLoaded, setIsAllLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const { token } = useToken();

  const fetchPostsFunc = () => {
    setIsLoading(true);
    fetchPosts(null, lastTimestamp, 6).then((data) => {
      if (data.length !== 0) {
        setPostData((prev) => prev.concat(data));
        setLastTimestamp(data.at(-1).timestamp);
      } 
      if (data.length < 6) {
        setIsAllLoaded(true);
      }
      setIsLoading(false);
    });
  };

  useEffect(() => {
    if (token) {
      fetchPostsFunc();
      setIsLoaded(true);
    }
  }, [token]);

  return (
    <section
      id="blog"
      className="bg-gray-light dark:bg-bg-color-dark py-16 md:py-20 lg:py-28"
    >
      <div className="container">
        <SectionTitle
          title="Home"
          paragraph="See the latest posts!"
          center
        />
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-1 md:gap-x-6 lg:grid-cols-2 lg:gap-x-8 xl:grid-cols-2">
          {postData.map((post) => (
            <div key={post.id} className="w-full">
              <Post post={post} />
            </div>
          ))}
        </div>
        {isLoading || !isLoaded ? (
          <div className="text-center text-gray-600 dark:text-gray-400 mt-8">
            <Lottie 
              options={{
                loop: true,
                autoplay: true,
                animationData: catAnimation,
                rendererSettings: {
                  preserveAspectRatio: 'xMidYMid slice'
                }
              }}
              height={100} 
              width={100} 
            />
          </div>  
        ) : !isAllLoaded ? (
          <div className="flex justify-center">
            <span
              onClick={fetchPostsFunc}
              className="mt-8 mx-10 text-lg font-large leading-snug text-green-400 hover:text-green-500 outline-none border-none cursor-pointer"
            >
              Load more
            </span>
          </div>
        ) : (
          <div className="text-center text-gray-600 dark:text-gray-400 mt-8">
            <p>No more posts to fetch.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Blog;
