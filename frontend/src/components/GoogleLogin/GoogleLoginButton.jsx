import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useContext } from "react";
import axios from "axios";
import { useCurrencies } from "../../context/CurrencyProvider.jsx";

const GoogleLoginButton = () => {
  const { login } = useCurrencies();
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const BASE_URL = import.meta.env.VITE_URLDB;
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          try {
            const res = await axios.post(`${BASE_URL}auth/google`, {
              token: credentialResponse.credential,
            });
            login(res.data.token, res.data.role);
            alert(`✅ Login exitoso como ${res.data.role}`);
          } catch {
            alert("❌ Acceso restringido");
          }
        }}
        onError={() => {
          alert("❌ Error en login con Google");
        }}
      />
    </GoogleOAuthProvider>
  );
};

export default GoogleLoginButton;
