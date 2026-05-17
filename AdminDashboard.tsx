/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Edit2, Trash2, Database, Save, Upload, UserPlus } from 'lucide-react';
import { Artwork, Artist } from '../constants';
import Logo from './Logo';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  artworks: Artwork[];
  artists: Artist[];
  onRefresh: () => void;
}

export default function AdminDashboard({ isOpen, onClose, artworks, artists, onRefresh }: AdminDashboardProps) {
  const [activeRegistry, setActiveRegistry] = useState<'artworks' | 'artists'>('artworks');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editArtForm, setEditArtForm] = useState<Partial<Artwork>>({});
  const [editArtistForm, setEditArtistForm] = useState<Partial<Artist>>({});
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEditArt = (art: Artwork) => {
    setEditingId(art.id);
    setEditArtForm(art);
    setActiveRegistry('artworks');
  };

  const handleEditArtist = (artist: Artist) => {
    setEditingId(artist.id);
    setEditArtistForm(artist);
    setActiveRegistry('artists');
  };

  const handleAddNewArtwork = () => {
    const newArt: Partial<Artwork> = {
      title: 'New Artifact',
      artistId: artists[0]?.id || '',
      institution: 'Faculty of Fine Arts, Zamalek',
      program: 'Painting',
      price: 5000,
      image: '',
      available: true,
      year: new Date().getFullYear(),
      medium: 'Canvas',
      paintType: 'Oil'
    };
    setEditingId('new');
    setEditArtForm(newArt);
    setActiveRegistry('artworks');
  };

  const handleAddNewArtist = () => {
    const newArtist: Partial<Artist> = {
      name: 'New Artist Identity',
      bio: '',
      achievements: []
    };
    setEditingId('new_artist');
    setEditArtistForm(newArtist);
    setActiveRegistry('artists');
  };

  const handleSaveArtwork = async () => {
    try {
      const response = await fetch('/api/artworks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editArtForm),
      });
      if (response.ok) {
        onRefresh();
        setEditingId(null);
      }
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  const handleSaveArtist = async () => {
    try {
      const response = await fetch('/api/artists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editArtistForm),
      });
      if (response.ok) {
        onRefresh();
        setEditingId(null);
      }
    } catch (err) {
      console.error("Artist save failed", err);
    }
  };

  const handleDeleteEntry = async (id: string, type: 'artworks' | 'artists') => {
    const msg = type === 'artworks' ? 'Verify: Permanent deletion of archive entry?' : 'Verify: Permanent deletion of artist record? This may orphan linked artworks.';
    if (confirm(msg)) {
      try {
        await fetch(`/api/${type}/${id}`, { method: 'DELETE' });
        onRefresh();
        if (editingId === id) setEditingId(null);
      } catch (err) {
        console.error("Delete failed", err);
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setEditArtForm(prev => ({ ...prev, image: data.url }));
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] bg-white flex flex-col md:flex-row overflow-hidden"
    >
      {/* Sidebar Controls */}
      <div className="md:w-80 bg-gallery-bg border-r border-studio-grey flex flex-col p-8 gap-12 overflow-y-auto">
        <header className="flex items-center justify-between">
           <div className="flex items-center gap-3">
             <Logo size={24} />
             <div className="font-serif text-xl">Archive Registry</div>
           </div>
           <button onClick={onClose} className="text-gray-400 hover:text-obsidian transition-colors"><X size={20} /></button>
        </header>

        <div className="flex bg-white p-1 rounded-sm border border-studio-grey">
           <button 
             onClick={() => { setActiveRegistry('artworks'); setEditingId(null); }}
             className={`flex-1 py-3 text-[9px] font-bold uppercase tracking-widest transition-all ${activeRegistry === 'artworks' ? 'bg-obsidian text-white' : 'text-gray-400 hover:text-obsidian'}`}
           >
             Artifacts
           </button>
           <button 
             onClick={() => { setActiveRegistry('artists'); setEditingId(null); }}
             className={`flex-1 py-3 text-[9px] font-bold uppercase tracking-widest transition-all ${activeRegistry === 'artists' ? 'bg-obsidian text-white' : 'text-gray-400 hover:text-obsidian'}`}
           >
             Artists
           </button>
        </div>

        <nav className="flex flex-col gap-4">
           {activeRegistry === 'artworks' ? (
             <button 
               onClick={handleAddNewArtwork}
               className="flex items-center gap-3 w-full bg-obsidian text-white p-4 text-[10px] font-bold tracking-widest uppercase hover:bg-black transition-all"
             >
               <Plus size={14} /> Register Artifact
             </button>
           ) : (
             <button 
               onClick={handleAddNewArtist}
               className="flex items-center gap-3 w-full bg-obsidian text-white p-4 text-[10px] font-bold tracking-widest uppercase hover:bg-black transition-all"
             >
               <Plus size={14} /> Register Identity
             </button>
           )}
        </nav>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
           <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400 block border-b border-studio-grey pb-2">
             Active Registry ({activeRegistry === 'artworks' ? artworks.length : artists.length})
           </span>
           <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
             {activeRegistry === 'artworks' ? (
               artworks.map(art => {
                 const artistName = artists.find(a => a.id === art.artistId)?.name || 'Unknown';
                 return (
                  <div 
                    key={art.id} 
                    className={`group p-3 flex items-center justify-between transition-colors cursor-pointer border-l-4 ${editingId === art.id ? 'bg-white shadow-sm border-obsidian' : 'hover:bg-white border-transparent'}`}
                    onClick={() => handleEditArt(art)}
                  >
                    <div className="min-w-0">
                       <div className="text-[10px] font-bold truncate uppercase">{art.title}</div>
                       <div className="text-[8px] text-gray-400 truncate uppercase mt-1">{artistName}</div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteEntry(art.id, 'artworks'); }}
                      className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-600 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                 );
               })
             ) : (
               artists.map(artist => (
                <div 
                  key={artist.id} 
                  className={`group p-3 flex items-center justify-between transition-colors cursor-pointer border-l-4 ${editingId === artist.id ? 'bg-white shadow-sm border-obsidian' : 'hover:bg-white border-transparent'}`}
                  onClick={() => handleEditArtist(artist)}
                >
                  <div className="min-w-0">
                     <div className="text-[10px] font-bold truncate uppercase">{artist.name}</div>
                     <div className="text-[8px] text-gray-400 truncate uppercase mt-1">{artworks.filter(a => a.artistId === artist.id).length} Artifacts</div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteEntry(artist.id, 'artists'); }}
                    className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-600 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
               ))
             )}
           </div>
        </div>
      </div>

      {/* Editor Surface */}
      <div className="flex-1 bg-white p-8 md:p-16 overflow-y-auto relative">
         <AnimatePresence mode="wait">
           {editingId ? (
             activeRegistry === 'artworks' ? (
                /* Artifact Editor */
                <motion.div 
                  key={`art-${editingId}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="max-w-4xl mx-auto space-y-12"
                >
                  <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-studio-grey pb-6 gap-6">
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Entry ID: #{editingId}</span>
                      <h2 className="text-4xl font-serif">Modify Artifact</h2>
                    </div>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => setEditingId(null)}
                        className="px-8 py-4 text-[10px] font-bold tracking-widest uppercase border border-studio-grey hover:bg-gallery-bg transition-all"
                      >
                        Discard
                      </button>
                      <button 
                        onClick={handleSaveArtwork}
                        disabled={!editArtForm.title || !editArtForm.artistId}
                        className="flex items-center gap-3 bg-green-600 text-white px-8 py-4 text-[10px] font-bold tracking-widest uppercase hover:bg-green-700 transition-all disabled:opacity-30"
                      >
                        <Save size={14} /> Sync to Database
                      </button>
                    </div>
                  </header>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 text-sm font-sans">
                    <div className="space-y-8">
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Title of Artifact</label>
                        <input 
                          type="text" 
                          value={editArtForm.title} 
                          onChange={e => setEditArtForm({...editArtForm, title: e.target.value})}
                          className="w-full border-b border-studio-grey py-3 outline-none focus:border-obsidian transition-colors"
                          placeholder="Artifact Title"
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 block pb-1 border-b border-studio-grey">Linked Artist</label>
                        <select 
                          value={editArtForm.artistId}
                          onChange={e => setEditArtForm({...editArtForm, artistId: e.target.value})}
                          className="w-full border-b border-studio-grey py-3 outline-none focus:border-obsidian transition-colors appearance-none bg-transparent"
                        >
                          <option value="">Select Identity...</option>
                          {artists.map(a => (
                            <option key={a.id} value={a.id}>{a.name}</option>
                          ))}
                        </select>
                        <p className="text-[8px] text-gray-400 uppercase tracking-widest">Identities can be managed independently in the Artists registry.</p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Institutional Provenance</label>
                        <input 
                          type="text" 
                          value={editArtForm.institution} 
                          onChange={e => setEditArtForm({...editArtForm, institution: e.target.value})}
                          className="w-full border-b border-studio-grey py-3 outline-none focus:border-obsidian transition-colors"
                          placeholder="Faculty / University"
                        />
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Evaluation (EGP)</label>
                          <input 
                            type="number" 
                            value={editArtForm.price} 
                            onChange={e => setEditArtForm({...editArtForm, price: parseInt(e.target.value)})}
                            className="w-full border-b border-studio-grey py-3 outline-none focus:border-obsidian transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Creation Year</label>
                          <input 
                            type="number" 
                            value={editArtForm.year} 
                            onChange={e => setEditArtForm({...editArtForm, year: parseInt(e.target.value)})}
                            className="w-full border-b border-studio-grey py-3 outline-none focus:border-obsidian transition-colors"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Surface/Medium</label>
                          <input 
                            type="text" 
                            value={editArtForm.medium} 
                            onChange={e => setEditArtForm({...editArtForm, medium: e.target.value})}
                            className="w-full border-b border-studio-grey py-3 outline-none focus:border-obsidian transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Application Type</label>
                          <input 
                            type="text" 
                            value={editArtForm.paintType} 
                            onChange={e => setEditArtForm({...editArtForm, paintType: e.target.value})}
                            className="w-full border-b border-studio-grey py-3 outline-none focus:border-obsidian transition-colors"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Archive Status</label>
                        <div className="flex gap-4 pt-2">
                          <button 
                            onClick={() => setEditArtForm({...editArtForm, available: true})}
                            className={`flex-1 py-3 text-[8px] font-bold uppercase tracking-widest border transition-all ${editArtForm.available ? 'bg-obsidian text-white border-obsidian' : 'border-studio-grey text-gray-400'}`}
                          >
                            Available
                          </button>
                          <button 
                            onClick={() => setEditArtForm({...editArtForm, available: false})}
                            className={`flex-1 py-3 text-[8px] font-bold uppercase tracking-widest border transition-all ${!editArtForm.available ? 'bg-obsidian text-white border-obsidian' : 'border-studio-grey text-gray-400'}`}
                          >
                            Reserved
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Visual Artifact Registry</label>
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                      <div className="w-full md:w-64 aspect-[3/4] bg-gallery-bg border-2 border-dashed border-studio-grey flex flex-col items-center justify-center p-8 text-center gap-4 group hover:border-obsidian transition-all overflow-hidden relative">
                        {editArtForm.image ? (
                          <>
                            <img src={editArtForm.image} className="absolute inset-0 w-full h-full object-contain" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button onClick={() => fileInputRef.current?.click()} className="p-3 bg-white text-obsidian rounded-full shadow-lg">
                                <Upload size={20} />
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <Upload size={32} strokeWidth={1} className="text-gray-400" />
                            <div className="text-[8px] font-bold uppercase tracking-widest text-gray-400">Archive Image Required</div>
                            <button onClick={() => fileInputRef.current?.click()} className="text-[8px] font-bold uppercase tracking-widest text-obsidian underline underline-offset-4">Browse Archives</button>
                          </>
                        )}
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                        {uploading && (
                          <div className="absolute inset-0 bg-white/80 flex items-center justify-center text-obsidian font-bold text-[8px] uppercase tracking-widest">Processing...</div>
                        )}
                      </div>
                      <div className="flex-1 space-y-4 pt-4">
                        <div className="p-6 border border-studio-grey bg-gallery-bg">
                           <h4 className="text-[10px] font-bold tracking-widest uppercase text-obsidian mb-2">Normalization Protocol</h4>
                           <p className="text-[10px] text-gray-500 font-light leading-relaxed">
                              Uploaded artifacts are automatically normalized. Scaling and aspect ratios are optimized to maintain fidelity across institutional display templates.
                           </p>
                        </div>
                        <input 
                          type="text" 
                          value={editArtForm.image} 
                          onChange={e => setEditArtForm({...editArtForm, image: e.target.value})}
                          className="w-full text-[9px] border-b border-studio-grey py-2 outline-none focus:border-obsidian text-gray-400 transition-colors bg-transparent"
                          placeholder="Image URL Link"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
             ) : (
                /* Artist Editor */
                <motion.div 
                  key={`artist-${editingId}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="max-w-4xl mx-auto space-y-12"
                >
                  <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-studio-grey pb-6 gap-6">
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Identity ID: #{editingId}</span>
                      <h2 className="text-4xl font-serif">Modify Identity</h2>
                    </div>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => setEditingId(null)}
                        className="px-8 py-4 text-[10px] font-bold tracking-widest uppercase border border-studio-grey hover:bg-gallery-bg transition-all"
                      >
                        Discard
                      </button>
                      <button 
                        onClick={handleSaveArtist}
                        disabled={!editArtistForm.name}
                        className="flex items-center gap-3 bg-green-600 text-white px-8 py-4 text-[10px] font-bold tracking-widest uppercase hover:bg-green-700 transition-all disabled:opacity-30"
                      >
                        <Save size={14} /> Sync Identity
                      </button>
                    </div>
                  </header>

                  <div className="space-y-12 max-w-2xl">
                    <div className="space-y-2">
                       <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Full Artist Identity</label>
                       <input 
                          type="text" 
                          value={editArtistForm.name} 
                          onChange={e => setEditArtistForm({...editArtistForm, name: e.target.value})}
                          className="w-full text-2xl font-serif border-b border-studio-grey py-3 outline-none focus:border-obsidian transition-colors"
                          placeholder="Artist Name"
                        />
                    </div>

                    <div className="space-y-2">
                       <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Biographical Statement</label>
                       <textarea 
                          value={editArtistForm.bio} 
                          onChange={e => setEditArtistForm({...editArtistForm, bio: e.target.value})}
                          className="w-full border border-studio-grey p-6 h-48 text-sm leading-relaxed outline-none focus:border-obsidian transition-colors resize-none font-sans"
                          placeholder="Enter biographical details..."
                        />
                    </div>

                    <div className="space-y-4">
                       <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 block pb-2 border-b border-studio-grey">Professional Achievements</label>
                       <div className="space-y-3">
                          {editArtistForm.achievements?.map((ach, idx) => (
                            <div key={idx} className="flex gap-4">
                               <input 
                                 type="number" 
                                 value={ach.year}
                                 onChange={e => {
                                   const newAch = [...(editArtistForm.achievements || [])];
                                   newAch[idx].year = parseInt(e.target.value);
                                   setEditArtistForm({...editArtistForm, achievements: newAch});
                                 }}
                                 className="w-20 border-b border-studio-grey py-2 text-xs outline-none focus:border-obsidian"
                               />
                               <input 
                                 type="text" 
                                 value={ach.title}
                                 onChange={e => {
                                   const newAch = [...(editArtistForm.achievements || [])];
                                   newAch[idx].title = e.target.value;
                                   setEditArtistForm({...editArtistForm, achievements: newAch});
                                 }}
                                 className="flex-1 border-b border-studio-grey py-2 text-xs outline-none focus:border-obsidian"
                               />
                               <button 
                                 onClick={() => {
                                   const newAch = editArtistForm.achievements?.filter((_, i) => i !== idx);
                                   setEditArtistForm({...editArtistForm, achievements: newAch});
                                 }}
                                 className="text-red-400 hover:text-red-600"
                               >
                                 <Trash2 size={14} />
                               </button>
                            </div>
                          ))}
                          <button 
                            onClick={() => setEditArtistForm({...editArtistForm, achievements: [...(editArtistForm.achievements || []), { year: new Date().getFullYear(), title: 'New Achievement' }]})}
                            className="text-[8px] font-bold uppercase tracking-widest flex items-center gap-2 text-obsidian hover:opacity-60"
                          >
                            <Plus size={12} /> Add Achievement
                          </button>
                       </div>
                    </div>
                  </div>
                </motion.div>
             )
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-20 h-20 bg-gallery-bg flex items-center justify-center rounded-full">
                  <Database size={32} className="text-studio-grey" />
                </div>
                <div>
                   <h3 className="font-serif text-3xl">Registry Master Interface</h3>
                   <p className="text-xs uppercase tracking-widest text-gray-400 mt-2">Select any artifact or artist record to initialize the synchronization editor.</p>
                   <p className="text-[10px] text-gray-300 uppercase tracking-[0.3em] font-bold mt-8">Database_Connection_Verified</p>
                </div>
             </div>
           )}
         </AnimatePresence>
      </div>
    </motion.div>
  );
}
