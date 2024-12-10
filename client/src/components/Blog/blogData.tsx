import { Blog } from "@/types/blog";

const blogData: Blog[] = [
  {
    id: 1,
    title: "Top 10 Tips for Training Your Dog",
    paragraph:
      "Learn how to train your dog effectively with these simple and proven tips. Make your furry friend the happiest!",
    image: "/images/blog/blog-01.jpg",
    author: {
      name: "Emily Pawson",
      image: "/images/blog/author-01.jpg",
      designation: "Pet Trainer",
    },
    tags: ["training", "dogs"],
    publishDate: "2024",
  },
  {
    id: 2,
    title: "Essential Cat Care Tips for Beginners",
    paragraph:
      "Starting with your first cat? These cat care essentials will ensure your feline friend stays healthy and happy.",
    image: "/images/blog/blog-02.jpg",
    author: {
      name: "Leo Whiskers",
      image: "/images/blog/author-02.jpg",
      designation: "Veterinarian",
    },
    tags: ["cats", "care"],
    publishDate: "2024",
  },
  {
    id: 3,
    title: "The Ultimate Guide to Adopting Pets",
    paragraph:
      "Thinking of adopting a pet? Here's a comprehensive guide to help you prepare for your new furry family member.",
    image: "/images/blog/blog-03.jpg",
    author: {
      name: "Samantha Tail",
      image: "/images/blog/author-03.jpg",
      designation: "Animal Advocate",
    },
    tags: ["adoption", "guides"],
    publishDate: "2024",
  },
];
export default blogData;