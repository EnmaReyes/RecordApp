import React, { useState } from "react";
import { useCurrencies } from "../../context/CurrencyProvider.jsx";
import { toast } from "react-toastify";

const EditUserModal = ({ user, onClose }) => {
  const { updateUser } = useCurrencies();
  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [photo, setPhoto] = useState(user.photo || "");
  const [companyName, setCompanyName] = useState(user.companyName || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const updatedData = { firstName, lastName, photo };
    if (user.role === "admin") {
      updatedData.companyName = companyName;
    }

    try {
      await updateUser(user.id, updatedData);
      onClose();
      toast.success("Perfil actualizado con éxito!", {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
    } catch (err) {
      setError("❌ Error al guardar cambios. Intenta nuevamente.");
      toast.error("Error al actualizar perfil. Intenta nuevamente.", {
        position: "top-center",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-home-gradient shadow-lg shadow-black/40 rounded-lg w-[400px] p-6 relative">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Editar Perfil
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Nombre</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full border rounded px-3 py-2 text-dark"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Apellido</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full border rounded px-3 py-2  text-dark"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Foto (URL)</label>
            <input
              type="text"
              value={photo}
              onChange={(e) => setPhoto(e.target.value)}
              className="w-full border rounded px-3 py-2  text-dark"
            />
          </div>

          {user.role === "admin" && (
            <div>
              <label className="block text-sm font-medium">Empresa</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full border rounded px-3 py-2  text-dark"
              />
            </div>
          )}

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
              disabled={loading}
            >
              {loading ? (
                <span className="loader border-2 border-white border-t-transparent rounded-full w-4 h-4 mr-2 animate-spin"></span>
              ) : null}
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
