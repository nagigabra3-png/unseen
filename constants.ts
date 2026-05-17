/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FrameOption {
  id: string;
  name: string;
  className: string;
  priceDelta: number;
}

export interface Achievement {
  year: number;
  title: string;
}

export interface Artist {
  id: string;
  name: string;
  bio: string;
  achievements: Achievement[];
}

export interface Artwork {
  id: string;
  title: string;
  artistId: string;
  institution: string;
  program: string;
  price: number;
  image: string;
  available: boolean;
  year: number;
  medium: string;
  paintType: string;
}

export interface JoinedArtwork extends Omit<Artwork, 'artistId'> {
  artist: string;
  artistBio: string;
  artistAchievements: Achievement[];
  artistId: string;
}

export interface CartItem {
  id: string; // unique id for the cart entry (artwork_id + frame_id)
  artwork: JoinedArtwork;
  frame: FrameOption;
  quantity: number;
}

export const FRAMES: FrameOption[] = [
  { id: 'none', name: 'No Frame', className: 'border border-gray-200', priceDelta: 0 },
  { id: 'modern', name: 'Modern Obsidian', className: 'border-[12px] border-obsidian', priceDelta: 1200 },
  { id: 'gallery', name: 'Gallery White', className: 'border border-gray-300 ring-8 ring-white ring-offset-2 ring-offset-gray-100', priceDelta: 1800 },
  { id: 'classic', name: 'Wooden Classic', className: 'border-[16px] border-[#3D2B1F]', priceDelta: 1500 },
  { id: 'metallic', name: 'Metallic Modern', className: 'border-[8px] border-[#9CA3AF] ring-2 ring-gray-300', priceDelta: 2200 },
];

export const ARTWORKS: Artwork[] = [];
