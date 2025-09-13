import { useRouter } from "next/router";
import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import useSWR from "swr";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import { useToast } from "../../contexts/ToastContext";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function TeamDetail() {
  const router = useRouter();
  const { teamId } = router.query;
  
  const { data: me } = useSWR("/api/me", fetcher);
  const { data: team, mutate } = useSWR(teamId ? `/api/teams/${teamId}` : null, fetcher);
  
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  // Plan restriction check
  if (me?.plan !== "AGENCY") {
    return (
      <>
        <Head>
          <title>Team Access Restricted – CastLumen</title>
        </Head>
        
        <SiteHeader />
        
        <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
          <div className="max-w-4xl mx-auto px-4 py-16">
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-4a2 2 0 00-2-2H6a2 2 0 00-2 2v4a2 2 0 002 2zM12 9V7a4 4 0 118 0v2" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Agency Plan Required</h3>
                <p className="text-gray-600 mb-4">Teams functionality is only available for Agency plan users.</p>
                <Link href="/#pricing" className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#9CEE69] to-green-400 text-gray-900 font-semibold rounded-lg hover:shadow-lg transition-all duration-200">
                  Upgrade to Agency
                </Link>
              </div>
            </div>
          </div>
        </main>
        
        <SiteFooter />
      </>
    );
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/teams/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId,
          email: inviteEmail.trim(),
        }),
      });

      if (response.ok) {
        setInviteEmail("");
        mutate(); // Refresh team data
        showToast("Invitation sent successfully!", "success");
      } else {
        const error = await response.json();
        showToast(error.error || "Failed to send invitation", "error");
      }
    } catch (error) {
      showToast("Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!team) {
    return (
      <>
        <SiteHeader />
        <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading team...</p>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{team.name} – CastLumen Teams</title>
        <meta name="description" content={`Collaborate with ${team.name} team on podcast content`} />
      </Head>

      <SiteHeader />

      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/teams" className="text-blue-200 hover:text-white">
                ← Back to Teams
              </Link>
            </div>
            <h1 className="text-4xl font-black mb-2">{team.name}</h1>
            {team.description && (
              <p className="text-xl text-blue-100">{team.description}</p>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Team Members */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Team Members</h2>
                
                <div className="space-y-4">
                  {/* Owner */}
                  <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {team.owner.name?.charAt(0) || team.owner.email?.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{team.owner.name || team.owner.email}</p>
                      <p className="text-sm text-gray-600">{team.owner.email}</p>
                    </div>
                    <span className="px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                      Owner
                    </span>
                  </div>

                  {/* Members */}
                  {team.memberships?.map((membership: any) => (
                    <div key={membership.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {membership.user.name?.charAt(0) || membership.user.email?.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{membership.user.name || membership.user.email}</p>
                        <p className="text-sm text-gray-600">{membership.user.email}</p>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                        {membership.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Invite Panel */}
            <div>
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Invite Members</h3>
                
                <form onSubmit={handleInvite} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="colleague@example.com"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      User must already have a CastLumen account
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !inviteEmail.trim()}
                    className="w-full px-4 py-2 bg-gradient-to-r from-[#9CEE69] to-green-400 text-gray-900 font-semibold rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                  >
                    {loading ? "Sending..." : "Send Invitation"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
