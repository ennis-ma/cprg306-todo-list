import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/dashboard"); // Redirect to dashboard if already logged in
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard"); // Redirect to dashboard after login
    } catch (error) {
      setError(error.message);
    }
  };

  const navigateToSignup = () => {
    router.push("/signup");
  };

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "400px",
        margin: "0 auto",
        color: "var(--color-latte)",
      }}
    >
      <h1 style={{ textAlign: "center" }}>Login</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form
        onSubmit={handleLogin}
        style={{ display: "flex", flexDirection: "column", gap: "10px" }}
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: "10px", borderRadius: "5px" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: "10px", borderRadius: "5px" }}
        />
        <button
          type="submit"
          style={{
            background: "var(--color-macchiato)",
            color: "var(--color-latte)",
            padding: "10px",
            borderRadius: "5px",
            border: "none",
          }}
        >
          Log In
        </button>
      </form>
      <p style={{ textAlign: "center", marginTop: "20px" }}>
        Dont have an account?{" "}
        <button
          onClick={navigateToSignup}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--color-frappe)",
            cursor: "pointer",
          }}
        >
          Sign Up
        </button>
      </p>
    </div>
  );
}
