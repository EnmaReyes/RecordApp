import { useEffect, useRef, useContext } from "react";
import axios from "axios";
import { useCurrencies } from "../../context/CurrencyProvider.jsx";

const GoogleLoginButton = () => {
  const { login } = useCurrencies();
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!buttonRef.current) return;

    window.google.accounts.id.initialize({
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
    });

    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: "outline",
      size: "large",
    });
  }, []);

  const handleCredentialResponse = async (response) => {
    const token = response.credential;
    try {
      const { data } = await axios.post("/api/auth/google", { token });
      login(data.token, data.role);
      alert(`✅ Login exitoso como ${data.role}`);
    } catch {
      alert("❌ Acceso restringido");
    }
  };

  return <div ref={buttonRef} className="flex justify-center"></div>;
};

export default GoogleLoginButton;
