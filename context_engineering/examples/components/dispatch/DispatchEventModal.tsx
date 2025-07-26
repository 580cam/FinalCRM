'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getMockResources } from '@/lib/mock/dispatchData'
import { DispatchEvent } from '@/types/dispatch'

interface DispatchEventModalProps {
  event: DispatchEvent
  onClose: () => void
  onSave: (updatedEvent: DispatchEvent) => void
}

export default function DispatchEventModal({ event, onClose, onSave }: DispatchEventModalProps) {
  const resources = getMockResources()
  const [formValues, setFormValues] = useState({
    title: event.title,
    status: event.status,
    quoteId: event.quoteId.toString(),
    resourceIds: event.resourceIds,
    start: event.start,
    end: event.end
  })
  
  // For demonstration purposes - in a real app would save to database
  const handleSave = () => {
    // Process form values and save
    console.log('Saving event:', formValues)
    onClose()
  }
  
  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{event.id ? 'Edit Move' : 'New Move'}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={formValues.title}
              onChange={(e) => setFormValues({ ...formValues, title: e.target.value })}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quoteId" className="text-right">
              Quote ID
            </Label>
            <Input
              id="quoteId"
              value={formValues.quoteId}
              onChange={(e) => setFormValues({ ...formValues, quoteId: e.target.value })}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select 
              value={formValues.status} 
              onValueChange={(value) => setFormValues({ ...formValues, status: value as any })}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="delayed">Delayed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Start Date</Label>
            <div className="col-span-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formValues.start && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formValues.start ? format(formValues.start, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formValues.start}
                    onSelect={(date) => date && setFormValues({ ...formValues, start: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">End Date</Label>
            <div className="col-span-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formValues.end && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formValues.end ? format(formValues.end, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formValues.end}
                    onSelect={(date) => date && setFormValues({ ...formValues, end: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Assigned Resources</Label>
            <div className="col-span-3">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Add a resource" />
                </SelectTrigger>
                <SelectContent>
                  {resources.map(resource => (
                    <SelectItem key={resource.id} value={resource.id}>
                      {resource.title} ({resource.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {formValues.resourceIds.length > 0 ? (
                <div className="mt-2 space-y-1">
                  {formValues.resourceIds.map(id => {
                    const resource = resources.find(r => r.id === id)
                    return (
                      <div key={id} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                        <span className="text-sm">{resource?.title}</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setFormValues({
                            ...formValues,
                            resourceIds: formValues.resourceIds.filter(r => r !== id)
                          })}
                        >
                          Remove
                        </Button>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-2">No resources assigned</p>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => {
            // Create the updated event object
            const updatedEvent: DispatchEvent = {
              ...event,
              title: formValues.title,
              start: formValues.start,
              end: formValues.end,
              quoteId: parseInt(formValues.quoteId) || 0,
              resourceIds: formValues.resourceIds,
              status: formValues.status as 'scheduled' | 'in-progress' | 'completed' | 'delayed'
            }
            // Call the onSave callback with the updated event
            onSave(updatedEvent)
          }}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
