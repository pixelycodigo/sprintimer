import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  CheckSquare,
  ListTodo,
  LogOut,
  Trash2
} from 'lucide-react';
import { useSidebarStore } from '../stores/sidebar.store';
import { useAuthStore } from '../stores/auth.store';
import { getLoginPath, buildPath } from '../utils/getBasePath';

import { ThemeToggle } from '@ui/ThemeToggle';
import { SidebarToggle } from '@ui/SidebarToggle';
import { UserMenuProfile } from '@ui/UserMenu';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarMenuItem,
  SidebarMenuItemIcon,
} from '@ui/Sidebar';
import { Header, HeaderLeft, HeaderRight } from '@ui/Header';
import { Main, MainContent } from '@ui/Main';
import { Button } from '@ui/Button';
import { cn } from '../utils/cn';

const navigation = [
  { name: 'Dashboard', path: '/talent', icon: LayoutDashboard },
  { name: 'Mis Proyectos', path: '/talent/proyectos', icon: Briefcase },
  { name: 'Mis Actividades', path: '/talent/actividades', icon: ListTodo },
  { name: 'Mis Tareas', path: '/talent/tareas', icon: CheckSquare },
  { name: 'Tareas Eliminadas', path: '/talent/tareas/eliminadas', icon: Trash2 },
];

export default function TalentLayout() {
  const sidebar = useSidebarStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate(getLoginPath());
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">
      <Sidebar collapsed={!sidebar.isOpen}>
        <SidebarHeader>
          <h1 className="text-xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">SPRINTASK</h1>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            {navigation.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              return (
                <SidebarMenuItem
                  key={item.name}
                  href={buildPath(item.path)}
                  active={isActive}
                  className="flex items-center gap-3"
                >
                  <SidebarMenuItemIcon>
                    <item.icon className="w-5 h-5" aria-hidden="true" />
                  </SidebarMenuItemIcon>
                  {item.name}
                </SidebarMenuItem>
              );
            })}
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <Button variant="ghost" onClick={handleLogout} className="w-full justify-start">
            <LogOut className="w-5 h-5 mr-3" aria-hidden="true" />
            Cerrar sesión
          </Button>
        </SidebarFooter>
      </Sidebar>

      <div className={cn('flex flex-col transition-all duration-300', sidebar.isOpen ? 'ml-[260px]' : 'ml-0')}>
        <Header>
          <HeaderLeft>
            <SidebarToggle isOpen={sidebar.isOpen} onToggle={sidebar.toggle} />
          </HeaderLeft>

          <HeaderRight className="flex-shrink-0">
            <ThemeToggle />
            <UserMenuProfile
              user={{
                nombre: user?.nombre || '',
                rol: user?.rol || '',
                avatar: user?.avatar,
              }}
              onLogout={handleLogout}
              profileLink={buildPath('/talent/perfil')}
              settingsLink={buildPath('/talent/configuracion')}
            />
          </HeaderRight>
        </Header>

        <Main>
          <MainContent>
            <Outlet />
          </MainContent>
        </Main>
      </div>
    </div>
  );
}
