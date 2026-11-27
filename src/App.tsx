import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, Search, X } from 'lucide-react';
import { ClubsView } from './components/ClubsView';
import { EventCard } from './components/EventCard';
import { EventDetailModal } from './components/EventDetailModal';
import { HostEventModal } from './components/HostEventModal';
import { OrganizerConsole } from './components/OrganizerConsole';
import { ResilientImage } from './components/ResilientImage';
import { ScheduleView } from './components/ScheduleView';
import { TopBar } from './components/TopBar';
import { INITIAL_EVENTS, STUDENT_CLUBS } from './data/campusData';
import type {
  CampusEvent,
  DateWindow,
  EventCategory,
  EventFeedback,
  NavTab,
  RsvpRecord,
  SortOrder,
} from './types';
import { formatEventDate, formatTimeRange, generatePassCode } from './utils/eventUtils';

const STORAGE_KEYS = {
  events: 'ceh_events_v1',
  rsvps: 'ceh_rsvps_v1',
  saved: 'ceh_saved_v1',
};

const CATEGORIES: ('All' | EventCategory)[] = [
  'All',
  'Academic',
  'Tech & Build',
  'Arts & Music',
  'Clubs & Social',
  'Sports & Rec',
];

function loadStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('events');
  const [events, setEvents] = useState<CampusEvent[]>(() =>
    loadStored<CampusEvent[]>(STORAGE_KEYS.events, INITIAL_EVENTS)
  );
  const [rsvps, setRsvps] = useState<Record<string, RsvpRecord>>(() =>
    loadStored<Record<string, RsvpRecord>>(STORAGE_KEYS.rsvps, {})
  );
  const [savedIds, setSavedIds] = useState<string[]>(() =>
    loadStored<string[]>(STORAGE_KEYS.saved, ['evt-chamber-night'])
  );

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | EventCategory>('All');
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [dateWindow, setDateWindow] = useState<DateWindow>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('soonest');

  // Modals & toast
  const [detailEventId, setDetailEventId] = useState<string | null>(null);
  const [hostModalOpen, setHostModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CampusEvent | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.events, JSON.stringify(events));
    } catch {
      // Ignore storage quota errors
    }
  }, [events]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.rsvps, JSON.stringify(rsvps));
    } catch {
      // Ignore storage quota errors
    }
  }, [rsvps]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.saved, JSON.stringify(savedIds));
    } catch {
      // Ignore storage quota errors
    }
  }, [savedIds]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const showToast = (msg: string) => setToastMessage(msg);

  const featuredEvent = useMemo(
    () => events.find((e) => e.featured) ?? events[0] ?? null,
    [events]
  );

  const activeDetailEvent = useMemo(
    () => events.find((e) => e.id === detailEventId) ?? null,
    [events, detailEventId]
  );

  const filteredEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = events.filter((ev) => {
      if (selectedCategory !== 'All' && ev.category !== selectedCategory) return false;
      if (selectedClubId && ev.organizerClubId !== selectedClubId) return false;

      if (dateWindow === 'today' && ev.dateISO !== '2026-11-27') return false;
      if (dateWindow === 'weekend' && ev.dateISO !== '2026-11-28' && ev.dateISO !== '2026-11-29') {
        return false;
      }
      if (dateWindow === 'week' && ev.dateISO > '2026-12-03') return false;

      if (!q) return true;
      return (
        ev.title.toLowerCase().includes(q) ||
        ev.subtitle.toLowerCase().includes(q) ||
        ev.venue.toLowerCase().includes(q) ||
        ev.organizerName.toLowerCase().includes(q) ||
        ev.speaker.toLowerCase().includes(q)
      );
    });

    return [...list].sort((a, b) => {
      if (sortOrder === 'popular') {
        return b.registeredCount - a.registeredCount;
      }
      if (sortOrder === 'seats') {
        return (b.capacity - b.registeredCount) - (a.capacity - a.registeredCount);
      }
      return `${a.dateISO} ${a.startTime}`.localeCompare(`${b.dateISO} ${b.startTime}`);
    });
  }, [events, searchQuery, selectedCategory, selectedClubId, dateWindow, sortOrder]);

  const handleToggleRsvp = (event: CampusEvent) => {
    const existing = rsvps[event.id];
    if (existing) {
      setRsvps((prev) => {
        const next = { ...prev };
        delete next[event.id];
        return next;
      });
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === event.id
            ? {
                ...ev,
                registeredCount: Math.max(0, ev.registeredCount - 1),
                attendees: ev.attendees.filter((a) => a.passCode !== existing.passCode),
              }
            : ev
        )
      );
      showToast(`Reservation cancelled for "${event.title}".`);
    } else {
      if (event.registeredCount >= event.capacity) {
        showToast('This event is currently at full capacity.');
        return;
      }
      const passCode = generatePassCode(event.id);
      const nowDate = new Date().toISOString().slice(0, 10);
      setRsvps((prev) => ({
        ...prev,
        [event.id]: {
          eventId: event.id,
          passCode,
          registeredAt: nowDate,
          checkedIn: false,
        },
      }));
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === event.id
            ? {
                ...ev,
                registeredCount: Math.min(ev.capacity, ev.registeredCount + 1),
                attendees: [
                  {
                    id: `att-${Date.now()}`,
                    name: 'You (Student Pass)',
                    email: 'student@campus.edu',
                    passCode,
                    checkedIn: false,
                    registeredAt: nowDate,
                  },
                  ...ev.attendees,
                ],
              }
            : ev
        )
      );
      showToast(`Seat reserved · Pass ${passCode} added to your schedule.`);
    }
  };

  const handleToggleSave = (eventId: string) => {
    setSavedIds((prev) => {
      const exists = prev.includes(eventId);
      const next = exists ? prev.filter((id) => id !== eventId) : [...prev, eventId];
      showToast(exists ? 'Removed from saved events.' : 'Saved to your schedule.');
      return next;
    });
  };

  const handleSubmitFeedback = (
    eventId: string,
    feedback: Omit<EventFeedback, 'id' | 'submittedAt'>
  ) => {
    const newEntry: EventFeedback = {
      ...feedback,
      id: `fb-${Date.now()}`,
      submittedAt: new Date().toISOString().slice(0, 10),
    };
    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === eventId ? { ...ev, feedback: [newEntry, ...ev.feedback] } : ev
      )
    );
    showToast('Thank you — your feedback note has been posted.');
  };

  const handleSaveHostEvent = (
    data: Omit<CampusEvent, 'id' | 'registeredCount' | 'attendees' | 'feedback'>,
    existingId?: string
  ) => {
    if (existingId) {
      setEvents((prev) =>
        prev.map((ev) => (ev.id === existingId ? { ...ev, ...data } : ev))
      );
      showToast(`Updated "${data.title}".`);
    } else {
      const created: CampusEvent = {
        ...data,
        id: `evt-${Date.now()}`,
        registeredCount: 1,
        attendees: [],
        feedback: [],
      };
      setEvents((prev) => [created, ...prev]);
      showToast(`Published "${data.title}" to the campus directory.`);
    }
    setHostModalOpen(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents((prev) => prev.filter((ev) => ev.id !== eventId));
    setRsvps((prev) => {
      const next = { ...prev };
      delete next[eventId];
      return next;
    });
    showToast('Event removed from directory.');
  };

  const handleToggleAttendeeCheckIn = (eventId: string, attendeeId: string) => {
    let toggledPassCode: string | null = null;
    let nextChecked = false;

    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id !== eventId) return ev;
        return {
          ...ev,
          attendees: ev.attendees.map((att) => {
            if (att.id !== attendeeId) return att;
            toggledPassCode = att.passCode;
            nextChecked = !att.checkedIn;
            return { ...att, checkedIn: nextChecked };
          }),
        };
      })
    );

    if (toggledPassCode && rsvps[eventId]?.passCode === toggledPassCode) {
      setRsvps((prev) => ({
        ...prev,
        [eventId]: { ...prev[eventId], checkedIn: nextChecked },
      }));
    }
  };

  const handleAddWalkInAttendee = (eventId: string, name: string, email: string) => {
    const passCode = generatePassCode(eventId);
    const today = new Date().toISOString().slice(0, 10);
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id !== eventId) return ev;
        return {
          ...ev,
          registeredCount: Math.min(ev.capacity, ev.registeredCount + 1),
          attendees: [
            {
              id: `att-${Date.now()}`,
              name,
              email,
              passCode,
              checkedIn: true,
              registeredAt: today,
            },
            ...ev.attendees,
          ],
        };
      })
    );
    showToast(`Walk-in pass ${passCode} checked in for ${name}.`);
  };

  const handleResetDemoData = () => {
    setEvents(INITIAL_EVENTS);
    setRsvps({});
    setSavedIds(['evt-chamber-night']);
    showToast('Campus directory restored to initial schedule.');
  };

  const totalOpenSeats = useMemo(
    () => events.reduce((acc, ev) => acc + Math.max(0, ev.capacity - ev.registeredCount), 0),
    [events]
  );

  const selectedClub = useMemo(
    () => STUDENT_CLUBS.find((c) => c.id === selectedClubId) ?? null,
    [selectedClubId]
  );

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedClubId(null);
    setDateWindow('all');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-zinc-900">
      <TopBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onHostEvent={() => {
          setEditingEvent(null);
          setHostModalOpen(true);
        }}
        scheduleCount={Object.keys(rsvps).length}
      />

      <main className="flex-1">
        {activeTab === 'events' && (
          <>
            {/* Editorial Hero Split */}
            <section className="border-b border-stone-200 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 lg:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
                  <div className="lg:col-span-6 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-medium text-blue-800">
                        Autumn Semester 2026 · University Commons & Lecture Halls
                      </p>
                      <h1 className="mt-3 font-serif text-4xl sm:text-5xl font-semibold tracking-tight text-zinc-900 leading-[1.1] text-balance">
                        Discover what’s happening across campus this week.
                      </h1>
                      <p className="mt-4 text-base text-zinc-600 leading-relaxed max-w-xl">
                        Explore department colloquia, late-night makerspace sprints, chamber recitals, and student organization fairs. Reserve your seat and carry your entry pass in one place.
                      </p>
                    </div>

                    <div className="mt-8 space-y-4">
                      <div className="relative max-w-xl">
                        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="search"
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                          }}
                          placeholder="Search events, venues, speakers, or clubs..."
                          aria-label="Search campus events"
                          className="w-full pl-10 pr-4 py-3 text-sm bg-[#FAF9F6] border border-stone-200 rounded-md text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-700"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <a
                          href="#directory"
                          className="px-5 py-2.5 text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-md transition-colors inline-flex items-center gap-2 whitespace-nowrap"
                        >
                          <span>Browse All Events</span>
                          <ArrowRight className="w-4 h-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => setActiveTab('schedule')}
                          className="px-5 py-2.5 text-sm font-medium text-zinc-800 bg-[#FAF9F6] hover:bg-stone-100 border border-stone-200 rounded-md transition-colors whitespace-nowrap cursor-pointer"
                        >
                          View My Schedule ({Object.keys(rsvps).length})
                        </button>
                      </div>
                    </div>
                  </div>

                  {featuredEvent && (
                    <div className="lg:col-span-6 flex">
                      <div className="relative w-full min-h-[320px] lg:min-h-[380px] rounded-lg overflow-hidden border border-stone-200 bg-stone-900 flex flex-col justify-end">
                        <ResilientImage
                          src={featuredEvent.imageUrl}
                          alt={featuredEvent.title}
                          fallbackLabel={featuredEvent.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10" />

                        <div className="relative z-10 p-6 sm:p-7 text-white">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-stone-200">
                            <span className="font-semibold text-white">Featured Spotlight</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">
                              {formatEventDate(featuredEvent.dateISO)} · {formatTimeRange(featuredEvent.startTime, featuredEvent.endTime)}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{featuredEvent.venue}</span>
                          </div>

                          <h2 className="mt-2 font-serif text-2xl sm:text-3xl font-semibold leading-snug text-white text-balance">
                            {featuredEvent.title}
                          </h2>

                          <p className="mt-1.5 text-sm text-stone-200 line-clamp-2 max-w-xl">
                            {featuredEvent.subtitle}
                          </p>

                          <div className="mt-5 flex flex-wrap items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleToggleRsvp(featuredEvent)}
                              className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                                rsvps[featuredEvent.id]
                                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                  : 'bg-white text-zinc-900 hover:bg-stone-100'
                              }`}
                            >
                              {rsvps[featuredEvent.id] ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Pass Confirmed</span>
                                </>
                              ) : (
                                <span>Reserve Seat</span>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => setDetailEventId(featuredEvent.id)}
                              className="px-4 py-2 text-xs font-medium text-white bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/25 rounded-md transition-colors whitespace-nowrap cursor-pointer"
                            >
                              Event Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Full-width 4-Column Campus Pulse Strip below hero split */}
                <div className="mt-8 pt-8 border-t border-stone-200 grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <div className="text-xs text-zinc-500">Upcoming Campus Events</div>
                    <div className="mt-1 font-mono text-2xl font-semibold text-zinc-900 tabular-nums">
                      {events.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500">Open Seats Across Venues</div>
                    <div className="mt-1 font-mono text-2xl font-semibold text-zinc-900 tabular-nums">
                      {totalOpenSeats}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500">Student Organizations</div>
                    <div className="mt-1 font-mono text-2xl font-semibold text-zinc-900 tabular-nums">
                      {STUDENT_CLUBS.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500">Your Active Passes</div>
                    <div className="mt-1 font-mono text-2xl font-semibold text-blue-800 tabular-nums">
                      {Object.keys(rsvps).length}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Directory & Filter Toolbar */}
            <section id="directory" className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div
                  className="flex items-center gap-1 p-1 bg-stone-200/70 rounded-lg overflow-x-auto"
                  role="tablist"
                  aria-label="Filter events by category"
                >
                  {CATEGORIES.map((category) => {
                    const active = selectedCategory === category;
                    return (
                      <button
                        key={category}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          active
                            ? 'bg-white text-zinc-900 shadow-xs'
                            : 'text-zinc-600 hover:text-zinc-900'
                        }`}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <select
                    aria-label="Filter by date window"
                    value={dateWindow}
                    onChange={(e) => setDateWindow(e.target.value as DateWindow)}
                    className="px-3 py-2 text-xs font-medium bg-white border border-stone-200 rounded-md text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-700"
                  >
                    <option value="all">All Dates</option>
                    <option value="today">Today (Nov 27)</option>
                    <option value="weekend">This Weekend</option>
                    <option value="week">Next 7 Days</option>
                  </select>

                  <select
                    aria-label="Sort events"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                    className="px-3 py-2 text-xs font-medium bg-white border border-stone-200 rounded-md text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-700"
                  >
                    <option value="soonest">Sort: Soonest</option>
                    <option value="popular">Sort: Most Reserved</option>
                    <option value="seats">Sort: Most Seats Open</option>
                  </select>
                </div>
              </div>

              {selectedClub && (
                <div className="flex items-center justify-between gap-4 px-4 py-3 bg-white border border-stone-200 rounded-md text-xs">
                  <span className="text-zinc-700">
                    Showing events hosted by <strong className="text-zinc-900">{selectedClub.name}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedClubId(null)}
                    className="font-medium text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Clear Club Filter</span>
                  </button>
                </div>
              )}

              {filteredEvents.length === 0 ? (
                <div className="bg-white border border-stone-200 rounded-lg p-12 text-center">
                  <h3 className="font-serif text-xl font-semibold text-zinc-900">
                    No matching campus events found
                  </h3>
                  <p className="mt-1.5 text-sm text-zinc-600 max-w-md mx-auto">
                    Try adjusting your search keywords, date window, or category filter to see more programs.
                  </p>
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="mt-5 px-4 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-md transition-colors cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents.map((ev) => (
                    <EventCard
                      key={ev.id}
                      event={ev}
                      isRegistered={Boolean(rsvps[ev.id])}
                      isSaved={savedIds.includes(ev.id)}
                      onOpenDetail={(item) => setDetailEventId(item.id)}
                      onToggleRsvp={handleToggleRsvp}
                      onToggleSave={handleToggleSave}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === 'schedule' && (
          <ScheduleView
            events={events}
            rsvps={rsvps}
            savedIds={savedIds}
            onOpenDetail={(item) => setDetailEventId(item.id)}
            onToggleRsvp={handleToggleRsvp}
            onToggleSave={handleToggleSave}
            onBrowseEvents={() => setActiveTab('events')}
          />
        )}

        {activeTab === 'clubs' && (
          <ClubsView
            clubs={STUDENT_CLUBS}
            events={events}
            onFilterByClub={(clubId) => {
              setSelectedClubId(clubId);
              setSelectedCategory('All');
              setActiveTab('events');
            }}
          />
        )}

        {activeTab === 'organizer' && (
          <OrganizerConsole
            events={events}
            onCreateEvent={() => {
              setEditingEvent(null);
              setHostModalOpen(true);
            }}
            onEditEvent={(ev) => {
              setEditingEvent(ev);
              setHostModalOpen(true);
            }}
            onDeleteEvent={handleDeleteEvent}
            onToggleAttendeeCheckIn={handleToggleAttendeeCheckIn}
            onAddWalkInAttendee={handleAddWalkInAttendee}
            onResetDemoData={handleResetDemoData}
          />
        )}
      </main>

      <footer className="border-t border-stone-200 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <span>Campus Event Hub · Student Affairs & Academic Scheduling</span>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setActiveTab('events')}
              className="hover:text-zinc-900 transition-colors cursor-pointer"
            >
              Directory
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('schedule')}
              className="hover:text-zinc-900 transition-colors cursor-pointer"
            >
              My Schedule
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('clubs')}
              className="hover:text-zinc-900 transition-colors cursor-pointer"
            >
              Student Clubs
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('organizer')}
              className="hover:text-zinc-900 transition-colors cursor-pointer"
            >
              Organizer Console
            </button>
          </div>
        </div>
      </footer>

      {activeDetailEvent && (
        <EventDetailModal
          event={activeDetailEvent}
          rsvp={rsvps[activeDetailEvent.id]}
          isSaved={savedIds.includes(activeDetailEvent.id)}
          onClose={() => setDetailEventId(null)}
          onToggleRsvp={handleToggleRsvp}
          onToggleSave={handleToggleSave}
          onSubmitFeedback={handleSubmitFeedback}
        />
      )}

      {hostModalOpen && (
        <HostEventModal
          clubs={STUDENT_CLUBS}
          editingEvent={editingEvent}
          onClose={() => {
            setHostModalOpen(false);
            setEditingEvent(null);
          }}
          onSaveEvent={handleSaveHostEvent}
        />
      )}

      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 px-4 py-3 bg-zinc-900 text-white text-xs font-medium rounded-lg shadow-lg border border-zinc-800 flex items-center gap-3 max-w-sm"
        >
          <span className="flex-1">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            aria-label="Dismiss notification"
            className="text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
