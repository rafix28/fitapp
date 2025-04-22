"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { AuthProtection } from "../components/authProtection"; // Upewnij się, że jest poprawny import

export default function DashboardLayout({ children }) {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/auth");
  };

  return (
    <AuthProtection>
      <main className="flex bg-amber-400 min-h-screen">
        <header className="w-1/5 p-4 bg-amber-100 dark:bg-gray-800">
          <ul className="space-y-4">
            <li>
              <Link
                href="/dashboard"
                className="block bg-amber-400 hover:bg-amber-500 text-white px-4 py-2 rounded-full"
              >
                Panel główny
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/calculate"
                className="block bg-amber-400 hover:bg-amber-500 text-white px-4 py-2 rounded-full"
              >
                Oblicz zapotrzebowanie
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/settings"
                className="block bg-amber-400 hover:bg-amber-500 text-white px-4 py-2 rounded-full"
              >
                Ustawienia
              </Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full"
              >
                Wyloguj
              </button>
            </li>
          </ul>
        </header>
        <section className="flex-1 p-6">{children}</section>
      </main>
    </AuthProtection>
  );
}
