import React, { useState } from "react";

interface AccordionProps {
  title: string;
  children: React.ReactNode;
}

const Accordion: React.FC<AccordionProps> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => setIsOpen(!isOpen);

  return (
    <div className="border rounded-lg mb-2">
      <button
        className="w-full text-left text-[13px] p-3 bg-gray-200 hover:bg-gray-300 font-semibold focus:outline-none"
        onClick={toggleAccordion}
      >
        {title}
      </button>
      {isOpen && (
        <div className="p-4 bg-white">
          {children}
        </div>
      )}
    </div>
  );
};

export default Accordion;
