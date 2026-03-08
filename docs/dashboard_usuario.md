# 📋 Especificación Funcional: plataforma para el TALENT

Este documento detalla el flujo del talent, reglas de negocio, lógica técnica y diseño de interfaz para el usuario talent.

---

## 1. Estructura de Navegación (Sidebar)

El sistema se divide en cuatro niveles de acceso principales:

| Menú | Propósito | Flujo del talent |
| :--- | :--- | :--- |
| **Proyectos** | Vista macro y progreso | Proyecto > Actividades del proyecto > Tareas. |
| **Actividades** | Gestión operativa general | Lista global de actividades > Tareas. |
| **Tareas** | Registro de tiempos | Lista de actividades asignadas > Tareas de la actividad seleccionada. |
| **Reportes** | Análisis de datos y exportación | Filtros > Visualización de KPIs > Exportar. |

---

## 2. Módulo de Proyectos (Vista Macro)
Supervisión del avance global de los proyectos asignados.

* **Estructura:** Título > Filtros (Nombre, Fechas) > Tabla con Paginación.
* **Lógica del Progreso:** $$\text{Progreso \%} = \left( \frac{\sum \text{Horas de tareas finalizadas}}{\text{Total horas asignadas a la actividad}} \right) \times 100$$
* **Tabla de Proyectos:** Nombre, Actividades (count), Progreso (ProgressBar 0-100%), Acciones (Icono Ver).

---

## 3. Módulo de Actividades (Vista Operativa)
La visualización es contextual según el origen del talent.

* **Filtros:** Búsqueda, Proyecto (selector), Nro. Sprint (dinámico), Filtrar y Limpiar.
* **Comportamiento de Columnas:**
    * **Desde Sidebar:** Muestra columna "Proyecto".
    * **Desde Proyectos:** Oculta columna "Proyecto".
* **Tabla de Actividades:** Nombre, Proyecto (condicional), Nro. Sprint, Acciones (Ver Tareas).

---

## 4. Módulo de Tareas y Registro de Tiempos (Timer)

### **A. Creación de Tarea**
Al crear una nueva tarea, el talent define:
1. **Nombre de la tarea** (Validación: no duplicados en la actividad).
2. **Nivel de Prioridad** (Selección inicial: Alta, Media, Baja).
3. **Nro. de Sprint** (Si la modalidad lo requiere).

### **B. Lógica Visual del ButtonGroup (Cronómetro)**
| Estado | Icono Play | Icono Pausa | Icono Stop | Lógica Visual |
| :--- | :---: | :---: | :---: | :--- |
| **Sin Iniciar** | **Primario** | Saturado | Saturado | Solo Play habilitado. |
| **En Ejecución**| Saturado | **Primario** | **Primario** | Pausa y Stop activos. |
| **En Pausa** | **Primario** | Saturado | **Primario** | Retomar o Finalizar. |
| **Detenida** | Deshabilitado | Deshabilitado | **Rojo** | Bloqueo irreversible. |

### **C. Formato de Tiempo (Configurable)**
El sistema permite configurar cómo se visualiza el **Tiempo Total** empleado:
* **Minutos:** Tiempo exacto acumulado (ej. 45 min).
* **Cuartiles:** Redondeo por fracciones de hora (0.25, 0.50, 0.75, 1.00).

---

## 5. Gestión de Prioridades
Representado por iconos y colores en la tabla:
* **Alta (↑):** Rojo. | **Media (→):** Amarillo. | **Baja (↓):** Azul/Verde.
* **Interacción:** Dropdown con iconos en la tabla (bloqueado tras presionar **Stop**).

---

## 6. Reglas de Negocio y Mensajes (UX)
* **Validación de Nombres:** Sugerir correlativo si el nombre ya existe.
* **Bloqueo Post-Stop:** Al presionar Stop, se dispara un **Modal de Confirmación**. Tras aceptar, la tarea es de solo lectura (excepto el nombre).

---

