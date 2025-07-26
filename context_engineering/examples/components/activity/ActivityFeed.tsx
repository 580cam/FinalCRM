'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { getDashboardActivities } from '@/lib/services/activityService'
import { ActivityLog } from '@/types/activity'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'

interface ActivityFeedProps {
  maxItems?: number
}

// Interface for activity with source information
interface ActivityWithSource extends ActivityLog {
  sourceInfo?: {
    loading: boolean;
    source: string;
  }
}

export function ActivityFeed({ maxItems = 20 }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityWithSource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  // Load initial activities
  useEffect(() => {
    async function loadActivities() {
      setIsLoading(true)
      const logs = await getDashboardActivities(maxItems)
      
      // Debug: Check for potential duplicates
      console.log("Activity logs loaded:", logs.length);
      
      // Group by lead_id and activity_type to identify potential duplicates
      const potentialDuplicates = logs.reduce((acc, log) => {
        if (log.activity_type === 'lead_creation' && log.lead_id) {
          const key = `${log.lead_id}-${log.activity_type}`;
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push({
            id: log.id,
            created_at: log.created_at,
            lead_id: log.lead_id,
            title: log.title
          });
        }
        return acc;
      }, {} as Record<string, any[]>);
      
      // Log groups with more than one entry (potential duplicates)
      Object.entries(potentialDuplicates).forEach(([key, items]) => {
        if (items.length > 1) {
          console.warn(`Potential duplicate activities for ${key}:`, items);
        }
      });
      
      // Extract all lead IDs that need source info
      const leadIds = logs
        .filter(log => log.activity_type === 'lead_creation' && log.lead_id)
        .map(log => log.lead_id);
      
      // Batch fetch sources for all leads at once
      const sources: Record<string, string> = {};
      
      if (leadIds.length > 0) {
        // Get distinct lead IDs (remove duplicates)
        const uniqueLeadIds = [...new Set(leadIds)];
        
        const { data, error } = await supabase
          .from('quotes')
          .select('lead_id, referral_source')
          .in('lead_id', uniqueLeadIds);
          
        if (!error && data) {
          // Create a map of lead_id to referral_source
          data.forEach(quote => {
            // For each lead, use the first quote's source we find
            if (!sources[quote.lead_id]) {
              sources[quote.lead_id] = quote.referral_source || 'Website';
            }
          });
        }
      }
      
      // Apply sources to activities
      const activitiesWithSources = logs.map(log => {
        if (log.activity_type === 'lead_creation' && log.lead_id) {
          return {
            ...log,
            sourceInfo: { 
              loading: false, 
              source: sources[log.lead_id] || 'Website'
            }
          };
        }
        return log;
      });
      
      setActivities(activitiesWithSources);
      setIsLoading(false);
    }
    
    loadActivities()
  }, [maxItems])
  
  // Real-time subscription handler for new activities
  useEffect(() => {
    // Subscribe to any changes in the activity_logs table
    const channel = supabase
      .channel('activity-updates')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'activity_logs'
        }, 
        async (payload) => {
          // Add the new activity to the top of the list
          const newActivity = payload.new as ActivityLog
          
          // Need to fetch the full activity with relationships
          const { data } = await supabase
            .from('activity_logs')
            .select('*, leads(*), quotes(*), users(*)')
            .eq('id', newActivity.id)
            .single();
          
          if (data) {
            let source = 'Website';
            
            // Fetch source immediately if this is a lead creation
            if (data.activity_type === 'lead_creation' && data.lead_id) {
              const { data: quoteData } = await supabase
                .from('quotes')
                .select('referral_source')
                .eq('lead_id', data.lead_id)
                .limit(1)
                .single();
                
              if (quoteData) {
                source = quoteData.referral_source || 'Website';
              }
            }
            
            const activityWithSource: ActivityWithSource = {
              ...data,
              sourceInfo: data.activity_type === 'lead_creation' 
                ? { loading: false, source } 
                : undefined
            };
            
            setActivities(prev => {
              const updated = [activityWithSource, ...prev];
              return updated.slice(0, maxItems);
            });
          }
        })
      .subscribe();

    // Clean up subscription
    return () => {
      supabase.removeChannel(channel)
    }
  }, [maxItems, supabase])

  // Generate activity icon based on type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'lead_creation':
        return '👤'
      case 'opportunity_creation':
        return '💰'
      case 'job_creation':
        return '🚚'
      case 'status_change':
        return '🔄'
      case 'assignment':
        return '📋'
      case 'sms':
        return '💬'
      case 'email':
        return '📧'
      case 'call':
        return '📞'
      default:
        return '📝'
    }
  }

  // Format the activity content based on type
  const formatActivityContent = (activity: ActivityWithSource) => {
    if (activity.activity_type === 'lead_creation') {
      // Get name from leads join or metadata
      const name = activity.leads?.name || 
                  (activity.metadata && typeof activity.metadata === 'object' ? 
                   activity.metadata.name : 'Unknown');
      
      // Get source from our dynamically loaded source or fall back to metadata
      let source = activity.sourceInfo?.source || 'Website';
      
      if (!source && activity.metadata && typeof activity.metadata === 'object' && activity.metadata.source) {
        source = activity.metadata.source as string;
      }
      
      return `${name} - Generated from ${source}`;
    }
    
    // For other activity types, return the original content
    return activity.content;
  }

  // Get the title based on activity type
  const getActivityTitle = (activity: ActivityLog) => {
    if (activity.activity_type === 'lead_creation') {
      return 'New Lead Created';
    }
    
    return activity.title;
  }

  // Render loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <ScrollArea className="h-[600px]">
          <CardContent>
            <div className="space-y-4">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <div key={activity.id} className="flex items-start border-b pb-3 last:border-0">
                    <div className="flex h-8 w-8 rounded-full items-center justify-center bg-primary/10 text-lg">
                      {getActivityIcon(activity.activity_type)}
                    </div>
                    <div className="ml-4 space-y-1 flex-1">
                      <p className="text-sm font-medium leading-none">
                        {getActivityTitle(activity)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatActivityContent(activity)}
                      </p>
                    </div>
                    <div className="ml-auto text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No recent activity found
                </div>
              )}
            </div>
          </CardContent>
        </ScrollArea>
      </Card>
    </>
  );
}
