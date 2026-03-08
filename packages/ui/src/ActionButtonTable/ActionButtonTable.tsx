import * as React from 'react';
import { Pencil, Trash2, Eye, EyeOff, Check, X, LogOut, RotateCcw, UserCheck, Settings } from 'lucide-react';
import { cn } from '../utils/cn';

export type ActionButtonType = 
  | 'edit'
  | 'delete'
  | 'view'
  | 'hide'
  | 'show'
  | 'activate'
  | 'deactivate'
  | 'logout'
  | 'restore'
  | 'check'
  | 'uncheck'
  | 'settings';

export interface ActionButtonTableProps {
  type: ActionButtonType;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  title?: string;
  'aria-label'?: string;
}

const actionIcons: Record<ActionButtonType, React.ReactNode> = {
  edit: <Pencil className="w-4 h-4" aria-hidden="true" />,
  delete: <Trash2 className="w-4 h-4" aria-hidden="true" />,
  view: <Eye className="w-4 h-4" aria-hidden="true" />,
  hide: <EyeOff className="w-4 h-4" aria-hidden="true" />,
  show: <Eye className="w-4 h-4" aria-hidden="true" />,
  activate: <Check className="w-4 h-4" aria-hidden="true" />,
  deactivate: <X className="w-4 h-4" aria-hidden="true" />,
  logout: <LogOut className="w-4 h-4" aria-hidden="true" />,
  restore: <RotateCcw className="w-4 h-4" aria-hidden="true" />,
  check: <UserCheck className="w-4 h-4" aria-hidden="true" />,
  uncheck: <X className="w-4 h-4" aria-hidden="true" />,
  settings: <Settings className="w-4 h-4" aria-hidden="true" />,
};

const actionTitles: Record<ActionButtonType, string> = {
  edit: 'Editar',
  delete: 'Eliminar',
  view: 'Ver',
  hide: 'Ocultar',
  show: 'Mostrar',
  activate: 'Activar',
  deactivate: 'Desactivar',
  logout: 'Cerrar sesión',
  restore: 'Restaurar',
  check: 'Verificar',
  uncheck: 'Deshabilitar',
  settings: 'Configuración',
};

const actionColors: Record<ActionButtonType, string> = {
  edit: 'text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800',
  delete: 'text-slate-400 dark:text-zinc-500 hover:text-red-600 hover:text-white dark:hover:text-white hover:bg-red-50 dark:hover:bg-red-900/20',
  view: 'text-slate-400 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20',
  hide: 'text-slate-400 dark:text-zinc-500 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20',
  show: 'text-slate-400 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20',
  activate: 'text-slate-400 dark:text-zinc-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20',
  deactivate: 'text-slate-400 dark:text-zinc-500 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20',
  logout: 'text-slate-400 dark:text-zinc-500 hover:text-red-600 hover:text-white dark:hover:text-white hover:bg-red-50 dark:hover:bg-red-900/20',
  restore: 'text-slate-400 dark:text-zinc-500 hover:text-green-600 hover:text-white dark:hover:text-white hover:bg-green-50 dark:hover:bg-green-900/20',
  check: 'text-slate-400 dark:text-zinc-500 hover:text-green-600 hover:text-white dark:hover:text-white hover:bg-green-50 dark:hover:bg-green-900/20',
  uncheck: 'text-slate-400 dark:text-zinc-500 hover:text-red-600 hover:text-white dark:hover:text-white hover:bg-red-50 dark:hover:bg-red-900/20',
  settings: 'text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800',
};

/**
 * Componente reutilizable para botones de acción en tablas
 * Soporta diferentes tipos de acciones: edit, delete, view, activate, deactivate, etc.
 */
const ActionButtonTable = React.forwardRef<HTMLButtonElement, ActionButtonTableProps>(
  (
    {
      type,
      onClick,
      className,
      disabled = false,
      title,
      'aria-label': ariaLabel,
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          'p-2 rounded-md transition-colors',
          actionColors[type],
          disabled && 'opacity-50 cursor-not-allowed hover:bg-transparent hover:text-slate-400 dark:hover:text-zinc-500',
          className
        )}
        title={title || actionTitles[type]}
        aria-label={ariaLabel || title || actionTitles[type]}
      >
        {actionIcons[type]}
      </button>
    );
  }
);

