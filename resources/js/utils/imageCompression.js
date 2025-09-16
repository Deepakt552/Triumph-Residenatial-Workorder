/**
 * Image compression utility for maintenance request form
 * Uses tiered compression based on file size
 */

import { COMPRESSION_TIERS, MAX_COMPRESSION_RATIO } from './compressionConfig';

/**
 * Get compression settings based on file size
 * @param {number} fileSizeMB - File size in MB
 * @returns {Object} Compression settings
 */
const getCompressionTier = (fileSizeMB) => {
    // Files under 2MB - no compression
    if (fileSizeMB < 2) {
        return null;
    }
    
    // Find the appropriate tier
    for (const tier of Object.values(COMPRESSION_TIERS)) {
        if (fileSizeMB >= tier.minSizeMB && fileSizeMB < tier.maxSizeMB) {
            return tier;
        }
    }
    
    // Default to highest compression for very large files
    return COMPRESSION_TIERS.tier3;
};

/**
 * Compress an image file using tiered compression
 * @param {File} file - The image file to compress
 * @param {Object} options - Compression options
 * @returns {Promise<File>} - Compressed image file
 */
export const compressImage = async (file, options = {}) => {
    const {
        maxWidth = 1920,
        maxHeight = 1080,
        maxSizeKB = 500,
        format = 'image/jpeg'
    } = options;

    const fileSizeMB = file.size / (1024 * 1024);
    const compressionTier = getCompressionTier(fileSizeMB);
    
    // If file is under 2MB, return original
    if (!compressionTier) {
        console.log(`File ${file.name} is ${fileSizeMB.toFixed(2)}MB, keeping original (under 2MB)`);
        return file;
    }

    console.log(`File ${file.name} is ${fileSizeMB.toFixed(2)}MB, applying ${compressionTier.description}`);

    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            try {
                // Calculate dimensions based on file size
                let targetMaxWidth = maxWidth;
                let targetMaxHeight = maxHeight;
                
                // Reduce dimensions for larger files
                if (fileSizeMB > 8) {
                    targetMaxWidth = Math.min(maxWidth, 1280);
                    targetMaxHeight = Math.min(maxHeight, 720);
                } else if (fileSizeMB > 5) {
                    targetMaxWidth = Math.min(maxWidth, 1600);
                    targetMaxHeight = Math.min(maxHeight, 900);
                }

                const { width, height } = calculateDimensions(
                    img.width, 
                    img.height, 
                    targetMaxWidth, 
                    targetMaxHeight
                );

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                // Use the tier's quality setting
                canvas.toBlob(async (blob) => {
                    if (!blob) {
                        reject(new Error('Failed to compress image'));
                        return;
                    }

                    let finalBlob = blob;
                    let currentQuality = compressionTier.quality;
                    
                    // Calculate minimum allowed file size (30% of original to respect 70% max compression)
                    const minAllowedSize = file.size * (1 - MAX_COMPRESSION_RATIO);

                    // Additional compression if still too large, but respect minimum size limit
                    while (finalBlob.size > maxSizeKB * 1024 && 
                           finalBlob.size > minAllowedSize && 
                           currentQuality > 0.3) { // Don't go below 30% quality
                        currentQuality -= 0.05;
                        const testBlob = await new Promise(resolve => {
                            canvas.toBlob(resolve, format, currentQuality);
                        });
                        
                        // Only use the new blob if it doesn't exceed compression limit
                        if (testBlob.size >= minAllowedSize) {
                            finalBlob = testBlob;
                        } else {
                            // Stop compression if we would exceed the limit
                            break;
                        }
                    }

                    const compressedFile = new File([finalBlob], file.name, {
                        type: format,
                        lastModified: Date.now()
                    });

                    const compressionRatio = ((file.size - compressedFile.size) / file.size * 100);
                    console.log(`Compressed ${file.name}: ${fileSizeMB.toFixed(2)}MB → ${(compressedFile.size / (1024 * 1024)).toFixed(2)}MB (${compressionRatio.toFixed(1)}% compression)`);
                    
                    // Ensure we haven't exceeded maximum compression ratio
                    if (compressionRatio > MAX_COMPRESSION_RATIO * 100) {
                        console.warn(`Warning: Compression ratio ${compressionRatio.toFixed(1)}% exceeds maximum ${MAX_COMPRESSION_RATIO * 100}%`);
                    }
                    
                    resolve(compressedFile);
                }, format, compressionTier.quality);

            } catch (error) {
                reject(error);
            }
        };

        img.onerror = () => {
            reject(new Error('Failed to load image'));
        };

        img.src = URL.createObjectURL(file);
    });
};

/**
 * Calculate new dimensions while maintaining aspect ratio
 * @param {number} originalWidth 
 * @param {number} originalHeight 
 * @param {number} maxWidth 
 * @param {number} maxHeight 
 * @returns {Object} New width and height
 */
const calculateDimensions = (originalWidth, originalHeight, maxWidth, maxHeight) => {
    let width = originalWidth;
    let height = originalHeight;

    // Calculate scaling factor
    const widthRatio = maxWidth / originalWidth;
    const heightRatio = maxHeight / originalHeight;
    const ratio = Math.min(widthRatio, heightRatio, 1); // Don't upscale

    width = Math.round(originalWidth * ratio);
    height = Math.round(originalHeight * ratio);

    return { width, height };
};

/**
 * Compress multiple images using tiered compression
 * @param {File[]} files - Array of image files
 * @param {Object} options - Compression options
 * @param {Function} onProgress - Progress callback (optional)
 * @returns {Promise<File[]>} - Array of compressed image files
 */
export const compressImages = async (files, options = {}, onProgress = null) => {
    const compressedFiles = [];
    const compressionStats = {
        tier1: 0, // 2-5MB files (50% compression)
        tier2: 0, // 5-8MB files (60% compression)  
        tier3: 0, // 8MB+ files (80% compression)
        unchanged: 0 // Under 2MB files
    };

    for (let i = 0; i < files.length; i++) {
        try {
            const originalSize = files[i].size;
            const fileSizeMB = originalSize / (1024 * 1024);
            const compressedFile = await compressImage(files[i], options);
            compressedFiles.push(compressedFile);
            
            // Track compression statistics
            if (fileSizeMB < 2) {
                compressionStats.unchanged++;
            } else if (fileSizeMB < 5) {
                compressionStats.tier1++;
            } else if (fileSizeMB < 8) {
                compressionStats.tier2++;
            } else {
                compressionStats.tier3++;
            }

            if (onProgress) {
                onProgress({
                    current: i + 1,
                    total: files.length,
                    percentage: Math.round(((i + 1) / files.length) * 100),
                    compressionStats
                });
            }
        } catch (error) {
            console.error(`Failed to compress image ${files[i].name}:`, error);
            // Keep original file if compression fails
            compressedFiles.push(files[i]);
            compressionStats.unchanged++;
        }
    }

    return compressedFiles;
};

/**
 * Get file size in human readable format
 * @param {number} bytes 
 * @returns {string}
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Validate image file
 * @param {File} file 
 * @returns {boolean}
 */
export const isValidImageFile = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    return validTypes.includes(file.type.toLowerCase());
};