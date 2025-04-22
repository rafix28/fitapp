"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "../../firebase/config";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";

export default function Settings() {
  const router = useRouter();
  const [userData, setUserData] = useState({
    email: "",
    newEmail: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setUserData(prev => ({ ...prev, email: currentUser.email }));
        
        // Pobierz dane użytkownika
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserData(prev => ({ 
            ...prev, 
            email: currentUser.email,
            newEmail: currentUser.email
          }));
        }
      } else {
        router.push("/auth");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    if (!userData.currentPassword) {
      setMessage({ text: "Podaj aktualne hasło, aby zmienić email", type: "error" });
      return;
    }

    try {
      // Ponowna autentykacja użytkownika
      const credential = EmailAuthProvider.credential(user.email, userData.currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Aktualizacja email
      await updateEmail(user, userData.newEmail);
      
      // Aktualizacja email w Firestore
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        email: userData.newEmail
      });

      setMessage({ text: "Email został zaktualizowany", type: "success" });
      setUserData(prev => ({ ...prev, email: userData.newEmail, currentPassword: "" }));
    } catch (error) {
      console.error("Błąd podczas aktualizacji email:", error);
      setMessage({ text: `Błąd: ${error.message}`, type: "error" });
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    if (userData.newPassword !== userData.confirmPassword) {
      setMessage({ text: "Hasła nie są identyczne", type: "error" });
      return;
    }

    if (userData.newPassword.length < 6) {
      setMessage({ text: "Hasło musi mieć co najmniej 6 znaków", type: "error" });
      return;
    }

    try {
      // Ponowna autentykacja użytkownika
      const credential = EmailAuthProvider.credential(user.email, userData.currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Aktualizacja hasła
      await updatePassword(user, userData.newPassword);
      
      setMessage({ text: "Hasło zostało zaktualizowane", type: "success" });
      setUserData(prev => ({ 
        ...prev, 
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }));
    } catch (error) {
      console.error("Błąd podczas aktualizacji hasła:", error);
      setMessage({ text: `Błąd: ${error.message}`, type: "error" });
    }
  };

  if (loading) {
    return <p className="text-center mt-10">Ładowanie...</p>;
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-amber-500">Ustawienia konta</h1>
      
      {message.text && (
        <div className={`p-4 mb-4 rounded ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {message.text}
        </div>
      )}
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Zmień adres email</h2>
        <form onSubmit={handleUpdateEmail} className="space-y-4">
          <div>
            <label className="block text-gray-700">Aktualny email</label>
            <input
              type="email"
              value={userData.email}
              className="w-full p-2 border rounded bg-gray-100"
              disabled
            />
          </div>
          
          <div>
            <label className="block text-gray-700">Nowy email</label>
            <input
              type="email"
              name="newEmail"
              value={userData.newEmail}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700">Aktualne hasło (wymagane)</label>
            <input
              type="password"
              name="currentPassword"
              value={userData.currentPassword}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded transition-colors"
          >
            Aktualizuj email
          </button>
        </form>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Zmień hasło</h2>
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className="block text-gray-700">Aktualne hasło</label>
            <input
              type="password"
              name="currentPassword"
              value={userData.currentPassword}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700">Nowe hasło</label>
            <input
              type="password"
              name="newPassword"
              value={userData.newPassword}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700">Potwierdź nowe hasło</label>
            <input
              type="password"
              name="confirmPassword"
              value={userData.confirmPassword}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded transition-colors"
          >
            Aktualizuj hasło
          </button>
        </form>
      </div>
    </div>
  );
}