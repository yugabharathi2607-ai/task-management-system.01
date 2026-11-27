export type EventCategory =
  | 'Academic'
  | 'Tech & Build'
  | 'Arts & Music'
  | 'Clubs & Social'
  | 'Sports & Rec';

export type NavTab = 'events' | 'schedule' | 'clubs' | 'organizer';

export type DateWindow = 'all' | 'today' | 'week' | 'weekend';

export type SortOrder = 'soonest' | 'popular' | 'seats';

export interface AgendaItem {
  time: string;
  title: string;
  detail: string;
}

export interface EventFeedback {
  id: string;
  author: string;
  rating: number;
  comment: string;
  submittedAt: string;
}

export interface AttendeeRecord {
  id: string;
  name: string;
  email: string;
  passCode: string;
  checkedIn: boolean;
  registeredAt: string;
}

export interface CampusEvent {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: EventCategory;
  dateISO: string; // YYYY-MM-DD
  startTime: string; // HH:MM (24h)
  endTime: string; // HH:MM (24h)
  venue: string;
  room: string;
  accessibility: string;
  organizerClubId: string;
  organizerName: string;
  speaker: string;
  capacity: number;
  registeredCount: number;
  imageUrl: string;
  featured?: boolean;
  agenda: AgendaItem[];
  attendees: AttendeeRecord[];
  feedback: EventFeedback[];
}

export interface StudentClub {
  id: string;
  name: string;
  category: EventCategory;
  foundedYear: number;
  memberCount: number;
  meetingLocation: string;
  summary: string;
  leadContact: string;
}

export interface RsvpRecord {
  eventId: string;
  passCode: string;
  registeredAt: string;
  checkedIn: boolean;
}
