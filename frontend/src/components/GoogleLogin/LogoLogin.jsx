import { useState } from "react";
import { useCurrencies } from "../../context/CurrencyProvider.jsx";
import GoogleLoginButton from "./GoogleLoginButton.jsx";
import { RiArrowDownWideFill, RiArrowUpWideFill } from "react-icons/ri";

const LogoLogin = () => {
  const { auth, logout, useMediaQuery } = useCurrencies();
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen((prev) => !prev);
  };
  const isMobile = useMediaQuery("(max-width: 768px)");

  console.log("user: ", auth);
  return (
    <div className="flex flex-row items-center relative">
      {auth ? (
        <div className="flex flex-col md:flex-row items-center gap-1 md:gap-2 w-12 h-12 rounded-full">
          {auth?.photo ? (
            <img
              onClick={() => {
                if (isMobile) handleOpen();
              }}
              src={auth?.photo}
              alt={auth?.firstName?.charAt(0)?.toUpperCase() || "R"}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-aqua-gradient flex items-center justify-center text-dark font-bold text-lg shadow-lg shadow-cyan-500/30">
              {auth?.firstName?.charAt(0)?.toUpperCase() || "R"}
            </div>
          )}
          <div>
            <button
              className="bg-neutral-800/25 shadow-lg shadow-black/20 px-2 py-1 rounded text-sm"
              onClick={handleOpen}
            >
              <div className="hidden md:block">
                <RiArrowDownWideFill />
              </div>
            </button>
          </div>
        </div>
      ) : (
        <button className={isMobile ? "" : "textanimate"}>
          <GoogleLoginButton />
        </button>
      )}

      <div
        className={`absolute -top-60 md:top-14 -right-24 w-64 rounded-lg bg-neutral-800/5 shadow-lg shadow-black/40 ring-1 ring-white/10 backdrop-blur-md p-4
  transform transition-all duration-300 ease-in-out
  ${open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-90 pointer-events-none"}`}
      >
        <div className="flex flex-row justify-start items-center gap-1 mb-4">
          <p className="font-mono">Hola Hola!</p>
          <p className="text-2xl">👋</p>
        </div>

        {/* Header con foto y datos */}
        <div className="flex items-center gap-3 mb-4 font-mono ">
          {auth?.photo ? (
            <img
              src={auth?.photo}
              alt={auth?.firstName?.charAt(0)?.toUpperCase() || "R"}
              className="w-12 h-12 rounded-full ring-2 ring-white/20"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-aqua-gradient flex items-center justify-center text-dark font-bold text-lg shadow-lg shadow-cyan-500/30">
              {auth?.firstName?.charAt(0)?.toUpperCase() || "R"}
            </div>
          )}
          <div className="flex flex-col">
            <p className="text-sm font-semibold text-white truncate">
              {auth?.firstName} {auth?.lastName}
            </p>
            <p className="text-xs text-white/60 truncate">{auth?.role?.toUpperCase()}</p>
            <p className="text-xs text-white/60 truncate">{auth?.email}</p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col gap-2 cursor-pointer">
          <button
            onClick={() => {
              logout();
              setOpen(false);
            }}
            className="w-full bg-red-500/90 hover:bg-red-600 text-white font-medium px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-center gap-2"
          >
            Cerrar sesión
          </button>
          <button
            onClick={handleOpen}
            className="w-full bg-neutral-700/80 hover:bg-neutral-600 text-white px-3 py-2 rounded-md text-sm flex items-center justify-center gap-1 transition-colors"
          >
            <div className="hidden md:block">
              <RiArrowUpWideFill />
            </div>

            <div className="block md:hidden">
              <RiArrowDownWideFill className="text-sm" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoLogin;
