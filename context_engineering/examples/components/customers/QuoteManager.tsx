'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { 
  Plus, 
  Send, 
  Eye, 
  Edit, 
  Copy, 
  Download, 
  Mail, 
  MessageSquare,
  DollarSign, 
  Clock, 
  Users, 
  Truck,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreVertical,
  Calculator,
  Zap,
  Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { format, formatDistanceToNow } from 'date-fns'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  EnhancedQuote,
  QuoteStatus,
  QuoteManagerProps,
  SpecialItem,
  QuoteInventoryItem
} from '@/types/customers'
import { cn } from '@/lib/utils'

// Quote status configuration
const QUOTE_STATUS_CONFIG: Record<QuoteStatus, { label: string; icon: React.ReactNode; color: string; bgColor: string }> = {
  pending: {
    label: 'Pending',
    icon: <Clock className="h-4 w-4" />,
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100'
  },
  sent: {
    label: 'Sent',
    icon: <Send className="h-4 w-4" />,
    color: 'text-blue-700',
    bgColor: 'bg-blue-100'
  },
  viewed: {
    label: 'Viewed',
    icon: <Eye className="h-4 w-4" />,
    color: 'text-purple-700',
    bgColor: 'bg-purple-100'
  },
  accepted: {
    label: 'Accepted',
    icon: <CheckCircle className="h-4 w-4" />,
    color: 'text-green-700',
    bgColor: 'bg-green-100'
  },
  expired: {
    label: 'Expired',
    icon: <XCircle className="h-4 w-4" />,
    color: 'text-red-700',
    bgColor: 'bg-red-100'
  },
  revised: {
    label: 'Revised',
    icon: <Edit className="h-4 w-4" />,
    color: 'text-orange-700',
    bgColor: 'bg-orange-100'
  },
  lost: {
    label: 'Lost',
    icon: <XCircle className="h-4 w-4" />,
    color: 'text-gray-700',
    bgColor: 'bg-gray-100'
  }
}

// Quote creation/editing dialog
interface QuoteDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (quoteData: Partial<EnhancedQuote>) => Promise<void>
  quote?: EnhancedQuote | null
  customerId: number
  customerInventory?: QuoteInventoryItem[]
}

