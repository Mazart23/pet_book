"use client";

import { useEffect, useState } from "react";
import RelatedPost from "./RelatedPost";
import Notification from "./Notification";
import { getNotifications } from "@/app/Api";
import useToken from "../contexts/TokenContext";

const NotificationSidebar = () => {
  const [notifications, setNotifications] = useState([]);
  const { token } = useToken();

  useEffect(() => {
    if (token) {
      getNotifications(token).then((data) => {
        if (data) {
          setNotifications(data);
        }
      });
    }
  }, [token])

  return (
    <div className="shadow-three dark:bg-gray-dark mb-10 rounded-sm bg-white dark:shadow-none">
      <h3 className="border-b border-body-color border-opacity-10 px-8 py-4 text-lg font-semibold text-black dark:border-white dark:border-opacity-10 dark:text-white">
        Notifications
      </h3>
      <ul className="p-8">
        {notifications && notifications.map((notification) => (
          <li className="mb-6 border-b border-body-color border-opacity-10 pb-6 dark:border-white dark:border-opacity-10">
            <Notification
              type={notification.notification_type}
              id={notification.notification_id}
              timestamp={notification.timestamp}
              data={notification.data}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationSidebar;
