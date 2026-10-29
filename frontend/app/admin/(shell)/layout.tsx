import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";

/** Layout for the authenticated admin shell — all sections except login/register */
export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#f0f2ff] dark:bg-[#0a0a0f] text-slate-900 dark:text-slate-100 transition-colors">
      {/* Subtle mesh background for light mode */}
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "radial-gradient(ellipse at 20% 40%, rgba(99,102,241,0.07) 0%, transparent 55%), radial-gradient(ellipse at 80% 15%, rgba(139,92,246,0.05) 0%, transparent 50%)"
        }}
      />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <TopBar />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

