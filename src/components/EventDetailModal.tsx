import { useState } from 'react';
import {
  Accessibility,
  Bookmark,
  CalendarPlus,
  Check,
  Clock,
  MapPin,
  Star,
  User,
  X,
} from 'lucide-react';
import type { CampusEvent, EventFeedback, RsvpRecord } from '../types';
import { buildPassMatrix, downloadEventIcs, formatEventDate, formatTimeRange } from '../utils/eventUtils';
import { ResilientImage } from './ResilientImage';

interface EventDetailModalProps {
  event: CampusEvent;
  rsvp?: RsvpRecord;
  isSaved: boolean;
  onClose: () => void;
  onToggleRsvp: (event: CampusEvent) => void;
  onToggleSave: (eventId: string) => void;
  onSubmitFeedback: (eventId: string, feedback: Omit<EventFeedback, 'id' | 'submittedAt'>) => void;
}

export function EventDetailModal({
  event,
  rsvp,
  isSaved,
  onClose,
  onToggleRsvp,
  onToggleSave,
  onSubmitFeedback,
}: EventDetailModalProps) {
  const [author, setAuthor] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [feedbackError, setFeedbackError] = useState('');

  const seatsRemaining = Math.max(0, event.capacity - event.registeredCount);
  const fillPercent = Math.min(100, Math.round((event.registeredCount / Math.max(1, event.capacity)) * 100));
  const isFull = seatsRemaining === 0 && !rsvp;
  const passMatrix = rsvp ? buildPassMatrix(rsvp.passCode) : null;

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !comment.trim()) {
      setFeedbackError('Please enter your name and a brief note before submitting.');
      return;
    }
    onSubmitFeedback(event.id, {
      author: author.trim(),
      rating,
      comment: comment.trim(),
    });
    setAuthor('');
    setRating(5);
    setComment('');
    setFeedbackError('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-[2px] p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-detail-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl bg-[#FAF9F6] border border-stone-200 rounded-xl overflow-hidden shadow-xl my-auto max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-stone-200 shrink-0">
          <div className="flex items-center gap-2 text-xs text-zinc-500 min-w-0 truncate">
            <span className="font-semibold text-blue-800">{event.category}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{event.organizerName}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close event details"
            className="p-2 -mr-2 text-zinc-500 hover:text-zinc-900 hover:bg-stone-100 rounded-md transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-stone-200 bg-white">
            <div className="lg:col-span-5 aspect-[4/3] lg:aspect-auto bg-stone-100 overflow-hidden">
              <ResilientImage
                src={event.imageUrl}
                alt={event.title}
                fallbackLabel={event.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <h2
                  id="event-detail-title"
                  className="font-serif text-2xl sm:text-3xl font-semibold text-zinc-900 leading-tight text-balance"
                >
                  {event.title}
                </h2>
                <p className="mt-2.5 text-sm sm:text-base text-zinc-600 leading-relaxed">
                  {event.subtitle}
                </p>

                <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm border-t border-stone-100 pt-5">
                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                    <div>
                      <dt className="text-xs text-zinc-500">Date & Time</dt>
                      <dd className="font-mono text-xs sm:text-sm text-zinc-900 tabular-nums mt-0.5">
                        {formatEventDate(event.dateISO)} · {formatTimeRange(event.startTime, event.endTime)}
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                    <div>
                      <dt className="text-xs text-zinc-500">Campus Location</dt>
                      <dd className="text-zinc-900 mt-0.5">{event.venue} · {event.room}</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <User className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                    <div>
                      <dt className="text-xs text-zinc-500">Featured Lead</dt>
                      <dd className="text-zinc-900 mt-0.5">{event.speaker}</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Accessibility className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                    <div>
                      <dt className="text-xs text-zinc-500">Accessibility</dt>
                      <dd className="text-zinc-700 mt-0.5">{event.accessibility}</dd>
                    </div>
                  </div>
                </dl>
              </div>

              <div className="mt-6 pt-5 border-t border-stone-100">
                <div className="flex items-center justify-between text-xs text-zinc-600 mb-2">
                  <span>Registration Capacity</span>
                  <span className="font-mono tabular-nums">
                    {event.registeredCount} / {event.capacity} reserved ({seatsRemaining} open)
                  </span>
                </div>
                <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${fillPercent >= 90 ? 'bg-amber-600' : 'bg-blue-700'}`}
                    style={{ width: `${fillPercent}%` }}
                  />
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    disabled={isFull}
                    onClick={() => onToggleRsvp(event)}
                    className={`px-5 py-2.5 text-sm font-semibold rounded-md transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${
                      rsvp
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                        : isFull
                        ? 'bg-stone-100 text-zinc-400 cursor-not-allowed'
                        : 'bg-blue-700 text-white hover:bg-blue-800'
                    }`}
                  >
                    {rsvp ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Registered · Cancel Seat</span>
                      </>
                    ) : isFull ? (
                      <span>Event at Full Capacity</span>
                    ) : (
                      <span>Confirm RSVP</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => downloadEventIcs(event)}
                    className="px-4 py-2.5 text-sm font-medium text-zinc-800 bg-white border border-stone-200 hover:bg-stone-50 rounded-md transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
                  >
                    <CalendarPlus className="w-4 h-4 text-zinc-500" />
                    <span>Add to Calendar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleSave(event.id)}
                    className={`px-4 py-2.5 text-sm font-medium border rounded-md transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${
                      isSaved
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : 'bg-white text-zinc-800 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <Bookmark className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
                    <span>{isSaved ? 'Saved' : 'Save'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {rsvp && passMatrix && (
              <section className="bg-white border border-emerald-200 rounded-lg p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <div className="text-xs font-semibold text-emerald-800">
                    Confirmed Entry Pass · {rsvp.checkedIn ? 'Checked In at Venue' : 'Ready for Door Check-In'}
                  </div>
                  <div className="mt-1 font-mono text-xl font-semibold text-zinc-900 tracking-tight tabular-nums">
                    {rsvp.passCode}
                  </div>
                  <p className="mt-1 text-xs text-zinc-600 max-w-md">
                    Present this pass code at {event.venue} ({event.room}). Organizers verify check-in using your pass ID.
                  </p>
                </div>

                <div
                  className="grid grid-cols-9 gap-0.5 p-2 bg-white border border-stone-200 rounded-md w-fit shrink-0"
                  aria-label={`Pass verification matrix for ${rsvp.passCode}`}
                >
                  {passMatrix.flatMap((row, rIdx) =>
                    row.map((filled, cIdx) => (
                      <div
                        key={`${rIdx}-${cIdx}`}
                        className={`w-2.5 h-2.5 ${filled ? 'bg-zinc-900' : 'bg-stone-100'}`}
                      />
                    ))
                  )}
                </div>
              </section>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 space-y-6">
                <section>
                  <h3 className="text-sm font-semibold text-zinc-900">About This Event</h3>
                  <p className="mt-2.5 text-sm text-zinc-700 leading-relaxed max-w-prose">
                    {event.description}
                  </p>
                </section>

                <section className="pt-6 border-t border-stone-200">
                  <h3 className="text-sm font-semibold text-zinc-900">Program Schedule</h3>
                  <div className="mt-3 divide-y divide-stone-200 border border-stone-200 rounded-lg bg-white">
                    {event.agenda.map((item, idx) => (
                      <div key={idx} className="p-4 flex items-start gap-4">
                        <span className="font-mono text-xs font-medium text-blue-800 tabular-nums pt-0.5 shrink-0">
                          {item.time}
                        </span>
                        <div>
                          <div className="text-sm font-medium text-zinc-900">{item.title}</div>
                          <div className="text-xs text-zinc-600 mt-0.5">{item.detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="lg:col-span-5 space-y-6">
                <section className="bg-white border border-stone-200 rounded-lg p-5">
                  <h3 className="text-sm font-semibold text-zinc-900">Student Notes & Feedback</h3>
                  <p className="mt-1 text-xs text-zinc-500">
                    Share feedback for {event.organizerName} or preview attendee notes.
                  </p>

                  {event.feedback.length > 0 ? (
                    <ul className="mt-4 space-y-3 divide-y divide-stone-100">
                      {event.feedback.map((item) => (
                        <li key={item.id} className="pt-3 first:pt-0">
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <span className="font-medium text-zinc-900">{item.author}</span>
                            <span className="font-mono tabular-nums text-amber-700 flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                              {item.rating}/5
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-zinc-600 leading-relaxed">{item.comment}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-4 text-xs text-zinc-500 italic">
                      No notes yet. Leave the first comment below.
                    </p>
                  )}

                  <form onSubmit={handleFeedbackSubmit} className="mt-5 pt-4 border-t border-stone-100 space-y-3">
                    <div>
                      <label htmlFor="fb-author" className="block text-xs font-medium text-zinc-700">
                        Your Name
                      </label>
                      <input
                        id="fb-author"
                        type="text"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="e.g. Jordan Rivera (Class of 2027)"
                        className="mt-1 w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-stone-200 rounded-md text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
                      />
                    </div>
                    <div>
                      <label htmlFor="fb-rating" className="block text-xs font-medium text-zinc-700">
                        Rating
                      </label>
                      <select
                        id="fb-rating"
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                        className="mt-1 w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-stone-200 rounded-md text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
                      >
                        <option value={5}>5 / 5 — Exceptional</option>
                        <option value={4}>4 / 5 — Very Good</option>
                        <option value={3}>3 / 5 — Solid</option>
                        <option value={2}>2 / 5 — Needs Improvement</option>
                        <option value={1}>1 / 5 — Poor</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="fb-comment" className="block text-xs font-medium text-zinc-700">
                        Feedback
                      </label>
                      <textarea
                        id="fb-comment"
                        rows={2}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="How was the venue, speaker, or schedule?"
                        className="mt-1 w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-stone-200 rounded-md text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
                      />
                    </div>
                    {feedbackError && (
                      <p className="text-xs text-red-700">{feedbackError}</p>
                    )}
                    <button
                      type="submit"
                      className="w-full py-2 px-4 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-md transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
                    >
                      Post Feedback
                    </button>
                  </form>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
