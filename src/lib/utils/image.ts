/**
 * Utilities for client-side image processing.
 */

interface CroppedAreaPixels {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Creates a cropped image from a source URL using the pixel area
 * provided by react-easy-crop's onCropComplete callback.
 * Returns a File ready for upload.
 */
export async function getCroppedImage(
    imageSrc: string,
    croppedAreaPixels: CroppedAreaPixels,
    fileName: string = 'cropped.jpg'
): Promise<File> {
    const image = await loadImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('Failed to get canvas context');
    }

    // Set canvas to the exact cropped dimensions
    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    // Draw only the cropped region from the source image
    ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
    );

    // Convert canvas to blob
    const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (b) => {
                if (b) resolve(b);
                else reject(new Error('Failed to create blob from cropped canvas'));
            },
            'image/jpeg',
            0.9
        );
    });

    return new File([blob], fileName, {
        type: 'image/jpeg',
        lastModified: Date.now(),
    });
}

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load image for cropping'));
        img.src = src;
    });
}

interface OptimizationOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'image/jpeg' | 'image/webp';
    maxFileSize?: number; // in bytes, e.g., 400 * 1024 for 400KB
}

/**
 * Optimizes an image file by resizing and compressing it.
 * Performs iterative compression if maxFileSize is provided.
 * Supports HEIC conversion using dynamic import.
 */
export async function optimizeImage(
    file: File,
    options: OptimizationOptions = {}
): Promise<File> {
    const {
        maxWidth = 1600,
        maxHeight = 1600,
        quality = 0.8,
        format = 'image/webp', // Default to webp, will fallback to jpeg if needed
        maxFileSize = 0 // 0 means no mandatory limit
    } = options;

    let processingFile: File | Blob = file;

    // 1. Handle HEIC files (typical from manual uploads on iPhone/Mac)
    const isHeic = file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic';
    if (isHeic) {
        try {
            // We use dynamic import so heic2any isn't loaded unless needed
            // @ts-ignore - heic2any might not have types installed
            const heic2any = (await import('heic2any')).default;
            const converted = await heic2any({
                blob: file,
                toType: 'image/jpeg',
                quality: 0.9,
            });
            processingFile = Array.isArray(converted) ? converted[0] : converted;
        } catch (error) {
            console.error('HEIC conversion failed:', error);
            // If conversion fails, we'll try to process the original file anyway
        }
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(processingFile);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = async () => {
                const width = img.width;
                const height = img.height;

                // Calculate initial target dimensions
                const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
                let currentWidth = Math.round(width * ratio);
                let currentHeight = Math.round(height * ratio);

                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'));
                    return;
                }

                let currentQuality = quality;
                let currentFormat: 'image/jpeg' | 'image/webp' = format;
                let optimizedBlob: Blob | null = null;
                let attempts = 0;
                const maxAttempts = 5;

                // Iterative compression loop
                while (attempts < maxAttempts) {
                    canvas.width = currentWidth;
                    canvas.height = currentHeight;
                    ctx.clearRect(0, 0, currentWidth, currentHeight);
                    ctx.drawImage(img, 0, 0, currentWidth, currentHeight);

                    optimizedBlob = await new Promise<Blob | null>((res) => 
                        canvas.toBlob((b) => res(b), currentFormat, currentQuality)
                    );

                    if (!optimizedBlob) {
                        reject(new Error('Failed to create blob from canvas'));
                        return;
                    }

                    // CRITICAL FIX: If browser doesn't support WebP encoding, toBlob fallbacks to image/png
                    // which is lossless and HUGE. We must switch to image/jpeg in this case.
                    if (currentFormat === 'image/webp' && optimizedBlob.type === 'image/png') {
                        currentFormat = 'image/jpeg';
                        continue; // Retry immediately with same dimensions but JPEG
                    }

                    // If we have a size limit and haven't met it yet
                    if (maxFileSize > 0 && optimizedBlob.size > maxFileSize && attempts < maxAttempts - 1) {
                        // Reduce quality first
                        if (currentQuality > 0.5) {
                            currentQuality -= 0.15;
                        } else {
                            // Then reduce dimensions more aggressively
                            currentWidth = Math.round(currentWidth * 0.7);
                            currentHeight = Math.round(currentHeight * 0.7);
                            currentQuality = 0.7; // Reset quality slightly when shrinking
                        }
                        attempts++;
                    } else {
                        // Success or reached max attempts
                        break;
                    }
                }

                if (!optimizedBlob) {
                    reject(new Error('Failed to process image'));
                    return;
                }

                // If still above 1MB and original was smaller, or if we just want to be safe
                // (Omitted for now to prioritize hitting the 400KB target)

                const extension = optimizedBlob.type === 'image/webp' ? '.webp' : '.jpg';
                const fileName = file.name.replace(/\.[^/.]+$/, "") + extension;
                const optimizedFile = new File([optimizedBlob], fileName, {
                    type: optimizedBlob.type,
                    lastModified: Date.now(),
                });

                resolve(optimizedFile);
            };
            img.onerror = () => reject(new Error('Failed to load image source.'));
        };
        reader.onerror = () => reject(new Error('Failed to read file.'));
    });
}
