"use client";

import { useEffect, useState, useRef } from "react";
import SectionTitle from "../Common/SectionTitle";
import Post from "./Post";
import PostForm from "./PostForm";
import { fetchPosts, createPost } from "@/app/Api";
import Lottie from "react-lottie";
import catAnimation from "@/static/animations/cat.json";
import underPost1 from "@/static/animations/underPost1.json";
import underPost2 from "@/static/animations/underPost2.json";
import underPost3 from "@/static/animations/underPost3.json";
import underPost4 from "@/static/animations/underPost4.json";
import underPost5 from "@/static/animations/underPost5.json";
import underPost6 from "@/static/animations/underPost6.json";
import underPost7 from "@/static/animations/underPost7.json";
import useToken from "../contexts/TokenContext";

const Blog = () => {
  const [postData, setPostData] = useState([]);
  const [lastTimestamp, setLastTimestamp] = useState();
  const [isAllLoaded, setIsAllLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [animationTrigger, setAnimationTrigger] = useState(false);
  const { token } = useToken();
  const containerRef = useRef<HTMLDivElement>(null);

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
      setTimeout(() => {
        setAnimationTrigger((prev) => !prev);
      }, 500); 
    });
  };

  useEffect(() => {
    if (token) {
      setIsLoading(true);
      fetchPosts(null, lastTimestamp, 6).then((data) => {
        if (data.length !== 0) {
          setPostData(data);
          setLastTimestamp(data.at(-1).timestamp);
        } 
        if (data.length < 6) {
          setIsAllLoaded(true);
        }
        setIsLoading(false);
        setTimeout(() => {
          setAnimationTrigger((prev) => !prev);
        }, 500);        
        setIsLoaded(true);
      });
    }
  }, [token]);

  const loadAnimations = () => {
    const container = containerRef.current;
    if (container) {
      const children = Array.from(container.children);
      const updatedPosts = [...postData];

      for (let i = 0; i < children.length; i += 2) {
        const firstChild = Array.from(children[i].children)[0] as HTMLElement;
        if (children[i + 1]) {
          const secondChild = Array.from(children[i + 1].children)[0] as HTMLElement | undefined;
          if (secondChild) {
            const firstHeight = firstChild.getBoundingClientRect().height;
            const secondHeight = secondChild.getBoundingClientRect().height;
            const heightDiff = Math.abs(firstHeight - secondHeight);
  
            if (heightDiff > 50) {
              if (firstHeight < secondHeight) {
                updatedPosts[i].filler = {
                  height: heightDiff - 20,
                  key: `${updatedPosts[i].id}-filler`,
                };
              } else {
                updatedPosts[i + 1].filler = {
                  height: heightDiff - 20,
                  key: `${updatedPosts[i + 1].id}-filler`,
                };
              }
            }
          }
        }
      }
      setPostData(updatedPosts);
    }
  };

  const handleAnimations = (index) => {
    const container = containerRef.current;
    if (container && index < postData.length - 1) {
      const children = Array.from(container.children);
      const updatedPosts = [...postData];

      const firstChild = Array.from(children[index].children)[0] as HTMLElement;
      const otherIndex = index - 2 * (index % 2 - 0.5);

      if (children[otherIndex]) {
        const secondChild = Array.from(children[otherIndex].children)[0] as HTMLElement | undefined;
  
        if (secondChild) {
          const firstHeight = firstChild.getBoundingClientRect().height;
          const secondHeight = secondChild.getBoundingClientRect().height;
          const heightDiff = Math.abs(firstHeight - secondHeight);
  
          if (heightDiff > 50) {
            if (firstHeight < secondHeight) {
              updatedPosts[index].filler = {
                height: heightDiff,
                key: `${updatedPosts[index].id}-filler`,
              };
              if (updatedPosts[otherIndex]?.filler) {
                delete updatedPosts[otherIndex].filler;
              }
            } else {
              updatedPosts[otherIndex].filler = {
                height: heightDiff,
                key: `${updatedPosts[otherIndex].id}-filler`,
              };
              if (updatedPosts[index].filler) {
                delete updatedPosts[index].filler;
              }
            } 
          } else {
            if (updatedPosts[index].filler) {
              delete updatedPosts[index].filler;
            }
            if (updatedPosts[otherIndex]?.filler) {
              delete updatedPosts[otherIndex].filler;
            }
          }
        }
        setPostData(updatedPosts);
      }
    }
  };

  const handleCreatePost = async (content: string, images: File[], location: string | null) => {
    try {
      // Create a FormData object to send the post data including images
      const formData = new FormData();
      formData.append('content', content);
      if (location) formData.append('location', location);
      images.forEach((image, index) => {
        formData.append(`images`, image);
      });

      const newPost = await createPost(token, formData);
      setPostData([newPost, ...postData]);
    } catch (error) {
      console.error("Failed to create post:", error);
    }
  };
  
  const lottieAnimations = [
    underPost1,
    underPost2,
    underPost3,
    underPost4,
    underPost5,
    underPost6,
    underPost7,
  ]

  const getRandomAnimation = (id) => {
    return lottieAnimations[id % lottieAnimations.length];
  };

  useEffect(() => {
    loadAnimations();
  }, [animationTrigger]);

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
        
        <div className="max-w-2xl mx-auto mb-10">
          <PostForm 
            onSubmit={handleCreatePost}
            token={token}
          />
        </div>

        <div 
          className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-1 md:gap-x-6 lg:grid-cols-2 lg:gap-x-8 xl:grid-cols-2"
          ref={containerRef}
        >
          {postData.map((post, index) => (
            <div key={post.id} className="w-full relative">
              <Post post={post} index={index} handleAnimations={handleAnimations} />
              {post.filler && (
                <div style={{ height: post.filler.height, width: "100%" }}>
                  <Lottie
                    options={{
                      loop: true,
                      autoplay: true,
                      animationData: getRandomAnimation(index),
                      rendererSettings: {
                        preserveAspectRatio: "xMidYMid slice",
                      },
                    }}
                    height={post.filler.height}
                    width={post.filler.height}
                  />
                </div>
              )}
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

