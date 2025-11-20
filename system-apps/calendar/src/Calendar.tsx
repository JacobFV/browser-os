import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import './Calendar.css';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: Date;
  time?: string;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const Calendar: React.FC<{ os: any }> = ({ os }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      // Try to load events from filesystem
      const eventsPath = '/home/user/calendar/events.json';
      const exists = await os.syscall('fs.exists', { path: eventsPath });
      if (exists) {
        const data = await os.syscall('fs.read', { path: eventsPath });
        const text = new TextDecoder().decode(data);
        const parsed = JSON.parse(text);
        setEvents(parsed.map((e: any) => ({
          ...e,
          date: new Date(e.date)
        })));
      }
    } catch (e) {
      console.error('Failed to load events:', e);
    }
  };

  const saveEvents = async () => {
    try {
      const eventsPath = '/home/user/calendar/events.json';
      await os.syscall('fs.mkdir', { path: '/home/user/calendar' });
      const json = JSON.stringify(events.map(e => ({
        ...e,
        date: e.date.toISOString()
      })));
      await os.syscall('fs.write', { 
        path: eventsPath, 
        data: new TextEncoder().encode(json) 
      });
    } catch (e) {
      console.error('Failed to save events:', e);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: Date[] = [];
    
    // Add previous month's trailing days
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push(new Date(year, month - 1, prevMonth.getDate() - i));
    }
    
    // Add current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    // Add next month's leading days to fill grid
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push(new Date(year, month + 1, i));
    }
    
    return days;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const isSameMonth = (date1: Date, date2: Date) => {
    return date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(e => isSameDay(e.date, date));
  };

  const handleAddEvent = (eventData: Partial<CalendarEvent>) => {
    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: eventData.title || 'Untitled Event',
      description: eventData.description,
      date: eventData.date || new Date(),
      time: eventData.time,
    };
    setEvents([...events, newEvent]);
    saveEvents();
    setShowEventForm(false);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
    saveEvents();
  };

  const days = getDaysInMonth(currentDate);
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="calendar-app">
      <div className="calendar-header">
        <div className="calendar-title">
          {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
        </div>
        <div className="calendar-nav">
          <button className="calendar-nav-btn" onClick={handlePrevMonth}>
            <ChevronLeft size={18} />
          </button>
          <button className="today-btn" onClick={handleToday}>Today</button>
          <button className="calendar-nav-btn" onClick={handleNextMonth}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="calendar-content">
        <div className="calendar-grid">
          <div className="weekdays">
            {WEEKDAYS.map(day => (
              <div key={day} className="weekday">{day}</div>
            ))}
          </div>
          <div className="days-grid">
            {days.map((day, index) => {
              const dayEvents = getEventsForDate(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              
              return (
                <div
                  key={index}
                  className={`day-cell ${
                    !isSameMonth(day, currentDate) ? 'other-month' : ''
                  } ${isToday(day) ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedDate(day)}
                >
                  <div className="day-number">{day.getDate()}</div>
                  <div className="day-events">
                    {dayEvents.slice(0, 3).map(event => (
                      <div key={event.id} className="event-dot" title={event.title}>
                        {event.time ? `${event.time} ` : ''}{event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="event-dot other">+{dayEvents.length - 3} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="events-panel">
          <div className="events-header">
            {selectedDate 
              ? `${MONTHS[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`
              : 'Select a date'}
          </div>
          
          {selectedDate && (
            <>
              <button className="add-event-btn" onClick={() => {
                setEditingEvent(null);
                setShowEventForm(true);
              }}>
                <Plus size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                Add Event
              </button>
              
              <div className="events-list">
                {selectedDateEvents.length === 0 ? (
                  <div style={{ padding: 20, textAlign: 'center', color: '#999' }}>
                    No events scheduled
                  </div>
                ) : (
                  selectedDateEvents.map(event => (
                    <div key={event.id} className="event-item">
                      {event.time && <div className="event-time">{event.time}</div>}
                      <div className="event-title">{event.title}</div>
                      {event.description && <div className="event-description">{event.description}</div>}
                      <button 
                        onClick={() => handleDeleteEvent(event.id)}
                        style={{ marginTop: 8, fontSize: 12, color: '#d32f2f', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        Delete
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {showEventForm && (
        <EventForm
          date={selectedDate || new Date()}
          event={editingEvent}
          onSave={(data) => {
            if (editingEvent) {
              setEvents(events.map(e => e.id === editingEvent.id ? { ...e, ...data } : e));
              saveEvents();
            } else {
              handleAddEvent(data);
            }
            setShowEventForm(false);
            setEditingEvent(null);
          }}
          onCancel={() => {
            setShowEventForm(false);
            setEditingEvent(null);
          }}
        />
      )}
    </div>
  );
};

interface EventFormProps {
  date: Date;
  event?: CalendarEvent | null;
  onSave: (data: Partial<CalendarEvent>) => void;
  onCancel: () => void;
}

const EventForm: React.FC<EventFormProps> = ({ date, event, onSave, onCancel }) => {
  const [title, setTitle] = useState(event?.title || '');
  const [description, setDescription] = useState(event?.description || '');
  const [time, setTime] = useState(event?.time || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      description,
      date: event?.date || date,
      time: time || undefined,
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: 8,
        padding: 24,
        width: 400,
        maxWidth: '90%'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ margin: 0 }}>{event ? 'Edit Event' : 'New Event'}</h2>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              className="form-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Time (optional)</label>
            <input
              className="form-input"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Description (optional)</label>
            <textarea
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          
          <div className="form-actions">
            <button type="button" className="form-btn secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="form-btn primary">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
