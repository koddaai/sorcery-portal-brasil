#!/bin/bash
# Optimize article images for web
# Converts to WebP and resizes to max 800px width

ARTICLES_DIR="/Users/pedro/sorcery-collection-manager/assets/articles"
BACKUP_DIR="/Users/pedro/sorcery-collection-manager/assets/articles-backup"

# Check if cwebp is installed
if ! command -v cwebp &> /dev/null; then
    echo "Installing webp tools..."
    brew install webp
fi

# Create backup
echo "Creating backup..."
mkdir -p "$BACKUP_DIR"
cp "$ARTICLES_DIR"/*.{png,jpg,jpeg,PNG,JPG,JPEG} "$BACKUP_DIR/" 2>/dev/null

echo "Optimizing images..."
cd "$ARTICLES_DIR"

for file in *.png *.jpg *.jpeg *.PNG *.JPG *.JPEG 2>/dev/null; do
    if [ -f "$file" ]; then
        # Get filename without extension
        filename="${file%.*}"

        # Convert to WebP with quality 80 and max width 800px
        echo "Converting: $file"

        # Use sips to resize first (macOS built-in)
        sips --resampleWidth 800 "$file" --out "${filename}_resized.png" 2>/dev/null

        # Convert to WebP
        cwebp -q 80 "${filename}_resized.png" -o "${filename}.webp" 2>/dev/null

        # Also create optimized JPG fallback
        sips -s format jpeg -s formatOptions 80 "${filename}_resized.png" --out "${filename}.jpg" 2>/dev/null

        # Remove temp file
        rm -f "${filename}_resized.png"

        # Remove original large file
        rm -f "$file"

        echo "  -> ${filename}.webp created"
    fi
done

echo ""
echo "=== Results ==="
echo "Before:"
du -sh "$BACKUP_DIR"
echo "After:"
du -sh "$ARTICLES_DIR"
echo ""
echo "Done! Update articles-database.json to use .webp extensions"
