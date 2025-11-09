import React, { useState } from 'react';
import { Button, Dialog, DialogActions, Input, Textarea } from '@browser-os/ui';
import '@browser-os/ui/dist/ui.css';
import './Calendar.css';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time?: string;
  description?: string;
}

export const CalendarApp: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const handleDateClick = (day: number) => {
    const date = new Date(year, month, day);
    setSelectedDate(date);
    setShowEventDialog(true);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleAddEvent = (title: string, time?: string, description?: string) => {
    if (selectedDate && title) {
      const newEvent: CalendarEvent = {
        id: Date.now().toString(),
        title,
        date: selectedDate,
        time,
        description,
      };
      setEvents([...events, newEvent]);
      setShowEventDialog(false);
      setSelectedDate(null);
    }
  };

  return (
    <div className="calendar-app" style={{ padding: '20px', width: '100%', height: '100%' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button onClick={handlePrevMonth}>←</Button>
        <h2>{monthNames[month]} {year}</h2>
        <Button onClick={handleNextMonth}>→</Button>
      </div>

      <div className="calendar-grid">
        {dayNames.map(day => (
          <div key={day} className="calendar-day-header">{day}</div>
        ))}
        
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="calendar-day empty" />
        ))}
        
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const date = new Date(year, month, day);
          const dayEvents = getEventsForDate(date);
          const isToday = date.toDateString() === new Date().toDateString();
          
          return (
            <div
              key={day}
              className={`calendar-day ${isToday ? 'today' : ''}`}
              onClick={() => handleDateClick(day)}
            >
              <div className="day-number">{day}</div>
              {dayEvents.length > 0 && (
                <div className="day-events">
                  {dayEvents.slice(0, 3).map(event => (
                    <div key={event.id} className="event-dot" title={event.title} />
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="event-more">+{dayEvents.length - 3}</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showEventDialog && selectedDate && (
        <EventDialog
          date={selectedDate}
          onClose={() => {
            setShowEventDialog(false);
            setSelectedDate(null);
          }}
          onSave={handleAddEvent}
        />
      )}

      <div className="events-list" style={{ marginTop: '20px' }}>
        <h3>Upcoming Events</h3>
        {events
          .filter(event => new Date(event.date) >= new Date())
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 5)
          .map(event => (
            <div key={event.id} className="event-item">
              <strong>{event.title}</strong>
              <div>{new Date(event.date).toLocaleDateString()} {event.time}</div>
              {event.description && <div>{event.description}</div>}
            </div>
          ))}
      </div>
    </div>
  );
};

interface EventDialogProps {
  date: Date;
  onClose: () => void;
  onSave: (title: string, time?: string, description?: string) => void;
}

const EventDialog: React.FC<EventDialogProps> = ({ date, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');

  return (
    <Dialog
      open={true}
      onClose={onClose}
      title={`Add Event - ${date.toLocaleDateString()}`}
      actions={
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(title, time, description)} disabled={!title}>
            Save
          </Button>
        </DialogActions>
      }
    >
      <Input
        type="text"
        placeholder="Event title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: '100%', marginBottom: '8px' }}
      />
      <Input
        type="time"
        placeholder="Time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        style={{ width: '100%', marginBottom: '8px' }}
      />
      <Textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{ width: '100%', marginBottom: '8px', minHeight: '100px' }}
      />
    </Dialog>
  );
};
