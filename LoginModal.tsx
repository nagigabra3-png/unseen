/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, User as UserIcon } from 'lucide-react';

import Logo from './Logo';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: { username: string; role: 'user' | 'admin' }) => void;
}

export default function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      onLogin({ username: 'Administrator', role: 'admin' });
      onClose();
    } else if (username && password) {
      onLogin({ username: username, role: 'user' });
      onClose();
    } else {
      setError('Please provide valid credentials.');
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] bg-obsidian/60 backdrop-blur-md flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white w-full max-w-md p-8 md:p-12 relative shadow-3xl"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-obsidian transition-colors"
        >
          <X size={20} />
        </button>

        <header className="text-center mb-10 space-y-6">
           <Logo size={48} className="mx-auto" />
           <h2 className="font-serif text-3xl">Access the Archive</h2>
           <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Institutional Authentication Required</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Operator Identity</label>
            <input 
              type="text" 
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full border-b border-studio-grey py-3 focus:border-obsidian outline-none transition-colors text-sm font-sans"
              placeholder="Username"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Passcode</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border-b border-studio-grey py-3 focus:border-obsidian outline-none transition-colors text-sm font-sans"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-[9px] font-bold uppercase text-red-500 tracking-widest">{error}</p>}

          <button 
            type="submit"
            className="w-full h-14 bg-obsidian text-white text-[10px] font-bold tracking-[0.4em] uppercase hover:bg-black transition-all"
          >
            Authenticate
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[9px] font-bold tracking-widest uppercase text-gray-300">
            System Protocol 4.12 // Cairo-EG
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
