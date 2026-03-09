/**
 * Imports globales de componentes UI más usados
 * 
 * Uso: import { UI } from '@ui';
 * 
 * Esto importa los componentes más comunes para evitar
 * tener que importarlos uno por uno en cada página.
 */

import { Badge } from './Badge';
import { Spinner } from './Spinner';
import { Button } from './Button';
import { Input } from './Input';
import { Label } from './Label';
import { Card } from './Card';
import { Empty } from './Empty';
import { Skeleton } from './Skeleton';

export const UI = {
  Badge,
  Spinner,
  Button,
  Input,
  Label,
  Card,
  Empty,
  Skeleton,
};

// Re-exportar todo desde @ui para conveniencia
export * from './index';
