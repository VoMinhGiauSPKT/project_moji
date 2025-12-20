import { SignupForm } from "@/components/auth/signup-form"; 

const SignUpPage = () => {
    return (
        <div className="flex flex-col h-screen items-center justify-center p-4 md:p-6 overflow-hidden">
            <div className="w-full max-w-sm md:max-w-4xl">
                <SignupForm />
            </div>
        </div>
    )
};

export default SignUpPage;