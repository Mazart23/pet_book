"use client";

import SectionTitle from "../Common/SectionTitle";
import Post from "./Post";
import postData from "./postData";

const Blog = () => {
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
      </div>
    </section>
  );
};

export default Blog;
