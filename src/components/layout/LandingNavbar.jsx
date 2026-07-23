import Logo from "../common/Logo";
import Button from "../common/Button";
import { Link } from "react-router-dom";

function LandingNavbar() {
  return (
    <nav 
      className="
        flex 
        items-center 
        justify-between 
        px-8 
        py-6
        max-w-7xl
        mx-auto
      "
    >
      
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
            href="#why-echo"
            className="hover:text-white transition"
        >
            Why Echo?
        </a>

        <a
            href="#how-it-works"
            className="hover:text-white transition"
        >
            How It Works
        </a>

        <Link to="/feed">
          <Button>
            Get Started
          </Button>
        </Link>

      </div>

    </nav>
  );
}

export default LandingNavbar;