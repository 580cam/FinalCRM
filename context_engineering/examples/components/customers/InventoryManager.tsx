'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Camera, 
  Edit, 
  Trash2, 
  Copy, 
  RefreshCw,
  Package,
  Home,
  AlertCircle,
  CheckCircle,
  Eye,
  MoreVertical
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  CustomerInventoryItem,
  InventorySource,
  InventoryManagerProps
} from '@/types/customers'
import { cn } from '@/lib/utils'

// Inventory source configuration
const INVENTORY_SOURCES: Record<InventorySource, { label: string; icon: React.ReactNode; color: string }> = {
  yembo_ai: {
    label: 'Yembo AI',
    icon: <Camera className="h-4 w-4" />,
    color: 'bg-purple-100 text-purple-700'
  },
  crm_entry: {
    label: 'CRM Entry',
    icon: <Edit className="h-4 w-4" />,
    color: 'bg-blue-100 text-blue-700'
  },
  customer_portal: {
    label: 'Customer Portal',
    icon: <Home className="h-4 w-4" />,
    color: 'bg-green-100 text-green-700'
  },
  phone_survey: {
    label: 'Phone Survey',
    icon: <Package className="h-4 w-4" />,
    color: 'bg-orange-100 text-orange-700'
  },
  in_home_survey: {
    label: 'In-Home Survey',
    icon: <CheckCircle className="h-4 w-4" />,
    color: 'bg-teal-100 text-teal-700'
  },
  video_survey: {
    label: 'Video Survey',
    icon: <Eye className="h-4 w-4" />,
    color: 'bg-indigo-100 text-indigo-700'
  }
}

// Standard inventory categories and items
const STANDARD_INVENTORY = {
  'Living Room': [
    { name: 'Sofa', cubic_feet: 50, weight: 150 },
    { name: 'Coffee Table', cubic_feet: 15, weight: 50 },
    { name: 'TV Stand', cubic_feet: 25, weight: 75 },
    { name: 'Armchair', cubic_feet: 35, weight: 100 },
    { name: 'End Table', cubic_feet: 8, weight: 30 },
    { name: 'Bookshelf', cubic_feet: 40, weight: 120 },
    { name: 'Entertainment Center', cubic_feet: 60, weight: 200 }
  ],
  'Bedroom': [
    { name: 'Queen Bed', cubic_feet: 70, weight: 200 },
    { name: 'King Bed', cubic_feet: 85, weight: 250 },
    { name: 'Twin Bed', cubic_feet: 45, weight: 125 },
    { name: 'Dresser', cubic_feet: 45, weight: 150 },
    { name: 'Nightstand', cubic_feet: 12, weight: 40 },
    { name: 'Wardrobe', cubic_feet: 80, weight: 180 },
    { name: 'Chest of Drawers', cubic_feet: 30, weight: 100 }
  ],
  'Kitchen': [
    { name: 'Refrigerator', cubic_feet: 65, weight: 300 },
    { name: 'Stove/Range', cubic_feet: 35, weight: 200 },
    { name: 'Dishwasher', cubic_feet: 25, weight: 150 },
    { name: 'Microwave', cubic_feet: 5, weight: 50 },
    { name: 'Kitchen Table', cubic_feet: 25, weight: 75 },
    { name: 'Kitchen Chairs (each)', cubic_feet: 8, weight: 25 }
  ],
  'Dining Room': [
    { name: 'Dining Table', cubic_feet: 40, weight: 120 },
    { name: 'Dining Chairs (each)', cubic_feet: 12, weight: 35 },
    { name: 'China Cabinet', cubic_feet: 65, weight: 180 },
    { name: 'Buffet', cubic_feet: 50, weight: 140 }
  ],
  'Office': [
    { name: 'Desk', cubic_feet: 30, weight: 100 },
    { name: 'Office Chair', cubic_feet: 15, weight: 50 },
    { name: 'Filing Cabinet', cubic_feet: 20, weight: 75 },
    { name: 'Bookshelf', cubic_feet: 40, weight: 120 }
  ],
  'Appliances': [
    { name: 'Washer', cubic_feet: 30, weight: 200 },
    { name: 'Dryer', cubic_feet: 30, weight: 150 },
    { name: 'Water Heater', cubic_feet: 20, weight: 120 }
  ],
  'Miscellaneous': [
    { name: 'Boxes (Small)', cubic_feet: 1.5, weight: 30 },
    { name: 'Boxes (Medium)', cubic_feet: 3, weight: 45 },
    { name: 'Boxes (Large)', cubic_feet: 6, weight: 60 },
    { name: 'Mattress (Queen)', cubic_feet: 30, weight: 100 },
    { name: 'Mattress (King)', cubic_feet: 35, weight: 120 }
  ]
}

