import type { NavTab } from '../types';

interface TopBarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onHostEvent: () => void;
  scheduleCount: number;
}

export function TopBar({ activeTab, onSelectTab, onHostEvent, scheduleCount }: TopBarProps) {
  const navItems: { id: NavTab; label: string }[] = [
    { id: 'events', label: 'Events' },
    { id: 'schedule', label: scheduleCount > 0 ? `Schedule (${scheduleCount})` : 'Schedule' },
    { id: 'clubs', label: 'Clubs' },
    { id: 'organizer', label: 'Organizer' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#FAF9F6]/95 backdrop-blur-sm border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-8">
        <button
          type="button"
          onClick={() => onSelectTab('events')}
          className="font-serif text-xl font-semibold tracking-tight text-zinc-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 rounded-sm cursor-pointer"
        >
          Campus Event Hub
        </button>

        <nav className="hidden md:flex items-center gap-7" aria-label="Primary navigation">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`py-2 text-sm font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${
                  isActive
                    ? 'border-blue-700 text-zinc-900'
                    : 'border-transparent text-zinc-600 hover:text-zinc-900 hover:border-stone-300'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onHostEvent}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-700"
          >
            Host Event
          </button>
        </div>
      </div>

      {/* Compact mobile nav row */}
      <nav
        className="flex md:hidden items-center justify-around border-t border-stone-200/80 px-2 bg-[#FAF9F6]"
        aria-label="Mobile navigation"
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`py-2.5 px-2 text-xs font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors ${
                isActive ? 'border-blue-700 text-zinc-900' : 'border-transparent text-zinc-600'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
