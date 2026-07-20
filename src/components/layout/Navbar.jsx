import Logo from "../common/Logo";
import Button from "../common/Button";

function Navbar() {
  return (
    <nav className="
      flex 
      items-center 
      justify-between 
      px-8 
      py-6
      max-w-7xl
      mx-auto
    ">
      
      <Logo />

      <div className="
        hidden
        md:flex
        items-center
        gap-10
        text-sm
        text-zinc-400
      ">
        <a 
          href="#features"
          className="hover:text-white transition"
        >
          Features
        </a>

        <a 
          href="#about"
          className="hover:text-white transition"
        >
          About
        </a>

        <Button>
          Get Started
        </Button>
      </div>

    </nav>
  );
}

export default Navbar;