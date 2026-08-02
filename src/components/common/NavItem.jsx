import { NavLink } from "react-router-dom";


function NavItem({ to, children }) {

    return (
        <NavLink
            to={to}
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
            {children}
        </NavLink>
    );
}


export default NavItem;