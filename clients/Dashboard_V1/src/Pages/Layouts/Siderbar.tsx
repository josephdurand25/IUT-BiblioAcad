// SIGIF
import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import "remixicon/fonts/remixicon.css";
import clsx from "clsx";
import { SidebarLinkGroup } from "../components/SidebarLinkGroup";
import { Button } from "../components/Button";
import { Dropdown, DropdownDivider, DropdownItem } from "../components/Dropdown";
import { useAuth } from "../../Contexts/AuthContext";
import { useToast } from "../../Contexts/TaostContainer";
import { utils_getImageUrl } from "../../Utils/utils_fuctions";



interface SidebarProps {
  sidebarExpanded: boolean;
  toggleSidebarExpanded: () => void;
  sidebarOpen: boolean;
  closeMobile: () => void;
  menuData : any;
  variant?: 'default' | 'v2' | 'v1';
}
const Sidebar: React.FC<SidebarProps> = ({ sidebarExpanded, toggleSidebarExpanded, sidebarOpen, closeMobile, menuData, variant = 'default' }) => {
  const location = useLocation();
  const { state, actions } = useAuth();
  const { pathname } = location;
  const navigation = menuData;
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await actions.logout();
      navigate('/login');
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erreur',
        message: 'Erreur lors de la déconnexion'
      });
    }
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  // Récupérer les initiales de l'utilisateur
  const getUserInitials = () => {
    if (state.user?.prenom && state.user?.nom) {
      return `${state.user.prenom[0]}${state.user.nom[0]}`.toUpperCase();
    }
    return <i className="ri-user-line"></i>;
  };

  // Récupérer le rôle formaté
  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      'SUPER': 'Super Administrateur',
      'ADMINISTRATEUR': 'Administrateur',
      'ENSEIGNANT': 'Enseignant',
      'ETUDIANT': 'Étudiant'
    };
    return roles[role] || role;
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-gray-900 bg-opacity-30 z-40 lg:hidden lg:z-auto transition-opacity duration-200 ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      ></div>

        <div
          className={clsx(
            'fixed inset-0 z-40 lg:hidden transition-opacity duration-300',
            sidebarOpen ? 'block' : 'hidden'
          )}>
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity duration-300"
            onClick={closeMobile}
          />
          <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
            <div className="flex min-h-0 flex-1 flex-col">
              {/* Header mobile sidebar */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h1 className="text-xl font-bold text-indigo-600">
                  <i className="ri-graduation-cap-line mr-2"></i>
                  <span>Student Manager</span>
                </h1>
                <Button action={closeMobile} variant='perso' icon='ri-close-line text-xl' supStyle="text-gray-500 hover:text-gray-700" />
              </div>
              
              {/* Navigation mobile */}
              <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-2">
                  {navigation.map((item: any) => (
                    <div key={item.name}>
                      {item.submenu ? (
                        <SidebarLinkGroup 
                          activecondition={pathname.includes(item.href.split('/')[1])}
                        >
                          {(handleClick, open) => (
                            <>
                              <Button
                                action={handleClick}
                                variant='perso'
                                icon={item.icon}
                                iconPosition='left'
                                supStyle={clsx(
                                  'w-full group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                  pathname.includes(item.href.split('/')[1])
                                    ? 'bg-indigo-50 text-indigo-600'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                )}
                              >
                                <span className=''>{item.name}</span>
                                <i className={clsx(
                                  'ri-arrow-down-s-line absolute mr-1 right-0 transition-transform duration-200',
                                  open && 'rotate-180'
                                )}/>
                              </Button>
                              
                              {open && (
                                <div className="mt-1 ml-8 space-y-1">
                                  {item.submenu?.map((subItem: any) => (
                                    <NavLink
                                      key={subItem.name}
                                      to={subItem.href}
                                      onClick={closeMobile}
                                      className={({ isActive }) =>
                                        clsx(
                                          'block rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                          isActive
                                            ? 'bg-indigo-100 text-indigo-700'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                        )
                                      }
                                    >
                                      {subItem.name}
                                    </NavLink>
                                  ))}
                                </div>
                              )}
                            </>
                          )}
                        </SidebarLinkGroup>
                      ) : (
                        <NavLink
                          to={item.href}
                          onClick={closeMobile}
                          className={({ isActive }) =>
                            clsx(
                              'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                              isActive
                                ? 'bg-indigo-50 text-indigo-600'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                            )
                          }
                        >
                          <i className={clsx(item.icon, 'mr-3 text-lg')}></i>
                          {item.name}
                        </NavLink>
                      )}
                    </div>
                  ))}
                </nav>
              </div>
              
              {/* Profile mobile sidebar */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                      <i className="ri-user-line"></i>
                    </div>
                  </div>
                  <Dropdown buttonVariant="perso" className="ml-3" align="left" 
                    trigger={<span className="ml-3 text-sm font-medium text-gray-700">Account</span>} 
                    menuClassName="w-48">
                      <DropdownItem onClick={() => alert('Profil')}>
                        <i className="ri-user-line mr-2"></i> Profil
                      </DropdownItem>
                      <DropdownItem onClick={() => alert('Paramètres')}>
                        <i className="ri-settings-3-line mr-2"></i> Paramètres
                      </DropdownItem>
                      <DropdownItem onClick={() => alert('Déconnexion')}>
                        <i className="ri-logout-box-line mr-2"></i> Déconnexion
                      </DropdownItem>
                    </Dropdown>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`${sidebarExpanded ? 'hidden lg:flex' : 'hidden lg:flex lg:w-20'} lg:fixed lg:inset-y-0 lg:flex-col`}>
          <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white shadow-sm">
            {/* Desktop sidebar header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h1 className="text-xl font-bold text-indigo-600">
                <i className={`ri-graduation-cap-line mr-2`}></i>
                <span className={`${sidebarExpanded ?  'ml-1' : 'hidden'}`}>Student Manager</span>
                
              </h1>
              <button
                onClick={toggleSidebarExpanded}
                className="text-gray-400 hover:text-gray-500"
                title={sidebarExpanded ? "Réduire la sidebar" : "Étendre la sidebar"}
              >
                <i className={clsx(
                  `${sidebarExpanded ? 'ri-arrow-left-s-line' : 'ri-arrow-right-s-line'} ri-arrow-left-s-line transition-transform duration-200`,
                  sidebarExpanded && 'rotate-180'
                )}></i>
              </button>
            </div>
            
            {/* Navigation desktop */}
            <div className="flex-1 overflow-y-auto py-4">
              <nav className=" px-2">
                {navigation.map((item: any) => (
                  <div key={item.name}>
                    {item.submenu ? (
                      <SidebarLinkGroup 
                        activecondition={pathname.includes(item.href.split('/')[1])}
                      >
                        {(handleClick, open) => (
                          <>
                            <Button
                              action={handleClick}
                              variant='perso'
                              icon={`${item.icon} mr-2 text-lg`}
                              iconPosition='left'
                              supStyle={clsx(
                                'w-full group flex items-center justify-between rounded-md px-3 py-1 text-sm font-medium transition-colors',
                                pathname.includes(item.href.split('/')[1])
                                  ? 'bg-indigo-50 text-indigo-600'
                                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                              )}
                            >
                                <span className={clsx(
                                  'transition-opacity duration-200',
                                  sidebarExpanded ? 'opacity-100' : 'opacity-0 w-0 hidden'
                                )}>
                                  {item.name}
                                </span>
                              <i className={clsx(
                                'ri-arrow-down-s-line absolute right-2 transition-all duration-200',
                                open && 'rotate-180',
                                sidebarExpanded ? 'opacity-100' : 'opacity-0'
                              )}></i>
                            </Button>
                            
                            {open && sidebarExpanded && (
                              <div className="mt-1 ml-8 space-y-1">
                                {item.submenu?.map((subItem: any) => (
                                  <NavLink
                                    key={subItem.name}
                                    to={subItem.href}
                                    className={({ isActive }) =>
                                      clsx(
                                        'block rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                        isActive
                                          ? 'bg-indigo-100 text-indigo-700'
                                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                      )
                                    }
                                  >
                                    {subItem.name}
                                  </NavLink>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </SidebarLinkGroup>
                    ) : (
                      <NavLink
                        to={item.href}
                        className={({ isActive }) =>
                          clsx(
                            'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                            isActive
                              ? 'bg-indigo-50 text-indigo-600'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                          )
                        }
                      >
                        <i className={clsx(item.icon, 'mr-3 text-lg')}></i>
                        <span className={clsx(
                          'transition-opacity duration-200',
                          sidebarExpanded ? 'opacity-100' : 'opacity-0 w-0'
                        )}>
                          {item.name}
                        </span>
                      </NavLink>
                    )}
                  </div>
                ))}
              </nav>
            </div>
            
            {/* Profile desktop sidebar */}
            <div className={clsx('border-t border-gray-200 p-4 transition-all duration-200 opacity-100' )}>
              <div className="flex items-center">
                {/* Avatar avec initiales ou image */}
                <div className={`flex-shrink-0 ${!sidebarExpanded ? 'hidden' : ' '}`}>
                  {state.user?.avatar_url ? (
                    <img
                      src={utils_getImageUrl(state.user.avatar_url)}
                      alt={`${state.user.prenom} ${state.user.nom}`}
                      className="h-10 w-10 rounded-full object-cover"
                      onError={(e) => {
                    if (state.user?.genre === 'M') {
                      e.currentTarget.src = '/app/images/default-avatar-male.png';
                    } else if (state.user?.genre === 'F') {
                      e.currentTarget.src = '/app/images/default-avatar-female.png';
                    } else {
                      e.currentTarget.src = '/app/images/default-avatar.png';
                    }
                    e.currentTarget.onerror = null;
                    console.log('Fallback vers image locale:', e.currentTarget.src);
                  }}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium">
                      {getUserInitials()}
                    </div>
                  )}
                </div>

                {/* Dropdown menu */}
                <Dropdown
                  buttonVariant="perso"
                  buttonClassName={clsx(
                    'ml-3 transition-all duration-200',
                    sidebarExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 pointer-events-none'
                  )}
                  position="bottom"
                  align="left"
                  trigger={
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-700 ">
                        {state.user?.prenom} {state.user?.nom}
                      </p>
                      <p className="text-xs text-purple-700 ">
                        -- {getRoleLabel(state.user?.role || '')} --
                      </p>
                    </div>
                  }
                >
                  <DropdownItem onClick={handleProfile} icon="ri-user-line mr-2" className="font-medium bg-slate-50 px-4 py-1.5 text-slate-700 hover:bg-slate-100">
                    Mon profil
                  </DropdownItem>
                  
                  <DropdownItem onClick={handleSettings} icon="ri-settings-3-line mr-2" className="font-medium bg-slate-50 px-4 py-1.5 text-slate-700 hover:bg-slate-100">
                    Paramètres
                  </DropdownItem>
                  
                  {actions.isAdmin() && (
                    <>
                    <DropdownDivider />
                      <DropdownItem  onClick={() => navigate('/admin/users')} icon="ri-shield-user-line" className="font-medium text-[13px] bg-slate-50 px-4 py-1.5 text-slate-700 hover:bg-slate-100">
                        Gestion des utilisateurs
                      </DropdownItem>

                      <DropdownItem  onClick={() => navigate('/admin/roles')} icon="ri-admin-line" className="font-medium text-[13px] bg-slate-50 px-4 py-1.5 text-slate-700 hover:bg-slate-100">
                        Gestion des rôles
                      </DropdownItem>
                    </>
                  )}
                  
                  <DropdownDivider />
                  
                  <DropdownItem  onClick={handleLogout}  icon="ri-logout-box-line mr-2" className="bg-slate-50 text-slate-700 hover:bg-red-50 hover:text-red-800" >
                    Déconnexion
                  </DropdownItem>

                </Dropdown>
              </div>

              {/* Email affiché en dessous quand la sidebar est réduite */}
              {!sidebarExpanded && (
                <Dropdown
                    buttonVariant="perso"
                    buttonClassName="transition-all duration-200"
                    position="top"  // ← Passer en top pour éviter de sortir de l'écran
                    align="left"
                    trigger={state.user?.avatar_url ? (
                      <img
                        src={utils_getImageUrl(state.user.avatar_url)}
                        alt={`${state.user.prenom} ${state.user.nom}`}
                        className="h-10 w-10 rounded-full object-cover"
                        onError={(e) => {
                          if (state.user?.genre === 'M') {
                            e.currentTarget.src = '/app/images/default-avatar-male.png';
                          } else if (state.user?.genre === 'F') {
                            e.currentTarget.src = '/app/images/default-avatar-female.png';
                          } else {
                            e.currentTarget.src = '/app/images/default-avatar.png';
                          }
                          e.currentTarget.onerror = null;
                          console.log('Fallback vers image locale:', e.currentTarget.src);
                        }}
                      />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium">
                          {getUserInitials()}
                        </div>
                      )
                    }
                  >
                    <DropdownItem onClick={handleProfile} icon="ri-user-line mr-2" className="font-medium bg-slate-50 px-4 py-1.5 text-slate-700 hover:bg-slate-100">
                      Mon profil
                    </DropdownItem>
                    
                    <DropdownItem onClick={handleSettings} icon="ri-settings-3-line mr-2" className="font-medium bg-slate-50 px-4 py-1.5 text-slate-700 hover:bg-slate-100">
                      Paramètres
                    </DropdownItem>
                    
                    {actions.isAdmin() && (
                      <>
                      <DropdownDivider />
                        <DropdownItem  onClick={() => navigate('/admin/users')} icon="ri-shield-user-line" className="font-medium text-[13px] bg-slate-50 px-4 py-1.5 text-slate-700 hover:bg-slate-100">
                          Gestion des utilisateurs
                        </DropdownItem>

                        <DropdownItem  onClick={() => navigate('/admin/roles')} icon="ri-admin-line" className="font-medium text-[13px] bg-slate-50 px-4 py-1.5 text-slate-700 hover:bg-slate-100">
                          Gestion des rôles
                        </DropdownItem>
                      </>
                    )}
                    
                    <DropdownDivider />
                    
                    <DropdownItem  onClick={handleLogout}  icon="ri-logout-box-line mr-2" className="bg-slate-50 text-slate-700 hover:bg-red-50 hover:text-red-800" >
                      Déconnexion
                    </DropdownItem>
                </Dropdown>
              )}
            </div>
          </div>
        </div>
    </>
  );
}

export default Sidebar;