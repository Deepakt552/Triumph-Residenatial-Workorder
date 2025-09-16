/**
 * Configuration options for image compression
 */

export const COMPRESSION_PRESETS = {
    // High quality, larger file size
    high: {
        maxWidth: 2560,
        maxHeight: 1440,
        quality: 0.5,
        maxSizeKB: 1000,
        format: 'image/jpeg',
        minSizeForCompressionMB: 2
    },
    
    // Medium quality, balanced size
    medium: {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.5,
        maxSizeKB: 500,
        format: 'image/jpeg',
        minSizeForCompressionMB: 2
    },
    
    // Low quality, smaller file size
    low: {
        maxWidth: 1280,
        maxHeight: 720,
        quality: 0.5,
        maxSizeKB: 250,
        format: 'image/jpeg',
        minSizeForCompressionMB: 2
    },
    
    // Thumbnail size
    thumbnail: {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.5,
        maxSizeKB: 100,
        format: 'image/jpeg',
        minSizeForCompressionMB: 2
    }
};

// Progressive compression tiers based on file size
export const COMPRESSION_TIERS = {
    // 2-5MB: 50% compression
    tier1: {
        minSizeMB: 2,
        maxSizeMB: 5,
        quality: 0.7,
        description: '50% compression'
    },
    // 5-8MB: 60% compression  
    tier2: {
        minSizeMB: 5,
        maxSizeMB: 8,
        quality: 0.6,
        description: '60% compression'
    },
    // 8MB+: 70% compression (maximum)
    tier3: {
        minSizeMB: 8,
        maxSizeMB: Infinity,
        quality: 0.5,
        description: '70% compression'
    }
};

// Maximum compression ratio (70% means file can be compressed to minimum 30% of original size)
export const MAX_COMPRESSION_RATIO = 0.7;

// Default compression settings for maintenance request form
export const DEFAULT_MAINTENANCE_COMPRESSION = COMPRESSION_PRESETS.medium;

// Maximum file size before compression (in bytes) - unlimited
export const MAX_FILE_SIZE_BEFORE_COMPRESSION = 1000 * 1024 * 1024; // 1GB (effectively unlimited)

// Supported image formats
export const SUPPORTED_IMAGE_FORMATS = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif'
];

// Maximum number of images allowed
export const MAX_IMAGES_ALLOWED = 10;