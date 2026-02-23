import React, { useState, useEffect, useCallback } from 'react';
import { X, ZoomIn, ChevronLeft, ChevronRight, Loader2, ImageOff } from 'lucide-react';
import { getGalleryPhotos } from '../../api';

const Gallery = () => {
    const [selectedIdx, setSelectedIdx] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);

    const fallbackImages = [
        { image_url: "/gallery1.jpg", title: "School Campus", category: "campus" },
        { image_url: "/gallery2.jpg", title: "Students & Activities", category: "activities" },
        { image_url: "/gallery3.jpg", title: "School Events", category: "events" },
        { image_url: "/gallery4.jpg", title: "Programs & Celebrations", category: "events" },
        { image_url: "/gallery5.jpg", title: "Campus Life", category: "campus" },
        { image_url: "/banner.jpg", title: "Our Building", category: "campus" },
    ];

    useEffect(() => {
        getGalleryPhotos()
            .then(data => setPhotos(data.length > 0 ? data : fallbackImages))
            .catch(() => setPhotos(fallbackImages))
            .finally(() => setLoading(false));
    }, []);

    const images = photos;

    const openLightbox = (idx) => setSelectedIdx(idx);
    const closeLightbox = () => setSelectedIdx(null);

    const goNext = useCallback((e) => {
        e?.stopPropagation();
        setSelectedIdx(prev => (prev + 1) % images.length);
    }, [images.length]);

    const goPrev = useCallback((e) => {
        e?.stopPropagation();
        setSelectedIdx(prev => (prev - 1 + images.length) % images.length);
    }, [images.length]);

    useEffect(() => {
        if (selectedIdx === null) return;
        const handleKey = (e) => {
            if (e.key === 'ArrowRight') goNext();
            else if (e.key === 'ArrowLeft') goPrev();
            else if (e.key === 'Escape') closeLightbox();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [selectedIdx, goNext, goPrev]);

    if (loading) {
        return (
            <section id="gallery" className="py-16 md:py-20 bg-white">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </section>
        );
    }

    return (
        <section id="gallery" className="py-16 md:py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-14">
                    <h2 className="section-title">Life at Seven Star</h2>
                    <div className="section-divider" />
                    <p className="section-subtitle">Glimpses of academic and extracurricular activities at our campus.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((img, idx) => (
                        <div
                            key={img.id || idx}
                            onClick={() => openLightbox(idx)}
                            className="group relative aspect-square overflow-hidden rounded-lg bg-gray-200 cursor-pointer"
                        >
                            <img
                                src={img.image_url}
                                alt={img.title || 'Gallery'}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                onError={(e) => { e.target.src = '/banner.jpg'; }}
                            />
                            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/60 transition-colors duration-300 flex items-center justify-center">
                                <div className="text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                                    <ZoomIn className="w-8 h-8 text-white mx-auto mb-2" />
                                    <span className="text-white font-semibold text-sm">{img.title || 'View'}</span>
                                </div>
                            </div>
                            {img.is_featured && (
                                <div className="absolute top-2 left-2 bg-accent text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Featured</div>
                            )}
                        </div>
                    ))}
                </div>

                {images.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        <ImageOff className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No photos available yet</p>
                    </div>
                )}
            </div>

            {/* Lightbox with Slider */}
            {selectedIdx !== null && (
                <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={closeLightbox}>
                    {/* Close button */}
                    <button className="absolute top-4 right-4 z-50 text-white/70 hover:text-white transition-colors p-2" onClick={closeLightbox}>
                        <X className="w-7 h-7" />
                    </button>

                    {/* Counter */}
                    <div className="absolute top-5 left-1/2 -translate-x-1/2 z-50 text-white/60 text-sm font-medium">
                        {selectedIdx + 1} / {images.length}
                    </div>

                    {/* Previous */}
                    <button
                        onClick={goPrev}
                        className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-50 w-12 h-12 bg-white/10 hover:bg-white/25 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    {/* Image */}
                    <div className="max-w-[90vw] max-h-[85vh] flex items-center justify-center" onClick={e => e.stopPropagation()}>
                        <img
                            src={images[selectedIdx]?.image_url}
                            alt={images[selectedIdx]?.title || 'Gallery'}
                            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                        />
                    </div>

                    {/* Next */}
                    <button
                        onClick={goNext}
                        className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-50 w-12 h-12 bg-white/10 hover:bg-white/25 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Caption */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center z-50">
                        <p className="text-white font-semibold font-serif text-lg">{images[selectedIdx]?.title}</p>
                        {images[selectedIdx]?.description && (
                            <p className="text-white/60 text-sm mt-1">{images[selectedIdx].description}</p>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
};

export default Gallery;
