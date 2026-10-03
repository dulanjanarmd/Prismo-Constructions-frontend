import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Download, ZoomIn } from 'lucide-react';

const PhotoGallery = ({ photos = [] }) => {
  const [lightboxIdx, setLightboxIdx] = useState(null);

  const isOpen = lightboxIdx !== null;
  const current = isOpen ? photos[lightboxIdx] : null;

  const prev = useCallback(() => {
    setLightboxIdx(i => (i - 1 + photos.length) % photos.length);
  }, [photos.length]);

  const next = useCallback(() => {
    setLightboxIdx(i => (i + 1) % photos.length);
  }, [photos.length]);

  const close = useCallback(() => setLightboxIdx(null), []);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, prev, next, close]);

  if (photos.length === 0) {
    return <p className="text-sm text-slate-400 italic">No photos attached.</p>;
  }

  return (
    <>
      {/* Thumbnail Grid */}
      <div className={`grid gap-2 ${
        photos.length === 1 ? 'grid-cols-1' :
        photos.length === 2 ? 'grid-cols-2' :
        'grid-cols-3'
      }`}>
        {photos.map((photo, idx) => {
          const url = typeof photo === 'string' ? photo : (photo.fileUrl || photo.url);
          const caption = typeof photo === 'string' ? 'Site photo' : (photo.caption || 'Site photo');
          return (
            <div
              key={idx}
              className="group relative aspect-video rounded-lg overflow-hidden border border-border cursor-pointer bg-slate-100 "
              onClick={() => setLightboxIdx(idx)}
            >
              <img
                src={url}
                alt={caption}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
              </div>
              {/* Caption overlay */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-xs truncate">{caption}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {isOpen && current && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95"
            onClick={close}
          >
            {/* Close */}
            <button
              onClick={close}
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Counter */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
              {lightboxIdx + 1} / {photos.length}
            </div>

            {/* Navigation */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prev(); }}
                  className="absolute left-4 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10"
                >
                  <ChevronLeft className="w-7 h-7" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); next(); }}
                  className="absolute right-4 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10"
                >
                  <ChevronRight className="w-7 h-7" />
                </button>
              </>
            )}

            {/* Image */}
            <motion.div
              key={lightboxIdx}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="max-w-5xl max-h-[80vh] mx-16 flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={typeof current === 'string' ? current : (current.fileUrl || current.url)}
                alt={typeof current === 'string' ? 'Site photo' : current.caption}
                className="max-w-full max-h-[72vh] object-contain rounded-lg shadow-2xl"
              />
              {typeof current !== 'string' && current.caption && (
                <div className="mt-3 flex items-center gap-3">
                  <p className="text-white/80 text-sm">{current.caption}</p>
                  <a
                    href={current.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-white/50 hover:text-white transition-colors"
                    title="Open full size"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              )}
            </motion.div>

            {/* Thumbnail strip */}
            {photos.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {photos.map((p, idx) => {
                  const thumbUrl = typeof p === 'string' ? p : (p.fileUrl || p.url);
                  return (
                    <div
                      key={idx}
                      onClick={(e) => { e.stopPropagation(); setLightboxIdx(idx); }}
                      className={`w-12 h-12 rounded overflow-hidden border-2 cursor-pointer transition-all ${
                        idx === lightboxIdx ? 'border-white scale-110' : 'border-white/30 hover:border-white/60'
                      }`}
                    >
                      <img src={thumbUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PhotoGallery;
