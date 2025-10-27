import { RegisterForm } from "./features/RegisterForm";

export default function Register() {
  return (
    <div className=" flex justify-center items-center min-h-screen">
      <div className="my-4 p-10 rounded-lg shadow-2xl">
        <div className="text-center">
          <h1 className="text-2xl">Welcome to NeuroNest</h1>{" "}
          <p className="text-xl mt-4">Get started with us</p>
        </div>
        <div className="my-4">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
