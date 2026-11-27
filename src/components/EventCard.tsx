import { Bookmark, Check, MapPin } from 'lucide-react';
import type { CampusEvent } from '../types';
import { formatEventDate, formatTimeRange } from '../utils/eventUtils';
import { ResilientImage } from './ResilientImage';

interface EventCardProps {
  event: CampusEvent;
  isRegistered: boolean;
  isSaved: boolean;
  onOpenDetail: (event: CampusEvent) => void;
  onToggleRsvp: (event: CampusEvent) => void;
  onToggleSave: (eventId: string) => void;
}

export function EventCard({
  event,
  isRegistered,
  isSaved,
  onOpenDetail,
  onToggleRsvp,
  onToggleSave,
}: EventCardProps) {
  const seatsRemaining = Math.max(0, event.capacity - event.registeredCount);
  const isFull = seatsRemaining === 0 && !isRegistered;

  return (
    <article className="group flex flex-col bg-white border border-stone-200 rounded-lg overflow-hidden transition-colors hover:border-stone-300">
      <button
        type="button"
        onClick={() => onOpenDetail(event)}
        className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-700"
      >
        <ResilientImage
          src={event.imageUrl}
          alt={event.title}
          fallbackLabel={event.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </button>

      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center justify-between gap-2 text-xs text-zinc-500">
          <div className="flex items-center gap-1.5 min-w-0 truncate">
            <span className="font-medium text-blue-800">{event.category}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{formatEventDate(event.dateISO)}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{formatTimeRange(event.startTime, event.endTime)}</span>
          </div>
          <button
            type="button"
            onClick={() => onToggleSave(event.id)}
            aria-label={isSaved ? `Remove ${event.title} from saved events` : `Save ${event.title}`}
            className={`p-1.5 -mr-1.5 rounded-md transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${
              isSaved ? 'text-blue-700 bg-blue-50' : 'text-zinc-400 hover:text-zinc-700 hover:bg-stone-100'
            }`}
          >
            <Bookmark className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => onOpenDetail(event)}
          className="mt-2.5 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 rounded-sm"
        >
          <h3 className="font-serif text-lg font-semibold leading-snug text-zinc-900 group-hover:text-blue-800 transition-colors text-balance">
            {event.title}
          </h3>
        </button>

        <p className="mt-1.5 text-sm text-zinc-600 line-clamp-2 leading-relaxed">
          {event.subtitle}
        </p>

        <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between gap-3 text-xs text-zinc-600">
          <div className="flex items-center gap-1.5 min-w-0 truncate">
            <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="truncate">{event.venue} · {event.room}</span>
          </div>
          <span className="font-mono tabular-nums text-zinc-500 shrink-0">
            {seatsRemaining}/{event.capacity} open
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2.5">
          <button
            type="button"
            disabled={isFull}
            onClick={() => onToggleRsvp(event)}
            className={`flex-1 py-2 px-3.5 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${
              isRegistered
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                : isFull
                ? 'bg-stone-100 text-zinc-400 cursor-not-allowed'
                : 'bg-zinc-900 text-white hover:bg-zinc-800'
            }`}
          >
            {isRegistered ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Registered</span>
              </>
            ) : isFull ? (
              <span>At Capacity</span>
            ) : (
              <span>Reserve Seat</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onOpenDetail(event)}
            className="py-2 px-3.5 text-xs font-medium text-zinc-700 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
          >
            Details
          </button>
        </div>
      </div>
    </article>
  );
}
