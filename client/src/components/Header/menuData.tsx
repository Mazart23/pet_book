import { Menu } from "@/types/menu";
import { FaHome, FaQrcode, FaInfoCircle } from "react-icons/fa";
import { BsSearchHeartFill } from "react-icons/bs";

const menuData: Menu[] = [
  {
    id: 0,
    title: <FaHome size={26}/>,
    path: "/",
    newTab: false,
  },
  {
    id: 1,
    title: <FaQrcode size={26}/>,
    path: "/qr",
    newTab: false,
  },
  {
    id: 2,
    title: <BsSearchHeartFill size={26}/>,
    path: "/search",
    newTab: false,
  },
  {
    id: 3,
    title: <FaInfoCircle size={26}/>,
    path: "/about",
    newTab: false,
  },
];
export default menuData;
