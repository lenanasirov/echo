function Logo({ showName = true }) {
  return (
      <div className="flex items-center gap-2">
          <span className="text-3xl">
              🎧
          </span>

          {showName && (
              <h1 className="text-2xl font-bold tracking-tight">
                  Echo
              </h1>
          )}
      </div>
  );
}

export default Logo;