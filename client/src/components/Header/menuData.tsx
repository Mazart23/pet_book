import { Menu } from "@/types/menu";
import { FaHome, FaQrcode, FaInfoCircle } from "react-icons/fa";
import { BsSearchHeartFill } from "react-icons/bs";

const menuData: Menu[] = [
  {
    id: 1,
    title: <FaHome/>,
    path: "/",
    newTab: false,
  },
  {
    id: 2,
    title: <FaQrcode/>,
    path: "/qr",
    newTab: false,
  },
  {
    id: 33,
    title: <BsSearchHeartFill/>,
    path: "/search",
    newTab: false,
  },
  {
    id: 3,
    title: <FaInfoCircle/>,
    path: "/info",
    newTab: false,
  },
  {
    id: 4,
    title: "Pages",
    newTab: false,
    submenu: [
      {
        id: 41,
        title: "About Page",
        path: "/about",
        newTab: false,
      },
      {
        id: 42,
        title: "Contact Page",
        path: "/contact",
        newTab: false,
      },
      {
        id: 43,
        title: "Blog Grid Page",
        path: "/blog",
        newTab: false,
      },
      {
        id: 44,
        title: "Blog Sidebar Page",
        path: "/blog-sidebar",
        newTab: false,
      },
      {
        id: 45,
        title: "Blog Details Page",
        path: "/blog-details",
        newTab: false,
      },
      {
        id: 46,
        title: "Sign In Page",
        path: "/login",
        newTab: false,
      },
      {
        id: 47,
        title: "Sign Up Page",
        path: "/signup",
        newTab: false,
      },
      {
        id: 48,
        title: "Error Page",
        path: "/error",
        newTab: false,
      },
    ],
  },
];
export default menuData;
