/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search as SearchIcon, ArrowRight } from 'lucide-react';
import { JoinedArtwork } from '../constants';

import Logo from './Logo';

interface SearchInterfaceProps {
  onClose: () => void;
  onSelect: (artwork: JoinedArtwork) => void;
  artworks: JoinedArtwork[];
}

export default function SearchInterface({ onClose, onSelect, artworks }: SearchInterfaceProps) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return artworks.filter(art => 
      art.title.toLowerCase().includes(query.toLowerCase()) ||
      art.artist.toLowerCase().includes(query.toLowerCase()) ||
      art.institution.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, artworks]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-white flex flex-col"
    >
      {/* Header */}
      <div className="h-24 px-6 md:px-12 flex items-center justify-between border-b border-studio-grey">
        <div className="flex items-center gap-4">
           <Logo size={24} />
           <div className="w-px h-4 bg-studio-grey"></div>
           <div className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Archival Search</div>
        </div>
        <button 
          onClick={onClose}
          className="group flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase hover:text-gray-500 transition-colors"
        >
          <span>Exit Search</span>
          <X size={16} />
        </button>
      </div>

      {/* Search Input Area */}
      <div className="flex-1 flex flex-col items-center pt-24 md:pt-40 px-6">
        <div className="w-full max-w-3xl space-y-12">
          <div className="relative">
            <SearchIcon className="absolute left-0 top-1/2 -translate-y-1/2 text-studio-grey" size={32} strokeWidth={1} />
            <input 
              autoFocus
              type="text"
              placeholder="Query the Archive..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent border-b border-obsidian py-4 pl-12 text-3xl md:text-5xl font-serif outline-none placeholder:text-studio-grey"
            />
          </div>

          <div className="space-y-8">
            <div className="flex justify-between items-end border-b border-studio-grey pb-2">
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400">
                {results.length > 0 ? `Detected ${results.length} Matching Artifacts` : query ? 'No correlations found' : 'Awaiting archival query'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[40vh] overflow-y-auto no-scrollbar pb-12">
              <AnimatePresence mode="popLayout">
                {results.map((art, idx) => (
                  <motion.button
                    key={art.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => onSelect(art)}
                    className="flex p-4 border border-studio-grey hover:border-obsidian transition-all group items-center gap-6 text-left"
                  >
                    <div className="w-16 h-16 bg-gallery-bg flex-shrink-0 overflow-hidden">
                       <img src={art.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold uppercase tracking-tight truncate">{art.title}</div>
                      <div className="text-[9px] text-gray-400 uppercase tracking-widest mt-1">{art.artist}</div>
                    </div>
                    <ArrowRight size={16} className="text-studio-grey group-hover:text-obsidian group-hover:translate-x-1 transition-all" />
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* System Footer Metadata */}
      <div className="p-12 text-center text-[9px] font-bold tracking-[0.5em] uppercase text-gray-300">
        UNSEEN_QUERY_ENGINE_v4.1.2 // PERSISTENT_ARCHIVE_ACCESS
      </div>
    </motion.div>
  );
}
