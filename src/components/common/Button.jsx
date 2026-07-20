function Button({ children, className = "" }) {
  return (
    <button
      className={`
        rounded-full
        bg-gradient-to-r
        from-purple-500
        to-pink-500
        px-6
        py-3
        font-semibold
        text-white
        shadow-lg
        transition
        duration-300
        hover:scale-105
        hover:shadow-purple-500/30
        ${className}
      `}
    >
      {children}
    </button>
  );
}

export default Button;