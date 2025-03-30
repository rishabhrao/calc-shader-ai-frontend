import { Outlet, createRootRoute } from '@tanstack/react-router'
// import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/sidebar'
import { ThemeProvider } from '@/components/theme-provider'
import { useIsMobile } from '@/hooks/use-mobile'

export const Route = createRootRoute({
	component: () => {
		const isMobile = useIsMobile()

		return (
			<>
				<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
					<SidebarProvider>
						<AppSidebar />

						<main className="flex flex-col w-screen h-screen">
							{isMobile ? (
								<header className="my-4 px-2">
									<SidebarTrigger />
								</header>
							) : null}

							<Outlet />
						</main>
					</SidebarProvider>
				</ThemeProvider>

				{/* <TanStackRouterDevtools /> */}
			</>
		)
	},
})
