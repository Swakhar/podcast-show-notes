import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import { useToast } from "../../contexts/ToastContext";

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
});

export default function TeamDetail() {
  const router = useRouter();
  const { teamId } = router.query;
  const { data: session, status } = useSession();
  const { showToast } = useToast();
  
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [showUnauthorized, setShowUnauthorized] = useState(false);

  // Get user data
  const { data: meData, error: meError } = useSWR(
    status === "authenticated" ? "/api/me" : null,
    fetcher,
    { 
      shouldRetryOnError: false,
      onError: (error) => {
        if (error.message.includes('403') || error.message.includes('401')) {
          setShowUnauthorized(true);
        }
      }
    }
  );

  // Get team data
  const { data: teamData, mutate, error: teamError } = useSWR(
    teamId ? `/api/teams/${teamId}` : null, 
    fetcher,
    { 
      shouldRetryOnError: false,
      onError: (error) => {
        if (error.message.includes('403')) {
          setShowUnauthorized(true);
        }
      }
    }
  );

  const me = meData?.user;
  const team = teamData?.team || teamData; // Handle different response formats

  // Check if user has access to teams (Agency plan OR is team member)
  const hasTeamAccess = me?.plan === "AGENCY" || me?.isTeamMember;
  
  // Check if user is team owner
  const isTeamOwner = team?.ownerId === me?.id;
  
  // Check if user is team member
  const isTeamMember = team?.memberships?.some((membership: any) => membership.userId === me?.id);
  
  // User has access if they're the owner OR a member
  const hasAccessToThisTeam = isTeamOwner || isTeamMember;

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Handle unauthorized access
  useEffect(() => {
    if (meError && (meError.message.includes('403') || meError.message.includes('401'))) {
      setShowUnauthorized(true);
    }
    if (teamError && teamError.message.includes('403')) {
      setShowUnauthorized(true);
    }
  }, [meError, teamError]);

  // Show loading state
  if (status === "loading" || (status === "authenticated" && !me)) {
    return (
      <>
        <Head>
          <title>Loading Team – CastLumen</title>
        </Head>
        <SiteHeader />
        <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  // Show unauthorized access if user doesn't have team access at all
  if (showUnauthorized || (me && !hasTeamAccess)) {
    return (
      <>
        <Head>
          <title>Team Access Restricted – CastLumen</title>
        </Head>
        
        <SiteHeader />
        
        {/* Unauthorized Access Banner */}
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <strong>Unauthorized Access:</strong> You need an Agency plan subscription to access teams.
              </p>
            </div>
          </div>
        </div>
        
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
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link 
                    href="/#pricing" 
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#9CEE69] to-green-400 text-gray-900 font-semibold rounded-lg hover:shadow-lg transition-all duration-200"
                  >
                    Upgrade to Agency
                  </Link>
                  <Link 
                    href="/teams" 
                    className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back to Teams
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <SiteFooter />
      </>
    );
  }

  // Show loading state for team data
  if (!team && !teamError) {
    return (
      <>
        <Head>
          <title>Loading Team – CastLumen</title>
        </Head>
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

  // Show error if team not found or no access to this specific team
  if (teamError || (team && !hasAccessToThisTeam)) {
    return (
      <>
        <Head>
          <title>Team Not Found – CastLumen</title>
        </Head>
        <SiteHeader />
        <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
          <div className="max-w-4xl mx-auto px-4 py-16">
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.178 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Team Not Found</h3>
                <p className="text-gray-600 mb-4">
                  This team doesn't exist or you don't have access to it.
                </p>
                <Link 
                  href="/teams" 
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Back to Teams
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

    // Only team owners can invite members
    if (!isTeamOwner) {
      showToast("Only team owners can invite members", "error");
      return;
    }

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

  const handleRemoveMember = async (membershipId: string) => {
    if (!isTeamOwner) {
      showToast("Only team owners can remove members", "error");
      return;
    }

    if (!confirm("Are you sure you want to remove this member?")) {
      return;
    }

    try {
      const response = await fetch(`/api/teams/${teamId}/members/${membershipId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        mutate(); // Refresh team data
        showToast("Member removed successfully", "success");
      } else {
        const error = await response.json();
        showToast(error.error || "Failed to remove member", "error");
      }
    } catch (error) {
      showToast("Something went wrong", "error");
    }
  };

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
              <Link href="/teams" className="text-blue-200 hover:text-white transition-colors">
                ← Back to Teams
              </Link>
            </div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-4xl font-black">{team.name}</h1>
              {isTeamOwner && (
                <span className="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full">
                  Owner
                </span>
              )}
              {isTeamMember && !isTeamOwner && (
                <span className="px-3 py-1 bg-green-500 text-white text-sm font-semibold rounded-full">
                  Member
                </span>
              )}
            </div>
            {team.description && (
              <p className="text-xl text-blue-100">{team.description}</p>
            )}
            
            {/* Debug info */}
            <div className="mt-4 text-sm text-blue-200">
              <p>Your Role: {isTeamOwner ? 'Owner' : isTeamMember ? 'Member' : 'No Access'}</p>
              <p>Team ID: {teamId}</p>
            </div>
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
                        {team.owner?.name?.charAt(0) || team.owner?.email?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{team.owner?.name || team.owner?.email || 'Unknown'}</p>
                      <p className="text-sm text-gray-600">{team.owner?.email}</p>
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
                          {membership.user?.name?.charAt(0) || membership.user?.email?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{membership.user?.name || membership.user?.email || 'Unknown'}</p>
                        <p className="text-sm text-gray-600">{membership.user?.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                          {membership.role || 'Member'}
                        </span>
                        {/* Only show remove button for team owners */}
                        {isTeamOwner && (
                          <button
                            onClick={() => handleRemoveMember(membership.id)}
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
                            title="Remove member"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* No members message */}
                  {(!team.memberships || team.memberships.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No team members yet.</p>
                      {isTeamOwner && <p className="text-sm mt-1">Invite colleagues to join your team!</p>}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Invite Panel - Only show for team owners */}
            <div>
              {isTeamOwner ? (
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
              ) : (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Team Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Your Role</p>
                      <p className="text-gray-900">Team Member</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Team Owner</p>
                      <p className="text-gray-900">{team.owner?.name || team.owner?.email}</p>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Only team owners can invite new members and manage the team.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
