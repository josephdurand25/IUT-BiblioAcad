import React from 'react';
import { Outlet } from 'react-router';
import { DossierCandidatureProvider } from '../../Contexts/DossierCandidatureContext';
import { CandidatureProvider } from '../../Contexts/CandidatureContext';

const CandidatureContentLayout: React.FC = () => {

  return (
    <div className="space-y-3">
      <CandidatureProvider>
        <DossierCandidatureProvider>
        {/* Contenu des sous-routes */}
        <div className="w-full rounded-lg p-1 max-h-[85vh] overflow-y-auto">
            <Outlet />
        </div>
      </DossierCandidatureProvider>
    </CandidatureProvider>

    </div>
  );
};

export default CandidatureContentLayout;