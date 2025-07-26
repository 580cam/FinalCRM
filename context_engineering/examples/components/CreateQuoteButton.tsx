'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'

export default function CreateQuoteButton() {
  const router = useRouter()

  return (
    <Button 
      onClick={() => router.push('/quotes/new')}
      className="bg-blue-600 hover:bg-blue-700 text-white"
    >
      <Plus className="h-4 w-4 mr-2" />
      Create Quote
    </Button>
  )
}
