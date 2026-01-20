
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Court, Courtroom, Profile } from '@/utils/types';
import { STATUS_DISPLAY, STATUS_COLORS } from '@/utils/constants';

export default function CustomerDashboard() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [courtrooms, setCourtrooms] = useState<Courtroom[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedCourt, setSelectedCourt] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(profileData);

        const { data: courtsData } = await supabase
          .from('courts')
          .select('*');
        setCourts(courtsData || []);

        const { data: courtroomsData } = await supabase
          .from('courtrooms')
          .select('*');
        setCourtrooms(courtroomsData || []);
      }
      setLoading(false);
    };

    fetchData();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('courtrooms-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'courtrooms' },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setCourtrooms((prev) =>
              prev.map((cr) =>
                cr.id === payload.new.id ? payload.new : cr
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  const filteredRooms = selectedCourt
    ? courtrooms.filter((cr) => cr.court_id === selectedCourt)
    : courtrooms;

  const canSeeCase = profile?.tier === 'premium' || profile?.tier === 'paid';

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <p className="text-sm text-gray-600">
          Logged in as: <strong>{profile?.email}</strong> | Tier: <strong>{profile?.tier?.toUpperCase()}</strong>
        </p>
        {profile?.tier === 'free' && (
          <p className="text-sm text-orange-600 mt-2">
            💡 Upgrade to <strong>Paid</strong> or <strong>Premium</strong> to see live case numbers!
          </p>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Filter by Court Complex</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCourt(null)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              selectedCourt === null
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            All Courts
          </button>
          {courts.map((court) => (
            <button
              key={court.id}
              onClick={() => setSelectedCourt(court.id)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedCourt === court.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {court.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room) => {
          const court = courts.find((c) => c.id === room.court_id);
          return (
            <div
              key={room.id}
              className="bg-white border-2 border-gray-200 rounded-lg p-6 shadow-md hover:shadow-lg transition"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {court?.name} - {room.room_number}
              </h3>
              <p className="text-sm text-gray-600 mb-4">{court?.district}</p>

              <div
                className={`border-2 px-4 py-2 rounded-lg mb-4 text-center font-semibold ${STATUS_COLORS[room.current_status]}`}
              >
                {STATUS_DISPLAY[room.current_status]}
              </div>

              {canSeeCase ? (
                <div className="bg-green-50 border border-green-200 px-4 py-3 rounded-lg">
                  <p className="text-sm text-gray-600">Current Case #</p>
                  <p className="text-3xl font-bold text-green-600">
                    #{room.current_case_number}
                  </p>
                </div>
              ) : (
                <div className="bg-gray-100 border border-gray-300 px-4 py-3 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Case Number Hidden</p>
                  <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm mt-2">
                    ⬆️ Upgrade to see case numbers
                  </button>
                </div>
              )}

              <p className="text-xs text-gray-500 mt-4">
                Updated: {new Date(room.last_updated).toLocaleTimeString()}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
