<?php
/**
 * Simple script to generate a favicon.ico from Logo.png
 * Run this script once to generate the favicon
 */

// Check if Logo.png exists
if (!file_exists(__DIR__ . '/Logo.png')) {
    die('Logo.png not found');
}

// Load the original image
$source = imagecreatefrompng(__DIR__ . '/Logo.png');
if (!$source) {
    die('Could not load Logo.png');
}

// Get original dimensions
$width = imagesx($source);
$height = imagesy($source);

// Create a square canvas for the favicon (32x32 pixels)
$favicon = imagecreatetruecolor(32, 32);

// Make transparent background
imagealphablending($favicon, false);
imagesavealpha($favicon, true);
$transparent = imagecolorallocatealpha($favicon, 0, 0, 0, 127);
imagefilledrectangle($favicon, 0, 0, 32, 32, $transparent);

// Copy and resize the original image to fit the favicon
imagecopyresampled($favicon, $source, 0, 0, 0, 0, 32, 32, $width, $height);

// Save as favicon.ico
imagepng($favicon, __DIR__ . '/favicon.ico');

// Clean up
imagedestroy($source);
imagedestroy($favicon);

echo "Favicon generated successfully!"; 