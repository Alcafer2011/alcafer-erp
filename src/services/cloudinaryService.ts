import { Cloudinary } from 'cloudinary-core';

const cloudinary = new Cloudinary({
  cloud_name: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string,
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
    this.cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
    this.apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY as string;
    this.apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET as string;

    if (!this.cloudName || !this.apiKey || !this.apiSecret) {
      console.warn('Cloudinary non configurato correttamente. Alcune funzionalità potrebbero non funzionare.');
    }
  }

  public static getInstance(): CloudinaryService {
    if (!CloudinaryService.instance) {
      CloudinaryService.instance = new CloudinaryService();
    }
    return CloudinaryService.instance;
  }

  async uploadFile(file: File, folder: string = 'alcafer-erp'): Promise<UploadResult> {
    if (!this.cloudName || !this.apiKey) {
      throw new Error('Cloudinary non configurato');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ml_default'); // Preset pubblico di default
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
        throw new Error(`Upload fallito: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        public_id: result.public_id,
        secure_url: result.secure_url,
        format: result.format,
        resource_type: result.resource_type,
        bytes: result.bytes,
        width: result.width,
        height: result.height
      };
    } catch (error) {
      console.error('Errore upload Cloudinary:', error);
      throw new Error('Errore nel caricamento del file');
    }
  }

  async uploadMultipleFiles(files: File[], folder: string = 'alcafer-erp'): Promise<UploadResult[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }

  async deleteFile(publicId: string): Promise<boolean> {
    try {
      const timestamp = Math.round(new Date().getTime() / 1000);
      
      const formData = new FormData();
      formData.append('public_id', publicId);
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
      console.error('Errore eliminazione Cloudinary:', error);
      return false;
    }
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