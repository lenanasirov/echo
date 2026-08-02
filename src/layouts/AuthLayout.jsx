import { Outlet } from "react-router-dom";

import Logo from "../components/common/Logo";

function AuthLayout() {
    return (
        <div
            className="
                flex
                min-h-screen
                items-center
                justify-center
                bg-[#0B0B10]
                px-6
            "
        >
            <div
                className="
                    w-full
                    max-w-md
                "
            >
                <div className="mb-10 flex justify-center">
                    <Logo />
                </div>

                <Outlet />
            </div>
        </div>
    );
}

export default AuthLayout;