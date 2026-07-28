function Button({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`
        rounded-full
        bg-linear-to-r
        from-purple-500
        to-pink-500
        px-6
        py-3
        font-medium
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