// Add/Edit inventory item dialog
interface AddInventoryItemDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (item: Partial<CustomerInventoryItem>) => void
  item?: CustomerInventoryItem | null
  rooms: string[]
}

function AddInventoryItemDialog({ isOpen, onClose, onSave, item, rooms }: AddInventoryItemDialogProps) {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    description: item?.description || '',
    room_location: item?.room_location || '',
    cubic_feet: item?.cubic_feet || 0,
    weight: item?.weight || 0,
    quantity: item?.quantity || 1,
    special_handling: item?.special_handling || [],
    packing_required: item?.packing_required || false,
    disassembly_required: item?.disassembly_required || false,
    value_estimate: item?.value_estimate || 0,
    condition_notes: item?.condition_notes || ''
  })

  const handleSave = useCallback(() => {
    if (!formData.name.trim()) {
      toast.error('Item name is required')
      return
    }
    
    onSave({
      ...item,
      ...formData,
      special_handling: Array.isArray(formData.special_handling) 
        ? formData.special_handling 
        : formData.special_handling.split(',').map(s => s.trim()).filter(Boolean)
    })
    onClose()
  }, [formData, item, onSave, onClose])

  const loadStandardItem = useCallback((category: string, standardItem: any) => {
    setFormData(prev => ({
      ...prev,
      name: standardItem.name,
      cubic_feet: standardItem.cubic_feet,
      weight: standardItem.weight,
      room_location: category
    }))
  }, [])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Inventory Item' : 'Add Inventory Item'}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="standard">Standard Items</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Item Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Queen Bed"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Room Location</label>
                <Select
                  value={formData.room_location}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, room_location: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map(room => (
                      <SelectItem key={room} value={room}>{room}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed description of the item"
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Cubic Feet</label>
                <Input
                  type="number"
                  value={formData.cubic_feet}
                  onChange={(e) => setFormData(prev => ({ ...prev, cubic_feet: Number(e.target.value) }))}
                  min="0"
                  step="0.5"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Weight (lbs)</label>
                <Input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: Number(e.target.value) }))}
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity</label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                  min="1"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Value Estimate ($)</label>
                <Input
                  type="number"
                  value={formData.value_estimate}
                  onChange={(e) => setFormData(prev => ({ ...prev, value_estimate: Number(e.target.value) }))}
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Special Handling</label>
                <Input
                  value={Array.isArray(formData.special_handling) ? formData.special_handling.join(', ') : formData.special_handling}
                  onChange={(e) => setFormData(prev => ({ ...prev, special_handling: e.target.value }))}
                  placeholder="e.g., fragile, heavy, antique"
                />
              </div>
            </div>
            
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="packing_required"
                  checked={formData.packing_required}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, packing_required: checked as boolean }))}
                />
                <label htmlFor="packing_required" className="text-sm">Requires Packing</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="disassembly_required"
                  checked={formData.disassembly_required}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, disassembly_required: checked as boolean }))}
                />
                <label htmlFor="disassembly_required" className="text-sm">Requires Disassembly</label>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Condition Notes</label>
              <Textarea
                value={formData.condition_notes}
                onChange={(e) => setFormData(prev => ({ ...prev, condition_notes: e.target.value }))}
                placeholder="Condition, damage, or special notes"
                rows={2}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="standard" className="space-y-4">
            <div className="grid gap-4">
              {Object.entries(STANDARD_INVENTORY).map(([category, items]) => (
                <Card key={category}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">{category}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {items.map((standardItem, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded border hover:bg-gray-50">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{standardItem.name}</div>
                          <div className="text-xs text-gray-500">
                            {standardItem.cubic_feet} ft³ • {standardItem.weight} lbs
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadStandardItem(category, standardItem)}
                        >
                          Use
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>
            {item ? 'Update Item' : 'Add Item'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Inventory summary stats
interface InventorySummaryProps {
  inventory: CustomerInventoryItem[]
}

function InventorySummary({ inventory }: InventorySummaryProps) {
  const stats = useMemo(() => {
    const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0)
    const totalCubicFeet = inventory.reduce((sum, item) => sum + (item.cubic_feet * item.quantity), 0)
    const totalWeight = inventory.reduce((sum, item) => sum + ((item.weight || 0) * item.quantity), 0)
    const totalValue = inventory.reduce((sum, item) => sum + ((item.value_estimate || 0) * item.quantity), 0)
    const packingRequired = inventory.filter(item => item.packing_required).length
    const specialHandling = inventory.filter(item => item.special_handling && item.special_handling.length > 0).length
    
    return {
      totalItems,
      totalCubicFeet,
      totalWeight,
      totalValue,
      packingRequired,
      specialHandling
    }
  }, [inventory])

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.totalItems}</div>
          <div className="text-xs text-gray-600">Total Items</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{Math.round(stats.totalCubicFeet)}</div>
          <div className="text-xs text-gray-600">Cubic Feet</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{Math.round(stats.totalWeight)}</div>
          <div className="text-xs text-gray-600">Weight (lbs)</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">
            ${new Intl.NumberFormat('en-US', { notation: 'compact' }).format(stats.totalValue)}
          </div>
          <div className="text-xs text-gray-600">Est. Value</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-teal-600">{stats.packingRequired}</div>
          <div className="text-xs text-gray-600">Need Packing</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{stats.specialHandling}</div>
          <div className="text-xs text-gray-600">Special Handling</div>
        </CardContent>
      </Card>
    </div>
  )
}

