/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_BREVO_API_KEY: string;
  readonly VITE_TWILIO_ACCOUNT_SID: string;
  readonly VITE_TWILIO_AUTH_TOKEN: string;
  readonly VITE_TWILIO_PHONE_NUMBER: string;
  readonly VITE_CLOUDINARY_CLOUD_NAME: string;
  readonly VITE_CLOUDINARY_API_KEY: string;
  readonly VITE_CLOUDINARY_API_SECRET: string;
  readonly VITE_OCR_API_KEY: string;
  readonly VITE_MATERIAL_PRICES_API_KEY: string;
  readonly VITE_CRON_JOB_API_KEY: string;
  readonly VITE_APP_URL: string;
  readonly VITE_ADMIN_EMAIL: string;
  readonly VITE_ADMIN_PHONE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}