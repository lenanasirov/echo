function Button({ children, className = "", disabled=false , ...props }) {
  return (
    <button
      disabled={disabled}
      {...props}
      className={`
          rounded-full
          px-6
          py-3
          font-medium
          text-white
          shadow-lg
          transition
          duration-300
        ${
          disabled
            ? `
                cursor-not-allowed
                bg-zinc-700
                text-zinc-400
                opacity-60
                shadow-none
              `
            : `
                bg-linear-to-r
                from-purple-500
                to-pink-500
                hover:scale-105
                hover:shadow-purple-500/30
              `
        }

        ${className}
      `}
    >
      {children}
    </button>
  );
}

export default Button;