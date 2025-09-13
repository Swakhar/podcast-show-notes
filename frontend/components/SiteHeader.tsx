import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import useSWR from "swr";
import PlanBadge from "./PlanBadge";
import { useToast } from "../contexts/ToastContext";

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
});

type Me = {
  plan: "FREE" | "STARTER" | "PRO" | "AGENCY";
  subscriptionStatus: string | null;
  monthlyMinutesLimit: number;
  monthlyMinutesUsed: number;
  isTeamOwner?: boolean;
  isTeamMember?: boolean;
  ownedTeamsCount?: number;
  memberTeamsCount?: number;
};

export default function SiteHeader() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { showToast } = useToast();

  // Use SWR to fetch user data
  const { data: meData, error: meError } = useSWR(
    status === "authenticated" ? "/api/me" : null,
    fetcher,
    { 
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: false 
    }
  );

  const me = meData?.user as Me | null;
  const active = me?.subscriptionStatus === "active";
  const isAuthenticated = status === "authenticated";
  
  // Check if user is a team owner (has Agency plan and owns teams)
  const isTeamOwner = me?.plan === "AGENCY" && !me?.isTeamMember;
  // Check if user is only a team member (invited to teams but doesn't own subscription)
  const isOnlyTeamMember = me?.isTeamMember && !me?.isTeamOwner;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navigationItems = [
    { href: "/#features", label: "Features", public: true },
    { href: "/#pricing", label: "Pricing", public: true },
    { href: "/#demo", label: "Demo", public: true, hideWhenAuth: true },
    { href: "/generate", label: "Generate", authOnly: true, icon: "⚡" },
    { href: "/templates", label: "Templates", authOnly: true, icon: "📝" },
    // Only show Teams link for Agency users or team members
    { 
      href: "/teams", 
      label: "Teams", 
      authOnly: true, 
      icon: "👥",
      showForTeams: true // Show for both owners and members
    },
    { href: "/settings", label: "Settings", authOnly: true, icon: "⚙️" },
  ];

  const visibleNavItems = navigationItems.filter(item => {
    if (item.authOnly && !isAuthenticated) return false;
    if (item.hideWhenAuth && isAuthenticated) return false;
    if (!item.authOnly && !item.public) return false;
    
    // Show Teams link if user has Agency plan OR is a team member
    if (item.showForTeams) {
      return me?.plan === "AGENCY" || me?.isTeamMember;
    }
    
    return true;
  });

  return (
    <header className={`top-0 z-50 w-full sticky transition-all duration-200 ${
      scrolled 
        ? "backdrop-blur-md bg-white/90 shadow-sm border-b border-gray-200/60" 
        : "bg-white border-b border-gray-200"
    }`}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group" aria-label="CastLumen home">
            <img 
              src="/castlumen-wordmark.svg" 
              alt="CastLumen" 
              className="h-8 w-auto transition-transform group-hover:scale-105" 
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {visibleNavItems.map((item) => {
              const isActive = router.pathname === item.href.split('#')[0];
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {item.icon && <span className="text-base">{item.icon}</span>}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {/* User Info - Only show for team owners, not team members */}
            {me && !isOnlyTeamMember && (
              <div className="flex items-center gap-2">
                <PlanBadge plan={me.plan} />
                <div className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 border">
                  <span className="font-medium">{me.monthlyMinutesUsed}</span>
                  <span className="text-gray-500">/{me.monthlyMinutesLimit} min</span>
                </div>
              </div>
            )}

            {/* Team Member Status */}
            {me && isOnlyTeamMember && (
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700 border border-blue-200">
                  Team Member
                </span>
              </div>
            )}

            {/* Action Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {/* Only show billing for team owners, not team members */}
                {active && !isOnlyTeamMember ? (
                  <>
                    <button
                      onClick={async () => {
                        try {
                          const r = await fetch("/api/stripe/create-portal-session", { method: "POST" });
                          const { url, error } = await r.json();
                          if (error) return showToast(error, "error");
                          window.location.href = url;
                        } catch (error) {
                          showToast("Failed to open billing portal", "error");
                        }
                      }}
                      className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Billing
                    </button>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm"
                  >
                    Sign out
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link 
                  href="/generate" 
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Try Demo
                </Link>
                <Link 
                  href="/login" 
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-green-600 rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-sm"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-gray-200">
            <div className="flex flex-col gap-1 mt-4">
              {visibleNavItems.map((item) => {
                const isActive = router.pathname === item.href.split('#')[0];
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {item.icon && <span className="text-lg">{item.icon}</span>}
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Mobile User Info & Actions - Only for team owners */}
            {me && !isOnlyTeamMember && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <PlanBadge plan={me.plan} />
                  <div className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                    {me.monthlyMinutesUsed}/{me.monthlyMinutesLimit} min
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Team Member Status */}
            {me && isOnlyTeamMember && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700 border border-blue-200">
                    Team Member
                  </span>
                  <span className="text-xs text-gray-500">Billing managed by team owner</span>
                </div>
              </div>
            )}

            <div className="mt-3 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  {/* Only show billing for team owners */}
                  {active && !isOnlyTeamMember && (
                    <button
                      onClick={async () => {
                        try {
                          const r = await fetch("/api/stripe/create-portal-session", { method: "POST" });
                          const { url, error } = await r.json();
                          if (error) return showToast(error, "error");
                          window.location.href = url;
                        } catch (error) {
                          showToast("Failed to open billing portal", "error");
                        }
                      }}
                      className="w-full px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Manage Billing
                    </button>
                  )}
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/generate" 
                    className="w-full px-3 py-2 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Try Demo
                  </Link>
                  <Link 
                    href="/login" 
                    className="w-full px-4 py-2 text-sm font-medium text-center text-white bg-gradient-to-r from-green-500 to-green-600 rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
