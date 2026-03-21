const LogoLogin = ({ src, alt, size = "w-32" }) => {
  return (
    <div className="flex justify-center my-4">
      <img src={src} alt={alt} className={`${size} h-auto`} />
    </div>
  );
};

export default LogoLogin;
