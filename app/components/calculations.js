"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "../../firebase/config";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function Calculate() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    weight: "",
    growth: "",
    activity: "1.2",
    goal: "maintenance",
  });
  const [results, setResults] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setFormData({
            age: userData.age || "",
            gender: userData.gender || "",
            weight: userData.weight || "",
            growth: userData.growth || "",
            activity: userData.activity || "1.2",
            goal: userData.goal || "maintenance",
          });
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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateBMR = () => {
    const weight = parseFloat(formData.weight);
    const height = parseFloat(formData.growth);
    const age = parseInt(formData.age);
    const activityLevel = parseFloat(formData.activity);

    let bmr;
    if (formData.gender === "male") {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    const tdee = bmr * activityLevel;

    let calorieTarget;
    switch (formData.goal) {
      case "weight-loss":
        calorieTarget = tdee - 500;
        break;
      case "weight-gain":
        calorieTarget = tdee + 500;
        break;
      default:
        calorieTarget = tdee;
    }

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      calorieTarget: Math.round(calorieTarget),
      protein: Math.round(weight * 2), // 2g na kg masy ciała
      carbs: Math.round((calorieTarget * 0.4) / 4), // 40% kalorii z węglowodanów, 4 kalorie na gram
      fats: Math.round((calorieTarget * 0.3) / 9), // 30% kalorii z tłuszczów, 9 kalorii na gram
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const calculationResults = calculateBMR();
    setResults(calculationResults);

    if (user) {
      try {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          ...formData,
          calorieNeeds: calculationResults.calorieTarget,
          bmr: calculationResults.bmr,
          tdee: calculationResults.tdee,
          macros: {
            protein: calculationResults.protein,
            carbs: calculationResults.carbs,
            fats: calculationResults.fats,
          },
          updatedAt: new Date(),
        });

        setTimeout(() => {
          router.push("/dashboard");
        }, 3000);
      } catch (error) {
        console.error("Błąd podczas aktualizacji danych użytkownika:", error);
      }
    }
  };

  if (loading) {
    return <p className="text-center mt-10">Ładowanie...</p>;
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-amber-500">Oblicz swoje zapotrzebowanie kaloryczne</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Form fields here */}
      </form>

      {results && (
        <div className="mt-8 p-4 bg-amber-50 rounded-lg">
          <h2 className="text-2xl font-bold mb-4 text-amber-600">Twoje wyniki:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold">BMR (podstawowa przemiana materii):</p>
              <p>{results.bmr} kcal</p>
            </div>
            <div>
              <p className="font-semibold">TDEE (całkowite dzienne zapotrzebowanie):</p>
              <p>{results.tdee} kcal</p>
            </div>
            <div>
              <p className="font-semibold">Docelowe spożycie kalorii:</p>
              <p>{results.calorieTarget} kcal</p>
            </div>
            <div>
              <p className="font-semibold">Zalecane makroskładniki:</p>
              <p>Białko: {results.protein}g</p>
              <p>Węglowodany: {results.carbs}g</p>
              <p>Tłuszcze: {results.fats}g</p>
            </div>
          </div>
          <p className="mt-4 text-green-600">Dane zostały zaktualizowane. Za chwilę nastąpi przekierowanie do panelu głównego.</p>
        </div>
      )}
    </div>
  );
}
