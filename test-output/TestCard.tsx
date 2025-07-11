'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface CardProps {
  title: string;
  description: string;
  imageUrl: string;
  altText: string;
}

const Card = ({ title, description, imageUrl, altText }: CardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      className={`
        relative
        rounded-lg
        shadow-md
        overflow-hidden
        transition-transform
        duration-200
        ${isHovered ? 'scale-105' : 'scale-100'}
        bg-white
        dark:bg-gray-800
        hover:shadow-lg
        cursor-pointer
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="aspect-w-16 aspect-h-9">
        <Image
          src={imageUrl}
          alt={altText}
          width={640}
          height={360}
          className="object-cover w-full h-full"
        />
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>
    </div>
  );
};

export default Card;