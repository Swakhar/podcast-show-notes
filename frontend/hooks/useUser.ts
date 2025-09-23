import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

type User = {
  plan: "FREE" | "PRO" | "AGENCY";
  subscriptionStatus: string | null;
  monthlyMinutesLimit: number;
  monthlyMinutesUsed: number;
};

export function useUser() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      // If not authenticated, don't fetch user data
      if (status === 'unauthenticated') {
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Wait for session to load
      if (status === 'loading') {
        return;
      }

      try {
        const res = await fetch("/api/me");
        const data = await res.json();
        
        if (data.user) {
          setUser({
            plan: data.user.plan,
            subscriptionStatus: data.user.subscriptionStatus,
            monthlyMinutesLimit: data.user.monthlyMinutesLimit,
            monthlyMinutesUsed: data.user.monthlyMinutesUsed,
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [status]);

  return {
    user,
    isLoading: isLoading || status === 'loading',
    isAuthenticated: !!session,
    active: user?.subscriptionStatus === "active",
    plan: user?.plan || "FREE"
  };
}
