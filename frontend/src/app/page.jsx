"use client";
import NavIcon from "@/components/NavIcon";
import { IoMdRefresh } from "react-icons/io";
import { MdDeleteOutline } from "react-icons/md";
import { MdOutlineArchive } from "react-icons/md";
import { HiDotsVertical } from "react-icons/hi";

export default function Dashboard() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-6 text-black dark:text-white font-alan">Inbox</h1>
      <div className="bg-red-100 min-h-full rounded-xl flex flex-col">
        <div className="flex justify-between items-center h-20 px-6 min-w-full bg-slate-200 rounded-t-xl">
          <div className="flex justify-between w-1/5">
            <NavIcon icon={<IoMdRefresh />} />
            <NavIcon icon={<MdDeleteOutline />} />
            <NavIcon icon={<MdOutlineArchive />} />
            <NavIcon icon={<HiDotsVertical/>} />
          </div>
        </div>
        <div>
          
        </div>
      </div>
    </>
  );
}