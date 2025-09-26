import toast from 'react-hot-toast';
import { aiService } from './aiService';

export function startErrorWatcher(): void {
  // JS errors
  window.addEventListener('error', async (event) => {
    const message = `JS Error: ${event.message} at ${event.filename}:${event.lineno}`;
    toast.error(message, { duration: 5000 });
    try {
      await aiService.chatWithAI(`Suggerisci una correzione per: ${event.message}`, {
        filename: event.filename,
        line: event.lineno,
        stack: event.error?.stack,
      });
    } catch {}
  });

  // Promise rejections
  window.addEventListener('unhandledrejection', async (event: PromiseRejectionEvent) => {
    const reason: any = (event as any).reason;
    const message = `Promise rejection: ${reason?.message || reason}`;
    toast.error(message, { duration: 5000 });
    try {
      await aiService.chatWithAI(`Spiega e proponi fix: ${message}`, { reason });
    } catch {}
  });
}



