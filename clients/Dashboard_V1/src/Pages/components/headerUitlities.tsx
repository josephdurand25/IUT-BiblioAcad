import { ReactNode } from "react";

interface DashboardUtilitiesProps {
    title: string | ReactNode;
    children?: React.ReactNode;
}
const HeaderUtilities: React.FC<DashboardUtilitiesProps> =({title, children})=>{
    return(
        <div className="sm:flex sm:justify-between sm:items-center mb-8 sm:flex-wrap sm:gap-5">
              {/* Left: Title */}
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold first-letter:uppercase">{title ?? 'Dashboard'}</h1>
              </div>

            {/* Right: Actions */}
            <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                {children}
                
            </div>

        </div>
    );
};

export {HeaderUtilities};