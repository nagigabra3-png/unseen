/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { useState } from 'react';

interface LogoProps {
  state?: 'resting' | 'hover' | 'open';
  onClick?: () => void;
  className?: string;
  size?: number;
}

export default function Logo({ state: propState, onClick, className = "", size = 32 }: LogoProps) {
  const [isHovered, setIsHovered] = useState(false);
  const transition = { duration: 0.6, ease: [0.16, 1, 0.3, 1] };

  // Determine active state: priority to propState, fallback to local hover
  const activeState = propState || (isHovered ? 'hover' : 'resting');

  const isResting = activeState === 'resting';
  const isHover = activeState === 'hover';
  const isOpen = activeState === 'open';

  // The base dimensions of the outer container
  const containerWidth = isResting ? size / 2 : size;
  const containerHeight = size;

  return (
    <div 
      className={`relative flex items-center justify-center cursor-pointer select-none ${className}`}
      style={{ width: size, height: size }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div 
        animate={{ 
          width: containerWidth, 
          height: containerHeight 
        }}
        transition={transition}
        className="relative"
      >
        {/* Top-Left Bracket Piece */}
        <motion.div
          animate={{
            x: isOpen ? -size/4 : 0,
            y: isOpen ? -size/4 : 0,
            width: isOpen ? size/1.5 : '100%',
            height: isOpen ? size/1.5 : '100%',
          }}
          transition={transition}
          className="absolute top-0 left-0 border-t-2 border-l-2 border-obsidian"
        />
        
        {/* Bottom-Right Bracket Piece */}
        <motion.div
          animate={{
            x: isOpen ? size/4 : 0,
            y: isOpen ? size/4 : 0,
            width: isOpen ? size/1.5 : '100%',
            height: isOpen ? size/1.5 : '100%',
          }}
          transition={transition}
          className="absolute bottom-0 right-0 border-b-2 border-r-2 border-obsidian"
        />
      </motion.div>
    </div>
  );
}
