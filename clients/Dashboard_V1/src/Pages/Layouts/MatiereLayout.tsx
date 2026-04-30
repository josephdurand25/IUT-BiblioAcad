import React from 'react';
import { Outlet, useLocation } from 'react-router';
import { MatiereProvider } from '../../Contexts/MatiereContext.tsx';

const MatiereContentLayout: React.FC = () => {
  const location = useLocation();

  return (
    <div className="space-y-3">
        <div className="w-full rounded-lg  p-1 max-h-[85vh] overflow-y-auto">
            <MatiereProvider>
                <Outlet /> 
            </MatiereProvider>
        </div>
    </div>
  );
};

export default MatiereContentLayout;