import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchProfilePicture } from "@/app/Api";

const Notification = ({
  type,
  timestamp,
  data
}: {
  type: string;
  timestamp: string;
  data: object;
}) => {
  const [url, setUrl] = useState();
  const [image, setImage] = useState();

  const fetchImage = (userId) => {
    fetchProfilePicture(userId)
      .then((profileUrl) => {
        return profileUrl;
      })
      .catch((error) => {
        throw error;
      });
  };

  useEffect(() => {
    if (["reaction", "comment"].includes(type)) {
      setUrl(data.url);
      setImage(fetchImage(data.user_id));
    }
  }, []);

  return (
    <div className="flex items-center lg:block xl:flex">
      <div className="mr-5 lg:mb-3 xl:mb-0">
        <div className="relative h-[60px] w-[70px] overflow-hidden rounded-md sm:h-[75px] sm:w-[85px]">
          {image && 
            <div className={"animate__animated animate__fadeInUp animate__faster"}>
              <Image src={image} fill />
            </div>
          }
        </div>
      </div>
      <div className="w-full">
        <h5>
        {
          {
            "scan": <Foo />,
            "comment": <Bar />,
            "reaction": <Bar />
          }[type]
        }
          <Link
            href={slug}
            className="mb-[6px] block text-base font-medium leading-snug text-black hover:text-primary dark:text-white dark:hover:text-primary"
          >
            {title}
          </Link>
        </h5>
        <p className="text-xs font-medium text-body-color">{timestamp}</p>
      </div>
    </div>
  );
};

export default Notification;
