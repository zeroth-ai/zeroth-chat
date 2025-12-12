import sharp from 'sharp';

export async function compressImageToBase64(
  file: File, 
  maxSizeKB: number = 500 // Reduced for better compatibility
): Promise<string> {
  try {
    console.log(`[Image Utils] Processing: ${file.name}, Type: ${file.type}, Size: ${(file.size / 1024).toFixed(2)}KB`);
    
    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Get original metadata
    const metadata = await sharp(buffer).metadata();
    console.log(`[Image Utils] Original dimensions: ${metadata.width}x${metadata.height}, Format: ${metadata.format}`);
    
    // ALWAYS convert to JPEG for DeepSeek compatibility
    // DeepSeek is most reliable with JPEG
    let processedBuffer = await sharp(buffer)
      .resize({
        width: Math.min(metadata.width || 1024, 1024),
        height: Math.min(metadata.height || 1024, 1024),
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ 
        quality: 75, // Lower quality for smaller size
        mozjpeg: true,
        force: true // Force JPEG output even if input is different format
      })
      .toBuffer();
    
    let currentSizeKB = processedBuffer.length / 1024;
    console.log(`[Image Utils] Converted to JPEG: ${currentSizeKB.toFixed(2)}KB`);
    
    // Further reduce if still too large
    if (currentSizeKB > maxSizeKB) {
      console.log(`[Image Utils] Further compressing to meet ${maxSizeKB}KB limit`);
      processedBuffer = await sharp(buffer)
        .resize({
          width: Math.min(metadata.width || 768, 768),
          height: Math.min(metadata.height || 768, 768),
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ 
          quality: 65,
          mozjpeg: true,
          force: true
        })
        .toBuffer();
      
      currentSizeKB = processedBuffer.length / 1024;
      console.log(`[Image Utils] After additional compression: ${currentSizeKB.toFixed(2)}KB`);
    }
    
    // Convert to base64 and return as data URL
    const base64String = processedBuffer.toString('base64');
    const result = `data:image/jpeg;base64,${base64String}`;
    
    console.log(`[Image Utils] Final data URL length: ${result.length} chars`);
    console.log(`[Image Utils] Data URL starts with: ${result.substring(0, 30)}...`);
    
    return result;
    
  } catch (error) {
    console.error('[Image Utils] Compression error:', error);
    throw new Error(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate image file before processing
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Accept all common image types
  const validTypes = [
    'image/jpeg', 
    'image/jpg', 
    'image/png', 
    'image/webp', 
    'image/gif',
    'image/bmp',
    'image/tiff'
  ];
  
  if (!validTypes.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `Unsupported image type: ${file.type}. We'll convert it to JPEG.`
    };
  }
  
  // Check file size - be more restrictive
  const maxSizeBytes = 5 * 1024 * 1024; // 5MB max (more conservative than 20MB)
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `Image too large: ${(file.size / (1024 * 1024)).toFixed(2)}MB. Maximum size is 5MB.`
    };
  }
  
  return { valid: true };
}

/**
 * Alternative: Direct base64 conversion without sharp (fallback)
 */
export async function simpleImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      console.log(`[Simple Conversion] Result type: ${result.substring(0, 20)}...`);
      resolve(result);
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}