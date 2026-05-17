/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, University, Award, Grid } from 'lucide-react';
import { Artwork, FRAMES, FrameOption, JoinedArtwork } from '../constants';
import Logo from './Logo';

interface ProductInterfaceProps {
  initialArtwork: JoinedArtwork | null;
  onClose: () => void;
  onAddToCart: (artwork: JoinedArtwork, frame: FrameOption) => void;
  artworks: JoinedArtwork[];
}

type TabType = 'artist' | 'institution' | 'achievements' | 'other';

/**
 * Responsive Frame Renderer
 * Calculates frame thickness relative to the system design
 */
function FrameRenderer({ artwork, frame, children }: { artwork: Artwork, frame: FrameOption, children: React.ReactNode }) {
  const frameStyle = useMemo(() => {
    if (frame.id === 'none') return {};
    
    // Base thickness relative to system design
    let baseThickness = 12; // default for modern
    if (frame.id === 'gallery') baseThickness = 2;
    if (frame.id === 'classic') baseThickness = 16;
    if (frame.id === 'metallic') baseThickness = 8;

    return {
      borderStyle: 'solid',
      borderWidth: `${baseThickness}px`,
      borderColor: frame.id === 'classic' ? '#3D2B1F' : frame.id === 'metallic' ? '#9CA3AF' : '#1A1A1A'
    };
  }, [frame.id]);

  return (
    <div 
      className={`relative transition-all duration-700 bg-white inline-flex items-center justify-center ${frame.id === 'gallery' ? 'shadow-box-gallery border-studio-grey' : 'shadow-2xl'}`}
      style={{ 
        boxSizing: 'content-box',
        ...frameStyle
      }}
    >
       {/* Brackets relative to framing bounds */}
       <div className="absolute -top-4 -left-4 w-8 h-8 border-t border-l border-obsidian pointer-events-none"></div>
       <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b border-r border-obsidian pointer-events-none"></div>
       {children}
    </div>
  );
}

