import NotificationSidebar from "./NotificationSidebar";

export default function Sidebar() {
  return (
    <aside className="w-1/3 h-[calc(100vh-10rem)] bg-gray-light dark:bg-bg-color-dark text-white sticky top-28 mt-30 mb-16 ml-2 mr-8 p-4 rounded-lg overflow-hidden">
      <NotificationSidebar />
    </aside>
  );
}
