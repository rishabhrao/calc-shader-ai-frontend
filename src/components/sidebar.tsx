import { Calculator, Trees } from 'lucide-react'

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from '@/components/ui/sidebar'
import { Link, useLocation } from '@tanstack/react-router'
import { ModeToggle } from './mode-toggle'

export function AppSidebar() {
	const location = useLocation()

	const sidebar = useSidebar()

	return (
		<Sidebar variant="sidebar">
			<SidebarHeader className="font-bold p-4 cursor-default flex flex-row items-center">
				<img src="/logo.svg" className="w-6 h-6 rounded-sm mr-1" /> Calc Shader AI
			</SidebarHeader>

			<SidebarContent>
				<SidebarMenu className="px-2">
					<SidebarMenuItem>
						<SidebarMenuButton asChild isActive={location.pathname === '/'}>
							<Link
								to="/"
								onClick={() => {
									sidebar.setOpenMobile(false)
								}}
							>
								<Calculator />

								<span>Calculator</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>

					<SidebarMenuItem>
						<SidebarMenuButton asChild isActive={location.pathname === '/shader'}>
							<Link
								to="/shader"
								onClick={() => {
									sidebar.setOpenMobile(false)
								}}
							>
								<Trees />

								<span>Shader</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarContent>

			<SidebarFooter>
				<div className="px-2 flex items-center justify-between text-sm">
					<p>
						Made by{' '}
						<a
							href="https://rao.dev"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:underline underline-offset-4"
						>
							Rishabh Rao
						</a>
					</p>

					<ModeToggle />
				</div>
			</SidebarFooter>
		</Sidebar>
	)
}