export default function ArtworkOverlay({ initialArtwork, onClose, onAddToCart, artworks }: ProductInterfaceProps) {
  const [currentArtwork, setCurrentArtwork] = useState<JoinedArtwork | null>(initialArtwork);
  const [selectedFrame, setSelectedFrame] = useState<FrameOption>(FRAMES[0]);
  const [activeTab, setActiveTab] = useState<TabType>('artist');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // System Integrity: Handle body scroll lock carefully
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const otherWorks = useMemo(() => {
    if (!currentArtwork) return [];
    return artworks.filter(a => a.artist === currentArtwork.artist && a.id !== currentArtwork.id);
  }, [currentArtwork, artworks]);

  if (!currentArtwork) return null;

  const totalPrice = currentArtwork.price + selectedFrame.priceDelta;

  const tabs = [
    { id: 'artist' as TabType, label: 'Artist', icon: User },
    { id: 'institution' as TabType, label: 'Institution', icon: University },
    { id: 'achievements' as TabType, label: 'Achievements', icon: Award },
    { id: 'other' as TabType, label: 'Other works', icon: Grid },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-white flex flex-col md:flex-row overflow-hidden"
    >
      {/* HEADER: Permanent Bar */}
      <div className="absolute top-0 left-0 right-0 h-16 md:h-20 px-4 md:px-8 flex items-center justify-between z-[100] bg-white/95 backdrop-blur-md border-b border-studio-grey">
        <div 
          className="flex items-center gap-3 md:gap-4 cursor-pointer"
          onClick={onClose}
        >
           <Logo size={24} />
           <div className="w-px h-4 bg-studio-grey"></div>
           <div className="text-[9px] md:text-[10px] font-bold tracking-widest uppercase text-gray-400">Integrated Product System</div>
        </div>
        <button 
          onClick={onClose}
          className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase hover:text-gray-500 transition-colors"
        >
          <span className="hidden sm:inline">Close Product View</span>
          <X size={16} />
        </button>
      </div>

      {/* VIEWPORT & CONTROLS: Scrollable Container for Mobile */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 flex flex-col md:flex-row pt-16 md:pt-20 overflow-y-auto touch-pan-y"
      >
        {/* VIEWPORT (Left/Top) */}
        <div className="relative flex-[1.4] bg-gallery-bg flex items-center justify-center p-8 md:p-12 min-h-[450px] md:min-h-0 overflow-hidden">
          <div className="absolute inset-0 bg-archival-dots pointer-events-none opacity-[0.05]"></div>
          
          <AnimatePresence mode="wait">
            <motion.div 
               key={`${currentArtwork.id}`}
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
               className="w-full h-full flex items-center justify-center"
            >
               <FrameRenderer artwork={currentArtwork} frame={selectedFrame}>
                <img 
                   src={currentArtwork.image} 
                   alt={currentArtwork.title}
                   className="block max-w-[80vw] md:max-w-full max-h-[60vh] md:max-h-[75vh] w-auto h-auto pointer-events-none shadow-sm"
                   referrerPolicy="no-referrer"
                />
              </FrameRenderer>
            </motion.div>
          </AnimatePresence>

          <p className="absolute bottom-6 left-6 text-[9px] font-mono uppercase text-gray-400 tracking-[0.3em] hidden md:block">
            {currentArtwork.title} // {currentArtwork.artist} // FRAME_{selectedFrame.id.toUpperCase()}
          </p>
        </div>

        {/* CONTROLS (Right/Bottom) */}
        <div className="flex-1 flex flex-col bg-white border-t md:border-t-0 md:border-l border-studio-grey p-6 md:p-12 md:max-w-[480px]">
          <div className="space-y-10 flex-1">
            <header className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold tracking-[0.4em] text-gray-400 uppercase">Product Details</span>
              </div>
              <h1 className="font-serif text-4xl lg:text-5xl tracking-tightest leading-tight text-obsidian">
                {currentArtwork.title}
              </h1>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold tracking-widest uppercase text-obsidian">{currentArtwork.artist}</span>
                <span className="w-1 h-1 rounded-full bg-studio-grey"></span>
                <span className="text-[10px] font-medium tracking-widest uppercase text-gray-400">{currentArtwork.year} Selection</span>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <span className="text-[9px] font-bold tracking-widest uppercase text-gray-400">Medium: {currentArtwork.medium}</span>
                <span className="w-[1px] h-2 bg-studio-grey"></span>
                <span className="text-[9px] font-bold tracking-widest uppercase text-gray-400">Surface: {currentArtwork.paintType}</span>
              </div>
            </header>

            {/* Product System Tabs */}
            <div className="space-y-6">
              <nav className="flex border-b border-studio-grey">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center py-4 transition-all relative ${
                      activeTab === tab.id ? 'text-obsidian' : 'text-gray-300 hover:text-gray-400'
                    }`}
                  >
                    <tab.icon size={16} />
                    {activeTab === tab.id && (
                      <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-obsidian" />
                    )}
                  </button>
                ))}
              </nav>

              <div className="min-h-[160px] py-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-sm font-light leading-relaxed text-gray-600"
                  >
                    {activeTab === 'artist' && <p className="italic font-normal">{currentArtwork.artistBio}</p>}
                    {activeTab === 'institution' && (
                      <div className="grid grid-cols-1 gap-6">
                        <div className="border-l-2 border-studio-grey pl-4">
                          <div className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">Source Institution</div>
                          <div className="text-xs uppercase font-bold text-obsidian">{currentArtwork.institution}</div>
                        </div>
                        <div className="border-l-2 border-studio-grey pl-4">
                          <div className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">Academic Program</div>
                          <div className="text-xs uppercase font-bold text-obsidian">{currentArtwork.program}</div>
                        </div>
                      </div>
                    )}
                    {activeTab === 'achievements' && (
                      <ul className="space-y-4">
                        {currentArtwork.artistAchievements.map((ach, i) => (
                          <li key={i} className="flex gap-4 items-center">
                            <span className="text-[10px] font-mono text-gray-400">{ach.year}</span>
                            <span className="text-[10px] uppercase font-bold tracking-widest text-obsidian">{ach.title}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {activeTab === 'other' && (
                      <div className="grid grid-cols-4 gap-2">
                        {otherWorks.map(art => (
                          <button 
                            key={art.id}
                            onClick={() => {
                              setCurrentArtwork(art);
                              scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="aspect-square bg-studio-grey border border-transparent hover:border-obsidian transition-all overflow-hidden"
                          >
                            <img src={art.image} className="w-full h-full object-cover grayscale opacity-60 hover:grayscale-0 hover:opacity-100" />
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Frame System */}
            <div className="space-y-6 pt-6 border-t border-studio-grey">
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] font-bold tracking-[0.3em] uppercase">Configure Framing</span>
                <span className="font-serif italic text-sm text-gray-400">+{selectedFrame.priceDelta} EGP</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {FRAMES.map((frame) => {
                  const frameColor = frame.id === 'classic' ? '#3D2B1F' : frame.id === 'metallic' ? '#9CA3AF' : frame.id === 'gallery' ? '#F3F4F6' : '#1A1A1A';
                  return (
                    <button
                      key={frame.id}
                      onClick={() => setSelectedFrame(frame)}
                      className={`flex items-center gap-3 p-4 border transition-all ${
                        selectedFrame.id === frame.id 
                          ? 'border-obsidian bg-obsidian text-white' 
                          : 'border-studio-grey hover:border-obsidian text-gray-400'
                      }`}
                    >
                      <div 
                        className={`w-3 h-3 border ${selectedFrame.id === frame.id ? 'border-white/50' : 'border-studio-grey'}`}
                        style={{ backgroundColor: frameColor }}
                      ></div>
                      <span className="text-[9px] font-bold tracking-widest uppercase">{frame.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CTA System */}
          <div className="pt-12 pb-6 md:pb-0">
            <div className="flex justify-between items-end mb-8">
              <div className="space-y-1">
                <div className="text-[9px] font-bold text-gray-400 tracking-widest uppercase">Acquisition Value</div>
                <div className="font-serif text-4xl">
                  {totalPrice.toLocaleString()} <span className="text-xs font-sans font-bold">EGP</span>
                </div>
              </div>
              <div className="text-right">
                 <div className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1 ${currentArtwork.available ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                   {currentArtwork.available ? 'Ready to Ship' : 'Reserved Entry'}
                 </div>
              </div>
            </div>

            <button 
               onClick={() => {
                 if (currentArtwork) {
                   onAddToCart(currentArtwork, selectedFrame);
                   onClose();
                 }
               }}
               disabled={!currentArtwork.available}
               className={`w-full h-20 text-[10px] font-bold tracking-[0.5em] uppercase transition-all flex items-center justify-center gap-4 group ${
                 currentArtwork.available 
                  ? 'bg-obsidian text-white hover:bg-black active:scale-[0.98]' 
                  : 'bg-studio-grey text-gray-300 cursor-not-allowed'
               }`}
            >
              <span>{currentArtwork.available ? 'Acquire' : 'Reserved Collection'}</span>
              {currentArtwork.available && (
                <div className="w-4 h-4 relative group-hover:translate-x-2 transition-transform">
                  <div className="absolute top-1 right-0 w-2 h-2 border-t-2 border-r-2 border-white"></div>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
