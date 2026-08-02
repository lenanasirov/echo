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

    const navigate = useNavigate();

    const { login, register } = useAuth();

    const handleSubmit = (e) => {
        e.preventDefault();

        if (mode === "login") {
            login(values)
        }
        else {
            register(values);
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