"use client";

import { useEffect, useState } from "react";
import Lottie from "react-lottie";
import catAnimation from "@/static/animations/cat.json";
import Comment from "./Comment";
import { getComments, deleteComment, putComment } from "@/app/Api";
import useToken from "../contexts/TokenContext";
import useWebsocket from "../contexts/WebsocketContext";
import useUser from "../contexts/UserContext";

const Comments = ({postId}: {postId: string}) => {
  const [comments, setComments] = useState([]);
  const [lastTimestamp, setLastTimestamp] = useState();
  const [isAllLoaded, setIsAllLoaded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [dismissedComments, setDismissedComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const { token } = useToken();
  const { socket } = useWebsocket();
  const { userSelf } = useUser();

  const fetchComments = () => {
    if (token && !isLoading) {
      setIsLoading(true);
      getComments(token, postId, lastTimestamp).then((data) => {
        if (data.length !== 0) {
          setComments((prevComments) => prevComments.concat(data));
          setLastTimestamp(data.at(-1).timestamp);
        } 
        if (data.length < 5) {
          setIsAllLoaded(true);
        }
        setIsLoaded(true);
        setIsLoading(false);
      });
    }
  };

  const handleAddComment = () => {
    const content = newComment.trim();
    if (content && token) {
      putComment(token, content, postId).then((data) => {
        setComments((prev) => [data, ...prev]);
        setNewComment("");
      });
    }
  };

  const handleRemoveComment = async (commentId) => {
    if (token) {
      deleteComment(token, commentId);
      setDismissedComments((prev) => [...prev, commentId]);

      setTimeout(() => {
        setComments((prev) => prev.filter((comment) => comment.id !== commentId));
        setDismissedComments((prev) => prev.filter((nid) => nid !== commentId));
      }, 500);
    }
  };

  useEffect(() => {
    if (socket && token) {
      if (token && !isLoading) {
        setIsLoading(true);
        getComments(token, postId, lastTimestamp).then((data) => {
          if (data.length !== 0) {
            setComments(data);
            setLastTimestamp(data.at(-1).timestamp);
          } 
          if (data.length < 5) {
            setIsAllLoaded(true);
          }
          setIsLoaded(true);
          setIsLoading(false);
        });
      }
    }
  }, [socket]);

  const adjustTextareaHeight = (element: HTMLTextAreaElement) => {
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  };

  return (
    <div className="relative h-full overflow-hidden">
      <h3 className="sticky top-0 z-10 bg-white dark:bg-gray-dark border-b border-body-color border-opacity-10 px-8 py-4 mt-16 text-lg font-semibold text-black dark:border-white dark:border-opacity-10 dark:text-white">
        Comments
      </h3>
      <ul className="p-8 pb-32 overflow-y-auto h-full">
        {comments.map((comment) => (
          <li
            key={comment.id}
            className={`mb-6 border-b border-body-color border-opacity-10 pb-6 dark:border-white dark:border-opacity-10 ${
              dismissedComments.includes(comment.id)
                ? "animate__animated animate__backOutDown"
                : ""
            }`}
          >
            <Comment
              id={comment.id}
              timestamp={comment.timestamp}
              content={comment.content}
              user={comment.user}
              onRemove={handleRemoveComment}
              userSelfId={userSelf?.id}
            />
          </li>
        ))}
        {isLoaded && (
          <div className="flex justify-center">
            {isAllLoaded ? (
              <p className="mb-6 text-base font-medium leading-snug text-gray-400 dark:text-gray-600">
                No more comments to fetch
              </p>
            ) : (
              isLoading ? (
                <div className="flex items-center h-16 w-16 mb-6">
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
              ):(
                <span
                  onClick={fetchComments}
                  className="mt-16 mx-10 text-base font-large leading-snug text-green-400 hover:text-green-500 outline-none border-none cursor-pointer"
                >
                  Load more
                </span>
              )
            )}
          </div>
        )}
      </ul>
      <div className="sticky relative inset-x-0 bottom-0 flex items-center p-4 mb-16 border-t border-body-color border-opacity-10 bg-gray-100 dark:bg-gray-800 dark:border-white dark:border-opacity-10">
        <textarea
          value={newComment}
          onChange={(e) => {
            setNewComment(e.target.value);
            adjustTextareaHeight(e.target as HTMLTextAreaElement);
          }}
          placeholder="Write a comment..."
          rows={1}
          className="flex-grow p-2 rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-green-400 resize-none"        
        />
        <button
          onClick={handleAddComment}
          disabled={!newComment.trim()}
          className={
            `ml-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 shadow-lg focus:ring-2 focus:ring-green-400 transition duration-300${
            newComment.trim() ? "" : "opacity-50 cursor-not-allowed"
          }`}
        >
          Comment
        </button>
      </div>
    </div>
  );
};

export default Comments;
