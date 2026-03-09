import * as React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../AlertDialog';
import { ActionButtonEdit, ActionButtonDelete } from '../ActionButtonTable';

export interface DataTableActionsProps {
  /** ID del elemento a editar */
  editId?: number | string;
  /** ID del elemento a eliminar */
  deleteId?: number | string | null;
  /** Nombre del elemento para mostrar en el diálogo */
  deleteNombre?: string;
  /** Callback cuando se hace click en editar */
  onEdit?: (id: number | string) => void;
  /** Callback cuando se hace click en eliminar */
  onDelete?: (id: number | string, nombre: string) => void;
  /** Callback cuando se confirma la eliminación */
  onConfirmDelete?: (id: number | string) => void;
  /** Callback cuando se cierra el diálogo */
  onOpenChange?: (open: boolean) => void;
  /** Título del diálogo de eliminación */
  deleteTitle?: string;
  /** Descripción del diálogo de eliminación */
  deleteDescription?: string;
  /** Texto del botón de eliminar */
  deleteButtonText?: string;
  /** Si el botón de editar está deshabilitado */
  editDisabled?: boolean;
  /** Si el botón de eliminar está deshabilitado */
  deleteDisabled?: boolean;
  /** Si la mutación de eliminar está cargando */
  isLoading?: boolean;
  /** Clase CSS adicional para el contenedor de acciones */
  className?: string;
}

/**
 * Componente reutilizable para acciones de tabla con diálogo de confirmación
 * Incluye botones de Editar y Eliminar con AlertDialog integrado
 */
export function DataTableActions({
  editId,
  deleteId,
  deleteNombre = '',
  onEdit,
  onDelete,
  onConfirmDelete,
  onOpenChange,
  deleteTitle = '¿Estás seguro?',
  deleteDescription = 'Esta acción no se puede deshacer.',
  deleteButtonText = 'Eliminar',
  editDisabled = false,
  deleteDisabled = false,
  isLoading = false,
  className,
  isSoftDelete = false,
}: DataTableActionsProps & { isSoftDelete?: boolean }) {
  const [open, setOpen] = React.useState(false);

  const handleDeleteClick = () => {
    if (deleteId && deleteNombre && onDelete) {
      onDelete(deleteId, deleteNombre);
    }
    setOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteId && onConfirmDelete) {
      onConfirmDelete(deleteId);
    }
    setOpen(false);
    onOpenChange?.(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
    if (!newOpen && onDelete) {
      // Si se cierra sin confirmar, limpiar el deleteId
      if (deleteId) {
        onDelete(null as any, '');
      }
    }
  };

  return (
    <>
      <div className={`flex items-center justify-center gap-2 ${className || ''}`}>
        {editId !== undefined && editId !== null && (
          <ActionButtonEdit
            onClick={() => onEdit?.(editId)}
            disabled={editDisabled || isLoading}
          />
        )}
        {deleteId !== undefined && deleteId !== null && (
          <ActionButtonDelete
            onClick={handleDeleteClick}
            disabled={deleteDisabled || isLoading}
          />
        )}
      </div>

      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {isSoftDelete ? (
                <>
                  La {deleteNombre ? `tarea "${deleteNombre}"` : 'elemento'} se moverá a la papelera de reciclaje. Podrás restaurarla o eliminarla permanentemente antes de los 30 días.
                </>
              ) : (
                <>
                  {deleteDescription} {deleteNombre && (
                    <>
                      {' '}Se eliminará <strong className="text-slate-900 dark:text-zinc-100">"{deleteNombre}"</strong>.
                    </>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isLoading}
              className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:text-white dark:hover:bg-red-600"
            >
              {isLoading ? 'Eliminando...' : deleteButtonText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/**
 * Componente simplificado para acciones con solo botón de eliminar
 */
export function DataTableDeleteAction({
  deleteId,
  deleteNombre = '',
  onDelete,
  onConfirmDelete,
  onOpenChange,
  deleteTitle = '¿Eliminar elemento?',
  deleteDescription = 'Esta acción no se puede deshacer.',
  isLoading = false,
}: Omit<DataTableActionsProps, 'editId' | 'onEdit' | 'editDisabled'>) {
  return (
    <DataTableActions
      deleteId={deleteId}
      deleteNombre={deleteNombre}
      onDelete={onDelete}
      onConfirmDelete={onConfirmDelete}
      onOpenChange={onOpenChange}
      deleteTitle={deleteTitle}
      deleteDescription={deleteDescription}
      isLoading={isLoading}
      editDisabled={true}
    />
  );
}

export default DataTableActions;
