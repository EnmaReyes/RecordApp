import React from "react";

export default function WhatsAppButton() {
  return (
    <div className="fixed right-4 bottom-6">
      <a
        href="https://api.whatsapp.com/send?phone=&text=Hola%20quiero%20informacion"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-green-600 shadow-lg text-white"
        aria-label="Contactar por Whatsapp"
      >
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20.5 3.5L3.5 20.5V24L7 20.5H8A11 11 0 0020.5 8V3.5Z"
            fill="currentColor"
          />
        </svg>
        <span className="hidden sm:inline">WhatsApp</span>
      </a>
    </div>
  );
}
