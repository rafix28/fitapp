"use client"
import ButtonForm from "./ButtonForm"
import { useState } from "react"
import { doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "../firebase/config";
import { useRouter } from "next/navigation";

const Register = ({ isLogin }) => {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    goal: "",
    gender: "",
    age: "",
    growth: "",
    weight: "",
    activity: ""
  })
  const [error, setError] = useState("")
  const router = useRouter();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleNext = async () => {
    setError("")

    if (step === 1) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!formData.email || !formData.password) {
        setError("Email i hasło są wymagane")
        return
      }

      if (!emailRegex.test(formData.email)) {
        setError("Wprowadź poprawny adres email")
        return
      }

      if (formData.password.length < 6) {
        setError("Hasło musi mieć conajmniej 6 znaków")
        return
      }
    }

    if (step === 3) {
      if (
        !formData.gender ||
        !formData.age ||
        !formData.growth ||
        !formData.weight ||
        !formData.activity
      ) {
        setError("Uzupełnij wszystkie dane osobiste")
        return
      }
    }

    if (step < 3) {
      setStep(step + 1)
    } else {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
          email: formData.email,
          goal: formData.goal,
          gender: formData.gender,
          age: formData.age,
          growth: formData.growth,
          weight: formData.weight,
          activity: formData.activity,
        });

        console.log("Rejestracja zakończona");
        router.push("/dashboard");
      } catch (err) {
        console.error("Błąd przy rejestracji:", err);
        setError("Coś poszło nie tak. Spróbuj ponownie");
      }
    }
  }

  const handleGoalSelect = (goal) => {
    setFormData((prev) => ({ ...prev, goal }))
    setStep(3)
  }

  return (
    <>
      <h2 className="text-center text-3xl font-bold mb-10">Register</h2>

      {step === 1 && (
        <>
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="block w-full bg-gray-200 rounded-full px-7 py-3 mb-5" />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className="block w-full bg-gray-200 rounded-full px-7 py-3 mb-5" />
        </>
      )}

      {step === 2 && (
        <>
          <button onClick={() => handleGoalSelect("schudnąć")} className="bg-amber-400 hover:bg-amber-500 rounded-full px-7 py-2 text-amber-50 text-lg mb-3 block w-full">Chcę schudnąć</button>
          <button onClick={() => handleGoalSelect("utrzymać wagę")} className="bg-amber-400 hover:bg-amber-500 rounded-full px-7 py-2 text-amber-50 text-lg mb-3 block w-full">Chcę utrzymać wagę</button>
          <button onClick={() => handleGoalSelect("przytyć")} className="bg-amber-400 hover:bg-amber-500 rounded-full px-7 py-2 text-amber-50 text-lg mb-3 block w-full">Chcę przytyć</button>
        </>
      )}

      {step === 3 && (
        <>
          <div>
            <label><input type="radio" name="gender" value="Mężczyzna" checked={formData.gender === "Mężczyzna"} onChange={handleChange} /> Mężczyzna</label>
            <label className="ml-4"><input type="radio" name="gender" value="Kobieta" checked={formData.gender === "Kobieta"} onChange={handleChange} /> Kobieta</label>
          </div>
          <input type="number" name="age" placeholder="Wiek" value={formData.age} onChange={handleChange} className="block w-full bg-gray-200 rounded-full px-7 py-3 mb-5" />
          <input type="number" name="growth" placeholder="Wzrost" value={formData.growth} onChange={handleChange} className="block w-full bg-gray-200 rounded-full px-7 py-3 mb-5" />
          <input type="number" name="weight" placeholder="Waga" value={formData.weight} onChange={handleChange} className="block w-full bg-gray-200 rounded-full px-7 py-3 mb-5" />
          <select name="activity" value={formData.activity} onChange={handleChange} className="w-full mb-5 bg-gray-200 rounded-full px-4 py-2">
            <option value="">Wybierz aktywność...</option>
            <option value="brak">Brak aktywności</option>
            <option value="mała">Mała aktywność</option>
            <option value="umiarkowana">Umiarkowana aktywność</option>
            <option value="duża">Duża aktywność</option>
            <option value="bardzo_duża">Bardzo duża aktywność</option>
          </select>
        </>
      )}

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {step !== 2 && (
        <ButtonForm onClick={handleNext} label={step === 3 ? "Zarejestruj" : "Dalej"} />
      )}
    </>
  )
}

export default Register