ActionButtonTable.displayName = 'ActionButtonTable';

// Componentes específicos para cada acción
const ActionButtonEdit = React.forwardRef<HTMLButtonElement, Omit<ActionButtonTableProps, 'type'>>(
  (props, ref) => <ActionButtonTable ref={ref} type="edit" {...props} />
);
ActionButtonEdit.displayName = 'ActionButtonEdit';

const ActionButtonDelete = React.forwardRef<HTMLButtonElement, Omit<ActionButtonTableProps, 'type'>>(
  (props, ref) => <ActionButtonTable ref={ref} type="delete" {...props} />
);
ActionButtonDelete.displayName = 'ActionButtonDelete';

const ActionButtonView = React.forwardRef<HTMLButtonElement, Omit<ActionButtonTableProps, 'type'>>(
  (props, ref) => <ActionButtonTable ref={ref} type="view" {...props} />
);
ActionButtonView.displayName = 'ActionButtonView';

const ActionButtonHide = React.forwardRef<HTMLButtonElement, Omit<ActionButtonTableProps, 'type'>>(
  (props, ref) => <ActionButtonTable ref={ref} type="hide" {...props} />
);
ActionButtonHide.displayName = 'ActionButtonHide';

const ActionButtonShow = React.forwardRef<HTMLButtonElement, Omit<ActionButtonTableProps, 'type'>>(
  (props, ref) => <ActionButtonTable ref={ref} type="show" {...props} />
);
ActionButtonShow.displayName = 'ActionButtonShow';

const ActionButtonActivate = React.forwardRef<HTMLButtonElement, Omit<ActionButtonTableProps, 'type'>>(
  (props, ref) => <ActionButtonTable ref={ref} type="activate" {...props} />
);
ActionButtonActivate.displayName = 'ActionButtonActivate';

const ActionButtonDeactivate = React.forwardRef<HTMLButtonElement, Omit<ActionButtonTableProps, 'type'>>(
  (props, ref) => <ActionButtonTable ref={ref} type="deactivate" {...props} />
);
ActionButtonDeactivate.displayName = 'ActionButtonDeactivate';

const ActionButtonLogout = React.forwardRef<HTMLButtonElement, Omit<ActionButtonTableProps, 'type'>>(
  (props, ref) => <ActionButtonTable ref={ref} type="logout" {...props} />
);
ActionButtonLogout.displayName = 'ActionButtonLogout';

const ActionButtonRestore = React.forwardRef<HTMLButtonElement, Omit<ActionButtonTableProps, 'type'>>(
  (props, ref) => <ActionButtonTable ref={ref} type="restore" {...props} />
);
ActionButtonRestore.displayName = 'ActionButtonRestore';

const ActionButtonCheck = React.forwardRef<HTMLButtonElement, Omit<ActionButtonTableProps, 'type'>>(
  (props, ref) => <ActionButtonTable ref={ref} type="check" {...props} />
);
ActionButtonCheck.displayName = 'ActionButtonCheck';

const ActionButtonUncheck = React.forwardRef<HTMLButtonElement, Omit<ActionButtonTableProps, 'type'>>(
  (props, ref) => <ActionButtonTable ref={ref} type="uncheck" {...props} />
);
ActionButtonUncheck.displayName = 'ActionButtonUncheck';

const ActionButtonSettings = React.forwardRef<HTMLButtonElement, Omit<ActionButtonTableProps, 'type'>>(
  (props, ref) => <ActionButtonTable ref={ref} type="settings" {...props} />
);
ActionButtonSettings.displayName = 'ActionButtonSettings';

export {
  ActionButtonTable,
  ActionButtonEdit,
  ActionButtonDelete,
  ActionButtonView,
  ActionButtonHide,
  ActionButtonShow,
  ActionButtonActivate,
  ActionButtonDeactivate,
  ActionButtonLogout,
  ActionButtonRestore,
  ActionButtonCheck,
  ActionButtonUncheck,
  ActionButtonSettings,
};
