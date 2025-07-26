'use client'

import { useState } from 'react'
import { Calendar, momentLocalizer, Views } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { getMockDispatchEvents } from '@/lib/mock/dispatchData'
import DispatchEventModal from './DispatchEventModal'
import { DispatchEvent } from '@/types/dispatch'

// Setup localizer for react-big-calendar
const localizer = momentLocalizer(moment)

interface DispatchCalendarProps {
  view: string
  onViewChange?: (view: string) => void
}

export default function DispatchCalendar({ view, onViewChange }: DispatchCalendarProps) {
  // Get mock dispatch events
  const events = getMockDispatchEvents()
  
  // State for selected event and modal visibility
  const [selectedEvent, setSelectedEvent] = useState<DispatchEvent | null>(null)
  const [showModal, setShowModal] = useState(false)
  
  // Handle event selection
  const handleSelectEvent = (event: DispatchEvent) => {
    setSelectedEvent(event)
    setShowModal(true)
  }

  // Handle creating a new event
  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    // Create a new empty event
    const newEvent: DispatchEvent = {
      id: 0, // Will be set when saved
      title: 'New Move',
      start,
      end,
      quoteId: 0,
      resourceIds: [],
      status: 'scheduled'
    }
    
    setSelectedEvent(newEvent)
    setShowModal(true)
  }

  // Close the modal
  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedEvent(null)
  }

  // Event style based on status
  const eventStyleGetter = (event: DispatchEvent) => {
    let backgroundColor = '#3174ad'
    
    switch (event.status) {
      case 'in-progress':
        backgroundColor = '#9333ea' // Purple
        break
      case 'completed':
        backgroundColor = '#16a34a' // Green
        break
      case 'delayed':
        backgroundColor = '#dc2626' // Red
        break
      default:
        backgroundColor = '#3b82f6' // Blue (scheduled)
    }
    
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: '0',
        display: 'block'
      }
    }
  }
  
  // Map string view name to Views constants
  const getViewName = (viewName: string) => {
    const upperView = viewName.toUpperCase();
    return Views[upperView as keyof typeof Views] || Views.MONTH;
  };

  return (
    <div className="h-[calc(100vh-250px)] min-h-[500px] bg-white p-4 rounded-md">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        view={getViewName(view)}
        views={{
          month: true,
          week: true,
          day: true,
          agenda: true
        }}
        selectable
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        eventPropGetter={eventStyleGetter}
        onView={(newView) => onViewChange && onViewChange(newView)}
      />
      
      {showModal && selectedEvent && (
        <DispatchEventModal
          event={selectedEvent}
          onClose={handleCloseModal}
          onSave={(updatedEvent) => {
            console.log('Event saved:', updatedEvent)
            handleCloseModal()
          }}
        />
      )}
    </div>
  )
}
