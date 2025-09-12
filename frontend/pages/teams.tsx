import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

interface Team {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  members: {
    id: string;
    role: string;
    user: {
      name: string | null;
      email: string;
    };
  }[];
}

interface Membership {
  id: string;
  role: string;
  team: {
    id: string;
    name: string;
    ownerId: string;
  };
}

export default function TeamsPage() {
  const { data: session, status } = useSession();
  const [teams, setTeams] = useState<Team[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"owned" | "member">("owned");
  
  // Form states
  const [teamName, setTeamName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  // Fetch teams and memberships
  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    }
  }, [status]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      // You'll need to create these API endpoints
      const [teamsRes, membershipsRes] = await Promise.all([
        fetch("/api/teams/owned"),
        fetch("/api/teams/memberships")
      ]);
      
      const teamsData = await teamsRes.json();
      const membershipsData = await membershipsRes.json();
      
      setTeams(teamsData.teams || []);
      setMemberships(membershipsData.memberships || []);
    } catch (error) {
      console.error("Failed to fetch teams:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    setIsCreating(true);
    try {
      const res = await fetch("/api/teams/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: teamName.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        setTeamName("");
        await fetchData();
        alert("Team created successfully!");
      } else {
        alert(data.error || "Failed to create team");
      }
    } catch (error) {
      console.error("Error creating team:", error);
      alert("Failed to create team");
    } finally {
      setIsCreating(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamId || !inviteEmail.trim()) return;

    setIsInviting(true);
    try {
      const res = await fetch("/api/teams/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          teamId: selectedTeamId, 
          email: inviteEmail.trim() 
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setInviteEmail("");
        setSelectedTeamId("");
        await fetchData();
        alert("Invitation sent successfully!");
      } else {
        alert(data.error || "Failed to send invitation");
      }
    } catch (error) {
      console.error("Error sending invitation:", error);
      alert("Failed to send invitation");
    } finally {
      setIsInviting(false);
    }
  };

  const handleLeaveTeam = async (membershipId: string, teamName: string) => {
    if (!confirm(`Are you sure you want to leave "${teamName}"?`)) return;

    try {
      const res = await fetch("/api/teams/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ membershipId }),
      });

      if (res.ok) {
        await fetchData();
        alert("Successfully left the team");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to leave team");
      }
    } catch (error) {
      console.error("Error leaving team:", error);
      alert("Failed to leave team");
    }
  };

  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    if (!confirm(`Are you sure you want to delete "${teamName}"? This action cannot be undone.`)) return;

    try {
      const res = await fetch("/api/teams/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId }),
      });

      if (res.ok) {
        await fetchData();
        alert("Team deleted successfully");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete team");
      }
    } catch (error) {
      console.error("Error deleting team:", error);
      alert("Failed to delete team");
    }
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return (
      <>
        <Head><title>Teams - Sign in required</title></Head>
        <SiteHeader />
        <main className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Sign in required</h1>
          <p className="text-gray-600">Please sign in to manage your teams.</p>
        </main>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <Head><title>Teams - AI Podcast Show Notes</title></Head>
      <SiteHeader />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Teams</h1>
            <p className="text-gray-600 mt-1">Collaborate with your team on podcast content generation</p>
          </div>
          <Link 
            href="/generate" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Generate
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Forms Section */}
          <div className="space-y-6">
            {/* Create Team */}
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Create New Team</h2>
              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team Name
                  </label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="e.g., Marketing Team"
                    required
                    disabled={isCreating}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isCreating || !teamName.trim()}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? "Creating..." : "Create Team"}
                </button>
              </form>
            </div>

            {/* Invite Member */}
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Invite Team Member</h2>
              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Team
                  </label>
                  <select
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                    required
                    disabled={isInviting}
                  >
                    <option value="">Choose a team...</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="colleague@example.com"
                    required
                    disabled={isInviting}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isInviting || !selectedTeamId || !inviteEmail.trim()}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isInviting ? "Sending..." : "Send Invitation"}
                </button>
              </form>
            </div>
          </div>

          {/* Teams List Section */}
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Your Teams</h2>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab("owned")}
                  className={`px-3 py-1 rounded-md text-sm transition ${
                    activeTab === "owned"
                      ? "bg-white shadow text-gray-900"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Owned ({teams.length})
                </button>
                <button
                  onClick={() => setActiveTab("member")}
                  className={`px-3 py-1 rounded-md text-sm transition ${
                    activeTab === "member"
                      ? "bg-white shadow text-gray-900"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Member ({memberships.length})
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {activeTab === "owned" ? (
                  teams.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No teams created yet.</p>
                      <p className="text-sm mt-1">Create your first team to start collaborating!</p>
                    </div>
                  ) : (
                    teams.map((team) => (
                      <div key={team.id} className="border rounded-md p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-lg">{team.name}</h3>
                            <p className="text-sm text-gray-500">
                              {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                            </p>
                            <div className="mt-2 space-y-1">
                              {team.members.map((member) => (
                                <div key={member.id} className="text-xs text-gray-600 flex items-center gap-2">
                                  <span>{member.user.name || member.user.email}</span>
                                  <span className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">
                                    {member.role.toLowerCase()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteTeam(team.id, team.name)}
                            className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 ml-2"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )
                ) : (
                  memberships.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>You're not a member of any teams yet.</p>
                      <p className="text-sm mt-1">Ask a team owner to invite you!</p>
                    </div>
                  ) : (
                    memberships.map((membership) => (
                      <div key={membership.id} className="border rounded-md p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-lg">{membership.team.name}</h3>
                            <p className="text-sm text-gray-500">
                              Role: {membership.role.toLowerCase()}
                            </p>
                          </div>
                          <button
                            onClick={() => handleLeaveTeam(membership.id, membership.team.name)}
                            className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200 ml-2"
                          >
                            Leave
                          </button>
                        </div>
                      </div>
                    ))
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-12 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-center mb-6">Team Benefits</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Collaborative Workflow</h3>
              <p className="text-sm text-gray-600">Work together on podcast content with shared access and permissions</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Shared Templates</h3>
              <p className="text-sm text-gray-600">Create and share custom templates across your team for consistent content</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Faster Production</h3>
              <p className="text-sm text-gray-600">Streamline your podcast production with team collaboration tools</p>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
