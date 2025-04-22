"use client"
import Login from "../components/login"
import Register from "../components/register"
import { useState } from "react"
 const Auth = () => {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="flex flex-col items-center justify-center bg-amber-400 h-screen">
     <div className="flex flex-col bg-white p-5 rounded-3xl w-4/12">
      {isLogin ? <Login isLogin={isLogin} /> : <Register isLogin={isLogin} />}
     <p className="text-sm text-center">
        {isLogin ? "Nie masz jeszcze konta? " : "Masz już konto? "}
        <span onClick={() => setIsLogin(!isLogin)} className="text-blue-600 cursor-pointer">
          {isLogin ? "Zarejestruj się!" : "Zaloguj się!"}
        </span>
      </p>
      </div>
    </div>
  )
}
export default Auth