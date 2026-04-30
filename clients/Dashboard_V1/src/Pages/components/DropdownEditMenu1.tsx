import React, { useState, useRef, useEffect } from 'react';
import Transition from '../utils/Transition';
import clsx from 'clsx';
import { Button } from './Button';


interface DropdownMenuPersoProps {
    children: React.ReactNode;
    align?: 'left' | 'right';
    className?: string;
    menuClassName?: string;
    triggerClassName?: string;
    buttonText?: string;
    icon?: string;
    iconTheme?: 'accent' | 'secondary' | 'gray' | 'default';
    iconSize?: 'small' | 'medium' | 'large';
    appear?: boolean;
    disabled?: boolean;
  }
  
  const DropdownMenuPerso: React.FC<DropdownMenuPersoProps> = ({
    children,
    align = 'right',
    className = '',
    menuClassName = '',
    triggerClassName = '',
    buttonText = '',
    icon = '',
    iconTheme = 'default',
    iconSize = 'medium',
    appear = false,
    disabled = false,
    ...rest
  }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const trigger = useRef<HTMLButtonElement>(null);
    const dropdown = useRef<HTMLUListElement>(null);

    // Gestion des tailles d'icônes
    const getIconSizeClass = () => {
      switch (iconSize) {
        case 'small': return 'text-lg';
        case 'medium': return 'text-xl';
        case 'large': return 'text-2xl';
        default: return 'text-xl';
      }
    };

    // Gestion des thèmes d'icônes
    const getIconThemeClass = () => {
      switch (iconTheme) {
        case 'accent': return 'text-blue-500 hover:text-blue-600';
        case 'secondary': return 'text-primary-500 hover:text-primary-600';
        case 'gray': return 'text-gray-500 hover:text-gray-600';
        case 'default': 
        default: 
          return dropdownOpen 
            ? 'text-gray-500 dark:text-gray-400' 
            : 'text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400';
      }
    };

    // Fermeture au clic extérieur
    useEffect(() => {
      const clickHandler = ({ target }: MouseEvent) => {
        if (!dropdown.current || !trigger.current || !(target instanceof Node)) return;
        if (!dropdownOpen || dropdown.current.contains(target) || trigger.current.contains(target)) return;
        setDropdownOpen(false);
      };
      document.addEventListener('click', clickHandler);
      return () => document.removeEventListener('click', clickHandler);
    }, [dropdownOpen]);

    // Fermeture avec la touche Escape
    useEffect(() => {
      const keyHandler = ({ key }: KeyboardEvent) => {
        if (!dropdownOpen || key !== 'Escape') return;
        setDropdownOpen(false);
      };
      document.addEventListener('keydown', keyHandler);
      return () => document.removeEventListener('keydown', keyHandler);
    }, [dropdownOpen]);

    return (
      <div className={clsx('relative', className)} {...rest}>
        <button
          ref={trigger}
          className={clsx(
            'flex items-center rounded-md transition-colors first-letter:uppercase',
            disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
            triggerClassName
          )}
          aria-haspopup="true"
          onClick={() => !disabled && setDropdownOpen(!dropdownOpen)}
          aria-expanded={dropdownOpen}
          disabled={disabled}
        >
          {icon && (
            <i className={clsx(icon, getIconSizeClass())} />
          )}
          {buttonText && (
            <span className={clsx(
              'sr-only md:not-sr-only',
              iconSize === 'small' ? 'text-sm' : 
              iconSize === 'medium' ? 'text-base' : 'text-lg'
            )}>
              {buttonText}
            </span>
          )}
        </button>
        <Transition
          appear={appear}
          show={dropdownOpen}
          tag="div"
          className={clsx(
            'origin-top-right z-10 absolute top-full min-w-36  dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 py-1.5 rounded-lg shadow-lg overflow-hidden mt-1',
            align === 'right' ? 'right-0' : 'left-0',
            menuClassName
          )}
          enter="transition ease-out duration-200 transform"
          enterStart="opacity-0 -translate-y-2"
          enterEnd="opacity-100 translate-y-0"
          leave="transition ease-out duration-200"
          leaveStart="opacity-100"
          leaveEnd="opacity-0"
        >
          <ul 
            ref={dropdown} 
            onFocus={() => !disabled && setDropdownOpen(true)} 
            onBlur={() => setDropdownOpen(false)}
            className="divide-y divide-gray-200 dark:divide-gray-700/50 px-2"
          >
            {children}
          </ul>
        </Transition>
      </div>
    );
  };

export  {DropdownMenuPerso};