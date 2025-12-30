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

🇨🇴 a 🇻🇪: ${rates.COL?.toFixed(2) || "-"}         |    🇨🇱 a 🇻🇪: ${
      rates.CHL?.toFixed(4) || "-"
    }

🇲🇽 a 🇻🇪: ${rates.MEX?.toFixed(2) || "-"}       |    🇦🇷 a 🇻🇪: ${
      rates.ARG?.toFixed(4) || "-"
    }

🇵🇪 a 🇻🇪: ${rates.PER?.toFixed(2) || "-"}     |    🇧🇷 a 🇻🇪: ${
      rates.BRA?.toFixed(2) || "-"
    }

🇪🇸 a 🇻🇪: ${rates.ESP?.toFixed(2) || "-"}     |    🇺🇾 a 🇻🇪: ${
      rates.URU?.toFixed(2) || "-"
    } 

🇻🇪 a 🇺🇸: ${rates.USD?.toFixed(2) || "-"}     |    🇻🇪 a 🇨🇴: ${
      rates.VEN_COL?.toFixed(2) || "-"
    }   
 
⚠ A considerar:
💬 Pedir número de cuenta
antes de consignar o transferir

💬 Tasa sujeta a cambios
sin previo aviso
`;
  }, [rates]);

  const encodedMessage = encodeURIComponent(message);
  const whatsappLink = `https://api.whatsapp.com/send?text=${encodedMessage}`;

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
          viewBox="0 0 32 32"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M16.027 3C9.397 3 4 8.397 4 15.027c0 2.652.863 5.1 2.328 7.086L4 29l7.144-2.273A11.94 11.94 0 0 0 16.027 27C22.657 27 28 21.603 28 14.973 28 8.397 22.657 3 16.027 3zm0 21.917c-1.84 0-3.593-.497-5.132-1.362l-.368-.217-4.243 1.35 1.393-4.137-.239-.393a10.03 10.03 0 0 1-1.57-5.41c0-5.606 4.557-10.163 10.159-10.163 5.606 0 10.163 4.557 10.163 10.163 0 5.602-4.557 10.169-10.163 10.169zm5.53-7.463c-.302-.151-1.78-.878-2.056-.976-.276-.101-.477-.151-.68.151-.202.302-.778.976-.952 1.177-.176.202-.351.227-.653.076-.302-.151-1.274-.47-2.427-1.497-.897-.797-1.503-1.78-1.678-2.082-.176-.302-.019-.465.132-.616.136-.136.302-.351.453-.527.151-.176.202-.302.302-.504.101-.202.05-.378-.025-.528-.076-.151-.68-1.645-.93-2.252-.244-.587-.49-.508-.68-.518-.176-.008-.378-.01-.58-.01-.202 0-.528.076-.803.378-.276.302-1.055 1.03-1.055 2.507 0 1.478 1.079 2.904 1.228 3.106.151.202 2.127 3.247 5.17 4.552.723.312 1.288.497 1.727.637.726.23 1.386.198 1.909.12.582-.087 1.78-.727 2.034-1.429.252-.702.252-1.304.176-1.43-.075-.125-.277-.201-.58-.352z" />
        </svg>

        <span className="hidden sm:inline">WhatsApp</span>
      </a>
    </div>
  );
}
