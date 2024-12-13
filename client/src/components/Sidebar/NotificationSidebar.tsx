"use client";

import { useEffect, useState } from "react";
import Notification from "./Notification";
import { getNotifications } from "@/app/Api";
import useToken from "../contexts/TokenContext";
import useWebsocket from "../contexts/WebsocketContext";

const NotificationSidebar = () => {
  const [notifications, setNotifications] = useState([]);
  const [lastTimestamp, setLastTimestamp] = useState();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAllLoaded, setIsAllLoaded] = useState(false);
  const [animatedNotifications, setAnimatedNotifications] = useState([]);
  const { token } = useToken();
  const { socket } = useWebsocket();

  const fetchNotifications = () => {
    if (token) {
      getNotifications(token, lastTimestamp).then((data) => {
        if (data) {
          setNotifications((prevNotifications) => prevNotifications.concat(data));
          const newLastTimestamp = data.at(-1).timestamp;
          if (newLastTimestamp === lastTimestamp) {
            setIsAllLoaded(true);
          }
          setLastTimestamp(newLastTimestamp);
        }
      });
    }
  };

  useEffect(() => {
    if (token) {
      getNotifications(token).then((data) => {
        if (data) {
          setNotifications(data);
          if (data.length < 2) {
            setIsAllLoaded(true);
          }
          setLastTimestamp(data.at(-1).timestamp);
        }
        setIsLoaded(true);
      });
    }
  }, [token]);

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
    <div className="shadow-three dark:bg-gray-dark mb-10 rounded-sm bg-white dark:shadow-none">
      <h3 className="border-b border-body-color border-opacity-10 px-8 py-4 text-lg font-semibold text-black dark:border-white dark:border-opacity-10 dark:text-white">
        Notifications
      </h3>
      <ul className="p-8">
        {notifications &&
          notifications.map((notification) => (
            <li
              key={notification.notification_id}
              className={`mb-6 border-b border-body-color border-opacity-10 pb-6 dark:border-white dark:border-opacity-10 ${
                animatedNotifications.includes(notification.notification_id)
                  ? "animate-slide-in"
                  : ""
              }`}
            >
              <Notification
                type={notification.notification_type}
                id={notification.notification_id}
                timestamp={notification.timestamp}
                data={notification.data}
              />
            </li>
          ))}
        {isLoaded && (
          <div className="flex justify-center">
            {isAllLoaded ? (
              <p className="mb-[6px] text-base font-medium leading-snug text-gray-400 dark:text-gray-600">
                No more notifications to fetch
              </p>
            ) : (
              <span
                onClick={fetchNotifications}
                className="mb-[6px] text-base font-large leading-snug text-green-500 hover:text-green-600 outline-none border-none cursor-pointer"
              >
                Load more
              </span>
            )}
          </div>
        )}
      </ul>
    </div>
  );
};

export default NotificationSidebar;
