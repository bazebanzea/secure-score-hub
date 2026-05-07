import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet, createRootRouteWithContext, useRouter, HeadContent, Scripts, Link,
} from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Search, Bell, ShieldCheck } from "lucide-react";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-mono text-7xl font-bold text-primary text-glow">404</h1>
        <p className="mt-2 text-sm text-muted-foreground">Signal lost. This route doesn't exist.</p>
        <Link to="/" className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Return to SOC</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Telemetry error</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button onClick={() => { router.invalidate(); reset(); }} className="mt-6 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">Retry</button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Sentinel — Cybersecurity Scoring Platform" },
      { name: "description", content: "Real-time cybersecurity posture scoring across NIST CSF, ISO 27001, and CIS Controls." },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <div className="flex flex-1 flex-col">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md">
              <SidebarTrigger />
              <div className="flex items-center gap-2 text-xs">
                <span className="font-mono uppercase tracking-[0.2em] text-muted-foreground">Tenant</span>
                <span className="font-mono font-semibold text-foreground">ACME-CORP</span>
                <span className="text-muted-foreground">/</span>
                <span className="font-mono text-muted-foreground">prod</span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <div className="hidden md:flex items-center gap-2 rounded-md border border-border bg-secondary/40 px-3 py-1.5 text-xs text-muted-foreground">
                  <Search className="h-3 w-3" />
                  <span className="font-mono">Search assets, CVEs…</span>
                  <kbd className="ml-4 rounded border border-border bg-background px-1 font-mono text-[10px]">⌘K</kbd>
                </div>
                <button className="relative rounded-md border border-border p-1.5 hover:bg-secondary">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-critical shadow-glow-critical" />
                </button>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-cyber">
                  <ShieldCheck className="h-4 w-4 text-primary-foreground" />
                </div>
              </div>
            </header>
            <main className="flex-1 overflow-x-hidden">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </QueryClientProvider>
  );
}
