"use client";

import type React from "react";
import { useState, useRef } from "react";
import { searchRequestedResults } from "@/app/Api";
import UserCard from "./userCard";
import Post from "@/components/Blog/Post";
import Lottie from "react-lottie";
import loaderAnimation from "@/static/animations/loader.json";

const loaderOptions = {
  loop: true,
  autoplay: true,
  animationData: loaderAnimation,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

const SearchPage = () => {
  const [searchType, setSearchType] = useState<"username" | "content" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [displayedPosts, setDisplayedPosts] = useState<any[]>([]);
  const [hasMorePosts, setHasMorePosts] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);

  const fadeTimeout = useRef<NodeJS.Timeout | null>(null);

  const fadeCycle = () => {
    fadeTimeout.current = setTimeout(() => {
      setShowMessage(false);
    }, 3000);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchType || !searchQuery) return;

    if (fadeTimeout.current) {
      clearTimeout(fadeTimeout.current);
    }

    setError("");
    setSuccessMessage("");
    setShowMessage(false);
    setSearchResults([]);
    setAllPosts([]);
    setDisplayedPosts([]);
    setHasMorePosts(false);

    try {
      const data = await searchRequestedResults(searchQuery, searchType);

      if (searchType === "username") {
        setSearchResults(data.users || []);
        setSuccessMessage(`Found ${data.users?.length || 0} users`);
      } else {
        const posts = data.posts || [];
        setAllPosts(posts);
        setDisplayedPosts(posts.slice(0, 3));
        setHasMorePosts(posts.length > 3);
        setSuccessMessage(`Found ${posts.length} posts`);
      }

      setShowMessage(true);
      fadeCycle();
    } catch (error) {
      setError(`Search failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      setShowMessage(true);
      fadeCycle();
    }
  };

  const loadMorePosts = () => {
    setLoadingPosts(true);
    setTimeout(() => {
      const currentLength = displayedPosts.length;
      const newPosts = allPosts.slice(currentLength, currentLength + 3);
      setDisplayedPosts([...displayedPosts, ...newPosts]);
      setHasMorePosts(currentLength + 3 < allPosts.length);
      setLoadingPosts(false);
    }, 500);
  };

  return (
    <section className="relative z-10 overflow-hidden pt-20 pb-16 md:pb-20 lg:pb-28 lg:pt-[120px]">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center">
          <div className="w-full max-w-[480px]">
            <div className="shadow-lg rounded-lg bg-white px-6 py-8 dark:bg-dark sm:px-12 sm:py-10">
              <h3 className="mb-3 text-center text-2xl font-bold text-black dark:text-white sm:text-3xl">Search</h3>
              <form onSubmit={handleSearch}>
                <div className="mb-6">
                  <label htmlFor="searchType" className="mb-2 block text-sm text-dark dark:text-white">
                    Search Type
                  </label>
                  <div className="flex justify-center space-x-4">
                    <button
                      type="button"
                      onClick={() => setSearchType("username")}
                      className={`flex items-center justify-center rounded-md px-6 py-3 text-base font-medium ${
                        searchType === "username"
                          ? "bg-green-500 text-white"
                          : "bg-[#f8f8f8] text-body-color dark:bg-[#2C303B] dark:text-body-color-dark"
                      }`}
                    >
                      Username
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchType("content")}
                      className={`flex items-center justify-center rounded-md px-6 py-3 text-base font-medium ${
                        searchType === "content"
                          ? "bg-green-500 text-white"
                          : "bg-[#f8f8f8] text-body-color dark:bg-[#2C303B] dark:text-body-color-dark"
                      }`}
                    >
                      Content
                    </button>
                  </div>
                </div>
                {searchType && (
                  <div className="mb-6">
                    <label htmlFor="searchQuery" className="mb-2 block text-sm text-dark dark:text-white">
                      {searchType === "username" ? "Username" : "Content"} to search
                    </label>
                    <input
                      type="text"
                      name="searchQuery"
                      placeholder={`Enter ${searchType === "username" ? "username" : "content"} to search`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-md border bg-[#f8f8f8] px-6 py-4 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                    />
                  </div>
                )}
                <div className="mb-4">
                  <button
                    type="submit"
                    className="shadow-submit dark:shadow-submit-dark flex w-full items-center justify-center rounded-md bg-green-500 px-9 py-4 text-base font-medium text-white duration-300 hover:bg-green-600"
                    disabled={!searchType || !searchQuery}
                  >
                    Search
                  </button>
                </div>
              </form>
              {showMessage && (
                <div className={`mt-4 text-center animate__animated animate__fadeInUp`}>
                  {error && <p className="text-red-500">{error}</p>}
                  {successMessage && <p className="text-green-500">{successMessage}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
        {searchResults.length > 0 && searchType === "username" && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {searchResults.map((user, index) => (
              <UserCard key={index} user={user} />
            ))}
          </div>
        )}
        {displayedPosts.length > 0 && searchType === "content" && (
          <>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedPosts.map((post) => (
                <Post key={post.id} post={post} />
              ))}
            </div>
            {loadingPosts ? (
              <div className="flex justify-center mt-6">
                <Lottie options={loaderOptions} height={128} width={128} />
              </div>
            ) : (
              hasMorePosts && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={loadMorePosts}
                    className="rounded-md bg-green-500 px-6 py-3 text-white font-medium hover:bg-green-600"
                  >
                    Load More
                  </button>
                </div>
              )
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default SearchPage;