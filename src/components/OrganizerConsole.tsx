import { useState } from 'react';
import { CheckCircle2, Edit3, Plus, RotateCcw, Search, Trash2, UserCheck, X } from 'lucide-react';
import type { CampusEvent } from '../types';
import { formatEventDate } from '../utils/eventUtils';

interface OrganizerConsoleProps {
  events: CampusEvent[];
  onCreateEvent: () => void;
  onEditEvent: (event: CampusEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  onToggleAttendeeCheckIn: (eventId: string, attendeeId: string) => void;
  onAddWalkInAttendee: (eventId: string, name: string, email: string) => void;
  onResetDemoData: () => void;
}

export function OrganizerConsole({
  events,
  onCreateEvent,
  onEditEvent,
  onDeleteEvent,
  onToggleAttendeeCheckIn,
  onAddWalkInAttendee,
  onResetDemoData,
}: OrganizerConsoleProps) {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(events[0]?.id ?? null);
  const [rosterQuery, setRosterQuery] = useState('');
  const [walkInName, setWalkInName] = useState('');
  const [walkInEmail, setWalkInEmail] = useState('');

  const activeRosterEvent = events.find((e) => e.id === selectedEventId) ?? null;

  const totalSeats = events.reduce((acc, e) => acc + e.capacity, 0);
  const totalRegistered = events.reduce((acc, e) => acc + e.registeredCount, 0);
  const avgFill = totalSeats > 0 ? Math.round((totalRegistered / totalSeats) * 100) : 0;
  const totalCheckIns = events.reduce(
    (acc, e) => acc + e.attendees.filter((a) => a.checkedIn).length,
    0
  );

  const filteredAttendees = activeRosterEvent
    ? activeRosterEvent.attendees.filter((a) => {
        const q = rosterQuery.trim().toLowerCase();
        if (!q) return true;
        return (
          a.name.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          a.passCode.toLowerCase().includes(q)
        );
      })
    : [];

  const handleWalkInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRosterEvent || !walkInName.trim() || !walkInEmail.trim()) return;
    onAddWalkInAttendee(activeRosterEvent.id, walkInName.trim(), walkInEmail.trim());
    setWalkInName('');
    setWalkInEmail('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      <div className="border-b border-stone-200 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-blue-800">Club & Faculty Operations</p>
          <h1 className="mt-1 font-serif text-3xl sm:text-4xl font-semibold text-zinc-900 text-balance">
            Organizer Console & Door Check-In
          </h1>
          <p className="mt-2 text-sm text-zinc-600 max-w-2xl">
            Manage published events, inspect seat utilization, and verify student entry passes at venue doors.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onResetDemoData}
            className="px-3.5 py-2 text-xs font-medium text-zinc-600 bg-white border border-stone-200 hover:bg-stone-50 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Data</span>
          </button>
          <button
            type="button"
            onClick={onCreateEvent}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Event</span>
          </button>
        </div>
      </div>

