import React, { useState, useRef, useEffect } from 'react';
import { Button } from './Button';
import clsx from 'clsx';

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  position?: 'bottom' | 'top';  // Nouvelle prop pour la position verticale
  className?: string;
  menuClassName?: string;
  disabled?: boolean;
  buttonVariant?: 
    | 'accent'
    | 'slate'
    | 'secondary'
    | 'outline'
    | 'disabled'
    | 'ico'
    | 'danger'
    | 'success'
    | 'sivathemedark'
    | 'perso'
    | 'sivatheme';
  buttonClassName?: string;
  buttonProps?: Record<string, any>;
  closeOnClick?: boolean;
  offset?: number; // Espace entre le bouton et le menu
  [key: string]: any;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  children,
  align = 'right',
  position = 'bottom', // 'bottom' par défaut
  className = '',
  menuClassName = '',
  disabled = false,
  buttonVariant = 'outline',
  buttonClassName = '',
  buttonProps = {},
  closeOnClick = true,
  offset = 4, // 4px par défaut
  ...rest
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<'top' | 'bottom'>(position);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Calculer automatiquement la position si l'espace est insuffisant
  useEffect(() => {
    if (isOpen && buttonRef.current && menuRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const menuRect = menuRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Espace disponible en bas
      const spaceBelow = viewportHeight - buttonRect.bottom;
      // Espace disponible en haut
      const spaceAbove = buttonRect.top;

      // Si la position demandée est 'bottom' mais qu'il n'y a pas assez d'espace
      if (position === 'bottom' && spaceBelow < menuRect.height && spaceAbove > menuRect.height) {
        setMenuPosition('top');
      } 
      // Si la position demandée est 'top' mais qu'il n'y a pas assez d'espace
      else if (position === 'top' && spaceAbove < menuRect.height && spaceBelow > menuRect.height) {
        setMenuPosition('bottom');
      } else {
        setMenuPosition(position);
      }
    }
  }, [isOpen, position]);

  // Fermeture au clic extérieur ou touche Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  // Gestionnaire de clic sur les items
  const handleItemClick = (childOnClick?: (e: React.MouseEvent) => void) => (e: React.MouseEvent) => {
    if (closeOnClick) {
      setIsOpen(false);
    }
    childOnClick?.(e);
  };

  // Classes pour le positionnement
  const positionClasses = {
    bottom: `top-full mt-${offset}`,
    top: `bottom-full mb-${offset}`
  };

  return (
    <div 
      className={clsx('relative inline-block', className)} 
      ref={dropdownRef}
      {...rest}
    >
      {/* Trigger button */}
      <button
        ref={buttonRef}
        type="button"
        className={clsx(
          'flex items-center w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-md',
          buttonClassName
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-haspopup="true"
        aria-expanded={isOpen}
        {...buttonProps}
      >
        {trigger}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          ref={menuRef}
          className={clsx(
            'absolute z-50 min-w-[180px] rounded-md shadow-lg',
            'border border-gray-200 ',
            'bg-white ',
            positionClasses[menuPosition],
            align === 'right' ? 'right-0' : 'left-0',
            menuClassName
          )}
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
          style={{ 
            // Assure que le menu ne dépasse pas de la viewport
            maxHeight: 'calc(100vh - 100px)',
            overflowY: 'auto'
          }}
        >
          <div className="py-1">
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child, {
                  onClick: handleItemClick(child.props.onClick),
                  className: clsx(
                    'flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200',
                    'hover:bg-gray-100 dark:hover:bg-gray-700',
                    'focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700',
                    child.props.className
                  ),
                  role: 'menuitem',
                  tabIndex: -1,
                });
              }
              return child;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Composant Item pour faciliter l'utilisation
interface DropdownItemProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  disabled?: boolean;
  icon?: string;
  [key: string]: any;
}

export const DropdownItem: React.FC<DropdownItemProps> = ({ 
  children, 
  onClick, 
  className = '',
  disabled = false,
  icon,
  ...rest 
}) => {
  return (
    <button
      className={clsx(
        'flex items-center gap-2 w-full text-left',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      role="menuitem"
      {...rest}
    >
      {icon && <i className={icon}></i>}
      {children}
    </button>
  );
};

// Composant Divider pour séparer les sections
export const DropdownDivider: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={clsx('my-1 h-px bg-gray-200 dark:bg-gray-700', className)} />
  );
};

// Composant Header pour titrer les sections
export const DropdownHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={clsx('px-4 text-xs font-semibold uppercase tracking-wider', className)}>
      {children}
    </div>
  );
};