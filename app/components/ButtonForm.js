
const ButtonForm = ({isLogin, onClick, label = "Dalej"}) => {
  return (
    <button
      onClick={onClick}
      className="bg-amber-400 hover:bg-amber-500 rounded-full px-7 py-2 text-amber-50 text-lg"
    >
      {label}
    </button>
)
}

export default ButtonForm