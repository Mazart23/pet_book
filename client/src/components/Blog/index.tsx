"use client";

import { useState } from "react";
import SectionTitle from "../Common/SectionTitle";
import Post from "./Post";
import PostForm from "./PostForm";
import postData from "./postData";
import { createPost } from "@/app/Api";
import useToken from "../contexts/TokenContext";

const Blog = () => {
  const [posts, setPosts] = useState(postData);
  const { token } = useToken();

  const handleCreatePost = async (content: string, images: File[], location: string | null) => {
    if (!token) {
      console.error("No token available");
      return;
    }

    try {
      // Create a FormData object to send the post data including images
      const formData = new FormData();
      formData.append('content', content);
      if (location) formData.append('location', location);
      images.forEach((image, index) => {
        formData.append(`images`, image);
      });

      const newPost = await createPost(token, formData);
      setPosts([newPost, ...posts]);
    } catch (error) {
      console.error("Failed to create post:", error);
    }
  };

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

        <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-1 md:gap-x-6 lg:grid-cols-2 lg:gap-x-8 xl:grid-cols-2">
          {postData.map((post) => (
            <div key={post.id} className="w-full">
              <Post post={post} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Blog;

