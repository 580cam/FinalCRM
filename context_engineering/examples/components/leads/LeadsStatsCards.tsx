'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, UserCheck, Flame, Clock, TrendingUp, Star } from 'lucide-react'

interface LeadStats {
  total: number
  unclaimed: number
  hot: number
  myLeads: number
  needsFollowUp: number
  avgScore: number
}

interface LeadsStatsCardsProps {
  stats: LeadStats
}

export default function LeadsStatsCards({ stats }: LeadsStatsCardsProps) {
  const cards = [
    {
      title: "Total Leads",
      value: stats.total,
      description: "All leads in system",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: null
    },
    {
      title: "Unclaimed Leads",
      value: stats.unclaimed,
      description: "Available for claiming",
      icon: UserCheck,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      change: stats.unclaimed > 0 ? "urgent" : null
    },
    {
      title: "Hot Leads",
      value: stats.hot,
      description: "High priority leads",
      icon: Flame,
      color: "text-red-600",
      bgColor: "bg-red-50",
      change: stats.hot > 0 ? "hot" : null
    },
    {
      title: "My Leads",
      value: stats.myLeads,
      description: "Assigned to you",
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-50",
      change: null
    },
    {
      title: "Need Follow-up",
      value: stats.needsFollowUp,
      description: "Require attention",
      icon: Clock,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      change: stats.needsFollowUp > 0 ? "attention" : null
    },
    {
      title: "Avg Lead Score",
      value: stats.avgScore,
      description: "Quality indicator",
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      suffix: "/100",
      change: stats.avgScore >= 70 ? "good" : stats.avgScore >= 50 ? "fair" : "poor"
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-full ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">
                {card.value}
                {card.suffix && (
                  <span className="text-sm text-gray-500">{card.suffix}</span>
                )}
              </div>
              
              {/* Status indicators */}
              {card.change && (
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    card.change === 'urgent' ? 'bg-red-50 text-red-700 border-red-200' :
                    card.change === 'hot' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                    card.change === 'attention' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                    card.change === 'good' ? 'bg-green-50 text-green-700 border-green-200' :
                    card.change === 'fair' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                    card.change === 'poor' ? 'bg-red-50 text-red-700 border-red-200' : ''
                  }`}
                >
                  {card.change === 'urgent' ? '!' :
                   card.change === 'hot' ? '🔥' :
                   card.change === 'attention' ? '⚠' :
                   card.change === 'good' ? '✓' :
                   card.change === 'fair' ? '−' :
                   card.change === 'poor' ? '✗' : ''}
                </Badge>
              )}
            </div>
            <CardDescription className="text-xs">
              {card.description}
            </CardDescription>
          </CardContent>
          
          {/* Animated background for urgent items */}
          {(card.change === 'urgent' || card.change === 'hot') && card.value > 0 && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 animate-pulse" />
          )}
        </Card>
      ))}
    </div>
  )
}