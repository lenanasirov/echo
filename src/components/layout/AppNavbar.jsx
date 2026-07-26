import Logo from "../common/Logo";
import { NavLink } from "react-router-dom";


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

                <NavLink 
                    to="/feed"
                    className={({ isActive }) =>
                        `
                        transition
                        ${
                            isActive
                            ? "text-white"
                            : "text-zinc-400 hover:text-white"
                        }
                        `
                    }
                >
                    Feed
                </NavLink>

                <NavLink 
                    to="/create"
                    className={({ isActive }) =>
                        `
                        transition
                        ${
                            isActive
                            ? "text-white"
                            : "text-zinc-400 hover:text-white"
                        }
                        `
                    }
                >
                    Create Memory
                </NavLink>

                <NavLink 
                    to="/profile"
                    className={({ isActive }) =>
                        `
                        transition
                        ${
                            isActive
                            ? "text-white"
                            : "text-zinc-400 hover:text-white"
                        }
                        `
                    }
                >
                    Profile
                </NavLink>

            </div>

        </nav>
    );
}

export default AppNavbar;