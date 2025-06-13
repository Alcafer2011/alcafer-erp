import { Cloudinary } from 'cloudinary-core';

const cloudinary = new Cloudinary({
  cloud_name: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  secure: true
});

export interface UploadResult {
  public_id: string;
  secure_url: string;
  format: string;
  resource_type: string;
  bytes: number;
  width?: number;
  height?: number;
}

export class CloudinaryService {
  private static instance: CloudinaryService;
  private cloudName: string;
  private apiKey: string;
  private apiSecret: string;

  private constructor() {
    this.cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    this.apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
    this.apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET;
  }

  public static getInstance(): CloudinaryService {
    if (!CloudinaryService.instance) {
      CloudinaryService.instance = new CloudinaryService();
    }
    return CloudinaryService.instance;
  }

  async uploadFile(file: File, folder: string = 'alcafer-erp'): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'alcafer_preset'); // Dovrai creare questo preset in Cloudinary
    formData.append('folder', folder);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/auto/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  }

  async uploadMultipleFiles(files: File[], folder: string = 'alcafer-erp'): Promise<UploadResult[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }

  async deleteFile(publicId: string): Promise<boolean> {
    try {
      const timestamp = Math.round(new Date().getTime() / 1000);
      const signature = this.generateSignature(publicId, timestamp);

      const formData = new FormData();
      formData.append('public_id', publicId);
      formData.append('signature', signature);
      formData.append('api_key', this.apiKey);
      formData.append('timestamp', timestamp.toString());

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/destroy`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const result = await response.json();
      return result.result === 'ok';
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      return false;
    }
  }

  private generateSignature(publicId: string, timestamp: number): string {
    // Implementazione semplificata - in produzione usa crypto-js
    const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${this.apiSecret}`;
    return btoa(stringToSign); // Sostituire con SHA1 hash in produzione
  }

  getOptimizedUrl(publicId: string, options: any = {}): string {
    return cloudinary.url(publicId, {
      quality: 'auto',
      fetch_format: 'auto',
      ...options
    });
  }

  getThumbnailUrl(publicId: string, width: number = 200, height: number = 200): string {
    return this.getOptimizedUrl(publicId, {
      width,
      height,
      crop: 'fill',
      gravity: 'auto'
    });
  }
}

export const cloudinaryService = CloudinaryService.getInstance();