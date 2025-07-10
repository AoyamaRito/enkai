'use client';

import React, { useRef, useState, useEffect } from 'react';
import HeroSection from '../components/HeroSection';
import AboutSection from '../components/AboutSection';
import GameServicesSection from '../components/GameServicesSection';
import EducationServicesSection from '../components/EducationServicesSection';
import CommunitySection from '../components/CommunitySection';
import ContactSection from '../components/ContactSection';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function SorisutoWebsite() {
  // Refs for smooth scrolling
  const heroRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const gameServicesRef = useRef<HTMLDivElement>(null);
  const educationServicesRef = useRef<HTMLDivElement>(null);
  const communityRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  // Smooth scroll function
  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Navigation items
  const navItems = [
    { label: 'ホーム', ref: heroRef },
    { label: '会社概要', ref: aboutRef },
    { label: 'ゲーム事業', ref: gameServicesRef },
    { label: '教育事業', ref: educationServicesRef },
    { label: 'コミュニティ', ref: communityRef },
    { label: 'お問い合わせ', ref: contactRef }
  ];

  return (
    <div className="min-h-screen">
      {/* Header with navigation */}
      <Header />

      {/* Main sections */}
      <div ref={heroRef}>
        <HeroSection />
      </div>
      
      <div ref={aboutRef}>
        <AboutSection />
      </div>
      
      <div ref={gameServicesRef}>
        <GameServicesSection />
      </div>
      
      <div ref={educationServicesRef}>
        <EducationServicesSection />
      </div>
      
      <div ref={communityRef}>
        <CommunitySection />
      </div>
      
      <div ref={contactRef}>
        <ContactSection />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}