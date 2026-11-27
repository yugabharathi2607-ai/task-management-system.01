import { useState } from 'react';
import { X } from 'lucide-react';
import type { CampusEvent, EventCategory, StudentClub } from '../types';

interface HostEventModalProps {
  clubs: StudentClub[];
  editingEvent?: CampusEvent | null;
  onClose: () => void;
  onSaveEvent: (eventData: Omit<CampusEvent, 'id' | 'registeredCount' | 'attendees' | 'feedback'>, existingId?: string) => void;
}

const IMAGE_PRESETS = [
  {
    label: 'Atrium Showcase',
    url: '/src/assets/images/hero_campus_commons_1795789120380.jpg',
  },
  {
    label: 'Makerspace Lab',
    url: '/src/assets/images/event_hackathon_lab_1795789121719.jpg',
  },
  {
    label: 'Recital Hall',
    url: '/src/assets/images/event_arts_concert_1795789122016.jpg',
  },
  {
    label: 'Lecture Amphitheater',
    url: '/src/assets/images/event_academic_lecture_1795789121770.jpg',
  },
  {
    label: 'North Quad Fair',
    url: '/src/assets/images/event_campus_mixer_1795789122638.jpg',
  },
];

const CATEGORIES: EventCategory[] = [
  'Academic',
  'Tech & Build',
  'Arts & Music',
  'Clubs & Social',
  'Sports & Rec',
];

