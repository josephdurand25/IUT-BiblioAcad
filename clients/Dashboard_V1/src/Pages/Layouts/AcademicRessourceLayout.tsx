import React from 'react';
import { Outlet } from 'react-router';
import { AcademicResourcesProvider } from '../../Contexts/AcademicResourcesContext';

const AcademicRssourceContentLayout: React.FC = () => {
 

  return (
    <div className="space-y-3">
        {/* Contenu des sous-routes */}
        <div className="w-full rounded-lg  p-1 max-h-[85vh] overflow-y-auto">
            <AcademicResourcesProvider>
                <Outlet /> 
            </AcademicResourcesProvider>
        </div>

    </div>
  );
};

export default AcademicRssourceContentLayout;