import { Link } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

import Button from "../common/Button";

function AuthForm({
    mode,
    title,       
    description,
    fields,
    buttonText,
    footerText,
    footerLinkText,
    footerLink
}) {

    const [values, setValues] = useState({});
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const { login, register } = useAuth();

    const handleSubmit = (e) => {
        e.preventDefault();

        if (mode === "login") {
            const success = login(values);

            if (!success) {
                setError("No account found with this email.");
                return;
            }
        }
        else {
            const success = register(values);

            if (!success) {
                setError("An account with this email already exists.");
                return;
            }
        }

        navigate("/feed");
    };

    return (
        <div
            className="
                rounded-3xl
                border
                border-white/10
                bg-white/5
                p-8
                shadow-xl
            "
        >

            <h1
                className="
                    text-3xl
                    font-bold
                    text-white
                "
            >
                {title}
            </h1>


            <p
                className="
                    mt-2
                    text-zinc-400
                "
            >
                {description}
            </p>

            {error && (
                <div
                    className="
                        mt-6
                        rounded-xl
                        border
                        border-red-500/20
                        bg-red-500/10
                        px-4
                        py-3
                        text-sm
                        text-red-400
                    "
                >
                    {error}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="
                    mt-8
                    space-y-5
                "
            >

                {fields.map((field) => (

                    <div key={field.name}>

                        <label
                            className="
                                mb-2
                                block
                                text-sm
                                text-zinc-400
                            "
                        >
                            {field.label}
                        </label>


                        <input
                            type={field.type}
                            placeholder={field.placeholder}
                            value={values[field.name] || ""}
                            onChange={(e) => 
                                setValues({
                                    ...values, 
                                    [field.name]: e.target.value
                                })}
                            className="
                                w-full
                                rounded-xl
                                border
                                border-white/10
                                bg-[#15151C]
                                px-4
                                py-3
                                text-white
                                outline-none
                                transition
                                focus:border-purple-500
                            "
                        />

                    </div>

                ))}


                <Button type="submit" className="w-full">
                    {buttonText}
                </Button>

            </form>


            <p
                className="
                    mt-8
                    text-center
                    text-sm
                    text-zinc-400
                "
            >

                {footerText}{" "}

                <Link
                    to={footerLink}
                    className="
                        font-medium
                        text-purple-400
                        hover:text-purple-300
                    "
                >
                    {footerLinkText}
                </Link>

            </p>

        </div>
    );

}

export default AuthForm;