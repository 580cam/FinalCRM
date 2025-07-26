'use client'

import { useState } from 'react'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  StarIcon, 
  Search, 
  ArrowUpDown,
  MessageSquare
} from "lucide-react"
import { Review } from '@/types/customer-service'
import { formatMoveDate } from '@/lib/utils/timeUtils'

interface ReviewsPanelProps {
  reviews: Review[]
}

export default function ReviewsPanel({ reviews }: ReviewsPanelProps) {
  const [filter, setFilter] = useState('all')
  const [sortOrder, setSortOrder] = useState('newest')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Filter and sort reviews
  const filteredReviews = reviews
    .filter(review => {
      // Apply filter
      if (filter === 'responded' && !review.responded) return false
      if (filter === 'not-responded' && review.responded) return false
      
      // Apply search
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          review.customerName.toLowerCase().includes(query) ||
          review.content.toLowerCase().includes(query)
        )
      }
      
      return true
    })
    .sort((a, b) => {
      // Apply sorting
      if (sortOrder === 'newest') {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      } else if (sortOrder === 'oldest') {
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      } else if (sortOrder === 'highest') {
        return b.rating - a.rating
      } else if (sortOrder === 'lowest') {
        return a.rating - b.rating
      }
      return 0
    })
  
  // Metrics calculations
  const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
  const responseRate = (reviews.filter(r => r.responded).length / reviews.length) * 100
  
  // Render stars for ratings
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <StarIcon
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ))
  }
  
  return (
    <div className="p-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <span className="text-3xl font-bold mr-2">{avgRating.toFixed(1)}</span>
              <div className="flex">{renderStars(Math.round(avgRating))}</div>
            </div>
            <CardDescription className="mt-1">Based on {reviews.length} reviews</CardDescription>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Response Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{responseRate.toFixed(0)}%</div>
            <CardDescription className="mt-1">
              {reviews.filter(r => r.responded).length} of {reviews.length} reviews responded to
            </CardDescription>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Source Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline" className="bg-blue-50">
                Google ({reviews.filter(r => r.source === 'google').length})
              </Badge>
              <Badge variant="outline" className="bg-red-50">
                Yelp ({reviews.filter(r => r.source === 'yelp').length})
              </Badge>
              <Badge variant="outline" className="bg-green-50">
                Internal ({reviews.filter(r => r.source === 'internal').length})
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-start md:items-center">
        <div className="w-full md:w-auto flex items-center space-x-2">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search reviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-[300px]"
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto md:ml-auto">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reviews</SelectItem>
              <SelectItem value="responded">Responded</SelectItem>
              <SelectItem value="not-responded">Not Responded</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="highest">Highest Rated</SelectItem>
              <SelectItem value="lowest">Lowest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No reviews found</p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <Card key={review.id} className={review.responded ? 'border-green-100' : ''}>
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <div>
                    <CardTitle className="text-base font-medium">
                      {review.customerName}
                    </CardTitle>
                    <CardDescription>
                      {formatMoveDate(review.date)} • Quote #{review.quoteId}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex">
                      {renderStars(review.rating)}
                    </div>
                    <Badge variant="outline" className="mt-1">
                      {review.source.charAt(0).toUpperCase() + review.source.slice(1)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-700">{review.content}</p>
                
                {review.responded && (
                  <div className="mt-4 bg-gray-50 p-3 rounded">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>Your response:</span>
                    </div>
                    <p className="text-gray-600 text-sm">{review.response}</p>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="flex justify-end">
                {!review.responded ? (
                  <Button size="sm">
                    Respond
                  </Button>
                ) : (
                  <Button variant="outline" size="sm">
                    Edit Response
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
