import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import { RiArrowLeftWideLine, RiArrowRightWideLine  } from "react-icons/ri";

export default function ImageSlider({ images, onArrowClick }) {
  const galleryImages = images.map((img) => ({
    original: img,
    thumbnail: img,
  }));

  const renderLeftNav = (onClick, disabled) => (
    <button
      className={`absolute top-1/2 -translate-y-1/2 left-2 z-10 p-2 rounded-full transition ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:text-green-600 text-gray-300 hover:-translate-x-1 hover:scale-125"
      }`}
      onClick={(e) => {
        if (!disabled) {
          onArrowClick();
          onClick(e);
        }
      }}
      disabled={disabled}
    >
      <RiArrowLeftWideLine size={32} />
    </button>
  );

  const renderRightNav = (onClick, disabled) => (
    <button
      className={`absolute top-1/2 -translate-y-1/2 right-2 z-10 p-2 rounded-full transition ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:text-green-600 text-gray-300 hover:translate-x-1 hover:scale-125"
      }`}
      onClick={(e) => {
        if (!disabled) {
          onArrowClick();
          onClick(e);
        }
      }}
      disabled={disabled}
    >
      <RiArrowRightWideLine size={32} />
    </button>
  );

  return (
    <ImageGallery
      items={galleryImages}
      showFullscreenButton={true}
      showPlayButton={false}
      showThumbnails={false}
      showBullets={true}
      renderLeftNav={renderLeftNav}
      renderRightNav={renderRightNav}
    />
  )
}