'use client'

import { useState } from 'react'
import { Edit2, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface LeadInfoHeaderProps {
  quoteId: number
  name: string
  email: string
  phone: string
  status: string
  createdAt: string
}

export function LeadInfoHeader({
  quoteId,
  name,
  email,
  phone, 
  status,
  createdAt
}: LeadInfoHeaderProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editName, setEditName] = useState(name)
  const [editEmail, setEditEmail] = useState(email)
  const [editPhone, setEditPhone] = useState(phone)

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'lead':
        return 'bg-gray-500'
      case 'hot lead':
        return 'bg-red-500'
      case 'opportunity':
        return 'bg-blue-500'
      case 'booked':
        return 'bg-green-500'
      case 'confirmed':
        return 'bg-emerald-500'
      case 'completed':
        return 'bg-purple-500'
      default:
        return 'bg-gray-500'
    }
  }

  const handleSaveEdit = async () => {
    // Here you would implement the actual save to DB
    // Example code:
    // const supabase = createClient()
    // await supabase.from('leads').update({
    //   name: editName,
    //   email: editEmail,
    //   phone: editPhone
    // }).eq('id', leadId)
    
    setIsEditDialogOpen(false)
    // You would refresh data here
  }

  return (
    <Card className="border-b mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">{name}</h2>
              <button 
                onClick={() => setIsEditDialogOpen(true)}
                className="text-gray-500 hover:text-gray-700"
              >
                <Edit2 size={16} />
              </button>
              <Badge className={`${getStatusColor(status)} text-white ml-2`}>
                {status}
              </Badge>
            </div>
            <div className="text-sm text-gray-500 flex gap-4 mt-1">
              <div>Email: {email}</div>
              <div>Phone: {phone}</div>
              <div>Created: {new Date(createdAt).toLocaleDateString()}</div>
              <div>ID: {quoteId}</div>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="mr-3 text-right">
              <div className="text-sm text-gray-500">Next follow up</div>
              <div className="font-medium">Not scheduled</div>
            </div>
            <Button size="sm" variant="outline" className="flex items-center gap-1">
              <Calendar size={14} />
              Create Follow Up
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Lead Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                value={editName} 
                onChange={(e) => setEditName(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={editEmail} 
                onChange={(e) => setEditEmail(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone" 
                value={editPhone} 
                onChange={(e) => setEditPhone(e.target.value)} 
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
