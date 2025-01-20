"use client";

import { useState, useRef } from "react";
import { ImagePlus, MapPin, X } from 'lucide-react';
import Image from "next/image";

interface PostFormProps {
  onSubmit: (content: string, images: File[], location: string | null) => Promise<void>;
  token: string | null;
}

export default function PostForm({ onSubmit, token }: PostFormProps) {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [location, setLocation] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !token) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content, images, location || null);
      setContent("");
      setImages([]);
      setImagePreviews([]);
      setLocation("");
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages([...images, ...files]);

    const newImagePreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newImagePreviews]);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newImagePreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newImagePreviews);
  };

  const openImageUploadDialog = () => {
    fileInputRef.current?.click();
  };

  if (!token) {
    return null; // Don't show the form if user is not logged in
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full min-h-[100px] p-3 rounded-lg border border-gray-200 dark:border-gray-700 
                   bg-transparent dark:bg-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        
        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1">
            {imagePreviews.map((img, index) => (
              <div key={index} className="relative w-20 h-20">
                <div className="absolute inset-0">
                  <Image
                    src={img || "/placeholder.svg"}
                    alt={`Upload ${index + 1}`}
                    fill
                    className="rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-0 right-0 p-0.5 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors z-10"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className="flex-1 flex items-center gap-2">
            <button
              type="button"
              onClick={openImageUploadDialog}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <ImagePlus size={20} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              multiple
              className="hidden"
            />
            <div className="flex-1">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Add location"
                className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 
                         bg-transparent dark:bg-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Posting..." : "Post"}
          </button>
        </div>
      </form>
    </div>
  );
}