// Main InventoryManager component
export default function InventoryManager({
  customerId,
  inventory,
  onInventoryUpdate,
  onYemboSync,
  readOnly = false
}: InventoryManagerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [roomFilter, setRoomFilter] = useState<string>('all')
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CustomerInventoryItem | null>(null)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Get unique rooms for filtering
  const rooms = useMemo(() => {
    const roomSet = new Set(inventory.map(item => item.room_location).filter(Boolean))
    return Array.from(roomSet).sort()
  }, [inventory])

  // Filter inventory based on search and filters
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch = searchTerm === '' || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.room_location.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesRoom = roomFilter === 'all' || item.room_location === roomFilter
      const matchesSource = sourceFilter === 'all' || item.source === sourceFilter
      
      return matchesSearch && matchesRoom && matchesSource
    })
  }, [inventory, searchTerm, roomFilter, sourceFilter])

  const handleAddItem = useCallback(async (itemData: Partial<CustomerInventoryItem>) => {
    try {
      setIsLoading(true)
      const newItem: CustomerInventoryItem = {
        id: Date.now().toString(), // Temporary ID
        ...itemData,
        source: 'crm_entry',
        created_by: 'current_user', // Replace with actual user
        photo_urls: [],
        special_handling: Array.isArray(itemData.special_handling) 
          ? itemData.special_handling 
          : (itemData.special_handling || '').split(',').map(s => s.trim()).filter(Boolean)
      } as CustomerInventoryItem

      const updatedInventory = [...inventory, newItem]
      await onInventoryUpdate(updatedInventory)
      toast.success('Inventory item added successfully')
    } catch (error) {
      console.error('Error adding inventory item:', error)
      toast.error('Failed to add inventory item')
    } finally {
      setIsLoading(false)
    }
  }, [inventory, onInventoryUpdate])

  const handleEditItem = useCallback(async (itemData: Partial<CustomerInventoryItem>) => {
    if (!editingItem) return

    try {
      setIsLoading(true)
      const updatedInventory = inventory.map(item =>
        item.id === editingItem.id
          ? { 
              ...item, 
              ...itemData,
              special_handling: Array.isArray(itemData.special_handling) 
                ? itemData.special_handling 
                : (itemData.special_handling || '').split(',').map(s => s.trim()).filter(Boolean)
            }
          : item
      )
      await onInventoryUpdate(updatedInventory)
      setEditingItem(null)
      toast.success('Inventory item updated successfully')
    } catch (error) {
      console.error('Error updating inventory item:', error)
      toast.error('Failed to update inventory item')
    } finally {
      setIsLoading(false)
    }
  }, [editingItem, inventory, onInventoryUpdate])

  const handleDeleteItem = useCallback(async (itemId: string) => {
    try {
      setIsLoading(true)
      const updatedInventory = inventory.filter(item => item.id !== itemId)
      await onInventoryUpdate(updatedInventory)
      toast.success('Inventory item deleted successfully')
    } catch (error) {
      console.error('Error deleting inventory item:', error)
      toast.error('Failed to delete inventory item')
    } finally {
      setIsLoading(false)
    }
  }, [inventory, onInventoryUpdate])

  const handleYemboSync = useCallback(async () => {
    try {
      setIsLoading(true)
      await onYemboSync()
      toast.success('Yembo AI sync completed successfully')
    } catch (error) {
      console.error('Error syncing with Yembo AI:', error)
      toast.error('Failed to sync with Yembo AI')
    } finally {
      setIsLoading(false)
    }
  }, [onYemboSync])

  const handleBulkDelete = useCallback(async () => {
    try {
      setIsLoading(true)
      const updatedInventory = inventory.filter(item => !selectedItems.includes(item.id))
      await onInventoryUpdate(updatedInventory)
      setSelectedItems([])
      toast.success(`${selectedItems.length} items deleted successfully`)
    } catch (error) {
      console.error('Error deleting items:', error)
      toast.error('Failed to delete items')
    } finally {
      setIsLoading(false)
    }
  }, [inventory, selectedItems, onInventoryUpdate])

  const handleExportInventory = useCallback(() => {
    const csvContent = [
      ['Name', 'Room', 'Quantity', 'Cubic Feet', 'Weight', 'Source', 'Special Handling', 'Packing Required', 'Value Estimate'].join(','),
      ...filteredInventory.map(item => [
        item.name,
        item.room_location,
        item.quantity,
        item.cubic_feet,
        item.weight || 0,
        item.source,
        Array.isArray(item.special_handling) ? item.special_handling.join('; ') : '',
        item.packing_required ? 'Yes' : 'No',
        item.value_estimate || 0
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inventory-customer-${customerId}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Inventory exported successfully')
  }, [filteredInventory, customerId])

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Inventory Management</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleYemboSync}
            disabled={isLoading || readOnly}
            className="flex items-center gap-2"
          >
            <Camera className="h-4 w-4" />
            Sync Yembo AI
          </Button>
          <Button
            variant="outline"
            onClick={handleExportInventory}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          {!readOnly && (
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          )}
        </div>
      </div>

      {/* Inventory Summary */}
      <InventorySummary inventory={inventory} />

      {/* Filters and Search */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
        </div>
        
        <Select value={roomFilter} onValueChange={setRoomFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Rooms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Rooms</SelectItem>
            {rooms.map(room => (
              <SelectItem key={room} value={room}>{room}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {Object.entries(INVENTORY_SOURCES).map(([key, config]) => (
              <SelectItem key={key} value={key}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedItems.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
            disabled={isLoading || readOnly}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Selected ({selectedItems.length})
          </Button>
        )}
      </div>

      {/* Inventory Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              {!readOnly && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedItems.length === filteredInventory.length}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedItems(filteredInventory.map(item => item.id))
                      } else {
                        setSelectedItems([])
                      }
                    }}
                  />
                </TableHead>
              )}
              <TableHead>Item</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Cu Ft</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Special</TableHead>
              <TableHead>Value</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInventory.map((item) => (
              <TableRow key={item.id}>
                {!readOnly && (
                  <TableCell>
                    <Checkbox
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedItems(prev => [...prev, item.id])
                        } else {
                          setSelectedItems(prev => prev.filter(id => id !== item.id))
                        }
                      }}
                    />
                  </TableCell>
                )}
                <TableCell>
                  <div>
                    <div className="font-medium">{item.name}</div>
                    {item.description && (
                      <div className="text-sm text-gray-500 line-clamp-1">{item.description}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {item.room_location}
                  </Badge>
                </TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.cubic_feet * item.quantity}</TableCell>
                <TableCell>{(item.weight || 0) * item.quantity} lbs</TableCell>
                <TableCell>
                  <Badge className={cn('text-xs', INVENTORY_SOURCES[item.source].color)}>
                    {INVENTORY_SOURCES[item.source].label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {item.packing_required && (
                      <Badge variant="secondary" className="text-xs block w-fit">
                        Packing
                      </Badge>
                    )}
                    {item.disassembly_required && (
                      <Badge variant="secondary" className="text-xs block w-fit">
                        Disassembly
                      </Badge>
                    )}
                    {item.special_handling && item.special_handling.length > 0 && (
                      <Badge variant="outline" className="text-xs block w-fit">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Special
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {item.value_estimate ? `$${item.value_estimate * item.quantity}` : '-'}
                </TableCell>
                <TableCell>
                  {!readOnly && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingItem(item)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteItem(item.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredInventory.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No inventory items found</p>
            {!readOnly && (
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(true)}
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Item
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* Add/Edit Item Dialog */}
      <AddInventoryItemDialog
        isOpen={isAddDialogOpen || editingItem !== null}
        onClose={() => {
          setIsAddDialogOpen(false)
          setEditingItem(null)
        }}
        onSave={editingItem ? handleEditItem : handleAddItem}
        item={editingItem}
        rooms={[...rooms, 'Living Room', 'Bedroom', 'Kitchen', 'Dining Room', 'Office', 'Basement', 'Garage']}
      />
    </div>
  )
}