import NotificationSidebar from "./NotificationSidebar";

export default function Sidebar() {
  return (
    <aside className="w-1/4 h-screen bg-gray-800 text-white sticky lg:top-30 md:top-40 sm:top-50 p-6 mx-10 lg:mt-20 md:mt-30 sm:mt-40 mb-10">
      <NotificationSidebar/>
    </aside>
  );
}
