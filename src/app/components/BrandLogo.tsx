import React from 'react';
import Image from 'next/image';

interface BrandLogoProps {
  className?: string;
  theme?: "light" | "dark";
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = "", theme = "dark" }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Image 
        src="/logo.png" 
        alt="Asia University Rankings Logo" 
        width={120} 
        height={90} 
        style={{ objectFit: "contain" }}
        priority
      />
    </div>
  );
};
