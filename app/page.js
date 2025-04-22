import Link from "next/link";

export default function Home() {
  return (
   <>
   <div className="flex flex-col items-center justify-center bg-amber-400 h-screen">
    <h1 className="text-white text-7xl font-bold mb-4">Twój asystent treningowy i dietetyczny</h1>
    <p className="text-white text-2xl font-light mb-3">Spersonalizowane plany treningowe, indywidualna dieta i codzienne wsparcie AI czekają na Ciebie!</p>
    <Link href="/auth">
      <button className="bg-amber-100 hover:bg-amber-50 rounded-full px-7 py-2 text-black text-lg">Rozpocznij</button>
    </Link>
   </div>
   </>
  );
}
