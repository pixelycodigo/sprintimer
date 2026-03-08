import * as React from 'react';
import { Link } from 'react-router-dom';
import { LogOut, User, Settings } from 'lucide-react';
import { cn } from '../utils/cn';
import { Avatar, AvatarFallback, AvatarImage } from '../Avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../DropdownMenu';
import { Button } from '../Button';

export interface UserMenuProfileProps {
  user: {
    nombre: string;
    email?: string;
    rol: string;
    avatar?: string | null;
  };
  onLogout: () => void;
  profileLink?: string;
  settingsLink?: string;
  className?: string;
  showEmail?: boolean;
}

const UserMenuProfile = React.forwardRef<HTMLButtonElement, UserMenuProfileProps>(
  (
    {
      user,
      onLogout,
      profileLink = '/perfil',
      settingsLink = '/configuracion',
      className,
      showEmail = false,
    },
    ref
  ) => {
    const getInitial = (name: string) => name.charAt(0).toUpperCase();

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            ref={ref}
            variant="ghost"
            className={cn('flex items-center space-x-3', className)}
            aria-label="Abrir menú de usuario"
          >
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.avatar || undefined} alt={user.nombre} />
              <AvatarFallback className="bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold text-sm">
                {getInitial(user.nombre)}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm text-left hidden sm:block">
              <p className="font-medium text-slate-900 dark:text-zinc-100">{user.nombre}</p>
              <p className="text-xs text-slate-500 dark:text-zinc-400 capitalize">{user.rol}</p>
              {showEmail && user.email && (
                <p className="text-xs text-slate-400 dark:text-zinc-500 truncate max-w-[150px]">
                  {user.email}
                </p>
              )}
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link to={profileLink} className="flex items-center w-full">
              <User className="w-4 h-4 mr-2" aria-hidden="true" />
              Ver perfil
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to={settingsLink} className="flex items-center w-full">
              <Settings className="w-4 h-4 mr-2" aria-hidden="true" />
              Configuración
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onLogout} className="flex items-center cursor-pointer">
            <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
);

UserMenuProfile.displayName = 'UserMenuProfile';

export { UserMenuProfile };
