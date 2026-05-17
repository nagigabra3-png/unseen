/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Search, User } from 'lucide-react';
import Logo from './components/Logo';
import ArtworkCard from './components/ArtworkCard';
import ArtworkOverlay from './components/ArtworkOverlay';
import TransitionOverlay from './components/TransitionOverlay';
import CheckoutOverlay from './components/CheckoutOverlay';
import SearchInterface from './components/SearchInterface';
import LoginModal from './components/LoginModal';
import AdminDashboard from './components/AdminDashboard';
import { Artwork, CartItem, FrameOption, Artist, JoinedArtwork } from './constants';

export default function App() {
  const [selectedArtwork, setSelectedArtwork] = useState<JoinedArtwork | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [isBooting, setIsBooting] = useState(true);
  const [transitioningArt, setTransitioningArt] = useState<JoinedArtwork | null>(null);
  const [filterArtist, setFilterArtist] = useState<string>('All');
  const [filterInstitution, setFilterInstitution] = useState<string>('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [artistsList, setArtistsList] = useState<Artist[]>([]);
  const [user, setUser] = useState<{ username: string; role: 'user' | 'admin' } | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/data');
      const data = await res.json();
      setArtworks(data.artworks);
      setArtistsList(data.artists);
    } catch (err) {
      console.error("Failed to fetch archival data", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const joinedArtworks: JoinedArtwork[] = useMemo(() => {
    return artworks.map(art => {
      const artist = artistsList.find(a => a.id === art.artistId);
      return {
        ...art,
        artist: artist?.name || 'Unknown Artist',
        artistBio: artist?.bio || 'No biography available.',
        artistAchievements: artist?.achievements || [],
        artistId: art.artistId
      };
    });
  }, [artworks, artistsList]);

  const artistsOptions = ['All', ...Array.from(new Set(joinedArtworks.map(a => a.artist)))].sort();
  const institutions = ['All', ...Array.from(new Set(joinedArtworks.map(a => a.institution)))].sort();

  const filteredArtworks = joinedArtworks.filter(artwork => {
    const artistMatch = filterArtist === 'All' || artwork.artist === filterArtist;
    const institutionMatch = filterInstitution === 'All' || artwork.institution === filterInstitution;
    return artistMatch && institutionMatch;
  });

  const addToCart = (artwork: JoinedArtwork, frame: FrameOption) => {
    const itemId = `${artwork.id}_${frame.id}`;
    setCart(prev => {
      const existing = prev.find(item => item.id === itemId);
      if (existing) {
        return prev.map(item => item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { id: itemId, artwork: artwork, frame, quantity: 1 }];
    });
    
    setNotification(`${artwork.title} added to cart`);
    setTimeout(() => setNotification(null), 3000);
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const handleArtworkClick = (art: JoinedArtwork) => {
    setTransitioningArt(art);
    // After transition duration, actually set the selected artwork
    setTimeout(() => {
      setSelectedArtwork(art);
    }, 800);
  };

  const handleCloseArtwork = () => {
    // Trigger transition when closing
    setTransitioningArt({ id: 'closing' } as any);
    setTimeout(() => {
      setSelectedArtwork(null);
    }, 800);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`min-h-screen bg-gallery-white flex flex-col relative overflow-x-hidden ${isBooting ? 'h-screen' : ''}`}>
      {/* Global Transition Controller */}
      <TransitionOverlay 
        type="initial" 
        onComplete={() => setIsBooting(false)} 
      />
      
      <TransitionOverlay 
        trigger={transitioningArt?.id} 
        onComplete={() => setTransitioningArt(null)}
      />

      {/* Main App Content - Hidden during boot */}
      <div className={`flex flex-col flex-1 transition-opacity duration-1000 ${isBooting ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {/* Archival Dot Pattern Background */}
        <div className="fixed inset-0 pointer-events-none bg-archival-dots z-0 opacity-[0.03]"></div>

        {/* TOP NAVIGATION STOREFRONT HEADER */}
        <nav className={`fixed top-0 left-0 right-0 px-6 md:px-12 flex items-center justify-between z-40 transition-all duration-700 ${
          scrolled ? 'bg-white/95 backdrop-blur-md border-b border-studio-grey h-20' : 'bg-transparent h-24'
        }`}>
          <div className="flex items-center gap-12">
            <Logo 
              size={32}
              onClick={() => {
                if (selectedArtwork) handleCloseArtwork();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            <div className="hidden lg:flex items-center gap-8 text-[10px] font-bold tracking-[0.4em] uppercase text-obsidian">
              <a href="#" className="border-b border-obsidian pb-1">Primary Selection</a>
              <a href="#" className="text-gray-400 hover:text-obsidian transition-colors">By Artist</a>
              <a href="#" className="text-gray-400 hover:text-obsidian transition-colors">By School</a>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-8">
            {/* Mobile Nav Actions */}
            <div className="flex md:hidden items-center gap-1">
              <button 
                onClick={() => setIsSearchActive(true)}
                className="p-3 text-gray-400 active:text-obsidian transition-colors"
                aria-label="Search"
              >
                <Search size={20} />
              </button>
              <button 
                onClick={() => {
                  if (user) {
                    if (user.role === 'admin') setIsAdminOpen(true);
                    else setIsLoginOpen(true); 
                  } else {
                    setIsLoginOpen(true);
                  }
                }}
                className="p-3 text-gray-400 active:text-obsidian transition-colors"
                aria-label="Profile"
              >
                <User size={20} />
              </button>
            </div>

            <div className="hidden md:flex items-center gap-6 text-[10px] font-bold tracking-widest uppercase">
              <button 
                onClick={() => setIsSearchActive(true)}
                className="flex items-center gap-2 text-gray-400 hover:text-obsidian transition-colors"
              >
                <Search size={14} /> Find
              </button>
              <button 
                onClick={() => {
                  if (user) {
                    if (user.role === 'admin') setIsAdminOpen(true);
                    else setIsLoginOpen(true); 
                  } else {
                    setIsLoginOpen(true);
                  }
                }}
                className="flex items-center gap-2 text-gray-400 hover:text-obsidian transition-colors"
               >
                 <User size={14} /> {user ? user.username : 'Profile'}
               </button>
             </div>
             <button 
               onClick={() => setIsCheckoutOpen(true)}
               className="flex items-center gap-3 bg-obsidian text-white px-5 py-3 rounded-none shadow-xl hover:bg-black transition-all group active:scale-[0.98]"
             >
               <ShoppingBag size={14} />
               <span className="text-[10px] font-bold tracking-widest uppercase">Cart ({cart.length})</span>
             </button>
          </div>
        </nav>

        {/* Main Content Area */}
        {!isSearchActive && (
          <main className="flex-1 pt-40 pb-24 px-6 md:px-12 lg:px-24 relative z-10">
          
          {/* Storefront Hero Section */}
          <header className="mb-32 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
            >
              <span className="text-[10px] font-bold tracking-[0.6em] uppercase text-gray-400 mb-6 block">Direct Archival Acquisition</span>
              <h1 className="font-serif text-6xl md:text-8xl tracking-tightest mb-10 leading-[0.85] text-obsidian">
                Curating the <span className="italic">Unseen.</span>
              </h1>
              <div className="flex flex-col md:flex-row items-end gap-12">
                <p className="font-sans text-lg md:text-xl font-light text-gray-600 leading-relaxed max-w-2xl text-left">
                  A professional conduit for Egyptian student artists. We intercept transient studio artifacts, bringing institutional rigor to the private collection.
                </p>
                <div className="hidden md:block h-px flex-1 bg-studio-grey mb-4"></div>
              </div>
            </motion.div>
          </header>

          <div className="max-w-7xl mx-auto mb-20 space-y-8">
            {/* MOBILE FILTERS (Dropdowns) */}
            <div className="md:hidden space-y-4 mb-12">
              <div className="space-y-2">
                <label className="text-[9px] font-bold tracking-[0.3em] uppercase text-gray-400 ml-1">Filter by City</label>
                <select 
                  value={filterInstitution}
                  onChange={(e) => setFilterInstitution(e.target.value)}
                  className="w-full bg-white border border-studio-grey rounded-none px-4 py-4 text-[10px] font-bold tracking-[0.2em] uppercase appearance-none"
                >
                  <option value="All">All Cities</option>
                  {institutions.filter(inst => inst !== 'All').map(inst => (
                    <option key={inst} value={inst}>{inst}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-[9px] font-bold tracking-[0.3em] uppercase text-gray-400 ml-1">Filter by Artist</label>
                <select 
                  value={filterArtist}
                  onChange={(e) => setFilterArtist(e.target.value)}
                  className="w-full bg-white border border-studio-grey rounded-none px-4 py-4 text-[10px] font-bold tracking-[0.2em] uppercase appearance-none"
                >
                  <option value="All">All Artists</option>
                  {artistsOptions.filter(artist => artist !== 'All').map(artist => (
                    <option key={artist} value={artist}>{artist}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* DESKTOP FILTERS (Locked) */}
            <div className="hidden md:flex flex-col md:flex-row gap-12 border-b border-studio-grey pb-8">
              <div className="space-y-4 flex-1">
                <label className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 block">Filter by Institution</label>
                <div className="flex flex-wrap gap-x-6 gap-y-3">
                  {institutions.map(inst => (
                    <button
                      key={inst}
                      onClick={() => setFilterInstitution(inst)}
                      className={`text-[9px] font-bold tracking-widest uppercase transition-all ${
                        filterInstitution === inst ? 'text-obsidian border-b border-obsidian' : 'text-gray-300 hover:text-gray-500'
                      }`}
                    >
                      {inst}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4 flex-1">
                <label className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 block">Filter by Artist</label>
                <div className="flex flex-wrap gap-x-6 gap-y-3">
                  {artistsOptions.map(artist => (
                    <button
                      key={artist}
                      onClick={() => setFilterArtist(artist)}
                      className={`text-[9px] font-bold tracking-widest uppercase transition-all ${
                        filterArtist === artist ? 'text-obsidian border-b border-obsidian' : 'text-gray-300 hover:text-gray-500'
                      }`}
                    >
                      {artist}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <section className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-32">
            {filteredArtworks.map((artwork) => (
              <React.Fragment key={artwork.id}>
                <ArtworkCard 
                  artwork={artwork} 
                  onClick={(art) => handleArtworkClick(art)}
                />
              </React.Fragment>
            ))}
          </section>

          {filteredArtworks.length === 0 && (
            <div className="py-40 text-center space-y-6">
              <div className="font-serif text-3xl text-gray-300 italic">No artifacts found in current selection.</div>
              <button 
                 onClick={() => {
                   setFilterArtist('All');
                   setFilterInstitution('All');
                 }}
                 className="text-[10px] font-bold tracking-[0.3em] uppercase text-obsidian border border-obsidian px-8 py-4 hover:bg-obsidian hover:text-white transition-all"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Institutional Credibility Section */}
          <section className="mt-48 max-w-7xl mx-auto bg-obsidian text-gallery-white p-12 md:p-32 flex flex-col items-center text-center gap-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-white opacity-[0.03] bg-archival-dots"></div>
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="relative z-10 space-y-8 max-w-2xl"
            >
               <h2 className="font-serif text-4xl md:text-6xl tracking-tightest leading-[0.9]">Transforming the studio threshold.</h2>
               <p className="text-sm font-light tracking-[0.2em] uppercase opacity-60 leading-relaxed">Through direct institutional partnerships, UNSEEN provides a secure, curated space for original student works to leave the academy and enter the provenance of history.</p>
               <button className="border border-white/20 px-12 py-6 text-[10px] font-bold tracking-[0.5em] uppercase hover:bg-white hover:text-obsidian transition-all duration-500">
                 Registry Access
               </button>
            </motion.div>
          </section>
          
          <footer className="mt-48 py-24 border-t border-studio-grey flex flex-col md:flex-row justify-between items-start gap-12 max-w-7xl mx-auto">
            <div className="space-y-6 max-w-sm">
              <Logo size={40} />
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 leading-relaxed">
                Archival Selection 2024. Partnering with the Faculty of Fine Arts (Zamalek), AUC Arts, and Helwan Institute.
              </p>
            </div>
          </footer>
        </main>
        )}
      </div>

      {/* Full-screen Search Overlay */}
      <AnimatePresence>
        {isSearchActive && (
          <SearchInterface 
            onClose={() => setIsSearchActive(false)}
            onSelect={(art) => {
              setSelectedArtwork(art);
              setIsSearchActive(false);
            }}
            artworks={joinedArtworks}
          />
        )}
      </AnimatePresence>

      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onLogin={(u) => {
          setUser(u);
          if (u.role === 'admin') setIsAdminOpen(true);
        }}
      />

      <AdminDashboard 
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        artworks={artworks}
        artists={artistsList}
        onRefresh={fetchData}
      />

      {/* Success Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[110] bg-obsidian text-white px-8 py-4 flex items-center gap-4 shadow-3xl pointer-events-none"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase">{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedArtwork && (
          <ArtworkOverlay 
            initialArtwork={selectedArtwork} 
            onClose={handleCloseArtwork} 
            onAddToCart={addToCart}
            artworks={joinedArtworks}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCheckoutOpen && (
          <CheckoutOverlay 
            cart={cart}
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            onRemove={removeFromCart}
            onComplete={() => setCart([])}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
