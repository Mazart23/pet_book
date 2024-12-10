import { useEffect, useState } from "react";
import RelatedPost from "./RelatedPost";

const NotificationSidebar = () => {
  const notifications = ['1', '3', '5'];

  return (
    <div className="shadow-three dark:bg-gray-dark mb-10 rounded-sm bg-white dark:shadow-none">
      <h3 className="border-b border-body-color border-opacity-10 px-8 py-4 text-lg font-semibold text-black dark:border-white dark:border-opacity-10 dark:text-white">
        Notifications
      </h3>
      <ul className="p-8">
        {notifications && notifications.map((notification) => {
          <li className="mb-6 border-b border-body-color border-opacity-10 pb-6 dark:border-white dark:border-opacity-10">
            <RelatedPost
              title="Best way to boost your online sales."
              image="/images/blog/post-01.jpg"
              slug="#"
              date="12 Feb 2024"
            />
          </li>
        })}
      </ul>
    </div>
  );
};

export default NotificationSidebar;
