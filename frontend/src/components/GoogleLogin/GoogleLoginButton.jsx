import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useCurrencies } from "../../context/CurrencyProvider";
import { toast } from "react-toastify";

const GoogleLoginButton = () => {
  const { login } = useCurrencies();

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  return (
    <GoogleLogin
      type="icon"
      theme="filled_blue"
      size="large"
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

          toast.success(
            `Bienvenido ${res.data.role?.toUpperCase()} ${res.data.firstName} ${res.data.lastName}!`,
            {
              position: "top-center",
              theme: "dark",
              autoClose: 1000,
            },
          );
        } catch (err) {
          console.error(err);
          toast.error("❌ Error en login con Google", {
            position: "top-center",
            theme: "dark",
            autoClose: 1000,
          });
        }
      }}
      onError={() => {
        toast.error("❌ Error en login con Google", {
          position: "top-center",
          theme: "dark",
          autoClose: 900,
        });
      }}
    />
  );
};

export default GoogleLoginButton;
