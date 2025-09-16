# Image Compression Feature

## Overview

The maintenance request form now includes automatic image compression to reduce file sizes while maintaining reasonable quality. This allows users to upload more images without hitting server upload limits.

## Features

- **Selective Compression**: Only images larger than 2MB are compressed
- **50% Quality Compression**: Compressed images use 50% quality for significant size reduction
- **Progress Tracking**: Visual progress bar during processing
- **Compression Statistics**: Shows which files were compressed and savings achieved
- **Multiple Format Support**: JPEG, PNG, WebP, GIF
- **Smart Processing**: Smaller files are kept original to preserve quality
- **Error Handling**: Graceful fallback if compression fails

## Technical Details

### Compression Settings

The default compression settings for maintenance requests:
- **Compression Threshold**: 2MB (only files larger than this are compressed)
- **Max Width**: 1920px
- **Max Height**: 1080px  
- **Quality**: 50% (reduced for significant size savings)
- **Max File Size**: 500KB
- **Output Format**: JPEG

### File Limits

- **Maximum Images**: 10 per request
- **Max File Size Before Compression**: 5MB
- **Supported Formats**: JPEG, PNG, WebP, GIF

### How It Works

1. User selects image files
2. Files are validated for type and size
3. System checks file sizes - only files >2MB are compressed
4. Large images are compressed using HTML5 Canvas API at 50% quality
5. Processing progress is displayed to user
6. Results show which files were compressed vs kept original
7. User can remove individual images or all at once

## Configuration

### Compression Presets

Available in `resources/js/utils/compressionConfig.js`:

- **High Quality**: 2560x1440, 90% quality, 1MB max
- **Medium Quality**: 1920x1080, 80% quality, 500KB max (default)
- **Low Quality**: 1280x720, 60% quality, 250KB max
- **Thumbnail**: 400x400, 70% quality, 100KB max

### Customization

To modify compression settings, update the configuration in:
```javascript
// resources/js/Pages/MaintenanceRequest/Create.jsx
compressionOptions={DEFAULT_MAINTENANCE_COMPRESSION}
```

Or create custom settings:
```javascript
compressionOptions={{
    maxWidth: 1600,
    maxHeight: 900,
    quality: 0.75,
    maxSizeKB: 400,
    format: 'image/jpeg'
}}
```

## User Experience

### Visual Feedback

- **Progress Bar**: Shows processing progress percentage
- **Smart Statistics**: Shows how many files were compressed vs kept original
- **Compression Details**: For compressed files, displays original → compressed size and % savings
- **Threshold Information**: Clearly indicates 2MB compression threshold
- **Error Handling**: Clear error messages for invalid files or processing failures
- **Image Preview**: Grid layout with hover information showing filename and file size

### Accessibility

- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Keyboard Navigation**: Full keyboard accessibility
- **Error Messages**: Clear, translatable error messages
- **Visual Indicators**: Color-coded feedback for different states

## Browser Compatibility

The image compression feature uses the HTML5 Canvas API and is supported in:
- Chrome 4+
- Firefox 3.6+
- Safari 3.1+
- Edge 12+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- **Client-side Processing**: No server load for compression
- **Parallel Processing**: Multiple images compressed simultaneously
- **Memory Efficient**: Images processed one at a time to avoid memory issues
- **Progressive Enhancement**: Falls back to original files if compression fails

## Translations

The feature supports both English and Spanish with translations for:
- Progress messages
- Error messages  
- File size information
- User instructions
- Accessibility labels

## Files Modified

- `resources/js/utils/imageCompression.js` - Core compression logic
- `resources/js/Components/ImageUploadWithCompression.jsx` - React component
- `resources/js/utils/compressionConfig.js` - Configuration presets
- `resources/js/Pages/MaintenanceRequest/Create.jsx` - Form integration
- `resources/js/utils/translations.js` - Translation strings

## Future Enhancements

Potential improvements:
- WebP format support for better compression
- Drag & drop file upload
- Image cropping/editing tools
- Batch compression settings
- Cloud-based compression fallback