import AuthForm from "../components/auth/AuthForm";

function Login() {

    return (
        <AuthForm
            mode="login"
            title="Welcome back"
            description="Sign in to continue your Echo journey."
            fields={[
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
            buttonText="Sign In"
            footerText="Don't have an account?"
            footerLinkText="Create one"
            footerLink="/register"
        />
    );
}

export default Login;