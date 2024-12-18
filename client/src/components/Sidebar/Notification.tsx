import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchProfilePicture } from "@/app/Api";
import { FaTrashAlt } from "react-icons/fa";
import { SiDatadog } from "react-icons/si";
import { MdLocationOn, MdLocationOff } from "react-icons/md";
import MapModal from "../Map";
import { NotificationData } from "@/types/notificationData";
import { getColorFromUsername } from "@/app/layout";

const Notification = ({
  type,
  id,
  timestamp,
  data,
  onRemove
}: {
  type: string;
  id: string;
  timestamp: string;
  data: NotificationData;
  onRemove: (type: string, id: string) => void;
}) => {
  const [imageUrl, setImageUrl] = useState<string | null | undefined>(undefined);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false)

  const fetchImage = async (userId) => {
    fetchProfilePicture(userId)
      .then((profileUrl) => {
        if (profileUrl === "") {
          setImageUrl(null);
        } else {
          setImageUrl(profileUrl);
        }
      })
      .catch((error) => {
        setImageUrl(null);
      });
  };

  const handleOpenMap = () => {
    setIsMapModalOpen(true);
  };

  const handleCloseMap = () => {
    setIsMapModalOpen(false);
  };

  useEffect(() => {
    if (["reaction", "comment"].includes(type)) {
      fetchImage(data.user_id);
    }
  }, []);

  return (
    <div className="flex items-center">
      <div className="mr-5 xl:mb-0">
        <div className="relative h-[60px] w-[60px] rounded-md flex justify-center items-center">
          <div className={`w-10 h-10 ${imageUrl || !["reaction", "comment"].includes(type) ? "animate__animated animate__fadeInLeft" : ""}`}>
            { type === "scan" ? (
              (data.city && data.latitude && data.longitude) ? (
                <MdLocationOn
                  onClick={handleOpenMap}         
                  className="text-green-500 w-full h-full transition-all duration-300 ease-in-out hover:text-green-600 hover:translate-y-[-5px] cursor-pointer p-[2px]"
                />
              ):(
                <MdLocationOff         
                  className="text-body-color w-full h-full p-[2px]"
                />
              )
            ):(
              <Link
                href={`/profile/${data.username}`}
              >
                {imageUrl === undefined ? (
                  <></>
                ) : imageUrl ? (
                  <Image
                    src={imageUrl}
                    fill
                    alt="User profile picture"
                    className="h-full w-full rounded-full object-cover transition-all duration-300 ease-in-out hover:scale-110 cursor-pointer border-2 border-solid border-indigo-900 shadow-lg hover:shadow-xl shadow-gradient"
                  />
                ) : (
                  <SiDatadog 
                    className="h-full w-full rounded-full object-cover transition-all duration-300 ease-in-out hover:scale-110 cursor-pointer border-2 border-solid border-indigo-900 shadow-lg hover:shadow-xl shadow-gradient" 
                    style={{
                      color: getColorFromUsername(data.username),
                    }}
                  />
                )}
              </Link>
            )}
          </div>
        </div>
      </div>
      <div className="w-full text-black dark:text-white">
        {
          {
            "scan":
              <>
                <h3 className="text-black dark:text-white">
                  QR code scanned!
                </h3>
                {data.city && data.latitude && data.longitude &&
                  <span 
                    onClick={handleOpenMap} 
                    className='mb-[6px] text-s font-small leading-snug text-green-400 hover:text-green-500 cursor-pointer outline-none border-none'
                  >
                    Location
                  </span>
                }
              </>,
            "comment":
              <>
                <h3 className="text-black dark:text-white">
                  <Link
                    href={`/post/${data.post_id}`}
                    className="mb-[6px] text-base font-medium leading-snug text-green-400 hover:text-green-500 cursor-pointer outline-none border-none"
                  >
                    Post
                  </Link>
                  {" "}commented!
                </h3>
                User{" "}
                <Link
                  href={`/profile/${data.username}`}
                  className="mb-[6px] text-s font-small leading-snug text-green-400 hover:text-green-500 cursor-pointer outline-none border-none"
                >
                  {data.username}
                </Link>
              </>,
            "reaction":
              <>
                <h3 className="text-black dark:text-white">
                  <Link
                    href={`/post/${data.post_id}`}
                    className="mb-[6px] text-base font-medium leading-snug text-green-400 hover:text-green-500 cursor-pointer outline-none border-none"
                  >
                    Post
                  </Link>
                  <span> commented!</span>
                </h3>
                <span className="font-small">User </span>
                <Link
                  href={`/profile/${data.username}`}
                  className="mb-[6px] text-s font-small leading-snug text-green-300 hover:text-green-500 cursor-pointer outline-none border-none"
                >
                  {data.username}
                </Link>
              </>
          }[type]
        }
        <p className="text-xs font-medium text-body-color">{timestamp}</p>
      </div>
      <div className="relative flex items-center ml-auto pr-4">
        <FaTrashAlt
          onClick={() => onRemove(type, id)}
          className="text-gray-500 text-lg w-5 h-5 transition-all duration-200 ease-out-elastic hover:text-red-500 hover:translate-x-[2px] cursor-pointer"
        />
      </div>
      {type === 'scan' && data.city && data.latitude && data.longitude &&
        <MapModal
          city={data.city}
          latitude={data.latitude}
          longitude={data.longitude}
          open={isMapModalOpen}
          onClose={handleCloseMap}
        />
      }
    </div>
  );
};

export default Notification;
