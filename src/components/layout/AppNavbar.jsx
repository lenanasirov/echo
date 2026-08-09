import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiMenu, FiX } from "react-icons/fi";

import Logo from "../common/Logo";
import { useAuth } from "../../hooks/useAuth";
import NavItem from "../common/NavItem";

function AppNavbar() {
    const { logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    const closeMenu = () => {
        setMenuOpen (false);
    };

    const handleLogout = () => {
        closeMenu();
        logout();
    }

    return (
        <nav
            className="
                relative
                mx-auto
                flex
                max-w-7xl
                items-center
                justify-between
                px-6
                py-6
                md:px-8
            "
        >

            <Logo />

            {/* Desktop navigation */}
            <div
                className="
                    hidden
                    items-center
                    gap-8
                    text-zinc-400
                    md:flex
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
                        transition
                        duration-200
                        hover:text-white
                        hover:-translate-y-0.5
                    "
                >
                    Logout
                </button>

            </div>

            {/* Mobile menu button */}
            <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="
                    flex
                    items-center
                    justify-center
                    text-2xl
                    text-zinc-400
                    transition
                    hover:text-white
                    md:hidden
                "
                aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
                {menuOpen ? <FiX /> : <FiMenu />}
            </button>

            {/* Mobile navigation */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: -10
                        }}
                        animate={{
                            opacity: 1,
                            y: 0
                        }}
                        exit={{
                            opacity: 0,
                            y: -10
                        }}
                        transition={{
                            duration: 0.2
                        }}
                        className="
                            absolute
                            left-6
                            right-6
                            top-full
                            z-50
                            rounded-2xl
                            border
                            border-white/10
                            bg-[#15151D]
                            p-4
                            shadow-xl
                            md:hidden
                        "
                    >
                        <div className="flex flex-col gap-1">

                            <div onClick={closeMenu}>
                                <NavItem to="/feed">
                                    Feed
                                </NavItem>
                            </div>

                            <div onClick={closeMenu}>
                                <NavItem to="/create">
                                    Create Memory
                                </NavItem>
                            </div>

                            <div onClick={closeMenu}>
                                <NavItem to="/profile">
                                    Profile
                                </NavItem>
                            </div>

                            <div
                                className="
                                    mt-2
                                    border-t
                                    border-white/10
                                    pt-3
                                "
                            >
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="
                                        block
                                        w-full
                                        rounded-xl
                                        text-left
                                        text-zinc-400
                                        transition
                                        hover:bg-white/5
                                        hover:text-white
                                    "
                                >
                                    Logout
                                </button>
                            </div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </nav>
    );
}

export default AppNavbar;