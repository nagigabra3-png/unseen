/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import React, { useEffect, useState } from 'react';
import Logo from './Logo';

interface TransitionOverlayProps {
  onComplete?: () => void;
  trigger?: any;
  isVisible?: boolean;
  type?: 'initial' | 'transition';
}

export default function TransitionOverlay({ onComplete, trigger, isVisible: propIsVisible, type = 'transition' }: TransitionOverlayProps) {
  const [internalVisible, setInternalVisible] = useState(type === 'initial');
  const isVisible = propIsVisible !== undefined ? propIsVisible : internalVisible;

  useEffect(() => {
    if (type === 'transition' && trigger !== undefined) {
      setInternalVisible(true);
      const timer = setTimeout(() => {
        setInternalVisible(false);
        onComplete?.();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [trigger, type, onComplete]);

  // Initial load auto-hides after a delay
  useEffect(() => {
    if (type === 'initial') {
      const timer = setTimeout(() => {
        setInternalVisible(false);
        onComplete?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [type, onComplete]);

  const transition = { duration: 1.2, ease: [0.16, 1, 0.3, 1] };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-gallery-white overflow-hidden pointer-events-auto"
        >
          {/* Animated Central Container */}
          <motion.div
            initial={{ width: 60, height: 120 }}
            animate={{ 
              width: [60, 120, 120], 
              height: [120, 120, 120]
            }}
            transition={transition}
            className="relative"
          >
            {/* Top-Left Piece */}
            <motion.div
              initial={{ x: 0, y: 0, width: '100%', height: '100%' }}
              animate={{ 
                x: [0, 0, '-45vw'], 
                y: [0, 0, '-45vh'], 
                width: ['100%', '100%', '20vw'], 
                height: ['100%', '100%', '20vw'],
                borderBottomWidth: [0, 0, 0],
                borderRightWidth: [0, 0, 0],
              }}
              transition={transition}
              className="absolute top-0 left-0 border-t-4 border-l-4 border-obsidian"
            />

            {/* Bottom-Right Piece */}
            <motion.div
              initial={{ x: 0, y: 0, width: '100%', height: '100%' }}
              animate={{ 
                x: [0, 0, '45vw'], 
                y: [0, 0, '45vh'], 
                width: ['100%', '100%', '20vw'], 
                height: ['100%', '100%', '20vw'],
                borderTopWidth: [0, 0, 0],
                borderLeftWidth: [0, 0, 0],
              }}
              transition={transition}
              className="absolute bottom-0 right-0 border-b-4 border-r-4 border-obsidian"
            />
          </motion.div>
          
          {/* Central Logo Revealed */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: [0, 0, 1], scale: [0.9, 0.9, 1] }}
            transition={{ duration: 1.2, times: [0, 0.4, 1] }}
            className="text-center space-y-4"
          >
            <div className="font-serif text-5xl tracking-widest uppercase">Unseen</div>
            <div className="text-[8px] font-bold tracking-[0.6em] uppercase text-gray-400">Archival Selection</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
