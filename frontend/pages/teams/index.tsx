import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import useSWR from "swr";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
});

export default function Teams() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showUnauthorized, setShowUnauthorized] = useState(false);
  
  const { data: me, error: meError } = useSWR(
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

  const { data: teams, mutate, error: teamsError } = useSWR(
    me?.user?.plan === "AGENCY" ? "/api/teams" : null, 
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

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [loading, setLoading] = useState(false);

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
    if (teamsError && teamsError.message.includes('403')) {
      setShowUnauthorized(true);
    }
  }, [meError, teamsError]);

  // Show loading state
  if (status === "loading" || (status === "authenticated" && !me)) {
    return (
      <>
        <Head>
          <title>Teams – CastLumen</title>
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

  // Show unauthorized access message
  if (showUnauthorized || (me && me.user?.plan !== "AGENCY")) {
    return (
      <>
        <Head>
          <title>Teams – CastLumen</title>
          <meta name="description" content="Collaborate with your team on podcast content creation" />
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
                <strong>Unauthorized Access:</strong> You don't have permission to access this feature.
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
                    href="/" 
                    className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Go Home
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

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: teamName.trim(),
          description: teamDescription.trim() || null,
        }),
      });

      if (response.ok) {
        setTeamName("");
        setTeamDescription("");
        setCreateModalOpen(false);
        mutate();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create team");
      }
    } catch (error) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Teams – CastLumen</title>
        <meta name="description" content="Collaborate with your team on podcast content creation" />
      </Head>

      <SiteHeader />

      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="text-center">
              <h1 className="text-4xl font-black mb-4">Team Collaboration</h1>
              <p className="text-xl text-blue-100">Work together to create amazing podcast content</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Create Team Button */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Your Teams</h2>
              <p className="text-gray-600">Manage and collaborate with your team members</p>
            </div>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-[#9CEE69] to-green-400 text-gray-900 font-semibold rounded-lg hover:shadow-lg transition-all duration-200"
            >
              Create Team
            </button>
          </div>

          {/* Teams Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams?.map((team: any) => (
              <div key={team.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{team.name}</h3>
                    {team.description && (
                      <p className="text-gray-600 text-sm mt-1">{team.description}</p>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {team._count.memberships} member{team._count.memberships !== 1 ? 's' : ''}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {team.owner.name?.charAt(0) || team.owner.email?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{team.owner.name || team.owner.email}</p>
                    <p className="text-xs text-gray-500">Owner</p>
                  </div>
                </div>

                <Link
                  href={`/teams/${team.id}`}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center block"
                >
                  View Team
                </Link>
              </div>
            ))}
          </div>

          {teams?.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No teams yet</h3>
              <p className="text-gray-600 mb-4">Create your first team to start collaborating</p>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-[#9CEE69] to-green-400 text-gray-900 font-semibold rounded-lg hover:shadow-lg transition-all duration-200"
              >
                Create Your First Team
              </button>
            </div>
          )}
        </div>

        {/* Create Team Modal */}
        {createModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Team</h3>
              
              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Team Name
                  </label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter team name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={teamDescription}
                    onChange={(e) => setTeamDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe your team's purpose"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !teamName.trim()}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-[#9CEE69] to-green-400 text-gray-900 font-semibold rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                  >
                    {loading ? "Creating..." : "Create Team"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </>
  );
}
