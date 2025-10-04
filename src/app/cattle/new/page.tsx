'use client'

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createCattleWithResult } from '../actions';
import { getFarms, type Finca } from '@/lib/appwrite';
import { uploadImage, compressImage } from '@/lib/imageUtils';
import Image from 'next/image';

export default function NewCattlePage() {
  const router = useRouter();
  const [pesoEntrada, setPesoEntrada] = useState('');
  const [precioKg, setPrecioKg] = useState('');
  const [precioCompra, setPrecioCompra] = useState('');
  const [fincas, setFincas] = useState<Finca[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [compressedImage, setCompressedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');
  const [notificationMessage, setNotificationMessage] = useState('');

  // Calculate Precio_compra when peso_entrada or precio_kg changes
  useEffect(() => {
    if (pesoEntrada && precioKg) {
      const calculated = parseFloat(pesoEntrada) * parseFloat(precioKg);
      setPrecioCompra(calculated.toFixed(2));
    } else {
      setPrecioCompra('');
    }
  }, [pesoEntrada, precioKg]);

  // Fetch fincas from Appwrite
  useEffect(() => {
    const fetchFincas = async () => {
      try {
        const data = await getFarms();
        setFincas(data);
      } catch (error) {
        console.error('Error fetching fincas:', error);
      }
    };
    fetchFincas();
  }, []);

  // Handle image selection
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setIsCompressing(true);

      try {
        // Compress the image
        const compressed = await compressImage(file);
        setCompressedImage(compressed);

        // Create preview from compressed image
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
          setIsCompressing(false);
        };
        reader.readAsDataURL(compressed);
      } catch (error) {
        console.error('Error compressing image:', error);
        // Fallback to original image if compression fails
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
          setIsCompressing(false);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let imageUrl = null;

      // Upload image if selected (use compressed image if available)
      if (compressedImage || selectedImage) {
        const imageToUpload = compressedImage || selectedImage;
        if (imageToUpload) {
          imageUrl = await uploadImage(imageToUpload);
          if (!imageUrl) {
            setNotificationMessage('Error al subir la imagen. Inténtalo de nuevo.');
            setNotificationType('error');
            setShowNotification(true);
            setTimeout(() => setShowNotification(false), 5000);
            setIsUploading(false);
            return;
          }
        }
      }

      // Create form data manually to avoid chunking issues
      const formData = new FormData();

      // Get form values manually
      const form = e.target as HTMLFormElement;
      const formElements = form.elements;

      // Add all form fields manually
      for (let i = 0; i < formElements.length; i++) {
        const element = formElements[i] as HTMLInputElement | HTMLSelectElement;
        if (element.name && element.value && element.type !== 'file') {
          formData.append(element.name, element.value);
        }
      }

      // Add image URL if available
      if (imageUrl) {
        formData.append('Imagen', imageUrl);
        console.log('Image URL added to form data:', imageUrl);
      }

      // Submit form
      try {
        const result = await createCattleWithResult(formData);
        
        if (result.success) {
          // Show success message before redirect
          setNotificationMessage('¡Ganado registrado exitosamente! Redirigiendo...');
          setNotificationType('success');
          setShowNotification(true);
          
          // Hide notification and then redirect after 2 seconds
          setTimeout(() => {
            setShowNotification(false);
            router.push('/cattle');
          }, 2000);
        } else {
          throw new Error(result.message || 'Error desconocido al guardar');
        }
      } catch (error) {
        console.error('Error:', error);
        setNotificationMessage('Error al guardar el ganado. Inténtalo de nuevo.');
        setNotificationType('error');
        setShowNotification(true);
        // Hide notification after 5 seconds
        setTimeout(() => setShowNotification(false), 5000);
      }
    } catch (error) {
      console.error('Error:', error);
      setNotificationMessage('Error al guardar el ganado. Inténtalo de nuevo.');
      setNotificationType('error');
      setShowNotification(true);
      // Hide notification after 5 seconds
      setTimeout(() => setShowNotification(false), 5000);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      {/* Notification Component - Mobile Optimized */}
      {showNotification && (
        <div className="fixed inset-x-4 top-4 z-50 animate-slide-in-right sm:inset-x-auto sm:left-1/2 sm:transform sm:-translate-x-1/2">
          <div className={`border rounded-xl p-4 shadow-xl max-w-md mx-auto ${
            notificationType === 'success'
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                {notificationType === 'success' ? (
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
                    <svg className="h-6 w-6 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100">
                    <svg className="h-6 w-6 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="ml-3 flex-1">
                <h3 className={`text-base font-semibold ${
                  notificationType === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {notificationType === 'success' ? '¡Éxito!' : 'Error'}
                </h3>
                <div className={`mt-1 text-sm ${
                  notificationType === 'success' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {notificationMessage}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
        
        /* Mobile optimizations */
        @media (max-width: 640px) {
          input, select, textarea {
            font-size: 16px !important; /* Prevents zoom on iOS */
          }
        }
      `}</style>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Header Section - Mobile Optimized */}
        <div className="mb-6 sm:mb-8">
          <Link
            href="/cattle"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 sm:mb-6 transition-colors duration-200 active:scale-95 group"
          >
            <svg className="w-5 h-5 mr-2 group-hover:-translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium text-base">Volver al Listado</span>
          </Link>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mb-4 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Nuevo Ganado</h1>
            <p className="text-gray-600 text-base max-w-md mx-auto">Completa el formulario para registrar un nuevo animal en el sistema</p>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-white">Información del Animal</h2>
            <p className="text-blue-100 mt-1 text-sm">Completa los datos básicos del nuevo registro</p>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8 space-y-8">
            {/* Información Básica */}
            <div className="space-y-6">
              <div className="flex items-center">
                <div className="w-1 h-6 bg-blue-500 rounded-full mr-3"></div>
                <h3 className="text-lg font-semibold text-gray-900">Datos Generales</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label htmlFor="id_animal" className="block text-sm font-semibold text-gray-700 mb-3">
                    ID del Animal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="id_animal"
                    name="id_animal"
                    required
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 text-base"
                    placeholder="Ej: VAC001, TORO-2024-001"
                  />
                  <p className="mt-2 text-xs text-gray-500">Identificador único para el animal</p>
                </div>

                <div>
                  <label htmlFor="farm_id" className="block text-sm font-semibold text-gray-700 mb-3">
                    Ubicación - Finca <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="farm_id"
                    name="farm_id"
                    required
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-base"
                  >
                    <option value="">Selecciona una finca y apartado</option>
                    {fincas.map((finca) => (
                      <option key={finca.$id} value={finca.$id}>
                        {`${finca["Nombre-finca"] || ''} - ${finca["Nombre_apartado"] || ''}`}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs text-gray-500">Selecciona la finca donde se ubicará el animal</p>
                </div>
              </div>
            </div>

            {/* Datos de Compra */}
            <div className="space-y-6">
              <div className="flex items-center">
                <div className="w-1 h-6 bg-green-500 rounded-full mr-3"></div>
                <h3 className="text-lg font-semibold text-gray-900">Datos de Compra</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label htmlFor="peso_entrada" className="block text-sm font-semibold text-gray-700 mb-3">
                    Peso de Entrada (kg) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="peso_entrada"
                    name="peso_entrada"
                    step="0.01"
                    required
                    value={pesoEntrada}
                    onChange={(e) => setPesoEntrada(e.target.value)}
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 text-base"
                    placeholder="450.50"
                    inputMode="decimal"
                  />
                  <p className="mt-2 text-xs text-gray-500">Peso inicial al momento de la compra</p>
                </div>

                <div>
                  <label htmlFor="precio_kg" className="block text-sm font-semibold text-gray-700 mb-3">
                    Precio por Kg (Compra) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="precio_kg"
                    name="precio_kg"
                    step="0.01"
                    required
                    value={precioKg}
                    onChange={(e) => setPrecioKg(e.target.value)}
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 text-base"
                    placeholder="25.50"
                    inputMode="decimal"
                  />
                  <p className="mt-2 text-xs text-gray-500">Precio pagado por kilogramo</p>
                </div>

                <div>
                  <label htmlFor="Precio_compra" className="block text-sm font-semibold text-gray-700 mb-3">
                    Precio de Compra Total
                  </label>
                  <input
                    type="number"
                    id="Precio_compra"
                    name="Precio_compra"
                    step="0.01"
                    value={precioCompra}
                    readOnly
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 cursor-not-allowed text-base"
                    placeholder="0.00"
                  />
                  <p className="mt-2 text-xs text-gray-500">Calculado automáticamente: Peso × Precio/kg</p>
                </div>

                <div>
                  <label htmlFor="fecha_compra" className="block text-sm font-semibold text-gray-700 mb-3">
                    Fecha de Compra <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="fecha_compra"
                    name="fecha_compra"
                    required
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base"
                  />
                  <p className="mt-2 text-xs text-gray-500">Fecha en que se realizó la compra</p>
                </div>
              </div>
            </div>

            {/* Image Upload Section - Mobile Optimized */}
            <div className="space-y-6">
              <div className="flex items-center">
                <div className="w-1 h-6 bg-purple-500 rounded-full mr-3"></div>
                <h3 className="text-lg font-semibold text-gray-900">Imagen del Animal</h3>
              </div>

              {!imagePreview && (
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-400 transition-colors duration-200 bg-gray-50 active:bg-gray-100">
                  <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h4 className="mt-4 text-lg font-medium text-gray-900">Sube una imagen</h4>
                  <p className="mt-2 text-sm text-gray-500">O toma una foto con tu cámara</p>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
                    <button
                      type="button"
                      onClick={() => document.getElementById('gallery-input')?.click()}
                      className="inline-flex items-center justify-center px-6 py-5 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 active:scale-95 min-h-[56px]"
                      aria-label="Seleccionar imagen de la galería"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Galería</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => document.getElementById('camera-input')?.click()}
                      className="inline-flex items-center justify-center px-6 py-5 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 active:scale-95 min-h-[56px]"
                      aria-label="Tomar foto con la cámara"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Cámara</span>
                    </button>
                  </div>

                  <input
                    type="file"
                    id="gallery-input"
                    name="imagen"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    aria-hidden="true"
                  />

                  <input
                    type="file"
                    id="camera-input"
                    name="imagen"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageChange}
                    className="hidden"
                    aria-hidden="true"
                  />
                </div>
              )}

              {/* Image Preview */}
              {imagePreview && (
                <div className="relative">
                  <div className="bg-gray-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-semibold text-gray-900">Vista previa</h4>
                      <div className="flex items-center space-x-2">
                        {isCompressing && (
                          <span className="inline-flex items-center text-xs text-blue-600">
                            <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Procesando...
                          </span>
                        )}
                        {compressedImage && !isCompressing && (
                          <span className="inline-flex items-center text-xs text-green-600">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Optimizada
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="relative">
                      <Image
                        src={imagePreview}
                        alt="Vista previa"
                        width={800}
                        height={400}
                        className="w-full h-48 sm:h-64 object-cover rounded-lg"
                        style={{ objectFit: 'cover' }}
                        unoptimized={true}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedImage(null);
                          setCompressedImage(null);
                          setImagePreview(null);
                          setIsCompressing(false);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors duration-200 shadow-lg active:scale-95"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Campos ocultos de venta */}
            <div className="hidden">
              <div>
                <label htmlFor="peso_salida" className="block text-sm font-medium text-gray-700">
                  Peso de Salida (kg)
                </label>
                <input
                  type="number"
                  id="peso_salida"
                  name="peso_salida"
                  step="0.01"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: 520.75"
                />
              </div>

              <div>
                <label htmlFor="precio_kg_venta" className="block text-sm font-medium text-gray-700">
                  Precio por Kg (Venta)
                </label>
                <input
                  type="number"
                  id="precio_kg_venta"
                  name="precio_kg_venta"
                  step="0.01"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: 28.00"
                />
              </div>

              <div>
                <label htmlFor="fecha_venta" className="block text-sm font-medium text-gray-700">
                  Fecha de Venta
                </label>
                <input
                  type="date"
                  id="fecha_venta"
                  name="fecha_venta"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Botones de acción - Mobile Optimized */}
            <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
              <Link
                href="/cattle"
                className="w-full sm:w-auto px-6 py-5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium text-center min-h-[56px] active:scale-95 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={isUploading}
                className="w-full sm:w-auto px-6 py-5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl min-h-[56px] active:scale-95 flex items-center justify-center"
              >
                {isUploading ? (
                  <span className="inline-flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </span>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Guardar Ganado
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
