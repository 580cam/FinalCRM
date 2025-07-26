'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
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
import { notifyOpportunityAssignment } from '@/lib/notifications'

interface AssignOpportunityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  users: User[]
  customerId: number | null
  onSuccess?: () => void
}

export function AssignOpportunityDialog({
  open,
  onOpenChange,
  users,
  customerId,
  onSuccess,
}: AssignOpportunityDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const supabase = createClientComponentClient()
  const router = useRouter()

  // Get the current user's ID on component mount
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        const { data: userData, error } = await supabase
          .from('users')
          .select('id')
          .eq('email', session.user.email)
          .single()
        
        if (!error && userData) {
          setCurrentUserId(userData.id)
        }
      }
    }
    
    getCurrentUser()
  }, [supabase.auth])

  // Check if the opportunity is already assigned when the dialog opens
  useEffect(() => {
    if (!open || !customerId) return
    
    const checkOpportunityStatus = async () => {
      // Reset selected user ID each time the dialog opens
      setSelectedUserId('')
      
      // Get all quotes for this customer
      const { data, error } = await supabase
        .from('quotes')
        .select('user_id')
        .eq('lead_id', customerId)
        .not('user_id', 'is', null)
        .limit(1)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking opportunity status:', error)
        return
      }
      
      // If the opportunity is already assigned to a user, set the state
      if (data && data.user_id !== null) {
        // We still allow assignment (reassignment) but we'll set the selected user
        setSelectedUserId(data.user_id.toString())
      }
    }
    
    // Check opportunity status immediately
    checkOpportunityStatus()
  }, [open, customerId, supabase])

  const handleAssignOpportunity = async () => {
    if (!customerId || !selectedUserId) {
      toast.error("Cannot assign this opportunity", {
        description: "Please select a user to assign this opportunity to."
      })
      return
    }

    setIsLoading(true)
    
    try {
      // Check if this is a self-assignment
      const isSelfAssignment = currentUserId === parseInt(selectedUserId);
      
      // Get all quotes for this customer
      const { data: customerQuotes, error: quotesError } = await supabase
        .from('quotes')
        .select('id')
        .eq('lead_id', customerId)
      
      if (quotesError) throw quotesError
      
      if (!customerQuotes || customerQuotes.length === 0) {
        throw new Error('No quotes found for this customer')
      }
      
      // Update all quotes for this customer
      const quoteIds = customerQuotes.map(quote => quote.id)
      const { error: updateError } = await supabase
        .from('quotes')
        .update({ 
          user_id: parseInt(selectedUserId),
          is_self_claimed: isSelfAssignment
        })
        .in('id', quoteIds)
      
      if (updateError) throw updateError

      // Create notification for the assigned user if it's not a self-assignment
      // Commenting out this manual notification creation since the database trigger handles it now
      /*
      if (!isSelfAssignment) {
        await notifyOpportunityAssignment(
          parseInt(selectedUserId),
          currentUserId || undefined
        )
      }
      */

      toast.success("Opportunity assigned successfully!")
      
      // Close the dialog immediately
      onOpenChange(false)
      
      // Call the success callback if provided
      if (onSuccess) {
        onSuccess()
      }
      
      // Refresh the page
      router.refresh()
    } catch (error: any) {
      console.error('Error assigning opportunity:', error)
      toast.error("Error assigning opportunity", {
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
          <DialogTitle>Assign Opportunity</DialogTitle>
          <DialogDescription>
            Select a user to assign this opportunity to. They will be notified of the assignment.
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
          <Button onClick={handleAssignOpportunity} disabled={isLoading || !selectedUserId}>
            {isLoading ? "Assigning..." : "Assign Opportunity"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
