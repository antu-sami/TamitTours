#!/bin/bash

# Create a folder for optimized images
mkdir -p images/gallery/webp

# Loop over all HEIC images
for img in images/gallery/*.heic; do
    filename=$(basename "$img" .heic)
    # Convert to WebP, resize to max width 1200px, and set quality 80%
    magick "$img" -resize 1200x -quality 80 "images/gallery/webp/${filename}.webp"
done
