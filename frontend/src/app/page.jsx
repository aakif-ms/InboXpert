"use client";
import NavIcon from "@/components/NavIcon";
import EmailRow from "@/components/EmailRow";
import { IoMdRefresh } from "react-icons/io";
import { MdDeleteOutline } from "react-icons/md";
import { MdOutlineArchive } from "react-icons/md";
import { HiDotsVertical } from "react-icons/hi";
import emailsData from "./dummy.json";

export default function Dashboard() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-6 text-black font-alan">Inbox</h1>
      <div className="bg-white min-h-full rounded-xl flex flex-col border border-gray-200 ">
        <div className="flex justify-between items-center h-20 px-6 min-w-full bg-[#f5f5f5] rounded-t-xl border-b border-gray-300">
          <div className="flex justify-between w-1/5">
            <NavIcon icon={<IoMdRefresh />} />
            <NavIcon icon={<MdDeleteOutline />} />
            <NavIcon icon={<MdOutlineArchive />} />
            <NavIcon icon={<HiDotsVertical/>} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {emailsData.map((email) => (
            <EmailRow key={email.id} email={email} />
          ))}
        </div>
      </div>
    </>
  );
}