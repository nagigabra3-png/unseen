/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { JoinedArtwork } from '../constants';

export default function ArtworkCard({ artwork, onClick }: { artwork: JoinedArtwork, onClick: (artwork: JoinedArtwork) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="group cursor-pointer"
      onClick={() => onClick(artwork)}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-studio-grey mb-6">
        <motion.img
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          src={artwork.image}
          alt={artwork.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-all duration-700"
        />
        {!artwork.available && (
          <div className="absolute inset-0 bg-gallery-white/80 flex items-center justify-center backdrop-blur-[2px]">
            <span className="font-serif italic text-xl text-obsidian px-6 py-2 border border-obsidian">Reserved</span>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-baseline">
          <h3 className="font-serif text-2xl tracking-tightest">{artwork.title}</h3>
          <span className="font-sans text-xs font-bold uppercase tracking-widest text-obsidian">
            {artwork.price.toLocaleString()} EGP
          </span>
        </div>
        <div className="flex flex-col text-[10px] uppercase tracking-widest text-gray-400 font-bold">
          <span className="text-gray-600">{artwork.artist}</span>
          <span className="font-light text-[9px]">{artwork.institution}</span>
        </div>
      </div>
    </motion.div>
  );
}
