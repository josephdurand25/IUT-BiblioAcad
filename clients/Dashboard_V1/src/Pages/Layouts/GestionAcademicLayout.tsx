import React from 'react';
import { Outlet, useLocation } from 'react-router';
import { CoursesProvider } from '../../Contexts/CoursesContext';

const GestionAcademicContentLayout: React.FC = () => {
  const location = useLocation();

  return (
    <div className="space-y-3">
        {/* Contenu des sous-routes */}
        <div className="w-full rounded-lg  p-1 max-h-[85vh] overflow-y-auto">
            <CoursesProvider>
                <Outlet /> 
            </CoursesProvider>
        </div>

    </div>
  );
};

export default GestionAcademicContentLayout;