function QuoteDialog({ isOpen, onClose, onSave, quote, customerId, customerInventory = [] }: QuoteDialogProps) {
  const [formData, setFormData] = useState({
    service_type: quote?.service_type || '',
    move_date: quote?.move_date || '',
    crew_size: quote?.crew_size || 3,
    truck_count: quote?.truck_count || 1,
    estimated_hours: quote?.estimated_hours || 4,
    packing_services: quote?.packing_services || false,
    unpacking_services: quote?.unpacking_services || false,
    base_cost: quote?.base_cost || 0,
    materials_cost: quote?.materials_cost || 0,
    travel_cost: quote?.travel_cost || 0,
    fuel_cost: quote?.fuel_cost || 0,
    discount_amount: quote?.discount_amount || 0,
    tax_amount: quote?.tax_amount || 0,
    expires_at: quote?.expires_at || '',
    notes: quote?.notes || '',
    special_items: quote?.special_items || [],
    inventory: quote?.inventory || customerInventory
  })

  const [isCalculating, setIsCalculating] = useState(false)

  // Calculate total automatically
  const calculatedTotal = useMemo(() => {
    const subtotal = formData.base_cost + 
                    formData.materials_cost + 
                    formData.travel_cost + 
                    formData.fuel_cost + 
                    (formData.special_items?.reduce((sum, item) => sum + item.total_price, 0) || 0) - 
                    formData.discount_amount

    return subtotal + formData.tax_amount
  }, [formData])

  const handleAutoCalculate = useCallback(async () => {
    setIsCalculating(true)
    try {
      // Simulate API call to pricing engine
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock calculation based on form data
      const baseRate = 169 // Base hourly rate for 3-person crew
      const calculatedBase = formData.estimated_hours * baseRate
      const calculatedMaterials = formData.packing_services ? 150 : 0
      const calculatedTravel = 50 // Mock travel cost
      const calculatedTax = (calculatedBase + calculatedMaterials + calculatedTravel) * 0.08 // 8% tax
      
      setFormData(prev => ({
        ...prev,
        base_cost: calculatedBase,
        materials_cost: calculatedMaterials,
        travel_cost: calculatedTravel,
        tax_amount: calculatedTax
      }))
      
      toast.success('Quote calculated successfully')
    } catch (error) {
      toast.error('Failed to calculate quote')
    } finally {
      setIsCalculating(false)
    }
  }, [formData.estimated_hours, formData.packing_services])

  const handleSave = useCallback(async () => {
    try {
      await onSave({
        ...quote,
        ...formData,
        total_amount: calculatedTotal,
        version: quote ? quote.version + 1 : 1,
        status: quote ? 'revised' : 'pending'
      })
      onClose()
      toast.success(quote ? 'Quote updated successfully' : 'Quote created successfully')
    } catch (error) {
      toast.error('Failed to save quote')
    }
  }, [formData, calculatedTotal, quote, onSave, onClose])

  const addSpecialItem = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      special_items: [
        ...(prev.special_items || []),
        {
          id: Date.now().toString(),
          name: '',
          description: '',
          category: '',
          base_price: 0,
          quantity: 1,
          total_price: 0,
          requires_crating: false,
          requires_specialty_crew: false
        }
      ]
    }))
  }, [])

  const updateSpecialItem = useCallback((index: number, updates: Partial<SpecialItem>) => {
    setFormData(prev => ({
      ...prev,
      special_items: prev.special_items?.map((item, i) => 
        i === index 
          ? { ...item, ...updates, total_price: (updates.base_price || item.base_price) * (updates.quantity || item.quantity) }
          : item
      ) || []
    }))
  }, [])

  const removeSpecialItem = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      special_items: prev.special_items?.filter((_, i) => i !== index) || []
    }))
  }, [])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {quote ? `Edit Quote #${quote.id}` : 'Create New Quote'}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="special">Special Items</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Service Type *</label>
                <Select 
                  value={formData.service_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, service_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Moving">Moving</SelectItem>
                    <SelectItem value="Packing">Packing</SelectItem>
                    <SelectItem value="Moving and Packing">Moving and Packing</SelectItem>
                    <SelectItem value="Full Service">Full Service</SelectItem>
                    <SelectItem value="White Glove">White Glove</SelectItem>
                    <SelectItem value="Load Only">Load Only</SelectItem>
                    <SelectItem value="Unload Only">Unload Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Move Date</label>
                <Input
                  type="date"
                  value={formData.move_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, move_date: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Crew Size</label>
                <Input
                  type="number"
                  value={formData.crew_size}
                  onChange={(e) => setFormData(prev => ({ ...prev, crew_size: Number(e.target.value) }))}
                  min="2"
                  max="8"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Truck Count</label>
                <Input
                  type="number"
                  value={formData.truck_count}
                  onChange={(e) => setFormData(prev => ({ ...prev, truck_count: Number(e.target.value) }))}
                  min="1"
                  max="5"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Estimated Hours</label>
                <Input
                  type="number"
                  value={formData.estimated_hours}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimated_hours: Number(e.target.value) }))}
                  min="1"
                  step="0.25"
                />
              </div>
            </div>

            <div className="flex space-x-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="packing_services"
                  checked={formData.packing_services}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, packing_services: checked as boolean }))}
                />
                <label htmlFor="packing_services" className="text-sm">Packing Services</label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="unpacking_services"
                  checked={formData.unpacking_services}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, unpacking_services: checked as boolean }))}
                />
                <label htmlFor="unpacking_services" className="text-sm">Unpacking Services</label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Quote Expiration Date</label>
              <Input
                type="date"
                value={formData.expires_at}
                onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes or special instructions"
                rows={3}
              />
            </div>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Pricing Breakdown</h3>
              <Button
                onClick={handleAutoCalculate}
                disabled={isCalculating}
                className="flex items-center gap-2"
              >
                {isCalculating ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4" />
                    Auto Calculate
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Base Labor Cost</label>
                <Input
                  type="number"
                  value={formData.base_cost}
                  onChange={(e) => setFormData(prev => ({ ...prev, base_cost: Number(e.target.value) }))}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Materials Cost</label>
                <Input
                  type="number"
                  value={formData.materials_cost}
                  onChange={(e) => setFormData(prev => ({ ...prev, materials_cost: Number(e.target.value) }))}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Travel Cost</label>
                <Input
                  type="number"
                  value={formData.travel_cost}
                  onChange={(e) => setFormData(prev => ({ ...prev, travel_cost: Number(e.target.value) }))}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Fuel Cost</label>
                <Input
                  type="number"
                  value={formData.fuel_cost}
                  onChange={(e) => setFormData(prev => ({ ...prev, fuel_cost: Number(e.target.value) }))}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Discount Amount</label>
                <Input
                  type="number"
                  value={formData.discount_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, discount_amount: Number(e.target.value) }))}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tax Amount</label>
                <Input
                  type="number"
                  value={formData.tax_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, tax_amount: Number(e.target.value) }))}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total Amount:</span>
                <span className="text-green-600">
                  ${calculatedTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Inventory Items</h3>
              <div className="text-sm text-gray-500">
                Inventory items are automatically pulled from the customer's inventory. You can adjust quantities here.
              </div>
              
              {formData.inventory && formData.inventory.length > 0 ? (
                <div className="space-y-2">
                  {formData.inventory.map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-500">
                          {item.room} • {item.cubic_feet} ft³ • {item.weight || 0} lbs
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const updatedInventory = [...formData.inventory!]
                            updatedInventory[index] = { ...item, quantity: Number(e.target.value) }
                            setFormData(prev => ({ ...prev, inventory: updatedInventory }))
                          }}
                          min="0"
                          className="w-20"
                        />
                        {item.requires_special_handling && (
                          <Badge variant="outline" className="text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Special
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No inventory items available</p>
                  <p className="text-sm">Add inventory items to the customer first</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="special" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Special Items</h3>
              <Button onClick={addSpecialItem} size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Special Item
              </Button>
            </div>

            {formData.special_items && formData.special_items.length > 0 ? (
              <div className="space-y-4">
                {formData.special_items.map((item, index) => (
                  <Card key={item.id}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="grid grid-cols-2 gap-4 flex-1">
                          <Input
                            placeholder="Item name"
                            value={item.name}
                            onChange={(e) => updateSpecialItem(index, { name: e.target.value })}
                          />
                          <Input
                            placeholder="Category"
                            value={item.category}
                            onChange={(e) => updateSpecialItem(index, { category: e.target.value })}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSpecialItem(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>

                      <Textarea
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateSpecialItem(index, { description: e.target.value })}
                        rows={2}
                      />

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs text-gray-500">Base Price</label>
                          <Input
                            type="number"
                            value={item.base_price}
                            onChange={(e) => updateSpecialItem(index, { base_price: Number(e.target.value) })}
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-gray-500">Quantity</label>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateSpecialItem(index, { quantity: Number(e.target.value) })}
                            min="1"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-gray-500">Total</label>
                          <Input
                            value={`$${item.total_price.toFixed(2)}`}
                            disabled
                            className="bg-gray-50"
                          />
                        </div>
                      </div>

                      <div className="flex space-x-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`crating-${index}`}
                            checked={item.requires_crating}
                            onCheckedChange={(checked) => updateSpecialItem(index, { requires_crating: checked as boolean })}
                          />
                          <label htmlFor={`crating-${index}`} className="text-sm">Requires Crating</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`specialty-${index}`}
                            checked={item.requires_specialty_crew}
                            onCheckedChange={(checked) => updateSpecialItem(index, { requires_specialty_crew: checked as boolean })}
                          />
                          <label htmlFor={`specialty-${index}`} className="text-sm">Requires Specialty Crew</label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No special items added</p>
                <Button onClick={addSpecialItem} variant="outline" className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Special Item
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>
            {quote ? 'Update Quote' : 'Create Quote'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Quote comparison component
interface QuoteComparisonProps {
  quotes: EnhancedQuote[]
  selectedQuotes: string[]
  onSelectionChange: (quoteIds: string[]) => void
}

function QuoteComparison({ quotes, selectedQuotes, onSelectionChange }: QuoteComparisonProps) {
  const selectedQuoteDetails = quotes.filter(quote => selectedQuotes.includes(quote.id.toString()))

  if (selectedQuoteDetails.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-sm">Select quotes to compare</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Quote Comparison</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Attribute</TableHead>
            {selectedQuoteDetails.map(quote => (
              <TableHead key={quote.id}>Quote #{quote.id}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">Status</TableCell>
            {selectedQuoteDetails.map(quote => (
              <TableCell key={quote.id}>
                <Badge className={cn(QUOTE_STATUS_CONFIG[quote.status].bgColor, QUOTE_STATUS_CONFIG[quote.status].color)}>
                  {QUOTE_STATUS_CONFIG[quote.status].label}
                </Badge>
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Total Amount</TableCell>
            {selectedQuoteDetails.map(quote => (
              <TableCell key={quote.id}>
                ${quote.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Crew Size</TableCell>
            {selectedQuoteDetails.map(quote => (
              <TableCell key={quote.id}>{quote.crew_size} workers</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Estimated Hours</TableCell>
            {selectedQuoteDetails.map(quote => (
              <TableCell key={quote.id}>{quote.estimated_hours} hours</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Packing Services</TableCell>
            {selectedQuoteDetails.map(quote => (
              <TableCell key={quote.id}>
                {quote.packing_services ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Win Probability</TableCell>
            {selectedQuoteDetails.map(quote => (
              <TableCell key={quote.id}>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${quote.win_probability * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm">{Math.round(quote.win_probability * 100)}%</span>
                </div>
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}

// Main QuoteManager component
export default function QuoteManager({
  customerId,
  quotes,
  onQuoteCreate,
  onQuoteUpdate,
  onQuoteSend,
  permissions
}: QuoteManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingQuote, setEditingQuote] = useState<EnhancedQuote | null>(null)
  const [selectedQuotes, setSelectedQuotes] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState('list')
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateQuote = useCallback(async () => {
    try {
      await onQuoteCreate()
      setIsDialogOpen(true)
    } catch (error) {
      toast.error('Failed to create quote')
    }
  }, [onQuoteCreate])

  const handleSaveQuote = useCallback(async (quoteData: Partial<EnhancedQuote>) => {
    try {
      setIsLoading(true)
      if (editingQuote) {
        await onQuoteUpdate(editingQuote.id.toString(), quoteData)
      } else {
        // Handle new quote creation
        await onQuoteUpdate('new', { ...quoteData, customer_id: customerId })
      }
      setEditingQuote(null)
    } catch (error) {
      console.error('Error saving quote:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [editingQuote, customerId, onQuoteUpdate])

  const handleSendQuote = useCallback(async (quote: EnhancedQuote, method: 'email' | 'sms') => {
    try {
      setIsLoading(true)
      await onQuoteSend(quote.id.toString(), method)
      toast.success(`Quote sent via ${method}`)
    } catch (error) {
      console.error('Error sending quote:', error)
      toast.error('Failed to send quote')
    } finally {
      setIsLoading(false)
    }
  }, [onQuoteSend])

  const handleDuplicateQuote = useCallback((quote: EnhancedQuote) => {
    setEditingQuote({ ...quote, id: 0, version: 1, status: 'pending' } as EnhancedQuote)
    setIsDialogOpen(true)
  }, [])

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }, [])

  // Sort quotes by version (most recent first)
  const sortedQuotes = useMemo(() => {
    return [...quotes].sort((a, b) => b.version - a.version)
  }, [quotes])

  // Get current quote (highest version)
  const currentQuote = sortedQuotes[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Quote Management</h2>
        {permissions.canCreate && (
          <Button onClick={handleCreateQuote} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Quote
          </Button>
        )}
      </div>

      {/* Quote Summary */}
      {quotes.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{quotes.length}</div>
              <div className="text-sm text-gray-600">Total Quotes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(currentQuote?.total_amount || 0)}
              </div>
              <div className="text-sm text-gray-600">Latest Quote</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((currentQuote?.win_probability || 0) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Win Probability</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                <Badge className={cn(
                  QUOTE_STATUS_CONFIG[currentQuote?.status || 'pending'].bgColor,
                  QUOTE_STATUS_CONFIG[currentQuote?.status || 'pending'].color
                )}>
                  {QUOTE_STATUS_CONFIG[currentQuote?.status || 'pending'].label}
                </Badge>
              </div>
              <div className="text-sm text-gray-600">Current Status</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">Quote List</TabsTrigger>
          <TabsTrigger value="comparison">Compare</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {quotes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No quotes yet</h3>
              <p className="text-gray-500 mb-6">Create your first quote to get started</p>
              {permissions.canCreate && (
                <Button onClick={handleCreateQuote}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Quote
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quote #</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedQuotes.map((quote) => (
                  <TableRow key={`${quote.id}-${quote.version}`}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">#{quote.id}</span>
                        {quote.is_current && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Current
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>v{quote.version}</TableCell>
                    <TableCell>
                      <Badge className={cn(
                        QUOTE_STATUS_CONFIG[quote.status].bgColor,
                        QUOTE_STATUS_CONFIG[quote.status].color
                      )}>
                        {QUOTE_STATUS_CONFIG[quote.status].icon}
                        {QUOTE_STATUS_CONFIG[quote.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(quote.total_amount)}
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(quote.created_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      {quote.expires_at ? (
                        <span className={cn(
                          new Date(quote.expires_at) < new Date() 
                            ? 'text-red-600' 
                            : 'text-gray-600'
                        )}>
                          {format(new Date(quote.expires_at), 'MMM d, yyyy')}
                        </span>
                      ) : (
                        'No expiration'
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingQuote(quote)
                              setIsDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateQuote(quote)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          {permissions.canSend && quote.status === 'pending' && (
                            <>
                              <DropdownMenuItem onClick={() => handleSendQuote(quote, 'email')}>
                                <Mail className="h-4 w-4 mr-2" />
                                Send via Email
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSendQuote(quote, 'sms')}>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Send via SMS
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="comparison">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Select quotes to compare</h3>
              <div className="text-sm text-gray-500">
                {selectedQuotes.length} of {quotes.length} quotes selected
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {quotes.map(quote => (
                <Card 
                  key={quote.id} 
                  className={cn(
                    "cursor-pointer transition-colors",
                    selectedQuotes.includes(quote.id.toString()) 
                      ? "border-blue-500 bg-blue-50" 
                      : "hover:border-gray-300"
                  )}
                  onClick={() => {
                    const isSelected = selectedQuotes.includes(quote.id.toString())
                    if (isSelected) {
                      setSelectedQuotes(prev => prev.filter(id => id !== quote.id.toString()))
                    } else {
                      setSelectedQuotes(prev => [...prev, quote.id.toString()])
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Quote #{quote.id}</span>
                      <Checkbox 
                        checked={selectedQuotes.includes(quote.id.toString())}
                        readOnly
                      />
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      v{quote.version} • {formatCurrency(quote.total_amount)}
                    </div>
                    <Badge className={cn(
                      'text-xs',
                      QUOTE_STATUS_CONFIG[quote.status].bgColor,
                      QUOTE_STATUS_CONFIG[quote.status].color
                    )}>
                      {QUOTE_STATUS_CONFIG[quote.status].label}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>

            <QuoteComparison 
              quotes={quotes}
              selectedQuotes={selectedQuotes}
              onSelectionChange={setSelectedQuotes}
            />
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Quote Activity History</h3>
            <div className="space-y-4">
              {quotes.map(quote => (
                <Card key={quote.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">Quote #{quote.id} v{quote.version}</h4>
                        <p className="text-sm text-gray-600">
                          Created {format(new Date(quote.created_at), 'PPp')}
                        </p>
                        {quote.sent_at && (
                          <p className="text-sm text-gray-600">
                            Sent {format(new Date(quote.sent_at), 'PPp')}
                          </p>
                        )}
                        {quote.viewed_at && (
                          <p className="text-sm text-gray-600">
                            Viewed {format(new Date(quote.viewed_at), 'PPp')}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(quote.total_amount)}</div>
                        <Badge className={cn(
                          'text-xs mt-1',
                          QUOTE_STATUS_CONFIG[quote.status].bgColor,
                          QUOTE_STATUS_CONFIG[quote.status].color
                        )}>
                          {QUOTE_STATUS_CONFIG[quote.status].label}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quote Dialog */}
      <QuoteDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false)
          setEditingQuote(null)
        }}
        onSave={handleSaveQuote}
        quote={editingQuote}
        customerId={customerId}
      />
    </div>
  )
}