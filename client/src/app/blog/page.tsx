import Post from "@/components/Blog/Post";
import postData from "@/components/Blog/postData";
import Breadcrumb from "@/components/Common/Breadcrumb";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog Page | PetBook",
  description: "This is Blog Page for Startup Nextjs Template",
  // other metadata
};

const Blog = () => {
  return (
    <>
      <Breadcrumb
        pageName="Blog Grid"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. In varius eros eget sapien consectetur ultrices. Ut quis dapibus libero."
      />

      <section className="pb-[120px] pt-[120px]">
        <div className="container">
          <div className="-mx-4 flex flex-wrap justify-center">
            {postData.map((post) => (
              <div
                key={post.id}
                className="w-full px-4 md:w-full lg:w-1/2 xl:w-1/2"
              >
                <Post post={post} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Blog;
