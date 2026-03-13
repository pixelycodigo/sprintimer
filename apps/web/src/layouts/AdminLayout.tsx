import { Outlet, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FolderOpen,
  Tag,
  GraduationCap,
  Trash2,
  LogOut,
  Coins,
  DollarSign
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
  SidebarGroupLabel,
  SidebarMenuItem,
  SidebarMenuItemIcon,
} from '@ui/Sidebar';
import { Header, HeaderLeft, HeaderRight } from '@ui/Header';
import { Main, MainContent } from '@ui/Main';
import { Button } from '@ui/Button';
import { cn } from '../utils/cn';

const navigation = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { name: 'Clientes', path: '/admin/clientes', icon: Users },
  { name: 'Proyectos', path: '/admin/proyectos', icon: FolderOpen },
  { name: 'Actividades', path: '/admin/actividades', icon: Briefcase },
];

const teamWorkNav = [
  { name: 'Talents', path: '/admin/talents', icon: Briefcase },
  { name: 'Perfiles', path: '/admin/perfiles', icon: Tag },
  { name: 'Seniority', path: '/admin/seniorities', icon: GraduationCap },
  { name: 'Asignaciones', path: '/admin/asignaciones', icon: Users },
];

const otherNav = [
  { name: 'Divisas', path: '/admin/divisas', icon: Coins },
  { name: 'Costo por Hora', path: '/admin/costo-por-hora', icon: DollarSign },
  { name: 'Eliminados', path: '/admin/eliminados', icon: Trash2 },
];

export default function AdminLayout() {
  const sidebar = useSidebarStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

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
          {/* Main Navigation */}
          <SidebarGroup>
            {navigation.map((item) => (
              <SidebarMenuItem key={item.name}>
                <Link to={item.path} className="flex items-center gap-3">
                  <SidebarMenuItemIcon>
                    <item.icon className="w-5 h-5" aria-hidden="true" />
                  </SidebarMenuItemIcon>
                  {item.name}
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarGroup>

          {/* TeamWork Section */}
          <SidebarGroup>
            <SidebarGroupLabel>
              <FolderOpen className="w-5 h-5 mr-2" aria-hidden="true" />
              TeamWork
            </SidebarGroupLabel>
            {teamWorkNav.map((item) => (
              <SidebarMenuItem key={item.name}>
                <Link to={item.path} className="flex items-center gap-3 pl-8">
                  <SidebarMenuItemIcon>
                    <item.icon className="w-5 h-5" aria-hidden="true" />
                  </SidebarMenuItemIcon>
                  {item.name}
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarGroup>

          {/* Other Navigation */}
          <SidebarGroup>
            {otherNav.map((item) => (
              <SidebarMenuItem key={item.name}>
                <Link to={item.path} className="flex items-center gap-3">
                  <SidebarMenuItemIcon>
                    <item.icon className="w-5 h-5" aria-hidden="true" />
                  </SidebarMenuItemIcon>
                  {item.name}
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <Button variant="ghost" onClick={handleLogout} className="w-full justify-start">
            <LogOut className="w-5 h-5 mr-3" aria-hidden="true" />
            Cerrar sesión
          </Button>
        </SidebarFooter>
      </Sidebar>

      {/* Main content */}
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
              profileLink={buildPath('/admin/perfil')}
              settingsLink={buildPath('/admin/configuracion')}
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
