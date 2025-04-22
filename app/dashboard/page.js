"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";

export default function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const data = userSnap.data();
          
          // Zmiana celu (goal) na wartości pasujące do aplikacji
          if (data.goal === "schudnąć") data.goal = "weight-loss";
          if (data.goal === "przytyć") data.goal = "weight-gain";
          if (data.goal === "utrzymać") data.goal = "maintain-weight";
          
          // Zmiana płci (gender) na "male" i "female"
          if (data.gender === "Mężczyzna") data.gender = "male";
          if (data.gender === "Kobieta") data.gender = "female";
          
          // Zmiana aktywności na wartości numeryczne
          if (data.activity === "brak") data.activity = 1.2; // Ustawiamy domyślną aktywność na "Siedzący tryb życia"
          
          // Sprawdzenie, czy dane są prawidłowe
          if (
            isNaN(data.age) || 
            isNaN(data.weight) || 
            isNaN(data.growth) || 
            isNaN(data.activity)
          ) {
            console.log("Błędne dane wejściowe");
            setUserData(null);  // Przypisanie null, aby wyświetlić komunikat o błędzie
            setLoading(false);
            return;
          }

          setUserData(data);
        } else {
          console.log("Brak danych użytkownika");
        }
      } else {
        console.log("Użytkownik niezalogowany");
      }
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  if (loading) return <p className="text-center mt-10">Ładowanie danych...</p>;
  if (!userData) return (
    <div className="text-center mt-10">
      <p className="mb-4">Nie znaleziono danych użytkownika. Uzupełnij swoje dane.</p>
      <Link href="/dashboard/calculate" className="bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded">
        Oblicz zapotrzebowanie
      </Link>
    </div>
  );

  return (
    <div className="flex flex-col bg-amber-400 rounded-lg p-6">
      <h1 className="text-white text-4xl font-bold mb-6">Cześć, jestem twoim wirtualnym trenerem personalnym.</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-amber-50 rounded-3xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-amber-600">Twój profil</h2>
          <div className="space-y-2">
            <p><strong>Email:</strong> {userData.email}</p>
            <p><strong>Cel:</strong> {
              userData.goal === "weight-loss" ? "Redukcja wagi" : 
              userData.goal === "weight-gain" ? "Zwiększenie masy" : 
              "Utrzymanie wagi"
            }</p>
            <p><strong>Płeć:</strong> {userData.gender === "male" ? "Mężczyzna" : "Kobieta"}</p>
            <p><strong>Wiek:</strong> {userData.age} lat</p>
            <p><strong>Wzrost:</strong> {userData.growth} cm</p>
            <p><strong>Waga:</strong> {userData.weight} kg</p>
            <p><strong>Aktywność:</strong> {
              parseFloat(userData.activity) === 1.2 ? "Siedzący tryb życia" :
              parseFloat(userData.activity) === 1.375 ? "Lekko aktywny" :
              parseFloat(userData.activity) === 1.55 ? "Umiarkowanie aktywny" :
              parseFloat(userData.activity) === 1.725 ? "Bardzo aktywny" :
              "Ekstremalnie aktywny"
            }</p>
          </div>
        </div>
        
        {userData.calorieNeeds && (
          <div className="bg-amber-50 rounded-3xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-amber-600">Twoje zapotrzebowanie</h2>
            <div className="space-y-2">
              <p><strong>BMR:</strong> {userData.bmr} kcal</p>
              <p><strong>TDEE:</strong> {userData.tdee} kcal</p>
              <p><strong>Zapotrzebowanie kaloryczne:</strong> {userData.calorieNeeds} kcal</p>
              
              {userData.macros && (
                <div className="mt-4">
                  <p className="font-bold">Zalecane makroskładniki:</p>
                  <p>Białko: {userData.macros.protein}g</p>
                  <p>Węglowodany: {userData.macros.carbs}g</p>
                  <p>Tłuszcze: {userData.macros.fats}g</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {!userData.calorieNeeds && (
          <div className="bg-amber-50 rounded-3xl p-6 shadow-lg flex flex-col items-center justify-center">
            <h2 className="text-xl font-bold mb-4 text-amber-600">Oblicz swoje zapotrzebowanie kaloryczne</h2>
            <p className="mb-4 text-center">Uzupełnij dane, aby otrzymać spersonalizowane zalecenia dietetyczne.</p>
            <Link href="/dashboard/calculate" className="bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded">
              Oblicz teraz
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
