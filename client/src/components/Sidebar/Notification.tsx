import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchProfilePicture } from "@/app/Api";
import { FaMapMarkerAlt } from "react-icons/fa";
import MapModal from "../Map";

const Notification = ({
  type,
  id,
  timestamp,
  data
}: {
  type: string;
  id: string;
  timestamp: string;
  data: object;
}) => {
  const [imageUrl, setImageUrl] = useState();
  const [isMapModalOpen, setIsMapModalOpen] = useState(false)

  const fetchImage = async (userId) => {
    fetchProfilePicture(userId)
      .then((profileUrl) => {
        setImageUrl(profileUrl);
      })
      .catch((error) => {
        throw error;
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
    <div className="flex items-center lg:block xl:flex">
      <div className="mr-5 lg:mb-3 xl:mb-0">
        <div className="relative h-[60px] w-[60px] rounded-md sm:h-[75px] sm:w-[75px] flex justify-center items-center">
          <div className={"w-[70%] h-[70%] animate__animated animate__fadeInLeft"}>
            { type === "scan" ? (
              <FaMapMarkerAlt 
                onClick={handleOpenMap}         
                className="text-green-500 w-full h-full transition-all duration-300 ease-in-out hover:text-green-600 hover:translate-y-[-5px]"
              />
            ):(
              <>
              {imageUrl && 
                <Image src={imageUrl} fill/>
              }
              </>
            )}
          </div>
        </div>
      </div>
      <div className="w-full">
        {
          {
            "scan":
              <>
                <h6>
                  Someone scanned your QR code!
                </h6>
                <span onClick={handleOpenMap} className="mb-[6px] text-base font-medium leading-snug text-green-500 hover:text-green-600 outline-none border-none cursor-pointer">see the location</span>
              </>,
            "comment":
              <h6>
                User
                <Link
                  href={`/profile/${data.username}`}
                  className="mb-[6px] block text-base font-medium leading-snug text-black hover:text-primary dark:text-white dark:hover:text-primary"
                >
                  {data.username}
                </Link>
                commented the
                <Link
                  href={`/post/${data.post_id}`}
                  className="mb-[6px] block text-base font-medium leading-snug text-black hover:text-primary dark:text-white dark:hover:text-primary"
                >
                  post
                </Link>
                .
              </h6>,
            "reaction":
              <h6>
                User
                <Link
                  href={`/profile/${data.username}`}
                  className="mb-[6px] block text-base font-medium leading-snug text-black hover:text-primary dark:text-white dark:hover:text-primary"
                >
                  {data.username}
                </Link>
                reacted on
                <Link
                  href={`/post/${data.post_id}`}
                  className="mb-[6px] block text-base font-medium leading-snug text-black hover:text-primary dark:text-white dark:hover:text-primary"
                >
                  post
                </Link>
                .
              </h6>
          }[type]
        }
        <p className="text-xs font-medium text-body-color">{timestamp}</p>
      </div>
      {type === 'scan' &&
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
