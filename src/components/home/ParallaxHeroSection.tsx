// components/home/ParallaxHeroSection.tsx - Enhanced CSS version
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

export default function ParallaxHeroSection() {
  const [scrollY, setScrollY] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {/* Parallax Hero */}
      <div className="relative h-screen overflow-hidden">
        {/* Background Image with Parallax */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: 'url(/assets/dtuBg.jpeg)',
            transform: `translateY(${scrollY * 0.5}px)`,
            filter: 'brightness(0.7) contrast(1.1)'
          }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-red-600/20 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-red-500/15 blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white/10 blur-2xl animate-pulse delay-2000"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center text-white space-y-8 sm:space-y-12 px-4">
            {/* DTU Logo */}
            <div className="flex justify-center mb-4 sm:mb-8">
              <img 
                src="/assets/dtuLogo.png" 
                alt="Delhi Technological University Logo"
                className="h-16 w-auto sm:h-20 md:h-24 lg:h-28 drop-shadow-2xl"
              />
            </div>
            
            {/* Main DTU Shop Heading with Effects - Responsive */}
            <div className="space-y-4 sm:space-y-6">
              <h1 className="text-3xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl font-black leading-none tracking-tight">
                <span className="block text-white drop-shadow-2xl mb-2 sm:mb-4">
                  Delhi Technological University
                </span>
                <span className="block text-red-500 drop-shadow-2xl text-shadow-glow">
                  GIFT SHOP
                </span>
              </h1>
              
              {/* Subtitle with Animation - Responsive */}
              <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-light text-gray-200 tracking-wide animate-fade-in-up">
  Your One-Stop Destination for DTU Merchandise
</h2>
              
              {/* Decorative Line - Responsive */}
              <div className="w-24 sm:w-32 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent mx-auto"></div>
            </div>
            
            {/* Enhanced Subtitle - Responsive */}
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 max-w-xs sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto leading-relaxed font-light px-4">
              The Official Platform of DTU Gift Shop
            </p>
            
            {/* CTA Button with Enhanced Styling - Responsive */}
            <div className="pt-4 sm:pt-8">
              <Button 
                onClick={scrollToContent}
                size="lg" 
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-5 lg:px-12 lg:py-6 text-base sm:text-lg md:text-xl font-semibold shadow-2xl hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105 border border-red-500/50 w-full sm:w-auto"
              >
                Explore Marketplace
                <ChevronDown className="ml-2 sm:ml-3 h-5 w-5 sm:h-6 sm:w-6 animate-bounce" />
              </Button>
            </div>
          </div>
        </div>

        
        {/* Enhanced Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white">
          <div className="flex flex-col items-center space-y-2 animate-bounce">
            <span className="text-sm font-medium tracking-wide">Scroll Down</span>
            <ChevronDown className="h-8 w-8" />
          </div>
        </div>
        
        {/* Corner Decorative Elements */}
        <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-white/30"></div>
        <div className="absolute top-8 right-8 w-16 h-16 border-r-2 border-t-2 border-white/30"></div>
        <div className="absolute bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 border-white/30"></div>
        <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-white/30"></div>
      </div>

      {/* Custom CSS Styles */}
      {/* <style jsx>{`
        .text-shadow-glow {
          text-shadow: 
            0 0 10px rgba(239, 68, 68, 0.8),
            0 0 20px rgba(239, 68, 68, 0.6),
            0 0 30px rgba(239, 68, 68, 0.4),
            0 0 40px rgba(239, 68, 68, 0.2);
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out 0.5s both;
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.8;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style> */}
    </>
  );
}
