import { LoginForm } from "./features/LoginForm";

export default function Login() {
  return (
    <div className=" flex justify-center items-center min-h-screen">
      <div className="my-4 p-10 rounded-lg shadow-2xl">
        <div className="text-center">
          <h1 className="text-2xl">Welcome back to NeuroNest</h1>
          <p className="text-xl mt-4">Log in to continue</p>
        </div>
        <div className="my-4">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
