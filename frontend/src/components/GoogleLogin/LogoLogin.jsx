import { useCurrencies } from "../../context/CurrencyProvider.jsx";
import GoogleLoginButton from "./GoogleLoginButton.jsx";

const LogoLogin = () => {
  const { auth, logout } = useCurrencies();

  console.log("user: ", auth);
  return (
    <div className="flex items-center gap-4">
      {auth ? (
        <div className="flex flex-col items-center gap-1">
          <span>{auth.role.toUpperCase()}</span>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
          >
            {auth?.firstName}
          </button>
        </div>
      ) : (
        <GoogleLoginButton />
      )}
    </div>
  );
};

export default LogoLogin;
