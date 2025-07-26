'use client'

import { useState } from 'react'
import { getMockResources } from '@/lib/mock/dispatchData'
import { Check, Truck, Users, Package } from 'lucide-react'

export default function DispatchResourceList() {
  const [filterType, setFilterType] = useState<string | null>(null)
  const resources = getMockResources()
  
  // Filter resources by type if a filter is selected
  const filteredResources = filterType 
    ? resources.filter(resource => resource.type === filterType)
    : resources
  
  // Icon mapping for resource types
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'crew':
        return <Users className="h-4 w-4" />
      case 'truck':
        return <Truck className="h-4 w-4" />
      case 'equipment':
        return <Package className="h-4 w-4" />
      default:
        return null
    }
  }
  
  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Resources</h2>
      
      {/* Resource type filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setFilterType(null)}
          className={`px-3 py-1.5 text-xs font-medium rounded-full ${
            filterType === null 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilterType('crew')}
          className={`px-3 py-1.5 text-xs font-medium rounded-full flex items-center gap-1 ${
            filterType === 'crew' 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Users className="h-3 w-3" /> Crews
        </button>
        <button
          onClick={() => setFilterType('truck')}
          className={`px-3 py-1.5 text-xs font-medium rounded-full flex items-center gap-1 ${
            filterType === 'truck' 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Truck className="h-3 w-3" /> Trucks
        </button>
        <button
          onClick={() => setFilterType('equipment')}
          className={`px-3 py-1.5 text-xs font-medium rounded-full flex items-center gap-1 ${
            filterType === 'equipment' 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Package className="h-3 w-3" /> Equipment
        </button>
      </div>
      
      {/* Resource list */}
      <div className="flex-1 overflow-y-auto">
        <ul className="divide-y divide-gray-200">
          {filteredResources.map(resource => (
            <li key={resource.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-3">
                  {getResourceIcon(resource.type)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{resource.title}</p>
                  <p className="text-xs text-gray-500 capitalize">{resource.type}</p>
                </div>
              </div>
              <div className="flex items-center">
                {resource.availability.length > 0 ? (
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                    <Check className="h-3 w-3 mr-1" />
                    Available
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
                    Booked
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Add resource button */}
      <button className="mt-4 w-full flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
        Add Resource
      </button>
    </div>
  )
}
