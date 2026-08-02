import Logo from "../common/Logo";
import { useAuth } from "../../hooks/useAuth";
import NavItem from "../common/NavItem";

function AppNavbar() {
    const { logout } = useAuth();
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


                <NavItem to="/feed">
                Feed
                </NavItem>

                <NavItem to="/create">
                    Create Memory
                </NavItem>

                <NavItem to="/profile">
                    Profile
                </NavItem>
                        
                <button
                    onClick={logout}
                    className="
                        text-zinc-400
                        hover:text-white
                        transition
                    "
                >
                    Logout
                </button>

            </div>

        </nav>
    );
}

export default AppNavbar;