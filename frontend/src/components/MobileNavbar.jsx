import { useState } from "react";
import { HiHome } from "react-icons/hi2";
import { BsCurrencyExchange } from "react-icons/bs";
import { PiCurrencyDollarSimpleFill } from "react-icons/pi";
import { IoCalculator } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";

const items = [
  {
    id: "inicio",
    icon: <HiHome size={26} />,
    label: "Inicio",
  },
  {
    id: "prices",
    icon: <PiCurrencyDollarSimpleFill size={26} />,
    label: "Precios",
  },

  {
    id: "tasas",
    icon: <BsCurrencyExchange size={26} />,
    label: "Tasas",
  },
  { id: "calculator", icon: <IoCalculator size={26} />, label: "Calc" },
];

export default function MobileNavbar() {
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const goToSection = (id) => {
    if (id === "calculator") {
      setTimeout(() => {
        navigate("calculator");
      }, 100);
    }
    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: id } });
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50">
      <div className="relative flex h-16 items-center justify-between bg-white shadow-lg border-t px-5">
        {/* Bloque izquierdo */}
        <div className="flex gap-12">
          {items.slice(0, 2).map((item, index) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveIndex(index);
                goToSection(item.id);
              }}
              className={
                "flex flex-col items-center text-xs transition-all duration-300 text-gray-500"
              }
            >
              <div className="flex flex-col items-center h-10 justify-center">
                <span
                  className={`${activeIndex === index ? "text-primary scale-125 animate-pulse" : ""} transition-transform duration-500 ease-in-out`}
                >
                  {item.icon}
                </span>
                {activeIndex === index && (
                  <span className="mt-1 font-semibold">{item.label}</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Logo centrado */}
        <div className="sticky -translate-y-1/2 left-1/2 transform -translate-x-1/2">
          <div className="w-16 h-16 rounded-full bg-aqua-gradient flex items-center justify-center text-dark font-bold text-3xl shadow-lg shadow-cyan-500/30">
            R
          </div>
        </div>

        {/* Bloque derecho */}
        <div className="flex gap-12">
          {items.slice(2).map((item, index) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveIndex(index + 2); // offset porque ya cortamos el array
                goToSection(item.id);
              }}
              className={
                "flex flex-col items-center text-xs transition-all duration-300 text-gray-500"
              }
            >
              <div className="flex flex-col items-center h-10 justify-center">
                <span
                  className={`${activeIndex === index + 2 ? "text-primary scale-125 animate-pulse" : ""} transition-transform duration-500 ease-in-out`}
                >
                  {item.icon}
                </span>
                {activeIndex === index + 2 && (
                  <span className="mt-1 font-semibold">{item.label}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
