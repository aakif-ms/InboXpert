function NavIcon({ icon, onClick, disabled = false }) {
    return (
        <button 
            className="px-4 py-2 rounded-md bg-transparent text-black dark:text-white border-darkBlue dark:border-gray-400 font-bold transition duration-200 hover:bg-white dark:hover:bg-neutral-600 hover:text-black dark:hover:text-white border-2 hover:border-darkBlue dark:hover:border-gray-300 text-xl disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onClick}
            disabled={disabled}
        >
            {icon}
        </button>
    )
}

export default NavIcon;
