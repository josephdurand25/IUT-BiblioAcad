import React, { useEffect, useState } from "react";
import Transition from "../utils/Transition";

interface AlertProps {
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  duration?: number; // Durée en millisecondes
}

const Alert = ({ type, message, duration = 3000 }: AlertProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const alertStyles = {
    success: "bg-green-100 border-green-500 text-green-700",
    warning: "bg-amber-100 border-amber-500 text-amber-700",
    error: "bg-red-100 border-red-500 text-red-700",
    info: "bg-blue-100 border-blue-500 text-blue-700",
  };

  const icons = {
    success: "ri-checkbox-circle-line",
    warning: "ri-alert-line",
    error: "ri-close-circle-line",
    info: "ri-information-line",
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    // Nettoyer le timer à la fin
    return () => clearTimeout(timer);
  }, [duration]);

  if (!isVisible) return null;

  return (
    <Transition
      show={message}
      appear={true}
      enter="transition-opacity duration-500"
      enterStart="opacity-0"
      enterEnd="opacity-100"
      leave="transition-opacity duration-5s00"
      leaveStart="opacity-100"
      leaveEnd="opacity-0"
      >
      <div className={`mx-3 border rounded-md px-4 py-1 flex items-center gap-2 ${alertStyles[type]}`}
        role="alert">
        <i className={`${icons[type]} text-xl`}></i>
        <div>
          {/* <p className="font-bold capitalize mr-2">{type} </p> */}
          <span className="text-sm font-semibold first-letter:uppercase">{message}</span>
        </div>
      </div>
    </Transition>
  );
};

export default Alert;
