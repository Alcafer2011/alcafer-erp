import React from 'react';

interface GlobalContactButtonsProps {
  whatsappNumber?: string;
  telegramUsername?: string;
}

const GlobalContactButtons: React.FC<GlobalContactButtonsProps> = ({
  whatsappNumber = '393331234567',
  telegramUsername = 'AlcaferSupport',
}) => {
  const openWhatsApp = () => {
    const url = `https://wa.me/${whatsappNumber}`;
    window.open(url, '_blank');
  };

  const openTelegram = () => {
    const url = `https://t.me/${telegramUsername}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed right-4 bottom-4 z-[1000] flex flex-col gap-2">
      <button
        onClick={openWhatsApp}
        className="rounded-full shadow-lg bg-green-500 hover:bg-green-600 text-white px-4 py-3 transition-colors"
        title="Contattaci su WhatsApp"
      >
        WhatsApp
      </button>
      <button
        onClick={openTelegram}
        className="rounded-full shadow-lg bg-sky-500 hover:bg-sky-600 text-white px-4 py-3 transition-colors"
        title="Contattaci su Telegram"
      >
        Telegram
      </button>
    </div>
  );
};

export default GlobalContactButtons;







