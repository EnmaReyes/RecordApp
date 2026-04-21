import { useState } from "react";
import { useCurrencies } from "../../context/CurrencyProvider.jsx";
import GoogleLoginButton from "./GoogleLoginButton.jsx";
import { RiArrowDownWideFill, RiArrowUpWideFill } from "react-icons/ri";
import EditUserModal from "./EditUserModal.jsx";

const LogoLogin = () => {
  const { auth, logout, useMediaQuery } = useCurrencies();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const handleOpen = () => {
    setOpen((prev) => !prev);
  };
  const isMobile = useMediaQuery("(max-width: 768px)");

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
        className={`absolute bottom-24 md:top-14 -right-24 w-64 md:h-80 rounded-lg bg-neutral-800/5 shadow-lg shadow-black/40 ring-1 ring-white/10 backdrop-blur-md p-4
  transform transition-all duration-300 ease-in-out
  ${open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-90 pointer-events-none"}`}
      >
        {/* Saludo */}
        <div className="flex items-center gap-2 mb-4">
          <p className="font-mono text-sm text-white/70">Hola Hola!</p>
          <p className="text-2xl">👋</p>
        </div>

        {/* Header con foto y nombre */}
        <div className="flex items-center gap-3 mb-4">
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
          <div className="flex flex-col w-full max-w-[200px]">
            <p className="text-sm font-semibold text-white break-words">
              {auth?.firstName} {auth?.lastName}
            </p>
            <p className="text-xs text-white/60 break-words">
              {auth?.role?.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Info del usuario responsiva */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 text-xs">
          <span className="text-white/70">Email</span>
          <span className="text-white truncate">{auth?.email}</span>

          {auth?.companyName && (
            <>
              <span className="text-white/70">Empresa</span>
              <span className="text-white truncate">{auth?.companyName}</span>
            </>
          )}

          <span className="text-white/70">Rol</span>
          <span className="text-white truncate">
            {auth?.role.toUpperCase()}
          </span>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col gap-2 mt-4 cursor-pointer">
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
            onClick={() => {
              setEditOpen(true);
              setOpen(false);
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm flex items-center justify-center gap-2 transition-colors"
          >
            Editar perfil
          </button>
        </div>
      </div>
      {editOpen && (
        <EditUserModal user={auth} onClose={() => setEditOpen(false)} />
      )}
    </div>
  );
};

export default LogoLogin;
