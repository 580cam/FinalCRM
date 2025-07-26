'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import CreateOpportunityModal from './CreateOpportunityModal'

interface CreateOpportunityButtonProps {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export default function CreateOpportunityButton({
  variant = 'default',
  size = 'default',
  className
}: CreateOpportunityButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={`bg-blue-600 hover:bg-blue-700 text-white ${className}`}
        onClick={() => setIsModalOpen(true)}
      >
        <PlusCircle className="h-4 w-4 mr-2" />
        Create Opportunity
      </Button>
      
      <CreateOpportunityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          // We could trigger a refresh of the customer data here if needed
        }}
      />
    </>
  )
}
