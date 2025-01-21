"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Lottie from "react-lottie"
import loaderAnimation from "@/static/animations/loader.json"
import useToken from "../contexts/TokenContext"
import ScrollUp from "../Common/ScrollUp"
import Post from "./Post"
import Comments from "../Comments"
import { getPost, deletePost } from "@/app/Api"
import useUser from "../contexts/UserContext";

const SinglePost = () => {
  const { postId } = useParams()
  const [post, setPost] = useState()
  const [loadingPost, setLoadingPost] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const { token } = useToken()
  const { userSelf } = useUser();
  const router = useRouter()

  useEffect(() => {
    if (token) {
      setLoadingPost(true)
      getPost(token, postId)
        .then((post) => setPost(post))
        .catch((err) => console.error("Failed to fetch post:", err))
        .finally(() => setLoadingPost(false))
    }
  }, [token, postId])

  const handleDeletePost = async () => {
    try {
      await deletePost(token, postId)
      router.push("/") // Redirect to home page after deletion
    } catch (error) {
      console.error("Failed to delete post:", error)
    }
  }

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
                  preserveAspectRatio: "xMidYMid slice",
                },
              }}
              height={200}
              width={200}
            />
          ) : (
            <>
              <Post post={post} />
              {post && post.user.id === userSelf?.id && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Delete Post
                </button>
              )}
            </>
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
                  preserveAspectRatio: "xMidYMid slice",
                },
              }}
              height={200}
              width={200}
            />
          ) : (
            <Comments postId={postId} />
          )}
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Confirm Deletion</h2>
            <p className="mb-6 dark:text-gray-300">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeletePost()
                  setShowDeleteModal(false)
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default SinglePost

