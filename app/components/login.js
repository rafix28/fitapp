"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import ButtonForm from "./ButtonForm";

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err) {
      console.error("Login error:", err.message);
      setError("Nieprawidłowy email lub hasło");
    }
  };

  return (
    <>
      <h2 className="text-center text-3xl font-bold mb-10">Logowanie</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="bg-gray-200 rounded-full px-7 py-3 mb-5 block w-full"
      />
      <input
        type="password"
        placeholder="Hasło"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="bg-gray-200 rounded-full px-7 py-3 mb-5 block w-full"
      />

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <ButtonForm onClick={handleLogin} label="Zaloguj się" />
    </>
  );
};

export default Login;