      {/* 4-column summary strip with tabular numerals */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-stone-200 rounded-lg p-5">
          <div className="text-xs text-zinc-500">Published Events</div>
          <div className="mt-1.5 font-mono text-2xl font-semibold text-zinc-900 tabular-nums">
            {events.length}
          </div>
        </div>
        <div className="bg-white border border-stone-200 rounded-lg p-5">
          <div className="text-xs text-zinc-500">Total Reservations</div>
          <div className="mt-1.5 font-mono text-2xl font-semibold text-zinc-900 tabular-nums">
            {totalRegistered}
          </div>
        </div>
        <div className="bg-white border border-stone-200 rounded-lg p-5">
          <div className="text-xs text-zinc-500">Average Capacity Fill</div>
          <div className="mt-1.5 font-mono text-2xl font-semibold text-zinc-900 tabular-nums">
            {avgFill}%
          </div>
        </div>
        <div className="bg-white border border-stone-200 rounded-lg p-5">
          <div className="text-xs text-zinc-500">Checked In Passes</div>
          <div className="mt-1.5 font-mono text-2xl font-semibold text-emerald-800 tabular-nums">
            {totalCheckIns}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Events Table */}
        <div className="lg:col-span-7 bg-white border border-stone-200 rounded-lg overflow-hidden">
          <div className="px-5 py-3.5 border-b border-stone-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900">Scheduled Programs</h2>
            <span className="text-xs text-zinc-500">Select a row to open door check-in</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-[11px] font-semibold text-zinc-500 bg-stone-50/70">
                  <th className="py-2.5 px-4">Event</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Reserved</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {events.map((ev) => {
                  const isSelected = ev.id === selectedEventId;
                  return (
                    <tr
                      key={ev.id}
                      className={`h-11 transition-colors ${
                        isSelected ? 'bg-blue-50/60' : 'hover:bg-stone-50'
                      }`}
                    >
                      <td className="py-2 px-4">
                        <button
                          type="button"
                          onClick={() => setSelectedEventId(ev.id)}
                          className="text-left font-medium text-zinc-900 hover:text-blue-800 line-clamp-1 cursor-pointer"
                        >
                          {ev.title}
                        </button>
                        <div className="text-[11px] text-zinc-500 truncate">
                          {ev.organizerName} · {ev.venue}
                        </div>
                      </td>
                      <td className="py-2 px-3 font-mono tabular-nums text-zinc-600 whitespace-nowrap">
                        {formatEventDate(ev.dateISO)}
                      </td>
                      <td className="py-2 px-3 font-mono tabular-nums text-right text-zinc-700 whitespace-nowrap">
                        {ev.registeredCount}/{ev.capacity}
                      </td>
                      <td className="py-2 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setSelectedEventId(ev.id)}
                            aria-label={`Open roster for ${ev.title}`}
                            className={`p-1.5 rounded transition-colors cursor-pointer ${
                              isSelected
                                ? 'text-blue-700 bg-blue-100'
                                : 'text-zinc-500 hover:text-zinc-900 hover:bg-stone-100'
                            }`}
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onEditEvent(ev)}
                            aria-label={`Edit ${ev.title}`}
                            className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-stone-100 rounded transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteEvent(ev.id)}
                            aria-label={`Delete ${ev.title}`}
                            className="p-1.5 text-zinc-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Attendee Check-In Drawer */}
        <div className="lg:col-span-5 bg-white border border-stone-200 rounded-lg overflow-hidden">
          {activeRosterEvent ? (
            <>
              <div className="px-5 py-3.5 border-b border-stone-200 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-medium text-blue-800">Door Check-In Roster</div>
                  <h2 className="text-sm font-semibold text-zinc-900 truncate mt-0.5">
                    {activeRosterEvent.title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedEventId(null)}
                  aria-label="Close roster"
                  className="p-1 text-zinc-400 hover:text-zinc-700 rounded cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 border-b border-stone-100 space-y-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={rosterQuery}
                    onChange={(e) => setRosterQuery(e.target.value)}
                    placeholder="Search pass ID, student name, or email..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#FAF9F6] border border-stone-200 rounded-md text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
                  />
                </div>
              </div>

              <div className="divide-y divide-stone-100 max-h-72 overflow-y-auto">
                {filteredAttendees.length === 0 ? (
                  <p className="p-6 text-xs text-zinc-500 text-center">
                    No matching registrants found for this event.
                  </p>
                ) : (
                  filteredAttendees.map((att) => (
                    <div
                      key={att.id}
                      className="px-4 py-2.5 flex items-center justify-between gap-3 text-xs hover:bg-stone-50"
                    >
                      <div className="min-w-0">
                        <div className="font-medium text-zinc-900 truncate">{att.name}</div>
                        <div className="text-[11px] text-zinc-500 font-mono tabular-nums truncate">
                          {att.passCode} · {att.email}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onToggleAttendeeCheckIn(activeRosterEvent.id, att.id)}
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded transition-colors flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer ${
                          att.checkedIn
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-stone-100 text-zinc-700 hover:bg-stone-200'
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{att.checkedIn ? 'Checked In' : 'Check In'}</span>
                      </button>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleWalkInSubmit} className="p-4 bg-stone-50/70 border-t border-stone-200 space-y-2.5">
                <div className="text-xs font-semibold text-zinc-700">Register Walk-In Student</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={walkInName}
                    onChange={(e) => setWalkInName(e.target.value)}
                    placeholder="Student full name"
                    className="px-2.5 py-1.5 text-xs bg-white border border-stone-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-700"
                  />
                  <input
                    type="email"
                    value={walkInEmail}
                    onChange={(e) => setWalkInEmail(e.target.value)}
                    placeholder="student@campus.edu"
                    className="px-2.5 py-1.5 text-xs bg-white border border-stone-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-700"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-1.5 px-3 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-md transition-colors cursor-pointer"
                >
                  Issue Walk-In Pass & Check In
                </button>
              </form>
            </>
          ) : (
            <div className="p-8 text-center text-xs text-zinc-500">
              Select any scheduled event from the table to inspect attendees and verify passes.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
