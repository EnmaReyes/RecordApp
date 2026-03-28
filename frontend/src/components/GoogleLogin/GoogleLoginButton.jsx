import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useCurrencies } from "../../context/CurrencyProvider.jsx";

const GoogleLoginButton = () => {
  const { login } = useCurrencies();

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  return (
    <GoogleLogin
      onSuccess={async (credentialResponse) => {
        try {
          // Este es el ID token real de Google
          const googleToken = credentialResponse.credential;

          // Lo envías al backend
          const res = await axios.post(`${BASE_URL}/api/auth/google`, {
            token: googleToken,
          });

          // El backend responde con tu JWT y rol
          login(res.data.token, res.data.role);
          alert(`✅ Login exitoso como ${res.data.role}`);
        } catch (err) {
          console.error(err);
          alert("❌ Acceso restringido");
        }
      }}
      onError={() => {
        alert("❌ Error en login con Google");
      }}
    />
  );
};

export default GoogleLoginButton;
