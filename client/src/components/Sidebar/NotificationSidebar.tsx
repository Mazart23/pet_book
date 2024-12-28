"use client";

import { useEffect, useState } from "react";
import Lottie from "react-lottie";
import catAnimation from "@/static/animations/cat.json"
import Notification from "./Notification";
import { getNotifications, deleteNotification } from "@/app/Api";
import useToken from "../contexts/TokenContext";
import useWebsocket from "../contexts/WebsocketContext";

const NotificationSidebar = () => {
  const [notifications, setNotifications] = useState([]);
  const [lastTimestamp, setLastTimestamp] = useState();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAllLoaded, setIsAllLoaded] = useState(false);
  const [animatedNotifications, setAnimatedNotifications] = useState([]);
  const [dismissedNotifications, setDismissedNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useToken();
  const { socket } = useWebsocket();

  const fetchNotifications = () => {
    if (token && !isLoading) {
      setIsLoading(true);
      getNotifications(token, lastTimestamp).then((data) => {
        if (data.length !== 0) {
          setNotifications((prevNotifications) => prevNotifications.concat(data));
          const newLastTimestamp = data.at(-1).timestamp;
          setLastTimestamp(newLastTimestamp);
        } 
        if (data.length < 3) {
          setIsAllLoaded(true);
        }
        setIsLoading(false);
      });
    }
  };

  const handleRemoveNotification = async (type, id) => {
    if (token) {
      deleteNotification(token, type, id);
      setDismissedNotifications((prev) => [...prev, id]);

      setTimeout(() => {
        setNotifications((prev) => prev.filter((notification) => notification.notification_id !== id));
        setDismissedNotifications((prev) => prev.filter((nid) => nid !== id));
      }, 500);
    }
  };

  useEffect(() => {
    if (token && socket) {
      setIsLoading(true);
      getNotifications(token).then((data) => {
        if (data.length !== 0) {
          setNotifications(data);
          setLastTimestamp(data.at(-1).timestamp);
        }
        if (data.length < 3) {
          setIsAllLoaded(true);
        }
        setIsLoaded(true);
        setIsLoading(false);
      });
    }
  }, [socket]);

  useEffect(() => {
    if (socket) {
      const handler = (data) => {
        setNotifications((prevNotifications) => [data, ...prevNotifications]);
        setAnimatedNotifications((prevAnimated) => [data.notification_id, ...prevAnimated]);
        
        setTimeout(() => {
          setAnimatedNotifications((prevAnimated) =>
            prevAnimated.filter((id) => id !== data.notification_id)
          );
        }, 1000);
      };

      socket.on("notification_scan", handler);

      return () => {
        socket.off("notification_scan", handler);
      };
    }
  }, [socket]);

  return (
    <div className="relative h-full">
      <h3 className="sticky top-0 z-10 bg-white dark:bg-gray-dark border-b border-body-color border-opacity-10 px-8 py-4 text-lg font-semibold text-black dark:border-white dark:border-opacity-10 dark:text-white">
        Notifications
      </h3>
      <ul className="p-8 overflow-y-auto h-full">
        {notifications &&
          notifications.map((notification) => (
            <li
              key={notification.notification_id}
              className={`mb-6 border-b border-body-color border-opacity-10 pb-6 dark:border-white dark:border-opacity-10 ${
                animatedNotifications.includes(notification.notification_id)
                  ? "animate-slide-in"
                  : ""
              } ${
                dismissedNotifications.includes(notification.notification_id)
                  ? "animate__animated animate__backOutDown"
                  : ""
              }`}
            >
              <Notification
                type={notification.notification_type}
                id={notification.notification_id}
                timestamp={notification.timestamp}
                data={notification.data}
                onRemove={handleRemoveNotification}
              />
            </li>
          ))
        }
        {isLoaded && (
          <div className="flex justify-center">
            {isAllLoaded ? (
              <p className="mb-6 text-base font-medium leading-snug text-gray-400 dark:text-gray-600">
                No more notifications to fetch
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
                  onClick={fetchNotifications}
                  className="mt-16 mb-10 text-base font-large leading-snug text-green-400 hover:text-green-500 outline-none border-none cursor-pointer"
                >
                  Load more
                </span>
              )
            )}
          </div>
        )}
      </ul>
    </div>
  );
};

export default NotificationSidebar;
