function NavIcon({ icon }) {
    return (
        <button className="px-4 py-2 rounded-md bg-transparent text-black border-darkBlue font-bold transition duration-200 hover:bg-white hover:text-black border-2 hover:border-darkBlue text-xl ">
            {icon}
        </button>
    )
}

export default NavIcon;
