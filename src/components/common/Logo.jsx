import logo from "../../assets/logo/echo-logo.png";

function Logo() {
    return (
        <div className="flex items-center gap-2">
            <img
                src={logo}
                alt="Echo"
                className="h-10 w-auto"
            />

        </div>
    );
}

export default Logo;