export function HostEventModal({ clubs, editingEvent, onClose, onSaveEvent }: HostEventModalProps) {
  const [title, setTitle] = useState(editingEvent?.title ?? '');
  const [subtitle, setSubtitle] = useState(editingEvent?.subtitle ?? '');
  const [description, setDescription] = useState(editingEvent?.description ?? '');
  const [category, setCategory] = useState<EventCategory>(editingEvent?.category ?? 'Academic');
  const [dateISO, setDateISO] = useState(editingEvent?.dateISO ?? '2026-12-02');
  const [startTime, setStartTime] = useState(editingEvent?.startTime ?? '16:00');
  const [endTime, setEndTime] = useState(editingEvent?.endTime ?? '18:00');
  const [venue, setVenue] = useState(editingEvent?.venue ?? 'Turing Commons');
  const [room, setRoom] = useState(editingEvent?.room ?? 'Seminar Room 202');
  const [accessibility, setAccessibility] = useState(
    editingEvent?.accessibility ?? 'Step-free entrance, elevator access'
  );
  const [clubId, setClubId] = useState(editingEvent?.organizerClubId ?? clubs[0]?.id ?? 'club-robotics');
  const [speaker, setSpeaker] = useState(editingEvent?.speaker ?? '');
  const [capacity, setCapacity] = useState(editingEvent?.capacity ?? 80);
  const [imageUrl, setImageUrl] = useState(editingEvent?.imageUrl ?? IMAGE_PRESETS[0].url);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subtitle.trim() || !venue.trim() || !room.trim()) {
      setError('Please complete the event title, summary, venue, and room.');
      return;
    }
    const selectedClub = clubs.find((c) => c.id === clubId) ?? clubs[0];
    onSaveEvent(
      {
        title: title.trim(),
        subtitle: subtitle.trim(),
        description: description.trim() || subtitle.trim(),
        category,
        dateISO,
        startTime,
        endTime,
        venue: venue.trim(),
        room: room.trim(),
        accessibility: accessibility.trim() || 'Standard campus accessibility',
        organizerClubId: selectedClub.id,
        organizerName: selectedClub.name,
        speaker: speaker.trim() || `${selectedClub.name} Coordinators`,
        capacity: Math.max(5, Number(capacity) || 50),
        imageUrl,
        featured: editingEvent?.featured ?? false,
        agenda: editingEvent?.agenda ?? [
          {
            time: startTime,
            title: 'Doors Open & Check-In',
            detail: `Pass verification at ${venue.trim()} (${room.trim()}).`,
          },
          {
            time: endTime,
            title: 'Closing Remarks',
            detail: 'Wrap-up and informal networking.',
          },
        ],
      },
      editingEvent?.id
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-[2px] p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="host-event-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl bg-[#FAF9F6] border border-stone-200 rounded-xl shadow-xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-stone-200 shrink-0">
          <h2 id="host-event-title" className="font-serif text-xl font-semibold text-zinc-900">
            {editingEvent ? 'Edit Campus Event' : 'Publish Campus Event'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close event form"
            className="p-2 -mr-2 text-zinc-500 hover:text-zinc-900 hover:bg-stone-100 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="ev-title" className="block text-xs font-semibold text-zinc-700">
                Event Title
              </label>
              <input
                id="ev-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Winter Civic Design & Mapping Workshop"
                className="mt-1.5 w-full px-3.5 py-2 text-sm bg-white border border-stone-200 rounded-md text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="ev-subtitle" className="block text-xs font-semibold text-zinc-700">
                One-Line Summary
              </label>
              <input
                id="ev-subtitle"
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Concise deck shown on directory cards"
                className="mt-1.5 w-full px-3.5 py-2 text-sm bg-white border border-stone-200 rounded-md text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>

            <div>
              <label htmlFor="ev-category" className="block text-xs font-semibold text-zinc-700">
                Category
              </label>
              <select
                id="ev-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as EventCategory)}
                className="mt-1.5 w-full px-3.5 py-2 text-sm bg-white border border-stone-200 rounded-md text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="ev-club" className="block text-xs font-semibold text-zinc-700">
                Hosting Organization
              </label>
              <select
                id="ev-club"
                value={clubId}
                onChange={(e) => setClubId(e.target.value)}
                className="mt-1.5 w-full px-3.5 py-2 text-sm bg-white border border-stone-200 rounded-md text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
              >
                {clubs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="ev-date" className="block text-xs font-semibold text-zinc-700">
                Date
              </label>
              <input
                id="ev-date"
                type="date"
                value={dateISO}
                onChange={(e) => setDateISO(e.target.value)}
                className="mt-1.5 w-full px-3.5 py-2 text-sm font-mono bg-white border border-stone-200 rounded-md text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="ev-start" className="block text-xs font-semibold text-zinc-700">
                  Start Time
                </label>
                <input
                  id="ev-start"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="mt-1.5 w-full px-3 py-2 text-sm font-mono bg-white border border-stone-200 rounded-md text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
                />
              </div>
              <div>
                <label htmlFor="ev-end" className="block text-xs font-semibold text-zinc-700">
                  End Time
                </label>
                <input
                  id="ev-end"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="mt-1.5 w-full px-3 py-2 text-sm font-mono bg-white border border-stone-200 rounded-md text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
                />
              </div>
            </div>

            <div>
              <label htmlFor="ev-venue" className="block text-xs font-semibold text-zinc-700">
                Building / Venue
              </label>
              <input
                id="ev-venue"
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="mt-1.5 w-full px-3.5 py-2 text-sm bg-white border border-stone-200 rounded-md text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>

            <div>
              <label htmlFor="ev-room" className="block text-xs font-semibold text-zinc-700">
                Room / Space
              </label>
              <input
                id="ev-room"
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="mt-1.5 w-full px-3.5 py-2 text-sm bg-white border border-stone-200 rounded-md text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>

            <div>
              <label htmlFor="ev-speaker" className="block text-xs font-semibold text-zinc-700">
                Speaker / Host Lead
              </label>
              <input
                id="ev-speaker"
                type="text"
                value={speaker}
                onChange={(e) => setSpeaker(e.target.value)}
                placeholder="e.g. Prof. Nadia Al-Mansoor"
                className="mt-1.5 w-full px-3.5 py-2 text-sm bg-white border border-stone-200 rounded-md text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>

            <div>
              <label htmlFor="ev-capacity" className="block text-xs font-semibold text-zinc-700">
                Seat Capacity
              </label>
              <input
                id="ev-capacity"
                type="number"
                min={5}
                max={1000}
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="mt-1.5 w-full px-3.5 py-2 text-sm font-mono tabular-nums bg-white border border-stone-200 rounded-md text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="ev-accessibility" className="block text-xs font-semibold text-zinc-700">
                Accessibility Notes
              </label>
              <input
                id="ev-accessibility"
                type="text"
                value={accessibility}
                onChange={(e) => setAccessibility(e.target.value)}
                className="mt-1.5 w-full px-3.5 py-2 text-sm bg-white border border-stone-200 rounded-md text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>

            <div className="sm:col-span-2">
              <span className="block text-xs font-semibold text-zinc-700 mb-2">
                Venue Photography Preset
              </span>
              <div className="grid grid-cols-5 gap-2">
                {IMAGE_PRESETS.map((preset) => (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() => setImageUrl(preset.url)}
                    className={`group relative rounded-md overflow-hidden border text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${
                      imageUrl === preset.url ? 'border-blue-700 ring-2 ring-blue-700/30' : 'border-stone-200'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.label}
                      className="w-full h-14 object-cover"
                    />
                    <span className="block px-1.5 py-1 text-[11px] font-medium text-zinc-700 bg-white truncate">
                      {preset.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="ev-desc" className="block text-xs font-semibold text-zinc-700">
                Full Description
              </label>
              <textarea
                id="ev-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide details on prerequisites, materials provided, or refreshments."
                className="mt-1.5 w-full px-3.5 py-2 text-sm bg-white border border-stone-200 rounded-md text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>
          </div>

          {error && <p className="text-xs font-medium text-red-700">{error}</p>}

          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-stone-200 hover:bg-stone-50 rounded-md transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-md transition-colors cursor-pointer"
            >
              {editingEvent ? 'Save Changes' : 'Publish Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
