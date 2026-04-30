import {  Route, Routes, useLocation } from 'react-router-dom';
import DashboardLayout from './Pages/Layouts/DashboardLayout';
import { ToastProvider } from './Contexts/TaostContainer';
import { useEffect } from 'react';
import Dashboard from './Pages/Contents/Dashboard';
import StudentsList from './Pages/Contents/students/StudentsList';
import Statistics from './Pages/Contents/Statistics';
import StudentForm from './Pages/Contents/students/FormDataStudent';
import CoursesContentLayout from './Pages/Layouts/CourseLayout';
import CourseForm from './Pages/Contents/Courses/Form';
import StudentDetails from './Pages/Contents/students/StudentDetail';
import MatiereContentLayout from './Pages/Layouts/MatiereLayout';
import MatieresList from './Pages/Contents/Matieres/MatieresList';
import MatiereDetails from './Pages/Contents/Matieres/MatiereDetails';
import MatiereForm from './Pages/Contents/Matieres/MatiereForm';
import AcademicRssourceContentLayout from './Pages/Layouts/AcademicRessourceLayout';
import GestionAcademicContentLayout from './Pages/Layouts/GestionAcademicLayout';
import AdministrationContentLayout from './Pages/Layouts/AdministrationLayout';
import Users from './Pages/Contents/Administratration/Users';
import UEForm from './Pages/Contents/AcademicRessources/UeForm';
import CandidatureContentLayout from './Pages/Layouts/CandidatureLayout';
import CandidaturesList from './Pages/Contents/Candidatures/CandidaturesList';
import CandidatureDetail from './Pages/Contents/Candidatures/CandidatureDetail';
import FormCandidature from './Pages/Contents/Candidatures/FormCandidature';
import LoginPage from './Pages/Contents/Auth/Login';
import { AuthProvider } from './Contexts/AuthContext';
import { ProtectedRoute } from './Contexts/ProtectedRoutes';
import NotFound from './Pages/Page404';
import { PublicRoute } from './Contexts/publicRoutes';

const App: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    document.querySelector('html')!.style.scrollBehavior = 'auto';
    window.scroll({ top: 0 });
    document.querySelector('html')!.style.scrollBehavior = '';
  }, [location.pathname]);

  return (
    <ToastProvider>
      <AuthProvider>
        <Routes>
          {/* Route publique */}
          {/* <Route element={<PublicRoute />}> */}
           <Route path="/" element={<LoginPage />} />
           <Route path="/login" element={<LoginPage />} />
          {/* </Route> */}
          {/* Routes protégées */}
          {/* <Route element={<ProtectedRoute />}> */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              {/* Routes principales */}
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="students" element={<StudentsList />} />
              <Route path="students/:id" element={<StudentDetails  />} />
              <Route path="students/create" element={<StudentForm />} />
              <Route path="students/edit/:id" element={<StudentForm />} />
              <Route path="students/statistics" element={<Statistics />} />
              {/* Route imbriquée pour la gestion des cours */}
              <Route path="matieres" element={<MatiereContentLayout />}>
                <Route index element={<MatieresList />} />
                <Route path='create' element={<MatiereForm />} />
                <Route path=':id/edit' element={<MatiereForm />} />
                <Route path=':id' element={<MatiereDetails />} />
              </Route>

              {/* Route imbriquée pour la gestion des candidatures */}
              <Route path="Candidatures" element={<CandidatureContentLayout/>}>
                <Route index element={<CandidaturesList />} />
                <Route path=':id' element={<CandidatureDetail />} />
                <Route path='create' element={<FormCandidature />} />
              </Route>

              {/* Route imbriquee pour la gestion Academic resources */}
              <Route path='academic-resources' element={<AcademicRssourceContentLayout/>}>
              <Route path='create' element={<UEForm/>}/>
              </Route>

              {/* Route imbriquee pour la Gestion Académique */}
              <Route path='academic' element={<GestionAcademicContentLayout/>}>
              </Route>

            {/* Route imbriquee pour la Gestion de l'Administration */}
            <Route path='admin' element={<AdministrationContentLayout/>}>
                <Route path='users' element={<Users />} />
            </Route>
            
            {/* Route imbriquee pour la Gestion des courses */}
            <Route path='courses' element={<CoursesContentLayout/>}>
              <Route path='create' element={<CourseForm />} />
            </Route>

              {/* <Route path="*" element={<Page404 />} /> */}
            </Route>
          </Route>
          {/* 404 */}   
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </ToastProvider>

  );
};

export default App;