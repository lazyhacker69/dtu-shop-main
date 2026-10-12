// components/providers/ParallaxWrapper.tsx
"use client";

import { ParallaxProvider } from 'react-scroll-parallax';

interface ParallaxWrapperProps {
  children: React.ReactNode;
}

export default function ParallaxWrapper({ children }: ParallaxWrapperProps) {
  return (
    <ParallaxProvider>
      {children}
    </ParallaxProvider>
  );
}
