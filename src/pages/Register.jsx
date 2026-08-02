import AuthForm from "../components/auth/AuthForm";

function Register() {

    return (
        <AuthForm
            mode="register"
            title="Create your Echo account"
            description="Every moment has a soundtrack. Let's get started."
            fields={[
                {
                    name: "username",
                    label: "Username",
                    type: "text",
                    placeholder: "Your name"
                },
                {
                    name: "email",
                    label: "Email",
                    type: "email",
                    placeholder: "you@example.com"
                },
                {
                    name: "password",
                    label: "Password",
                    type: "password",
                    placeholder: "••••••••"
                }
            ]}
            buttonText="Create Account"
            footerText="Already have an account?"
            footerLinkText="Sign In"
            footerLink="/login"
        />
    );
}

export default Register;