import SinglePost from "@/components/Blog/SinglePost";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Post Page | PetBook",
  // other metadata
};

const PostPage = () => {
  return (
    <SinglePost />
  );
};

export default PostPage;
