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
                        ? "text-white font-medium"
                        : "text-zinc-400 hover:text-white hover:-translate-y-0.5"
                }
                `
            }
        >
            {children}
        </NavLink>
    );
}


export default NavItem;