// WhatsAppButton.jsx
import React, { useMemo } from "react";

export default function WhatsAppButton({ rates }) {
  const phoneNumber = "5491122947537";

  const message = useMemo(() => {
    if (!rates) return "Un problema ocurrió al obtener las tasas de cambio.";

    return `
🌤 FELIZ DÍA TE DESEA 
         CAMBIOS RECORD 🌥
   Haz tus cambios desde

🇨🇴 a 🇻🇪: ${rates.COL?.toFixed(2) || "-"}    |   🇲🇽 a 🇻🇪: ${
      rates.MEX?.toFixed(2) || "-"
    } 

🇵🇪 a 🇻🇪: ${rates.PER?.toFixed(2) || "-"}    |   🇨🇱 a 🇻🇪: ${
      rates.CHL?.toFixed(4) || "-"
    } 

🇧🇷 a 🇻🇪: ${rates.BRA?.toFixed(2) || "-"}    |   🇦🇷 a 🇻🇪: ${
      rates.ARG?.toFixed(4) || "-"
    }  

🇪🇸 a 🇻🇪: ${rates.ESP?.toFixed(2) || "-"}  |   🇺🇾 a 🇻🇪: ${
      rates.URU?.toFixed(2) || "-"
    } 

🇻🇪 a 🇨🇴: ${rates.VEN_COL?.toFixed(2) || "-"}      |  
 
⚠ A considerar:
💬 Pedir número de cuenta
antes de consignar o transferir

💬 Tasa sujeta a cambios
sin previo aviso
`;
  }, [rates]);

  const encodedMessage = encodeURIComponent(message);
  const whatsappLink = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`;

  return (
    <div className="fixed right-4 bottom-6 z-50">
      <a
        href={whatsappLink}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-green-600 shadow-lg text-white hover:bg-green-700 transition-all"
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
