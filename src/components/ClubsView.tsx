import { ArrowRight, MapPin, Users } from 'lucide-react';
import type { CampusEvent, StudentClub } from '../types';

interface ClubsViewProps {
  clubs: StudentClub[];
  events: CampusEvent[];
  onFilterByClub: (clubId: string) => void;
}

export function ClubsView({ clubs, events, onFilterByClub }: ClubsViewProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      <div className="border-b border-stone-200 pb-6">
        <p className="text-xs font-medium text-blue-800">Recognized Organizations</p>
        <h1 className="mt-1 font-serif text-3xl sm:text-4xl font-semibold text-zinc-900 text-balance">
          Student Clubs & Campus Hosts
        </h1>
        <p className="mt-2 text-sm text-zinc-600 max-w-2xl">
          Explore active student-led societies, academic guilds, and recreational collectives hosting programs this semester.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clubs.map((club) => {
          const hostedCount = events.filter((e) => e.organizerClubId === club.id).length;
          return (
            <article
              key={club.id}
              className="bg-white border border-stone-200 rounded-lg p-6 flex flex-col justify-between hover:border-stone-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs text-zinc-500">
                  <span className="font-medium text-blue-800">{club.category}</span>
                  <span className="font-mono tabular-nums">Est. {club.foundedYear}</span>
                </div>

                <h2 className="mt-2.5 font-serif text-xl font-semibold text-zinc-900">
                  {club.name}
                </h2>

                <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
                  {club.summary}
                </p>

                <dl className="mt-5 pt-4 border-t border-stone-100 space-y-2 text-xs text-zinc-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span>{club.meetingLocation}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span className="font-mono tabular-nums">{club.memberCount} active members</span>
                  </div>
                </dl>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
                <span className="text-xs font-mono tabular-nums text-zinc-500">
                  {hostedCount} {hostedCount === 1 ? 'event' : 'events'} listed
                </span>
                <button
                  type="button"
                  onClick={() => onFilterByClub(club.id)}
                  className="px-3.5 py-2 text-xs font-semibold text-zinc-900 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <span>View Events</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
