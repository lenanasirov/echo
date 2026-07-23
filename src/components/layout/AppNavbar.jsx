import Logo from "../common/Logo";
import { Link } from "react-router-dom";


function AppNavbar() {
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


            <div
                className="
                    flex
                    gap-8
                    text-zinc-400
                "
            >

                <Link to="/feed">
                    Feed
                </Link>

                <Link to="/create">
                    Create Memory
                </Link>

                <Link to="/profile">
                    Profile
                </Link>

            </div>

        </nav>
    );
}

export default AppNavbar;