'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface CattleImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function CattleImage({ src, alt, className = '' }: CattleImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);

  // Debug information
  console.log('CattleImage component rendered with src:', src);

  if (imageError) {
    console.error('Image failed to load:', src);
    return (
      <div className="flex flex-col items-center justify-center p-4 bg-gray-100 rounded-lg">
        <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-sm text-gray-500">No se pudo cargar la imagen</p>
        <p className="text-xs text-gray-400 mt-1">URL: {src?.substring(0, 50)}...</p>
      </div>
    );
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(0.5, Math.min(3, zoom + delta));
    setZoom(newZoom);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const openModal = () => {
    setIsModalOpen(true);
    resetZoom();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetZoom();
  };

  return (
    <>
      <Image
        src={src}
        alt={alt}
        width={300}
        height={200}
        className={`${className} cursor-pointer hover:opacity-90 transition-opacity`}
        onError={(e) => {
          console.error('Image failed to load:', src, e);
          setImageError(true);
        }}
        onLoad={() => {
          console.log('Image loaded successfully:', src);
        }}
        onClick={openModal}
        style={{ objectFit: 'cover' }}
        unoptimized={true}
      />

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Botón cerrar */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-75 transition-colors z-10 text-xl"
              aria-label="Cerrar imagen"
            >
              ✕
            </button>

            {/* Contenedor de la imagen con zoom */}
            <div
              className="relative overflow-hidden cursor-move flex items-center justify-center"
              style={{
                width: '90vw',
                height: '90vh',
                maxWidth: '1200px',
                maxHeight: '800px'
              }}
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                ref={imageRef}
                src={src}
                alt={alt}
                width={1200}
                height={800}
                className="select-none max-w-full max-h-full object-contain"
                style={{
                  transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                  transformOrigin: 'center center',
                  transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                }}
                draggable={false}
                unoptimized={true}
                onError={(e) => {
                  console.error('Modal image failed to load:', src, e);
                }}
                onLoad={() => {
                  console.log('Modal image loaded successfully:', src);
                }}
              />
            </div>

            {/* Indicador de zoom */}
            {zoom > 1 && (
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
                Zoom: {Math.round(zoom * 100)}%
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
