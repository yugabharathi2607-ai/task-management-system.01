import { Bookmark, Calendar, CalendarPlus, Check, MapPin, Ticket } from 'lucide-react';
import type { CampusEvent, RsvpRecord } from '../types';
import { buildPassMatrix, downloadEventIcs, formatEventDate, formatTimeRange } from '../utils/eventUtils';
import { ResilientImage } from './ResilientImage';

interface ScheduleViewProps {
  events: CampusEvent[];
  rsvps: Record<string, RsvpRecord>;
  savedIds: string[];
  onOpenDetail: (event: CampusEvent) => void;
  onToggleRsvp: (event: CampusEvent) => void;
  onToggleSave: (eventId: string) => void;
  onBrowseEvents: () => void;
}

export function ScheduleView({
  events,
  rsvps,
  savedIds,
  onOpenDetail,
  onToggleRsvp,
  onToggleSave,
  onBrowseEvents,
}: ScheduleViewProps) {
  const registeredEvents = events
    .filter((ev) => Boolean(rsvps[ev.id]))
    .sort((a, b) => `${a.dateISO} ${a.startTime}`.localeCompare(`${b.dateISO} ${b.startTime}`));

  const savedOnlyEvents = events
    .filter((ev) => savedIds.includes(ev.id) && !rsvps[ev.id])
    .sort((a, b) => `${a.dateISO} ${a.startTime}`.localeCompare(`${b.dateISO} ${b.startTime}`));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-12">
      <div className="border-b border-stone-200 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-blue-800">Personal Itinerary</p>
          <h1 className="mt-1 font-serif text-3xl sm:text-4xl font-semibold text-zinc-900 text-balance">
            My Schedule & Entry Passes
          </h1>
          <p className="mt-2 text-sm text-zinc-600 max-w-2xl">
            Manage confirmed reservations, export calendar invites, and review saved events across the semester.
          </p>
        </div>

        <button
          type="button"
          onClick={onBrowseEvents}
          className="px-4 py-2 text-sm font-medium text-zinc-800 bg-white border border-stone-200 hover:bg-stone-50 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Browse Directory
        </button>
      </div>

      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-xl font-semibold text-zinc-900">
            Confirmed Reservations ({registeredEvents.length})
          </h2>
        </div>

        {registeredEvents.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-lg p-10 text-center">
            <Ticket className="w-8 h-8 text-zinc-400 mx-auto mb-3" strokeWidth={1.5} />
            <h3 className="text-base font-semibold text-zinc-900">No active reservations yet</h3>
            <p className="mt-1 text-sm text-zinc-600 max-w-md mx-auto">
              Reserve a seat on any campus event to generate an instant entry pass and add it to your schedule.
            </p>
            <button
              type="button"
              onClick={onBrowseEvents}
              className="mt-5 px-5 py-2.5 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-md transition-colors cursor-pointer"
            >
              Explore Campus Events
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {registeredEvents.map((ev) => {
              const rsvp = rsvps[ev.id];
              const matrix = buildPassMatrix(rsvp.passCode);
              return (
                <article
                  key={ev.id}
                  className="bg-white border border-stone-200 rounded-lg overflow-hidden flex flex-col sm:flex-row"
                >
                  <div className="sm:w-44 aspect-[4/3] sm:aspect-auto bg-stone-100 shrink-0">
                    <ResilientImage
                      src={ev.imageUrl}
                      alt={ev.title}
                      fallbackLabel={ev.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 p-5 flex flex-col justify-between gap-4">
                    <div>
                      <div className="flex items-center justify-between gap-2 text-xs text-zinc-500">
                        <span className="font-medium text-emerald-800 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          {rsvp.checkedIn ? 'Checked In' : 'Pass Confirmed'}
                        </span>
                        <span className="font-mono tabular-nums">{rsvp.passCode}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onOpenDetail(ev)}
                        className="mt-2 text-left cursor-pointer"
                      >
                        <h3 className="font-serif text-lg font-semibold text-zinc-900 hover:text-blue-800 transition-colors leading-snug">
                          {ev.title}
                        </h3>
                      </button>

                      <div className="mt-2 space-y-1 text-xs text-zinc-600">
                        <div className="flex items-center gap-1.5 font-mono tabular-nums">
                          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{formatEventDate(ev.dateISO)} · {formatTimeRange(ev.startTime, ev.endTime)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{ev.venue} · {ev.room}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
                      <div
                        className="grid grid-cols-9 gap-[1px] p-1 bg-stone-50 border border-stone-200 rounded"
                        aria-label={`Pass QR for ${rsvp.passCode}`}
                      >
                        {matrix.flatMap((row, r) =>
                          row.map((on, c) => (
                            <span
                              key={`${r}-${c}`}
                              className={`w-1.5 h-1.5 ${on ? 'bg-zinc-900' : 'bg-transparent'}`}
                            />
                          ))
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => downloadEventIcs(ev)}
                          className="px-3 py-1.5 text-xs font-medium text-zinc-700 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <CalendarPlus className="w-3.5 h-3.5" />
                          <span>.ics</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onToggleRsvp(ev)}
                          className="px-3 py-1.5 text-xs font-medium text-red-700 bg-white hover:bg-red-50 border border-stone-200 rounded-md transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="pt-6 border-t border-stone-200">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-xl font-semibold text-zinc-900">
            Saved for Later ({savedOnlyEvents.length})
          </h2>
        </div>

        {savedOnlyEvents.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Bookmark events from the directory to compare times before reserving a seat.
          </p>
        ) : (
          <div className="divide-y divide-stone-200 bg-white border border-stone-200 rounded-lg">
            {savedOnlyEvents.map((ev) => (
              <div key={ev.id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-zinc-500 flex items-center gap-1.5">
                    <span className="font-medium text-blue-800">{ev.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">
                      {formatEventDate(ev.dateISO)} · {formatTimeRange(ev.startTime, ev.endTime)}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{ev.venue}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenDetail(ev)}
                    className="mt-1 font-serif text-base font-semibold text-zinc-900 hover:text-blue-800 text-left cursor-pointer"
                  >
                    {ev.title}
                  </button>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onToggleRsvp(ev)}
                    className="px-3.5 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-md transition-colors cursor-pointer"
                  >
                    Reserve Seat
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleSave(ev.id)}
                    aria-label="Remove bookmark"
                    className="p-2 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
                  >
                    <Bookmark className="w-4 h-4 fill-current" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
