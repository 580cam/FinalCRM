'use client'

import { useState, useEffect, useRef } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { notifyLeadAssignment } from '@/lib/notifications'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { User } from '@/types/leads'

interface AssignLeadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  users: User[]
  leadId: number | null
  quoteId: number | null
  onSuccess?: () => void
}

export function AssignLeadDialog({
  open,
  onOpenChange,
  users,
  leadId,
  quoteId,
  onSuccess,
}: AssignLeadDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const supabase = createClientComponentClient()
  const router = useRouter()

  // Get the current user's ID on component mount
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user?.email) {
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('email', session.user.email)
          .single()
        
        if (userData) {
          setCurrentUserId(userData.id)
        }
      }
    }
    
    getCurrentUser()
  }, [supabase])

  // Check if lead is already claimed and set initial selected user
  useEffect(() => {
    if (!open || !quoteId) return

    // First check if the lead is already claimed
    const checkLeadStatus = async () => {
      const { data, error } = await supabase
        .from('quotes')
        .select('user_id')
        .eq('id', quoteId)
        .single()

      if (error) {
        console.error('Error checking lead status:', error)
        return
      }

      // If the lead is already claimed by another user, set the state
      if (data && data.user_id !== null) {
        // We still allow assignment (reassignment) but we'll set the selected user
        setSelectedUserId(data.user_id.toString())
      }
    }

    // Check lead status immediately
    checkLeadStatus()
  }, [open, quoteId, supabase])

  const handleAssignLead = async () => {
    if (!quoteId || !selectedUserId) {
      toast.error("Cannot assign this lead", {
        description: "Please select a user to assign this lead to."
      })
      return
    }

    setIsLoading(true)
    
    try {
      // Check if this is a self-assignment
      const isSelfAssignment = currentUserId === parseInt(selectedUserId);
      
      console.log("Current user ID:", currentUserId);
      console.log("Selected user ID:", parseInt(selectedUserId));
      console.log("Is self assignment:", isSelfAssignment);
      
      // Update the quotes table with the new user_id
      const { error } = await supabase
        .from('quotes')
        .update({ 
          user_id: parseInt(selectedUserId),
          // Set is_self_claimed=true if current user is assigning to themselves
          is_self_claimed: isSelfAssignment
        })
        .eq('id', quoteId)

      if (error) {
        throw error
      }

      toast.success("Lead assigned successfully!")
      
      // Close the dialog immediately to prevent any real-time notifications
      onOpenChange(false)
      
      // Call the success callback if provided
      if (onSuccess) {
        onSuccess()
      }
      
      // Refresh the page
      router.refresh()
    } catch (error: any) {
      console.error('Error assigning lead:', error)
      toast.error("Error assigning lead", {
        description: error.message || "Something went wrong. Please try again."
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Lead</DialogTitle>
          <DialogDescription>
            Select a user to assign this lead to. They will be notified of the assignment.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Select onValueChange={setSelectedUserId} value={selectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssignLead} disabled={isLoading || !selectedUserId}>
            {isLoading ? "Assigning..." : "Assign Lead"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
