import React, { useState, useRef } from 'react';
import { compressImages, formatFileSize, isValidImageFile } from '@/utils/imageCompression';
import { DEFAULT_MAINTENANCE_COMPRESSION, MAX_IMAGES_ALLOWED } from '@/utils/compressionConfig';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';

const ImageUploadWithCompression = ({
    label,
    images = [],
    onChange,
    error,
    required = false,
    maxImages = MAX_IMAGES_ALLOWED,
    compressionOptions = {},
    t = (key) => key // Translation function
}) => {
    const [isCompressing, setIsCompressing] = useState(false);
    const [compressionProgress, setCompressionProgress] = useState(0);
    const [compressionStats, setCompressionStats] = useState(null);
    const fileInputRef = useRef(null);

    const defaultCompressionOptions = {
        ...DEFAULT_MAINTENANCE_COMPRESSION,
        ...compressionOptions
    };

    const handleFileSelect = async (e) => {
        const selectedFiles = Array.from(e.target.files);

        if (selectedFiles.length === 0) return;

        // Validate file types
        const invalidFiles = selectedFiles.filter(file => !isValidImageFile(file));
        if (invalidFiles.length > 0) {
            alert(t('invalidFileTypes') || 'Please select only image files (JPEG, PNG, WebP, GIF)');
            return;
        }

        // Check if adding these files would exceed the limit
        if (images.length + selectedFiles.length > maxImages) {
            alert(t('tooManyImages') || `Maximum ${maxImages} images allowed`);
            return;
        }

        // No file size restrictions - all files can be uploaded and will be compressed as needed

        setIsCompressing(true);
        setCompressionProgress(0);
        setCompressionStats(null);

        try {
            // Calculate original total size
            const originalSize = selectedFiles.reduce((total, file) => total + file.size, 0);

            // Compress images with progress tracking
            const compressedFiles = await compressImages(
                selectedFiles,
                defaultCompressionOptions,
                (progress) => {
                    setCompressionProgress(progress.percentage);
                }
            );

            // Calculate final compressed total size
            const compressedSize = compressedFiles.reduce((total, file) => total + file.size, 0);

            // Set final compression stats
            setCompressionStats({
                originalSize: formatFileSize(originalSize),
                compressedSize: formatFileSize(compressedSize),
                savings: originalSize > compressedSize ? Math.round(((originalSize - compressedSize) / originalSize) * 100) : 0,
                tier1: selectedFiles.filter(f => f.size >= 2*1024*1024 && f.size < 5*1024*1024).length,
                tier2: selectedFiles.filter(f => f.size >= 5*1024*1024 && f.size < 8*1024*1024).length,
                tier3: selectedFiles.filter(f => f.size >= 8*1024*1024).length,
                unchanged: selectedFiles.filter(f => f.size < 2*1024*1024).length
            });

            // Filter out any potential duplicates based on name and size
            const existingFileSignatures = images.map(img => `${img.name}_${img.size}`);
            const uniqueCompressedFiles = compressedFiles.filter(file => {
                const signature = `${file.name}_${file.size}`;
                return !existingFileSignatures.includes(signature);
            });
            
            // Update parent component with new images
            const updatedImages = [...images, ...uniqueCompressedFiles];
            console.log('Selected files:', selectedFiles.length);
            console.log('Compressed files:', compressedFiles.length);
            console.log('Unique compressed files:', uniqueCompressedFiles.length);
            console.log('Total images after update:', updatedImages.length);
            onChange(updatedImages);

        } catch (error) {
            console.error('Error compressing images:', error);
            alert(t('compressionError') || 'Error compressing images. Please try again.');
        } finally {
            setIsCompressing(false);
            setCompressionProgress(0);
            // Clear the file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const removeImage = (index) => {
        const updatedImages = [...images];
        const removedFile = updatedImages[index];
        
        // Clean up object URL to prevent memory leaks
        if (removedFile && typeof removedFile === 'object') {
            try {
                URL.revokeObjectURL(URL.createObjectURL(removedFile));
            } catch (e) {
                // Ignore errors if URL is already revoked
            }
        }
        
        updatedImages.splice(index, 1);
        onChange(updatedImages);
    };

    const clearAllImages = () => {
        onChange([]);
        setCompressionStats(null);
    };

    return (
        <div className="space-y-4">
            <div>
                <InputLabel htmlFor="image-upload" value={label} className="font-medium" />
                <p className="text-sm text-gray-600 mb-2">
                    {t('uploadPhotosInstructions') || 'Upload photos of any size. Automatic compression: 2-5MB (50%), 5-8MB (60%), 8MB+ (70% max).'}
                </p>

                <div className="mt-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        id="image-upload"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        disabled={isCompressing || images.length >= maxImages}
                        className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        required={required && images.length === 0}
                    />

                    {error && <InputError message={t(error)} className="mt-2" />}

                    <div className="mt-2 text-sm text-gray-500">
                        {images.length}/{maxImages} {t('imagesSelected') || 'images selected'}
                        {images.length >= maxImages && (
                            <span className="text-amber-600 ml-2">
                                ({t('maxImagesReached') || 'Maximum reached'})
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Compression Progress */}
            {isCompressing && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-800">
                            {t('compressingImages') || 'Compressing images...'}
                        </span>
                        <span className="text-sm text-blue-600">{compressionProgress}%</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${compressionProgress}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {/* Compression Stats */}
            {compressionStats && !isCompressing && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-green-800">
                                {t('processingComplete') || 'Processing Complete'}
                            </p>
                            <div className="space-y-1">
                                <p className="text-xs text-green-600">
                                    {compressionStats.originalSize} → {compressionStats.compressedSize} 
                                    ({compressionStats.savings}% {t('smaller') || 'smaller'})
                                </p>
                                {compressionStats.unchanged > 0 && (
                                    <p className="text-xs text-gray-600">
                                        {compressionStats.unchanged} {t('filesUnder2MB') || 'files under 2MB (kept original)'}
                                    </p>
                                )}
                                {compressionStats.tier1 > 0 && (
                                    <p className="text-xs text-blue-600">
                                        {compressionStats.tier1} {t('files2to5MB') || 'files 2-5MB (50% compression)'}
                                    </p>
                                )}
                                {compressionStats.tier2 > 0 && (
                                    <p className="text-xs text-orange-600">
                                        {compressionStats.tier2} {t('files5to8MB') || 'files 5-8MB (60% compression)'}
                                    </p>
                                )}
                                {compressionStats.tier3 > 0 && (
                                    <p className="text-xs text-red-600">
                                        {compressionStats.tier3} {t('filesOver8MB') || 'files over 8MB (80% compression)'}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="text-green-600">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Preview Grid */}
            {images.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-700">
                            {t('uploadedImages') || 'Uploaded Images'}: {images.length}
                        </p>
                        {images.length > 1 && (
                            <button
                                type="button"
                                onClick={clearAllImages}
                                className="text-sm text-red-600 hover:text-red-800 underline"
                            >
                                {t('removeAll') || 'Remove All'}
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {images.map((file, index) => (
                            <div key={index} className="relative group">
                                <div className="aspect-square border border-gray-300 rounded-lg overflow-hidden bg-gray-100">
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt={`${t('propertyImage') || 'Property image'} ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Image info overlay */}
                                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="truncate">{file.name}</div>
                                    <div>{formatFileSize(file.size)}</div>
                                </div>

                                {/* Remove button */}
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg transition-colors"
                                    aria-label={`${t('removeImage') || 'Remove image'} ${index + 1}`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageUploadWithCompression;