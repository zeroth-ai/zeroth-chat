import sharp from 'sharp';

export async function compressImageToBase64(
  file: File, 
  maxSizeKB: number = 100
): Promise<string> {
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    
    let compressedBuffer = await sharp(buffer)
      .resize(1024, 1024, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .jpeg({ 
        quality: 80,
        mozjpeg: true 
      })
      .toBuffer();
    
    let currentSizeKB = compressedBuffer.length / 1024;
    let quality = 80;
    
    while (currentSizeKB > maxSizeKB && quality > 30) {
      quality -= 10;
      compressedBuffer = await sharp(buffer)
        .resize(1024, 1024, { 
          fit: 'inside', 
          withoutEnlargement: true 
        })
        .jpeg({ quality, mozjpeg: true })
        .toBuffer();
      currentSizeKB = compressedBuffer.length / 1024;
    }
    
    if (currentSizeKB > maxSizeKB) {
      compressedBuffer = await sharp(buffer)
        .resize(512, 512, { 
          fit: 'inside', 
          withoutEnlargement: true 
        })
        .jpeg({ quality: 70, mozjpeg: true })
        .toBuffer();
    }
    
    return `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;
    
  } catch (error) {
    console.error('Image compression error:', error);
    throw new Error('Failed to process image');
  }
}

export function extractBase64Data(dataUrl: string): string {
  return dataUrl.split(',')[1];
}