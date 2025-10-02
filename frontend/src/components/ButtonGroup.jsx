"use client";

import { useState } from "react";

const ButtonGroup = ({ buttons, defaultActive, onButtonClick }) => {
  const [activeButton, setActiveButton] = useState(defaultActive || buttons[0]);

  const handleClick = (label) => {
    setActiveButton(label);
    if (onButtonClick) {
      onButtonClick(label);
    }
  };

  return (
    <div className="inline-flex rounded-lg shadow-sm" role="group">
      {buttons.map((label, index) => {
        const isActive = label === activeButton;
        
        let classNames = "px-4 py-2 text-sm font-medium border border-gray-200 focus:outline-none focus:ring-2 transition duration-150 ease-in-out";

        if (isActive) {
          classNames += " bg-black text-white hover:bg-slate-400 focus:ring-gray-800";
        } else {
          classNames += " bg-white text-gray-900 hover:bg-indigo-200 focus:ring-gray-300";
        }

        if (index === 0) {
          classNames += " rounded-l-lg";
        } else if (index === buttons.length - 1) {
          classNames += " rounded-r-lg";
        } else {
          classNames += " -ml-px"; 
        }

        return (
          <button
            key={label}
            type="button"
            className={classNames}
            onClick={() => handleClick(label)}
            aria-pressed={isActive}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};

export default ButtonGroup;