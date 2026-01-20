
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Courtroom, Court } from '@/utils/types';
import { STATUS_DISPLAY, STATUS_COLORS, COURT_STATUS_OPTIONS } from '@/utils/constants';

export default function ClerkDashboard() {
  const [assignedRoom, setAssignedRoom] = useState<Courtroom | null>(null);
  const [court, setCourt] = useState<Court | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchAssignedRoom = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: roomData } = await supabase
          .from('courtrooms')
          .select('*')
          .eq('assigned_clerk_id', user.id)
          .single();

        if (roomData) {
          setAssignedRoom(roomData);

          const { data: courtData } = await supabase
            .from('courts')
            .select('*')
            .eq('id', roomData.court_id)
            .single();

          setCourt(courtData);
        }
      }
      setLoading(false);
    };

    fetchAssignedRoom();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('clerk-updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'courtrooms' },
        (payload) => {
          if (assignedRoom && payload.new.id === assignedRoom.id) {
            setAssignedRoom(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleNextCase = async () => {
    if (!assignedRoom) return;
    setUpdating(true);

    const { error } = await supabase
      .from('courtrooms')
      .update({
        current_case_number: assignedRoom.current_case_number + 1,
        last_updated: new Date().toISOString(),
      })
      .eq('id', assignedRoom.id);

    if (!error) {
      setAssignedRoom({
        ...assignedRoom,
        current_case_number: assignedRoom.current_case_number + 1,
      });
    }
    setUpdating(false);
  };

  const handlePrevCase = async () => {
    if (!assignedRoom || assignedRoom.current_case_number <= 0) return;
    setUpdating(true);

    const { error } = await supabase
      .from('courtrooms')
      .update({
        current_case_number: assignedRoom.current_case_number - 1,
        last_updated: new Date().toISOString(),
      })
      .eq('id', assignedRoom.id);

    if (!error) {
      setAssignedRoom({
        ...assignedRoom,
        current_case_number: assignedRoom.current_case_number - 1,
      });
    }
    setUpdating(false);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!assignedRoom) return;
    setUpdating(true);

    const { error } = await supabase
      .from('courtrooms')
      .update({
        current_status: newStatus,
        last_updated: new Date().toISOString(),
      })
      .eq('id', assignedRoom.id);

    if (!error) {
      setAssignedRoom({
        ...assignedRoom,
        current_status: newStatus as any,
      });
    }
    setUpdating(false);
  };

  if (loading) {
    return <div className="text-center py-8">Loading assigned courtroom...</div>;
  }

  if (!assignedRoom) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg text-center">
        <p className="text-yellow-800 font-semibold">
          ⚠️ No courtroom assigned to you yet. Contact admin.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {court?.name}
        </h2>
        <p className="text-lg text-gray-600">
          {court?.district}
        </p>
      </div>

      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center mb-8">
        <p className="text-xl font-bold text-gray-900 mb-4">
          Courtroom: <span className="text-3xl text-blue-600">{assignedRoom.room_number}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-lg p-8 text-center">
          <p className="text-gray-700 font-semibold mb-2">Current Case Number</p>
          <p className="text-6xl font-bold text-green-600">
            #{assignedRoom.current_case_number}
          </p>
        </div>

        <div className={`border-2 rounded-lg p-8 text-center ${STATUS_COLORS[assignedRoom.current_status]}`}>
          <p className="text-gray-700 font-semibold mb-2">Current Status</p>
          <p className="text-3xl font-bold">
            {STATUS_DISPLAY[assignedRoom.current_status]}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Update Case Number</h3>
          <div className="flex gap-4 justify-center">
            <button
              onClick={handlePrevCase}
              disabled={updating || assignedRoom.current_case_number <= 0}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-lg text-2xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ➖ Previous
            </button>
            <button
              onClick={handleNextCase}
              disabled={updating}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg text-2xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ➕ Next
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Update Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {COURT_STATUS_OPTIONS.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={updating}
                className={`px-4 py-3 rounded-lg font-medium transition ${
                  assignedRoom.current_status === status
                    ? 'ring-2 ring-offset-2 ring-blue-500 ' + STATUS_COLORS[status]
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {STATUS_DISPLAY[status]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        Last updated: {new Date(assignedRoom.last_updated).toLocaleTimeString()}
      </div>
    </div>
  );
}