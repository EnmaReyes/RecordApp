import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useCurrencies } from "../../context/CurrencyProvider";

const GoogleLoginButton = () => {
  const { login } = useCurrencies();

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  return (
    <GoogleLogin
      type="icon"
      theme="filled_blue"
      size="medium"
      shape="pill"
      onSuccess={async (credentialResponse) => {
        try {
          const googleToken = credentialResponse.credential;

          const res = await axios.post(`${BASE_URL}/api/auth/google`, {
            token: googleToken,
          });
          console.log("Data del post: ", res.data);

          // ✅ Pasamos todo el objeto res.data
          login(res.data);

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