## 7. Módulo de Reportes
* **Filtros:** Rango de Fechas, Proyecto, Actividad.
* **Visualización:** KPIs (Total horas, Proyecto más activo), Gráficos (Torta y Barras).
* **Exportación:** Formatos PDF y Excel (CSV). - (para implementarlo despues)

---

## 8. Wireframes ASCII (Estructura Estándar del Main)

### A. Módulo de Proyectos
```text
________________________________________________________________________________
| PROYECTOS (Título)                                                           |
|______________________________________________________________________________|
| FILTROS: [ Buscar por nombre... ] [ Fecha Desde ] [ Fecha Hasta ] [ FILTRAR ]|
|______________________________________________________________________________|
|                                                                              |
| Nombre Proyecto    | Actividades | Progreso (0-100%)         | Acciones      |
|--------------------|-------------|---------------------------|---------------|
| E-commerce Fase 1  |      12     | [##########----------] 50%|    [ (👁️) ]    |
| App Móvil Rediseño |       5     | [#################---] 85%|    [ (👁️) ]    |
|____________________|_____________|___________________________|_______________|
|                                                     Pag: < [1] 2 3 ... 10 >  |
|______________________________________________________________________________|


B. Módulo de Actividades

________________________________________________________________________________
| ACTIVIDADES (Título)                                                         |
|______________________________________________________________________________|
| FILTROS: [ Buscar... ] [ Proyecto v ] [ Nro. Sprint v ] [ FILTRAR ] [LIMPIAR]|
|______________________________________________________________________________|
|                                                                              |
| Actividad              | Proyecto* | Nro. Sprint | Acciones         |
|------------------------|--------------------|-------------|------------------|
| Diseño de Wireframes   | E-commerce Fase 1  | Sprint 02   |    [ Ver Tareas ]|
| Configuración de DB    | API Rest Interna   | N/A         |    [ Ver Tareas ]|
|________________________|____________________|_____________|________________--|
|                                                     Pag: < [1] 2 3 ... 05 >  |
|______________________________________________________________________________|

C. Módulo de Tareas (Registro, Timer y Prioridad)

________________________________________________________________________________
| TAREAS: Diseño de Wireframes (Título)                 [ + CREAR NUEVA TAREA ]|
|______________________________________________________________________________|
| FILTROS: [ Buscar Tarea... ] [ Estado v ] [ Nro. Sprint v ]       [ FILTRAR ]|
|______________________________________________________________________________|
|                                                                              |
| Prioridad | Nombre de Tarea     | Sprint/Mod. | Timer    | ButtonGroup | Total|
|-----------|---------------------|-------------|----------|-------------|------|
|  [!] v    | Sketching Home      | Sprint 02   | 01:20:45 | [▶️][⏸️][⏹️] | 81 m |
|  [~] v    | Review con Cliente  | Sprint 02   | 00:00:00 | [▶️][⏸️][⏹️] | 0.50 |
|  [v] v    | Ajustes de Color    | Sprint 02   | 00:15:20 | [▶️][⏸️][⏹️] | 15 m |
|___________|_____________________|_____________|__________|_____________|______|
|  *Total mostrado en Min o Cuartiles                 Pag: < [1] 2 3 ... 02 >  |
|______________________________________________________________________________|

D. Módulo de Reportes
________________________________________________________________________________
| REPORTES Y ANALÍTICA (Título)                                                |
|______________________________________________________________________________|
| FILTROS: [ 📅 Rango de Fechas ] [ Proyecto v ] [ Actividad v ]   [ EXPORTAR ]|
|______________________________________________________________________________|
|                                                                              |
|  [ KPI: Total Horas ]   [ KPI: Proy. Más Activo ]   [ KPI: Desviación ]      |
|       160 hrs                E-commerce                 +5%                  |
|                                                                              |
|  __________________________________    ____________________________________  |
|  | GRAFICO: DISTRIBUCIÓN TIEMPO   |    | TABLA: RESUMEN DE EJECUCIÓN      |  |
|  |         (  Chart  )            |    | - Tarea A: 10.5 hrs              |  |
|  |________________________________|    |__________________________________|  |
|______________________________________________________________________________|