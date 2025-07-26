'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface ClaimLeadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  leadId: number | null
  quoteId: number | null
  userId: number
  onSuccess?: () => void
}

export function ClaimLeadDialog({
  open,
  onOpenChange,
  leadId,
  quoteId,
  userId,
  onSuccess,
}: ClaimLeadDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isAlreadyClaimed, setIsAlreadyClaimed] = useState(false)
  const supabase = createClientComponentClient()
  const router = useRouter()

  // Add real-time subscription to check if lead gets claimed while dialog is open
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

      // If the lead is already claimed, set the state
      if (data && data.user_id !== null) {
        setIsAlreadyClaimed(true)
      } else {
        setIsAlreadyClaimed(false)
      }
    }

    // Check lead status immediately
    checkLeadStatus()

    // Set up real-time subscription to watch for changes to this quote
    const channel = supabase
      .channel(`quote-${quoteId}`)
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'quotes',
          filter: `id=eq.${quoteId}`
        }, 
        (payload) => {
          // If user_id becomes not null, it means someone else claimed it
          if (payload.new && payload.new.user_id !== null) {
            setIsAlreadyClaimed(true)
            toast.error("This lead has already been claimed", {
              description: "Someone else claimed this lead while you were viewing it."
            })
          }
        })
      .subscribe()

    // Clean up subscription
    return () => {
      supabase.removeChannel(channel)
    }
  }, [open, quoteId, supabase])

  const handleClaimLead = async (): Promise<void> => {
    if (!quoteId) {
      toast.error("Cannot claim this lead", {
        description: "This lead doesn't have an associated quote."
      })
      return
    }

    if (isAlreadyClaimed) {
      toast.error("This lead has already been claimed", {
        description: "Someone else claimed this lead. Please refresh the page to see the updated list."
      })
      onOpenChange(false)
      if (onSuccess) onSuccess()
      return
    }

    setIsLoading(true)
    try {
      // Double check that the lead isn't claimed before proceeding
      const { data: currentQuote, error: checkError } = await supabase
        .from('quotes')
        .select('user_id')
        .eq('id', quoteId)
        .single()

      if (checkError) throw checkError

      if (currentQuote && currentQuote.user_id !== null) {
        throw new Error("This lead has already been claimed by another user.")
      }

      // First, mark this as a self-claim to prevent notification
      const { error: flagError } = await supabase
        .from('quotes')
        .update({ 
          user_id: userId,
          // Add a flag that indicates this is a self-claim, not an assignment
          is_self_claimed: true 
        })
        .eq('id', quoteId)

      if (flagError) {
        throw flagError
      }
      
      // Wait a short time for the database trigger to fire
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Force refresh of notifications by making a dummy request to encourage
      // the real-time subscription to check for updates
      await supabase.from('notification_recipients').select('count').limit(1)

      toast.success("Lead claimed successfully!", {
        description: "This lead has been assigned to you. Follow up as soon as possible."
      })

      // Call success callback if provided
      if (onSuccess) {
        onSuccess()
      }

      // Close the dialog
      onOpenChange(false)
      
      // Redirect to customer sales page
      router.push(`/customers/${quoteId}/sales`)
    } catch (error: any) {
      console.error('Error claiming lead:', error)
      toast.error("Error claiming lead", {
        description: error.message || "Something went wrong. Please try again."
      })
      // Close the dialog on claim error, especially if it's already claimed
      onOpenChange(false)
      if (onSuccess) onSuccess()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isAlreadyClaimed ? "Lead Already Claimed" : "Claim this lead?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isAlreadyClaimed ? (
              "This lead has already been claimed by another user. The leads list will be refreshed."
            ) : (
              "By claiming this lead, you will be responsible for following up with the customer. " +
              "You will be redirected to the sales page for this customer after claiming."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          {!isAlreadyClaimed && (
            <AlertDialogAction asChild>
              <Button 
                variant="default" 
                onClick={handleClaimLead} 
                disabled={isLoading || isAlreadyClaimed}
              >
                {isLoading ? "Claiming..." : "Claim Lead"}
              </Button>
            </AlertDialogAction>
          )}
          {isAlreadyClaimed && (
            <Button 
              variant="default" 
              onClick={() => {
                onOpenChange(false)
                if (onSuccess) onSuccess()
              }}
            >
              Refresh List
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
