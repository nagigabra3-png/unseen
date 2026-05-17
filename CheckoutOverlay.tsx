/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CreditCard, Truck, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { CartItem } from '../constants';
import Logo from './Logo';

interface CheckoutOverlayProps {
  cart: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onRemove: (itemId: string) => void;
  onComplete: () => void;
}

export default function CheckoutOverlay({ cart, isOpen, onClose, onRemove, onComplete }: CheckoutOverlayProps) {
  const [step, setStep] = useState<'cart' | 'shipping' | 'payment' | 'success'>('cart');
  const [form, setForm] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    zip: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });

  const total = cart.reduce((acc, item) => acc + (item.artwork.price + item.frame.priceDelta) * item.quantity, 0);

  const handleNext = () => {
    if (step === 'cart') setStep('shipping');
    else if (step === 'shipping') setStep('payment');
    else if (step === 'payment') {
      setStep('success');
      setTimeout(() => {
        onComplete();
        onClose();
        setStep('cart');
      }, 3000);
    }
  };

  const handleBack = () => {
    if (step === 'shipping') setStep('cart');
    else if (step === 'payment') setStep('shipping');
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-obsidian/40 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row relative shadow-3xl"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-10 text-gray-400 hover:text-obsidian transition-colors"
        >
          <X size={24} />
        </button>

        {/* SUMMARY (Left/Top) */}
        <div className="md:w-80 bg-gallery-bg p-8 border-b md:border-b-0 md:border-r border-studio-grey overflow-y-auto">
          <div className="space-y-8">
            <header className="space-y-4">
              <Logo size={24} />
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 block mb-2">Order Summary</span>
            </header>

            <div className="space-y-6">
              {cart.map(item => (
                <div key={item.id} className="space-y-2">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="text-[11px] font-bold uppercase tracking-tight text-obsidian">{item.artwork.title}</div>
                      <div className="text-[9px] text-gray-400 uppercase tracking-widest">{item.frame.name} Frame</div>
                    </div>
                    <div className="text-[11px] font-bold">{(item.artwork.price + item.frame.priceDelta).toLocaleString()} EGP</div>
                  </div>
                  {step === 'cart' && (
                    <button 
                      onClick={() => onRemove(item.id)}
                      className="text-[8px] font-bold uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors"
                    >
                      [ Remove Artifact ]
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-studio-grey space-y-4">
              <div className="flex justify-between text-[10px] font-bold tracking-widest uppercase text-gray-400">
                <span>Subtotal</span>
                <span>{total.toLocaleString()} EGP</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold tracking-widest uppercase text-gray-400">
                <span>Shipping</span>
                <span>{total > 0 ? 'Complimentary' : '0 EGP'}</span>
              </div>
              <div className="flex justify-between items-end pt-2">
                <div className="text-[10px] font-bold tracking-widest uppercase">Total Acquisition</div>
                <div className="text-2xl font-serif">{total.toLocaleString()} EGP</div>
              </div>
            </div>
          </div>
        </div>

        {/* FORM (Right/Bottom) */}
        <div className="flex-1 bg-white p-8 md:p-12 overflow-y-auto">
          <AnimatePresence mode="wait">
            {step === 'cart' && (
              <motion.div 
                key="cart"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col justify-center"
              >
                <div className="text-center space-y-6">
                  {cart.length === 0 ? (
                    <>
                      <div className="font-serif text-3xl italic text-gray-300">Your archive is empty.</div>
                      <button onClick={onClose} className="text-[10px] font-bold tracking-[0.3em] uppercase text-obsidian border border-obsidian px-8 py-4 hover:bg-obsidian hover:text-white transition-all">
                        Return to Selection
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="text-left space-y-8">
                        <header className="space-y-2">
                          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400">Step 01 / 03</span>
                          <h2 className="text-4xl font-serif">Review Selections</h2>
                        </header>
                        <p className="text-sm text-gray-500 font-light leading-relaxed">
                          Each artifact is prepared with archival care. Please confirm your framing selections before proceeding to institutional registration.
                        </p>
                        <button 
                          onClick={handleNext}
                          className="w-full h-16 bg-obsidian text-white text-[10px] font-bold tracking-[0.4em] uppercase hover:bg-black transition-all"
                        >
                          Proceed to Shipping
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {step === 'shipping' && (
              <motion.div 
                key="shipping"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                <header className="space-y-2">
                  <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400">Step 02 / 03</span>
                  <h2 className="text-4xl font-serif">Delivery Manifest</h2>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Full Name</label>
                    <input 
                      type="text" 
                      value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                      className="w-full border-b border-studio-grey py-2 focus:border-obsidian outline-none transition-colors text-sm"
                      placeholder="Collector Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Electronic Mail</label>
                    <input 
                      type="email" 
                      value={form.email}
                      onChange={e => setForm({...form, email: e.target.value})}
                      className="w-full border-b border-studio-grey py-2 focus:border-obsidian outline-none transition-colors text-sm"
                      placeholder="email@archival.com"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Delivery Address</label>
                    <input 
                      type="text" 
                      value={form.address}
                      onChange={e => setForm({...form, address: e.target.value})}
                      className="w-full border-b border-studio-grey py-2 focus:border-obsidian outline-none transition-colors text-sm"
                      placeholder="Street, District, Suite"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">City</label>
                    <input 
                      type="text" 
                      value={form.city}
                      onChange={e => setForm({...form, city: e.target.value})}
                      className="w-full border-b border-studio-grey py-2 focus:border-obsidian outline-none transition-colors text-sm"
                      placeholder="Cairo / Alexandria"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Postal Code</label>
                    <input 
                      type="text" 
                      value={form.zip}
                      onChange={e => setForm({...form, zip: e.target.value})}
                      className="w-full border-b border-studio-grey py-2 focus:border-obsidian outline-none transition-colors text-sm"
                      placeholder="00000"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={handleBack}
                    className="flex-1 h-16 border border-studio-grey text-[10px] font-bold tracking-[0.4em] uppercase hover:bg-gallery-bg transition-all"
                  >
                    Back to Artifacts
                  </button>
                  <button 
                    onClick={handleNext}
                    disabled={!form.name || !form.address}
                    className="flex-[2] h-16 bg-obsidian text-white text-[10px] font-bold tracking-[0.4em] uppercase hover:bg-black transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Continue to Payment
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'payment' && (
              <motion.div 
                key="payment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                <header className="space-y-2">
                  <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400">Step 03 / 03</span>
                  <h2 className="text-4xl font-serif">Acquisition Payment</h2>
                </header>

                <div className="bg-obsidian text-white p-6 rounded-none space-y-8 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                   <div className="flex justify-between items-start">
                     <CreditCard size={32} strokeWidth={1} />
                     <div className="text-[10px] font-bold tracking-widest uppercase opacity-60 italic">Archival VISA</div>
                   </div>
                   <div className="space-y-1">
                     <div className="text-[9px] font-bold uppercase tracking-widest opacity-40">Card Number</div>
                     <div className="text-xl tracking-[0.2em] font-mono">
                       {form.cardNumber || '**** **** **** 0000'}
                     </div>
                   </div>
                   <div className="flex gap-12">
                      <div className="space-y-1">
                        <div className="text-[9px] font-bold uppercase tracking-widest opacity-40">Expiry</div>
                        <div className="text-sm font-mono">{form.expiry || 'MM/YY'}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[9px] font-bold uppercase tracking-widest opacity-40">CVV</div>
                        <div className="text-sm font-mono">{form.cvv || '***'}</div>
                      </div>
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Card Number</label>
                    <input 
                      type="text" 
                      value={form.cardNumber}
                      onChange={e => setForm({...form, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()})}
                      className="w-full border-b border-studio-grey py-2 focus:border-obsidian outline-none transition-colors text-sm font-mono"
                      placeholder="0000 0000 0000 0000"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Expiry Date</label>
                      <input 
                        type="text" 
                        value={form.expiry}
                        onChange={e => setForm({...form, expiry: e.target.value})}
                        className="w-full border-b border-studio-grey py-2 focus:border-obsidian outline-none transition-colors text-sm font-mono"
                        placeholder="MM / YY"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Security Code</label>
                      <input 
                        type="text" 
                        value={form.cvv}
                        onChange={e => setForm({...form, cvv: e.target.value})}
                        className="w-full border-b border-studio-grey py-2 focus:border-obsidian outline-none transition-colors text-sm font-mono"
                        placeholder="000"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={handleBack}
                    className="flex-1 h-16 border border-studio-grey text-[10px] font-bold tracking-[0.4em] uppercase hover:bg-gallery-bg transition-all"
                  >
                    Back
                  </button>
                  <button 
                    onClick={handleNext}
                    disabled={!form.cardNumber || !form.expiry}
                    className="flex-[2] h-16 bg-obsidian text-white text-[10px] font-bold tracking-[0.4em] uppercase hover:bg-black transition-all flex items-center justify-center gap-4 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ShieldCheck size={16} />
                    <span>Authorize {total.toLocaleString()} EGP</span>
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center space-y-8"
              >
                <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={40} />
                </div>
                <div className="space-y-4">
                  <h2 className="text-4xl font-serif">Acquisition Successful</h2>
                  <p className="text-sm text-gray-500 font-light max-w-sm mx-auto leading-relaxed">
                    Your artifacts have been reserved and entered into the archive registry. Institutional provenance documents will follow via electronic mail.
                  </p>
                </div>
                <div className="w-full h-1 bg-studio-grey relative overflow-hidden">
                   <motion.div 
                     initial={{ x: '-100%' }}
                     animate={{ x: '100%' }}
                     transition={{ duration: 3, ease: 'linear' }}
                     className="absolute inset-0 bg-obsidian"
                   />
                </div>
                <div className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Closing Connection...</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
