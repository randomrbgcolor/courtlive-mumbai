
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Profile, Court, Courtroom } from '@/utils/types';

export default function AdminDashboard() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [courtrooms, setCourtrooms] = useState<Courtroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [newCourt, setNewCourt] = useState({ name: '', district: '' });
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: usersData } = await supabase.from('profiles').select('*');
      const { data: courtsData } = await supabase.from('courts').select('*');
      const { data: courtroomsData } = await supabase
        .from('courtrooms')
        .select('*');

      setUsers(usersData || []);
      setCourts(courtsData || []);
      setCourtrooms(courtroomsData || []);
      setLoading(false);
    };

    fetchData();
  }, [supabase]);

  const handleUserTierChange = async (userId: string, newTier: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ tier: newTier })
      .eq('id', userId);

    if (!error) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, tier: newTier as any } : u))
      );
      setEditingUser(null);
    }
  };

  const handleUserRoleChange = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (!error) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole as any } : u))
      );
    }
  };

  const handleAssignClerk = async (courtroomId: number, clerkId: string) => {
    const { error } = await supabase
      .from('courtrooms')
      .update({ assigned_clerk_id: clerkId })
      .eq('id', courtroomId);

    if (!error) {
      setCourtrooms((prev) =>
        prev.map((cr) =>
          cr.id === courtroomId ? { ...cr, assigned_clerk_id: clerkId } : cr
        )
      );
    }
  };

  const handleAddCourt = async () => {
    if (!newCourt.name || !newCourt.district) return;

    const { data, error } = await supabase
      .from('courts')
      .insert([{ name: newCourt.name, district: newCourt.district }])
      .select();

    if (!error && data) {
      setCourts([...courts, data[0]]);
      setNewCourt({ name: '', district: '' });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  const clerks = users.filter((u) => u.role === 'clerk');

  return (
    <div className="space-y-8">
      {/* User Management */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">User Management</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2 text-left">Email</th>
                <th className="border px-4 py-2 text-left">Role</th>
                <th className="border px-4 py-2 text-left">Tier</th>
                <th className="border px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{user.email}</td>
                  <td className="border px-4 py-2">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleUserRoleChange(user.id, e.target.value)
                      }
                      className="px-2 py-1 border rounded"
                    >
                      <option value="customer">Customer</option>
                      <option value="clerk">Clerk</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="border px-4 py-2">
                    <select
                      value={user.tier}
                      onChange={(e) =>
                        handleUserTierChange(user.id, e.target.value)
                      }
                      className="px-2 py-1 border rounded"
                    >
                      <option value="free">Free</option>
                      <option value="paid">Paid</option>
                      <option value="premium">Premium</option>
                    </select>
                  </td>
                  <td className="border px-4 py-2">
                    <span className="text-sm text-gray-500">Updated</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Court Management */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Court Management</h2>
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Court Name (e.g., Bombay High Court)"
              value={newCourt.name}
              onChange={(e) =>
                setNewCourt({ ...newCourt, name: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg"
            />
            <input
              type="text"
              placeholder="District (e.g., Mumbai - Fort)"
              value={newCourt.district}
              onChange={(e) =>
                setNewCourt({ ...newCourt, district: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg"
            />
            <button
              onClick={handleAddCourt}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              Add Court
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2 text-left">Court Name</th>
                <th className="border px-4 py-2 text-left">District</th>
                <th className="border px-4 py-2 text-left">Courtrooms</th>
              </tr>
            </thead>
            <tbody>
              {courts.map((court) => {
                const courtRoomCount = courtrooms.filter(
                  (cr) => cr.court_id === court.id
                ).length;
                return (
                  <tr key={court.id} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">{court.name}</td>
                    <td className="border px-4 py-2">{court.district}</td>
                    <td className="border px-4 py-2">{courtRoomCount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clerk Assignment */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Assign Clerks to Courtrooms</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2 text-left">Court</th>
                <th className="border px-4 py-2 text-left">Courtroom</th>
                <th className="border px-4 py-2 text-left">Assigned Clerk</th>
                <th className="border px-4 py-2 text-left">Assign Clerk</th>
              </tr>
            </thead>
            <tbody>
              {courtrooms.map((room) => {
                const court = courts.find((c) => c.id === room.court_id);
                const assignedClerk = users.find(
                  (u) => u.id === room.assigned_clerk_id
                );
                return (
                  <tr key={room.id} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">{court?.name}</td>
                    <td className="border px-4 py-2">{room.room_number}</td>
                    <td className="border px-4 py-2">
                      {assignedClerk?.email || 'Unassigned'}
                    </td>
                    <td className="border px-4 py-2">
                      <select
                        value={room.assigned_clerk_id || ''}
                        onChange={(e) =>
                          handleAssignClerk(room.id, e.target.value)
                        }
                        className="px-2 py-1 border rounded text-sm"
                      >
                        <option value="">Select Clerk</option>
                        {clerks.map((clerk) => (
                          <option key={clerk.id} value={clerk.id}>
                            {clerk.email}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}