'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import CreateLeadModal from './CreateLeadModal'
import { useRouter } from 'next/navigation'

export default function CreateLeadButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()
  
  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)
  
  const handleSuccess = () => {
    closeModal()
    router.refresh() // Refresh the page data
  }
  
  return (
    <>
      <Button onClick={openModal} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
        Add New Lead
      </Button>
      
      <CreateLeadModal 
        isOpen={isModalOpen}
        onClose={closeModal}
        onSuccess={handleSuccess}
      />
    </>
  )
}
