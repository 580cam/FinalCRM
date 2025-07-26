'use client'

import React, { useState, useRef, useEffect, useTransition, DragEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  Dialog, 
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Loader2, 
  ChevronDown, 
  X, 
  Check, 
  Circle, 
  Plus, 
  Info, 
  Calendar as CalendarIcon,
  GripVertical,
  Trash2,
} from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import GooglePlacesAutocomplete from './GooglePlacesAutocomplete'
import { saveEstimateToDatabase, mapFormAddressesToEstimateAddresses } from '@/lib/databaseEstimation'
import { PackingIntensity } from '@/lib/boxEstimator'

interface CreateOpportunityModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface Address {
  address: string
  propertyName: string
  unitNumber: string
  propertyType: string
  parkingType: string
  stairs: string
  elevator: string
  walkDistance: string
  stopType: 'pickup' | 'dropoff'
  // Add fields for custom address mode
  street?: string
  city?: string
  state?: string
  zipCode?: string
  isCustomMode?: boolean
  handicaps?: string[]
}

interface FormData {
  // Step 1: Personal Info
  name: string
  email: string
  phone: string
  moveDate: Date | undefined
  moveSize: string
  serviceType: string
  referralSource: string
  packingIntensity: 'Less than Normal' | 'Normal' | 'More than Normal'
  
  // Step 2: Origin Address
  originAddress: Address
  
  // Step 3: Destination Address
  destinationAddresses: Address[]
}

enum Step {
  PERSONAL_INFO = 0,
  ORIGIN = 1, // 1st Stop
  STOP_2 = 2,
  STOP_3 = 3,
  STOP_4 = 4,
  STOP_5 = 5,
}

const MAX_STOPS = 5;

export default function CreateOpportunityModal({ 
  isOpen, 
  onClose,
  onSuccess = () => {}
}: CreateOpportunityModalProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isPending, startTransition] = useTransition()
  const [currentStep, setCurrentStep] = useState<Step>(Step.PERSONAL_INFO)
  
  // Default address structure for origin and destinations
  const defaultAddress: Address = {
    address: '',
    propertyName: '',
    unitNumber: '',
    propertyType: 'House',
    parkingType: 'Private Driveway',
    stairs: 'No Stairs',
    walkDistance: 'Less than 100 feet',
    elevator: 'No',
    stopType: 'pickup',
    handicaps: []
  }
  
  const defaultFormValues: FormData = {
    name: '',
    email: '',
    phone: '',
    moveDate: undefined,
    moveSize: '',
    serviceType: '',
    referralSource: '',
    packingIntensity: 'Normal',
    originAddress: { ...defaultAddress },
    destinationAddresses: [{ ...defaultAddress, stopType: 'dropoff' }]
  }
  
  const [formData, setFormData] = useState<FormData>(defaultFormValues)
  const [error, setError] = useState<string | null>(null)
  const [googlePlacesOpen, setGooglePlacesOpen] = useState(false)
  
  // Add state to track selected addresses
  const [selectedAddresses, setSelectedAddresses] = useState<{
    origin: boolean;
    destinations: boolean[];
  }>({
    origin: false,
    destinations: [false]
  });

  // Track last valid selections
  const [lastValidSelections, setLastValidSelections] = useState<{
    origin: string;
    destinations: string[];
  }>({
    origin: '',
    destinations: ['']
  });
  
  // State to track which addresses are in custom mode
  const [customAddressModes, setCustomAddressModes] = useState<{
    origin: boolean;
    destinations: boolean[];
  }>({
    origin: false,
    destinations: [false]
  });

  const modalRef = useRef<HTMLDivElement>(null)
  const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || ''
  
  // Keep track of Google Places status
  const handleGooglePlacesInteraction = (isOpen: boolean) => {
    setGooglePlacesOpen(isOpen)
  }
  
  // Reset form when modal closes
  useEffect(() => {
    // When modal is closed, reset form data to defaults
    if (!isOpen) {
      setFormData(defaultFormValues)
      setCurrentStep(Step.PERSONAL_INFO)
      setError(null)
      setSelectedAddresses({
        origin: false,
        destinations: [false]
      });
      setLastValidSelections({
        origin: '',
        destinations: ['']
      });
      setCustomAddressModes({
        origin: false,
        destinations: [false]
      });
    }
  }, [isOpen])
  
  // Handle service type changes to update address requirements
  useEffect(() => {
    // Single location services
    const singleLocationServices = [
      'Load Only', 
      'Unload Only', 
      'Staging', 
      'Junk Removal', 
      'Packing', 
      'Unpacking'
    ];
    
    // Services where the location is a dropoff point
    const dropoffServices = ['Unload Only', 'Unpacking'];
    
    // Update origin address stop type based on service
    if (dropoffServices.includes(formData.serviceType)) {
      // For dropoff services like unloading, set origin as dropoff
      setFormData(prev => ({
        ...prev,
        originAddress: {
          ...prev.originAddress,
          stopType: 'dropoff'
        }
      }));
    } else {
      // For all other services, set origin as pickup
      setFormData(prev => ({
        ...prev,
        originAddress: {
          ...prev.originAddress,
          stopType: 'pickup'
        }
      }));
    }
    
    if (singleLocationServices.includes(formData.serviceType)) {
      // For single location services, remove destination addresses if they exist
      if (formData.destinationAddresses.length > 0) {
        setFormData(prev => ({
          ...prev,
          destinationAddresses: []
        }));
        
        // Update related states
        setSelectedAddresses(prev => ({
          ...prev,
          destinations: []
        }));
        
        setLastValidSelections(prev => ({
          ...prev,
          destinations: []
        }));
        
        setCustomAddressModes(prev => ({
          ...prev,
          destinations: []
        }));
        
        // If we're on a destination step, go back to origin
        if (currentStep > Step.ORIGIN) {
          safeSetCurrentStep(Step.ORIGIN);
        }
      }
    } else {
      // For multi-location services, ensure at least one destination exists
      if (formData.destinationAddresses.length === 0) {
        setFormData(prev => ({
          ...prev,
          destinationAddresses: [{ ...defaultAddress, stopType: 'dropoff' }]
        }));
        
        // Update related states
        setSelectedAddresses(prev => ({
          ...prev,
          destinations: [false]
        }));
        
        setLastValidSelections(prev => ({
          ...prev,
          destinations: ['']
        }));
        
        setCustomAddressModes(prev => ({
          ...prev,
          destinations: [false]
        }));
      }
    }
  }, [formData.serviceType]);

  // Update address selection state when an address is selected from Google Places
  const handleAddressSelected = (isOrigin: boolean, index: number = 0) => {
    if (isOrigin) {
      setSelectedAddresses(prev => ({
        ...prev,
        origin: true
      }));
    } else {
      const newDestinations = [...selectedAddresses.destinations];
      newDestinations[index] = true;
      setSelectedAddresses(prev => ({
        ...prev,
        destinations: newDestinations
      }));
    }
  };

  // Update last valid selection for an address
  const updateLastValidSelection = (isOrigin: boolean, index: number = 0, selection: string) => {
    if (isOrigin) {
      setLastValidSelections(prev => ({
        ...prev,
        origin: selection
      }));
    } else {
      const newDestinations = [...lastValidSelections.destinations];
      // Make sure we have enough entries in the array
      while (newDestinations.length <= index) {
        newDestinations.push('');
      }
      newDestinations[index] = selection;
      setLastValidSelections(prev => ({
        ...prev,
        destinations: newDestinations
      }));
    }
  };

  // Toggle custom address mode
  const toggleCustomAddressMode = (isOrigin: boolean, index: number = 0) => {
    if (isOrigin) {
      const newMode = !customAddressModes.origin;
      
      setCustomAddressModes(prev => ({
        ...prev,
        origin: newMode
      }));
      
      // Reset address fields when switching modes
      if (newMode) {
        // Switch to custom mode
        setFormData(prev => ({
          ...prev,
          originAddress: {
            ...prev.originAddress,
            address: '',
            street: '',
            city: '',
            state: '',
            zipCode: '',
            isCustomMode: true
          }
        }));
        
        // Mark as not selected until zip code is entered
        setSelectedAddresses(prev => ({
          ...prev,
          origin: false
        }));
      } else {
        // Switch back to Google Places mode
        setFormData(prev => ({
          ...prev,
          originAddress: {
            ...prev.originAddress,
            street: '',
            city: '',
            state: '',
            zipCode: '',
            isCustomMode: false
          }
        }));
      }
    } else {
      const newDestinationModes = [...customAddressModes.destinations];
      newDestinationModes[index] = !newDestinationModes[index];
      
      setCustomAddressModes(prev => ({
        ...prev,
        destinations: newDestinationModes
      }));
      
      // Reset address fields when switching modes
      if (newDestinationModes[index]) {
        // Switch to custom mode
        const updatedAddresses = [...formData.destinationAddresses];
        updatedAddresses[index] = {
          ...updatedAddresses[index],
          address: '',
          street: '',
          city: '',
          state: '',
          zipCode: '',
          isCustomMode: true
        };
        
        setFormData(prev => ({
          ...prev,
          destinationAddresses: updatedAddresses
        }));
        
        // Mark as not selected until zip code is entered
        const newSelectedDestinations = [...selectedAddresses.destinations];
        newSelectedDestinations[index] = false;
        setSelectedAddresses(prev => ({
          ...prev,
          destinations: newSelectedDestinations
        }));
      } else {
        // Switch back to Google Places mode
        const updatedAddresses = [...formData.destinationAddresses];
        updatedAddresses[index] = {
          ...updatedAddresses[index],
          street: '',
          city: '',
          state: '',
          zipCode: '',
          isCustomMode: false
        };
        
        setFormData(prev => ({ ...prev, destinationAddresses: updatedAddresses }))
      }
    }
  };
  
  // Handle zip code change and auto-fill city/state
  const handleZipCodeChange = async (isOrigin: boolean, index: number = 0, zipCode: string) => {
    // Update the zipCode in the form data
    if (isOrigin) {
      setFormData(prev => ({
        ...prev,
        originAddress: {
          ...prev.originAddress,
          zipCode
        }
      }));
    } else {
      const updatedAddresses = [...formData.destinationAddresses];
      updatedAddresses[index] = {
        ...updatedAddresses[index],
        zipCode
      };
      
      setFormData(prev => ({ ...prev, destinationAddresses: updatedAddresses }))
    }
    
    // Only proceed if we have a 5-digit zip code
    if (zipCode.length === 5) {
      try {
        // Use a zip code API to get city and state
        const response = await fetch(`https://api.zippopotam.us/us/${zipCode}`);
        
        if (response.ok) {
          const data = await response.json();
          const cityName = data.places[0]['place name'];
          const stateName = data.places[0]['state'];
          
          if (isOrigin) {
            setFormData(prev => ({
              ...prev,
              originAddress: {
                ...prev.originAddress,
                city: cityName,
                state: stateName
              }
            }));
            
            // Enable other fields once we have a valid zip
            setSelectedAddresses(prev => ({
              ...prev,
              origin: true
            }));
          } else {
            const updatedAddresses = [...formData.destinationAddresses];
            updatedAddresses[index] = {
              ...updatedAddresses[index],
              city: cityName,
              state: stateName
            };
            
            setFormData(prev => ({
              ...prev,
              destinationAddresses: updatedAddresses
            }));
            
            // Enable other fields once we have a valid zip
            const newDestinations = [...selectedAddresses.destinations];
            newDestinations[index] = true;
            setSelectedAddresses(prev => ({
              ...prev,
              destinations: newDestinations
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching zip code data:", error);
      }
    } else {
      // If zip code is not valid, disable other fields
      if (isOrigin) {
        setSelectedAddresses(prev => ({
          ...prev,
          origin: false
        }));
      } else {
        const newDestinations = [...selectedAddresses.destinations];
        newDestinations[index] = false;
        setSelectedAddresses(prev => ({
          ...prev,
          destinations: newDestinations
        }));
      }
    }
  };
  
  // Handle custom street address change
  const handleStreetChange = (isOrigin: boolean, index: number = 0, street: string) => {
    if (isOrigin) {
      const updatedAddress = {
        ...formData.originAddress,
        street,
        // Update the full address field for form submission
        address: street + ', ' + 
                 (formData.originAddress.city ? formData.originAddress.city + ', ' : '') + 
                 (formData.originAddress.state ? formData.originAddress.state + ' ' : '') + 
                 (formData.originAddress.zipCode || '')
      };
      
      setFormData(prev => ({
        ...prev,
        originAddress: updatedAddress
      }));
    } else {
      const updatedAddresses = [...formData.destinationAddresses];
      updatedAddresses[index] = {
        ...updatedAddresses[index],
        street,
        // Update the full address field for form submission
        address: street + ', ' + 
                 (updatedAddresses[index].city ? updatedAddresses[index].city + ', ' : '') + 
                 (updatedAddresses[index].state ? updatedAddresses[index].state + ' ' : '') + 
                 (updatedAddresses[index].zipCode || '')
      };
      
      setFormData(prev => ({ ...prev, destinationAddresses: updatedAddresses }))
    }
  };

  // Add a destination address when adding a new stop
  const handleAddStop = () => {
    if (formData.destinationAddresses.length < 4) {
      console.log("Adding a new stop");
      console.log(`Current destinations count: ${formData.destinationAddresses.length}`);
      
      const newDestinations = [
        ...formData.destinationAddresses, 
        { ...defaultAddress, stopType: 'dropoff' as 'dropoff' }
      ];
      
      console.log(`New destinations count: ${newDestinations.length}`);
      
      setFormData({
        ...formData,
        destinationAddresses: newDestinations
      });
      
      // Update selected addresses state for the new stop
      setSelectedAddresses(prev => ({
        ...prev,
        destinations: [...prev.destinations, false]
      }));
      
      // Update last valid selections for the new stop
      setLastValidSelections(prev => ({
        ...prev,
        destinations: [...prev.destinations, '']
      }));
      
      // Update custom address mode state for the new stop
      setCustomAddressModes(prev => ({
        ...prev,
        destinations: [...prev.destinations, false]
      }));
    }
  };

  const handleClose = () => {
    if (!googlePlacesOpen) {
      onClose()
    }
  }
  
  // Update handleChange to prevent service type from being lost
  const handleChange = (field: keyof FormData, value: any) => {
    console.log(`Updating field: ${field} with value:`, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleOriginAddressChange = (field: keyof Address, value: any) => {
    // Update form data with new value
    const updatedAddress = { 
      ...formData.originAddress, 
      [field]: value 
    }
    
    // If we're changing the address field, update selected status
    if (field === 'address') {
      // If address is empty, mark as not selected
      if (!value) {
        setSelectedAddresses(prev => ({
          ...prev,
          origin: false
        }));
      }
    }
    
    setFormData(prev => ({
      ...prev,
      originAddress: updatedAddress
    }));
  }
  
  const handleDestinationAddressChange = (index: number, field: keyof Address, value: any) => {
    // Update the specific field for the destination at the given index
    const updatedAddresses = [...formData.destinationAddresses]
    
    if (index >= 0 && index < updatedAddresses.length) {
      // Update the address field
      updatedAddresses[index] = {
        ...updatedAddresses[index],
        [field]: value
      }
      
      // If we're changing the address field, update selected status
      if (field === 'address') {
        // If address is empty, mark as not selected
        if (!value) {
          const newDestinations = [...selectedAddresses.destinations];
          newDestinations[index] = false;
          setSelectedAddresses(prev => ({
            ...prev,
            destinations: newDestinations
          }));
        }
      }
    }
    
    setFormData(prev => ({ ...prev, destinationAddresses: updatedAddresses }))
  }

  const deleteStop = (stopIndex: number) => {
    console.log(`Direct Stop Delete: Removing array index ${stopIndex}`);
    console.log("Before:", JSON.stringify(formData.destinationAddresses.map(a => a.address)));
    
    // Remove the destination
    const newDestinations = [...formData.destinationAddresses];
    newDestinations.splice(stopIndex, 1);
    
    // Update selections state
    const newSelectedDestinations = [...selectedAddresses.destinations];
    newSelectedDestinations.splice(stopIndex, 1);
    
    // Update last valid selections
    const newLastValidSelections = [...lastValidSelections.destinations];
    newLastValidSelections.splice(stopIndex, 1);
    
    // Update custom address mode state
    const newCustomAddressModes = [...customAddressModes.destinations];
    newCustomAddressModes.splice(stopIndex, 1);
    
    // Update state
    setFormData(prev => ({
      ...prev,
      destinationAddresses: newDestinations
    }));
    
    setSelectedAddresses(prev => ({
      ...prev,
      destinations: newSelectedDestinations
    }));
    
    setLastValidSelections(prev => ({
      ...prev,
      destinations: newLastValidSelections
    }));
    
    setCustomAddressModes(prev => ({
      ...prev,
      destinations: newCustomAddressModes
    }));
  }

  // Update address order after drag and drop
  const handleDragStart = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    const target = e.target as HTMLElement;
    setTimeout(() => {
      target.classList.add('opacity-50');
    }, 0);
  };

  const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    target.classList.remove('opacity-50');
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    if (sourceIndex === targetIndex) {
      return;
    }

    // Get all addresses in current order
    const allAddresses = [
      formData.originAddress,
      ...formData.destinationAddresses
    ];

    // Create a new list with the item moved to target position
    const updatedAddresses = [...allAddresses];
    const [removed] = updatedAddresses.splice(sourceIndex, 1);
    updatedAddresses.splice(targetIndex, 0, removed);

    // First is origin, rest are destinations
    const newOrigin = updatedAddresses[0];
    const newDestinations = updatedAddresses.slice(1);

    // Update form data
    setFormData(prev => ({
      ...prev,
      originAddress: { ...newOrigin, stopType: 'pickup' },
      destinationAddresses: newDestinations.map(dest => ({ ...dest, stopType: 'dropoff' }))
    }));

    // Update custom address modes
    const oldModes = [
      customAddressModes.origin,
      ...customAddressModes.destinations
    ];
    
    const newModes = [...oldModes];
    const [removedMode] = newModes.splice(sourceIndex, 1);
    newModes.splice(targetIndex, 0, removedMode);
    
    setCustomAddressModes({
      origin: newModes[0],
      destinations: newModes.slice(1)
    });

    // Update selected addresses
    const oldSelected = [
      selectedAddresses.origin,
      ...selectedAddresses.destinations
    ];
    
    const newSelected = [...oldSelected];
    const [removedSelected] = newSelected.splice(sourceIndex, 1);
    newSelected.splice(targetIndex, 0, removedSelected);
    
    setSelectedAddresses({
      origin: newSelected[0],
      destinations: newSelected.slice(1)
    });

    // Navigate to the appropriate step based on the target index
    if (targetIndex === 0) {
      // If the item was moved to become the origin, navigate to the origin step
      safeSetCurrentStep(Step.ORIGIN);
    } else {
      // If the item was moved to a destination position, navigate to that stop's step
      // targetIndex - 1 gives us the destination index (0-based), so we add Step.STOP_2 to get the enum value
      const stopStep = Step.STOP_2 + (targetIndex - 1);
      
      // Make sure we have a valid step enum value
      if (stopStep >= Step.STOP_2 && stopStep <= Step.STOP_5) {
        safeSetCurrentStep(stopStep as Step);
      }
    }
  };

  const nextStep = () => {
    // If we're at origin and don't have any destinations yet, add one
    if (currentStep === Step.ORIGIN && formData.destinationAddresses.length === 0) {
      handleChange('destinationAddresses', [{ ...defaultAddress }])
    }
    
    // Don't proceed past stops we don't have
    const totalStops = 1 + formData.destinationAddresses.length;
    
    // Determine next step based on current step and available stops
    let nextStepValue: Step = Step.PERSONAL_INFO; // Default value
    
    if (currentStep === Step.PERSONAL_INFO) {
      nextStepValue = Step.ORIGIN;
    } else if (currentStep === Step.ORIGIN) {
      if (formData.destinationAddresses.length > 0) {
        nextStepValue = Step.STOP_2;
      } else {
        // Stay on origin if there are no additional stops
        nextStepValue = Step.ORIGIN;
      }
    } else if (currentStep === Step.STOP_2) {
      if (totalStops >= 3) {
        nextStepValue = Step.STOP_3;
      } else {
        // Stay on current step if there are no more stops
        nextStepValue = Step.STOP_2;
      }
    } else if (currentStep === Step.STOP_3) {
      if (totalStops >= 4) {
        nextStepValue = Step.STOP_4;
      } else {
        // Stay on current step if there are no more stops
        nextStepValue = Step.STOP_3;
      }
    } else if (currentStep === Step.STOP_4) {
      if (totalStops >= 5) {
        nextStepValue = Step.STOP_5;
      } else {
        // Stay on current step if there are no more stops
        nextStepValue = Step.STOP_4;
      }
    }
    
    safeSetCurrentStep(nextStepValue);
  }

  const prevStep = () => {
    // Calculate total stops for navigation
    const totalStops = 1 + formData.destinationAddresses.length;
    
    // Determine previous step based on current step and available stops
    let prevStepValue: Step = Step.PERSONAL_INFO; // Default to first step
    
    if (currentStep === Step.STOP_5) {
      prevStepValue = Step.STOP_4;
    } else if (currentStep === Step.STOP_4) {
      prevStepValue = Step.STOP_3;
    } else if (currentStep === Step.STOP_3) {
      prevStepValue = Step.STOP_2;
    } else if (currentStep === Step.STOP_2) {
      prevStepValue = Step.ORIGIN;
    } else if (currentStep === Step.ORIGIN) {
      prevStepValue = Step.PERSONAL_INFO;
    }
    
    safeSetCurrentStep(prevStepValue);
  }

  const isLastStep = () => {
    const totalStops = 1 + formData.destinationAddresses.length;
    
    // If there are no additional stops, the origin is the last step
    if (formData.destinationAddresses.length === 0) {
      return currentStep === Step.ORIGIN;
    }
    
    if (totalStops === 1) {
      return currentStep === Step.ORIGIN;
    } else if (totalStops === 2) {
      return currentStep === Step.STOP_2;
    } else if (totalStops === 3) {
      return currentStep === Step.STOP_3;
    } else if (totalStops === 4) {
      return currentStep === Step.STOP_4;
    } else if (totalStops === 5) {
      return currentStep === Step.STOP_5;
    }
    
    return false;
  }

  const handleSubmit = async () => {
    setError('')
    
    if (isPending) return
    
    // Add validation for final step if needed
    
    try {
      // Start transition to show loading state
      startTransition(async () => {
        console.log('Form submitted:', formData)

        // Create a lead first
        const { data: leadData, error: leadError } = await supabase
          .from('leads')
          .insert({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
          })
          .select('id')
          .single();

        if (leadError) {
          console.error('Error creating lead:', leadError);
          setError('Failed to create lead. Please try again.');
          return;
        }

        // Map addresses to estimation format
        const estimateAddresses = mapFormAddressesToEstimateAddresses(
          formData.originAddress,
          formData.destinationAddresses
        );

        // Save estimate to database
        const { success, error, quoteId } = await saveEstimateToDatabase({
          leadId: leadData.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          moveDate: formData.moveDate,
          moveSize: formData.moveSize,
          serviceType: formData.serviceType,
          referralSource: formData.referralSource,
          addresses: estimateAddresses,
          packingIntensity: formData.packingIntensity,
        });

        if (!success) {
          setError(error || 'Failed to save estimate. Please try again.');
          return;
        }

        // Close modal after successful submission
        onClose();
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }

        // Navigate to the customer page for the newly created quote
        if (quoteId) {
          router.push(`/customers/${quoteId}/quotes`);
          router.refresh();
        }
      });
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('An error occurred. Please try again.');
    }
  }

  const ensureStopExists = (stopIndex: number) => {
    if (stopIndex <= 0) return; // Skip for 1st stop (origin)
    
    const destinationIndex = stopIndex - 2;
    if (destinationIndex >= formData.destinationAddresses.length) {
      // Add empty stops until we have enough
      const newAddresses = [...formData.destinationAddresses];
      while (newAddresses.length <= destinationIndex) {
        newAddresses.push({ ...defaultAddress });
      }
      handleChange('destinationAddresses', newAddresses);
    }
  }

  // Combined interface for both origin and destination addresses
  interface StopAddress extends Address {
    id: string;
    isOrigin: boolean;
    index: number;
  }

  // Initialize step addresses for dnd-kit
  const getStopAddresses = (): StopAddress[] => {
    const addresses: StopAddress[] = [
      {
        ...formData.originAddress,
        id: 'origin',
        isOrigin: true,
        index: 0
      },
      ...formData.destinationAddresses.map((address, index) => ({
        ...address,
        id: `destination-${index}`,
        isOrigin: false,
        index
      }))
    ];
    
    return addresses;
  };

  const renderPersonalInfoStep = () => {
    return (
      <div className="space-y-5">
        {/* Name field - Full width */}
        <div>
          <Label htmlFor="name" className="text-base">Name <span className="text-red-500">*</span></Label>
          <Input
            id="name"
            className="mt-1.5 w-full h-8"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Full Name"
            autoComplete="off"
          />
        </div>
        
        {/* Email field - Full width */}
        <div>
          <Label htmlFor="email" className="text-base">Email</Label>
          <Input
            id="email"
            type="email"
            className="mt-1.5 w-full h-8"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="Email Address"
            autoComplete="off"
          />
        </div>
        
        {/* Phone and Service Type - 2 columns */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone" className="text-base">Phone Number</Label>
            <Input
              id="phone"
              className="mt-1.5 w-full h-8"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="Phone Number"
              autoComplete="off"
            />
          </div>
          
          <div>
            <Label htmlFor="serviceType" className="text-base">Service Type <span className="text-red-500">*</span></Label>
            <Select 
              value={formData.serviceType} 
              onValueChange={(value) => handleChange('serviceType', value)}
            >
              <SelectTrigger className="mt-1.5 w-full h-8">
                <SelectValue placeholder="Service Type" />
              </SelectTrigger>
              <SelectContent position="item-aligned" sideOffset={4}>
                <SelectItem value="Moving">Moving</SelectItem>
                <SelectItem value="Full Service">Full Service</SelectItem>
                <SelectItem value="White Glove">White Glove</SelectItem>
                <SelectItem value="Packing">Packing</SelectItem>
                <SelectItem value="Unpacking">Unpacking</SelectItem>
                <SelectItem value="Moving and Packing">Moving and Packing</SelectItem>
                <SelectItem value="Labor Only">Labor Only</SelectItem>
                <SelectItem value="Load Only">Load Only</SelectItem>
                <SelectItem value="Unload Only">Unload Only</SelectItem>
                <SelectItem value="Staging">Staging</SelectItem>
                <SelectItem value="Junk Removal">Junk Removal</SelectItem>
                <SelectItem value="Commercial">Commercial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Move Date and Move Size - 2 columns */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="moveDate" className="text-base">Move Date <span className="text-red-500">*</span></Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-8 justify-start text-left font-normal mt-1.5"
                >
                  {formData.moveDate ? (
                    format(formData.moveDate, 'PPP')
                  ) : (
                    <span className="text-gray-400">Pick a date</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start" side="bottom" sideOffset={4}>
                <Calendar
                  mode="single"
                  selected={formData.moveDate}
                  onSelect={(date) => handleChange('moveDate', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div>
            <Label htmlFor="moveSize" className="text-base">Move Size <span className="text-red-500">*</span></Label>
            <Select 
              value={formData.moveSize} 
              onValueChange={(value) => handleChange('moveSize', value)}
            >
              <SelectTrigger className="mt-1.5 w-full h-8">
                <SelectValue placeholder="Move Size" />
              </SelectTrigger>
              <SelectContent position="item-aligned" sideOffset={4}>
                <SelectItem value="Office (Small)">Office (Small)</SelectItem>
                <SelectItem value="Office (Medium)">Office (Medium)</SelectItem>
                <SelectItem value="Office (Large)">Office (Large)</SelectItem>
                <SelectItem value="Room or Less">Room or Less</SelectItem>
                <SelectItem value="Studio Apartment">Studio Apartment</SelectItem>
                <SelectItem value="1 Bedroom Apartment">1 Bedroom Apartment</SelectItem>
                <SelectItem value="2 Bedroom Apartment">2 Bedroom Apartment</SelectItem>
                <SelectItem value="3 Bedroom Apartment">3 Bedroom Apartment</SelectItem>
                <SelectItem value="1 Bedroom House">1 Bedroom House</SelectItem>
                <SelectItem value="1 Bedroom House (Large)">1 Bedroom House (Large)</SelectItem>
                <SelectItem value="2 Bedroom House">2 Bedroom House</SelectItem>
                <SelectItem value="2 Bedroom House (Large)">2 Bedroom House (Large)</SelectItem>
                <SelectItem value="3 Bedroom House">3 Bedroom House</SelectItem>
                <SelectItem value="3 Bedroom House (Large)">3 Bedroom House (Large)</SelectItem>
                <SelectItem value="4 Bedroom House">4 Bedroom House</SelectItem>
                <SelectItem value="4 Bedroom House (Large)">4 Bedroom House (Large)</SelectItem>
                <SelectItem value="5 Bedroom House">5 Bedroom House</SelectItem>
                <SelectItem value="5 Bedroom House (Large)">5 Bedroom House (Large)</SelectItem>
                <SelectItem value="5 x 10 Storage Unit">5 x 10 Storage Unit</SelectItem>
                <SelectItem value="5 x 15 Storage Unit">5 x 15 Storage Unit</SelectItem>
                <SelectItem value="10 x 10 Storage Unit">10 x 10 Storage Unit</SelectItem>
                <SelectItem value="10 x 15 Storage Unit">10 x 15 Storage Unit</SelectItem>
                <SelectItem value="10 x 20 Storage Unit">10 x 20 Storage Unit</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Referral Source - Full width */}
        <div>
          <Label htmlFor="referralSource" className="text-base">Referral Source <span className="text-red-500">*</span></Label>
          <Select 
            value={formData.referralSource} 
            onValueChange={(value) => handleChange('referralSource', value)}
          >
            <SelectTrigger className="mt-1.5 w-full h-8">
              <SelectValue placeholder="How did you hear about us?" />
            </SelectTrigger>
            <SelectContent position="item-aligned" sideOffset={4}>
              <SelectItem value="Google Search">Google Search</SelectItem>
              <SelectItem value="Google Maps">Google Maps</SelectItem>
              <SelectItem value="Google Ads">Google Ads</SelectItem>
              <SelectItem value="Yelp">Yelp</SelectItem>
              <SelectItem value="Facebook">Facebook</SelectItem>
              <SelectItem value="Instagram">Instagram</SelectItem>
              <SelectItem value="Twitter">Twitter</SelectItem>
              <SelectItem value="LinkedIn">LinkedIn</SelectItem>
              <SelectItem value="TikTok">TikTok</SelectItem>
              <SelectItem value="Friend/Family Referral">Friend/Family Referral</SelectItem>
              <SelectItem value="Repeat Customer">Repeat Customer</SelectItem>
              <SelectItem value="Apartment Referral">Apartment Referral</SelectItem>
              <SelectItem value="Real Estate Agent">Real Estate Agent</SelectItem>
              <SelectItem value="Moving.com">Moving.com</SelectItem>
              <SelectItem value="HomeAdvisor">HomeAdvisor</SelectItem>
              <SelectItem value="Angi">Angi</SelectItem>
              <SelectItem value="Thumbtack">Thumbtack</SelectItem>
              <SelectItem value="Craigslist">Craigslist</SelectItem>
              <SelectItem value="Direct Mail">Direct Mail</SelectItem>
              <SelectItem value="Local Event">Local Event</SelectItem>
              <SelectItem value="Branded Truck">Branded Truck</SelectItem>
              <SelectItem value="Billboard">Billboard</SelectItem>
              <SelectItem value="Radio">Radio</SelectItem>
              <SelectItem value="Newspaper">Newspaper</SelectItem>
              <SelectItem value="Magazine">Magazine</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Packing Intensity */}
        <div>
          <Label htmlFor="packingIntensity" className="text-base">Packing Intensity <span className="text-red-500">*</span></Label>
          <Select 
            value={formData.packingIntensity} 
            onValueChange={(value) => handleChange('packingIntensity', value)}
          >
            <SelectTrigger className="mt-1.5 w-full h-8">
              <SelectValue placeholder="Packing Intensity" />
            </SelectTrigger>
            <SelectContent position="item-aligned" sideOffset={4}>
              <SelectItem value="Less than Normal">Less than Normal</SelectItem>
              <SelectItem value="Normal">Normal</SelectItem>
              <SelectItem value="More than Normal">More than Normal</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {error && <p className="text-red-500 mb-4">{error}</p>}
      </div>
    )
  }
  
  const renderOriginStep = () => {
    // Modified condition to enable form fields based on selected status only in custom mode
    const isAddressSelected = customAddressModes.origin 
      ? selectedAddresses.origin  // In custom mode, just check if ZIP was entered
      : selectedAddresses.origin && !!formData.originAddress.address; // In Google Places mode, check both
    
    const isCustomMode = customAddressModes.origin;
    
    return (
      <div className="space-y-6">
        <div onMouseDown={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-2">
            <Label htmlFor="originAddress" className="text-base">Address <span className="text-red-500">*</span></Label>
            <Button 
              variant="ghost"
              size="sm"
              className={isCustomMode 
                ? "text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-1" 
                : "text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-1"}
              onClick={() => toggleCustomAddressMode(true)}
            >
              {isCustomMode ? "Search Address" : "Custom Address"}
            </Button>
          </div>
          
          {isCustomMode ? (
            <div className="space-y-1">
              {/* ZIP Code */}
              <div>
                <Label htmlFor="zipCode" className="text-xs mb-0.5 block">ZIP Code <span className="text-red-500">*</span></Label>
                <Input
                  id="zipCode"
                  value={formData.originAddress.zipCode || ''}
                  onChange={(e) => handleZipCodeChange(true, 0, e.target.value)}
                  placeholder="Enter ZIP Code"
                  className="w-full h-7"
                  maxLength={5}
                  autoComplete="off"
                />
              </div>
              
              {/* City and State on same row */}
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div>
                  <Label htmlFor="city" className={`text-xs mb-0.5 block ${!isAddressSelected ? 'text-gray-400' : ''}`}>City</Label>
                  <Input
                    id="city"
                    value={formData.originAddress.city || ''}
                    placeholder="City"
                    className="w-full h-7"
                    disabled={!isAddressSelected}
                    readOnly
                    autoComplete="off"
                  />
                </div>
                
                <div>
                  <Label htmlFor="state" className={`text-xs mb-0.5 block ${!isAddressSelected ? 'text-gray-400' : ''}`}>State</Label>
                  <Input
                    id="state"
                    value={formData.originAddress.state || ''}
                    placeholder="State"
                    className="w-full h-7"
                    disabled={!isAddressSelected}
                    readOnly
                    autoComplete="off"
                  />
                </div>
              </div>
              
              {/* Street Address */}
              <div className="mt-1">
                <Label htmlFor="street" className={`text-xs mb-0.5 block ${!isAddressSelected ? 'text-gray-400' : ''}`}>Street Address <span className="text-red-500">*</span></Label>
                <Input
                  id="street"
                  value={formData.originAddress.street || ''}
                  onChange={(e) => handleStreetChange(true, 0, e.target.value)}
                  placeholder="Street Address"
                  className="w-full h-7"
                  disabled={!isAddressSelected}
                  autoComplete="off"
                />
              </div>
            </div>
          ) : (
            <GooglePlacesAutocomplete
              apiKey={googleApiKey}
              value={formData.originAddress.address}
              onChange={(value) => handleOriginAddressChange('address', value)}
              placeholder="Enter a location"
              onDropdownStatusChange={handleGooglePlacesInteraction}
              modalRef={modalRef}
              onPlaceSelect={() => handleAddressSelected(true)}
              lastValidSelection={lastValidSelections.origin}
              onUpdateLastValidSelection={(selection) => updateLastValidSelection(true, 0, selection)}
            />
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label htmlFor="propertyName" className={`mb-1 block text-xs ${!isAddressSelected ? 'text-gray-400' : ''}`}>Property Name</Label>
            <Input
              id="propertyName"
              value={formData.originAddress.propertyName}
              onChange={(e) => handleOriginAddressChange('propertyName', e.target.value)}
              placeholder="Property Name"
              className="w-full h-8"
              disabled={!isAddressSelected}
              autoComplete="off"
            />
          </div>
          
          <div>
            <Label htmlFor="unitNumber" className={`mb-1 block text-xs ${!isAddressSelected ? 'text-gray-400' : ''}`}>Unit Number</Label>
            <Input
              id="unitNumber"
              value={formData.originAddress.unitNumber}
              onChange={(e) => handleOriginAddressChange('unitNumber', e.target.value)}
              placeholder="Unit Number"
              className="w-full h-8"
              disabled={!isAddressSelected}
              autoComplete="off"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label htmlFor="propertyType" className={`mb-1 block text-xs ${!isAddressSelected ? 'text-gray-400' : ''}`}>Property Type</Label>
            <Select 
              value={formData.originAddress.propertyType} 
              onValueChange={(value) => handleOriginAddressChange('propertyType', value)}
              disabled={!isAddressSelected}
            >
              <SelectTrigger id="propertyType" className="h-8 w-full">
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent position="item-aligned" sideOffset={4}>
                <SelectItem value="House">House</SelectItem>
                <SelectItem value="Apartment">Apartment</SelectItem>
                <SelectItem value="Condo">Condo</SelectItem>
                <SelectItem value="Office">Office</SelectItem>
                <SelectItem value="Storage">Storage</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="parkingType" className={`mb-1 block text-xs ${!isAddressSelected ? 'text-gray-400' : ''}`}>Parking Type</Label>
            <Select 
              value={formData.originAddress.parkingType} 
              onValueChange={(value) => handleOriginAddressChange('parkingType', value)}
              disabled={!isAddressSelected}
            >
              <SelectTrigger id="parkingType" className="h-8 w-full">
                <SelectValue placeholder="Parking Type" />
              </SelectTrigger>
              <SelectContent position="item-aligned" sideOffset={4}>
                <SelectItem value="Private Driveway">Private Driveway</SelectItem>
                <SelectItem value="Street Parking">Street Parking</SelectItem>
                <SelectItem value="Parking Garage">Parking Garage</SelectItem>
                <SelectItem value="Loading Dock">Loading Dock</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Flights of Stairs - Full width */}
        <div>
          <Label htmlFor="stairs" className={`mb-1 block text-xs ${!isAddressSelected ? 'text-gray-400' : ''}`}>Flights of Stairs</Label>
          <Select 
            value={formData.originAddress.stairs} 
            onValueChange={(value) => handleOriginAddressChange('stairs', value)}
            disabled={!isAddressSelected}
          >
            <SelectTrigger id="stairs" className="h-8 w-full">
              <SelectValue placeholder="Flights of Stairs" />
            </SelectTrigger>
            <SelectContent position="item-aligned" sideOffset={4}>
              <SelectItem value="No Stairs">No Stairs</SelectItem>
              <SelectItem value="1 Flight">1 Flight</SelectItem>
              <SelectItem value="2 Flights">2 Flights</SelectItem>
              <SelectItem value="3 Flights">3 Flights</SelectItem>
              <SelectItem value="4 Flights">4 Flights</SelectItem>
              <SelectItem value="5 Flights">5 Flights</SelectItem>
              <SelectItem value="6 Flights">6 Flights</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label htmlFor="elevator" className={`mb-1 block text-xs ${!isAddressSelected ? 'text-gray-400' : ''}`}>Elevator</Label>
            <Select 
              value={formData.originAddress.elevator} 
              onValueChange={(value) => handleOriginAddressChange('elevator', value)}
              disabled={!isAddressSelected}
            >
              <SelectTrigger id="elevator" className="h-8 w-full">
                <SelectValue placeholder="Elevator" />
              </SelectTrigger>
              <SelectContent position="item-aligned" sideOffset={4}>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="walkDistance" className={`mb-1 block text-xs ${!isAddressSelected ? 'text-gray-400' : ''}`}>Walk Distance</Label>
            <Select 
              value={formData.originAddress.walkDistance} 
              onValueChange={(value) => handleOriginAddressChange('walkDistance', value)}
              disabled={!isAddressSelected}
            >
              <SelectTrigger id="walkDistance" className="h-8 w-full">
                <SelectValue placeholder="Walk Distance" />
              </SelectTrigger>
              <SelectContent position="item-aligned" sideOffset={4}>
                <SelectItem value="Less than 100 feet">Less than 100 feet</SelectItem>
                <SelectItem value="100-200 feet">100-200 feet</SelectItem>
                <SelectItem value="200-300 feet">200-300 feet</SelectItem>
                <SelectItem value="More than 300 feet">More than 300 feet</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {error && <p className="text-red-500 mb-4">{error}</p>}
      </div>
    )
  }
  
  const renderStopStep = (index: number) => {
    const currentAddress = formData.destinationAddresses[index];
    // Modified condition to enable form fields based on selected status only in custom mode
    const isAddressSelected = customAddressModes.destinations[index] 
      ? selectedAddresses.destinations[index]  // In custom mode, just check if ZIP was entered
      : selectedAddresses.destinations[index] && !!currentAddress.address; // In Google Places mode, check both
    
    const isCustomMode = customAddressModes.destinations[index];
    
    if (!currentAddress) return null;
    
    return (
      <div className="space-y-6">
        <div onMouseDown={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-2">
            <Label htmlFor={`destinationAddress-${index}`} className="text-base">Address <span className="text-red-500">*</span></Label>
            <Button 
              variant="ghost"
              size="sm"
              className={isCustomMode 
                ? "text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-1" 
                : "text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-1"}
              onClick={() => toggleCustomAddressMode(false, index)}
            >
              {isCustomMode ? "Search Address" : "Custom Address"}
            </Button>
          </div>
          
          {isCustomMode ? (
            <div className="space-y-1">
              {/* ZIP Code */}
              <div>
                <Label htmlFor={`zipCode-${index}`} className="text-xs mb-0.5 block">ZIP Code <span className="text-red-500">*</span></Label>
                <Input
                  id={`zipCode-${index}`}
                  value={currentAddress.zipCode || ''}
                  onChange={(e) => handleZipCodeChange(false, index, e.target.value)}
                  placeholder="Enter ZIP Code"
                  className="w-full h-7"
                  maxLength={5}
                  autoComplete="off"
                />
              </div>
              
              {/* City and State on same row */}
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div>
                  <Label htmlFor={`city-${index}`} className={`text-xs mb-0.5 block ${!isAddressSelected ? 'text-gray-400' : ''}`}>City</Label>
                  <Input
                    id={`city-${index}`}
                    value={currentAddress.city || ''}
                    placeholder="City"
                    className="w-full h-7"
                    disabled={!isAddressSelected}
                    readOnly
                    autoComplete="off"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`state-${index}`} className={`text-xs mb-0.5 block ${!isAddressSelected ? 'text-gray-400' : ''}`}>State</Label>
                  <Input
                    id={`state-${index}`}
                    value={currentAddress.state || ''}
                    placeholder="State"
                    className="w-full h-7"
                    disabled={!isAddressSelected}
                    readOnly
                    autoComplete="off"
                  />
                </div>
              </div>
              
              {/* Street Address */}
              <div className="mt-1">
                <Label htmlFor={`street-${index}`} className={`text-xs mb-0.5 block ${!isAddressSelected ? 'text-gray-400' : ''}`}>Street Address <span className="text-red-500">*</span></Label>
                <Input
                  id={`street-${index}`}
                  value={currentAddress.street || ''}
                  onChange={(e) => handleStreetChange(false, index, e.target.value)}
                  placeholder="Street Address"
                  className="w-full h-7"
                  disabled={!isAddressSelected}
                  autoComplete="off"
                />
              </div>
            </div>
          ) : (
            <GooglePlacesAutocomplete
              apiKey={googleApiKey}
              value={currentAddress.address}
              onChange={(value) => handleDestinationAddressChange(index, 'address', value)}
              placeholder="Enter a location"
              onDropdownStatusChange={handleGooglePlacesInteraction}
              modalRef={modalRef}
              onPlaceSelect={() => {
                const newDestinations = [...selectedAddresses.destinations];
                newDestinations[index] = true;
                setSelectedAddresses(prev => ({
                  ...prev,
                  destinations: newDestinations
                }));
              }}
              lastValidSelection={lastValidSelections.destinations[index] || ''}
              onUpdateLastValidSelection={(selection) => updateLastValidSelection(false, index, selection)}
            />
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label htmlFor={`propertyName-${index}`} className={`mb-1 block text-xs ${!isAddressSelected ? 'text-gray-400' : ''}`}>Property Name</Label>
            <Input
              id={`propertyName-${index}`}
              value={currentAddress.propertyName}
              onChange={(e) => handleDestinationAddressChange(index, 'propertyName', e.target.value)}
              placeholder="Property Name"
              className="w-full h-8"
              disabled={!isAddressSelected}
              autoComplete="off"
            />
          </div>
          
          <div>
            <Label htmlFor={`unitNumber-${index}`} className={`mb-1 block text-xs ${!isAddressSelected ? 'text-gray-400' : ''}`}>Unit Number</Label>
            <Input
              id={`unitNumber-${index}`}
              value={currentAddress.unitNumber}
              onChange={(e) => handleDestinationAddressChange(index, 'unitNumber', e.target.value)}
              placeholder="Unit Number"
              className="w-full h-8"
              disabled={!isAddressSelected}
              autoComplete="off"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label htmlFor={`propertyType-${index}`} className={`mb-1 block text-xs ${!isAddressSelected ? 'text-gray-400' : ''}`}>Property Type</Label>
            <Select 
              value={currentAddress.propertyType} 
              onValueChange={(value) => handleDestinationAddressChange(index, 'propertyType', value)}
              disabled={!isAddressSelected}
            >
              <SelectTrigger id={`propertyType-${index}`} className="h-8 w-full">
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent position="item-aligned" sideOffset={4}>
                <SelectItem value="House">House</SelectItem>
                <SelectItem value="Apartment">Apartment</SelectItem>
                <SelectItem value="Condo">Condo</SelectItem>
                <SelectItem value="Office">Office</SelectItem>
                <SelectItem value="Storage">Storage</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor={`parkingType-${index}`} className={`mb-1 block text-xs ${!isAddressSelected ? 'text-gray-400' : ''}`}>Parking Type</Label>
            <Select 
              value={currentAddress.parkingType} 
              onValueChange={(value) => handleDestinationAddressChange(index, 'parkingType', value)}
              disabled={!isAddressSelected}
            >
              <SelectTrigger id={`parkingType-${index}`} className="h-8 w-full">
                <SelectValue placeholder="Parking Type" />
              </SelectTrigger>
              <SelectContent position="item-aligned" sideOffset={4}>
                <SelectItem value="Private Driveway">Private Driveway</SelectItem>
                <SelectItem value="Street Parking">Street Parking</SelectItem>
                <SelectItem value="Parking Garage">Parking Garage</SelectItem>
                <SelectItem value="Loading Dock">Loading Dock</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Flights of Stairs - Full width */}
        <div>
          <Label htmlFor={`stairs-${index}`} className={`mb-1 block text-xs ${!isAddressSelected ? 'text-gray-400' : ''}`}>Flights of Stairs</Label>
          <Select 
            value={currentAddress.stairs} 
            onValueChange={(value) => handleDestinationAddressChange(index, 'stairs', value)}
            disabled={!isAddressSelected}
          >
            <SelectTrigger id={`stairs-${index}`} className="h-8 w-full">
              <SelectValue placeholder="Flights of Stairs" />
            </SelectTrigger>
            <SelectContent position="item-aligned" sideOffset={4}>
              <SelectItem value="No Stairs">No Stairs</SelectItem>
              <SelectItem value="1 Flight">1 Flight</SelectItem>
              <SelectItem value="2 Flights">2 Flights</SelectItem>
              <SelectItem value="3 Flights">3 Flights</SelectItem>
              <SelectItem value="4 Flights">4 Flights</SelectItem>
              <SelectItem value="5 Flights">5 Flights</SelectItem>
              <SelectItem value="6 Flights">6 Flights</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label htmlFor={`elevator-${index}`} className={`mb-1 block text-xs ${!isAddressSelected ? 'text-gray-400' : ''}`}>Elevator</Label>
            <Select 
              value={currentAddress.elevator} 
              onValueChange={(value) => handleDestinationAddressChange(index, 'elevator', value)}
              disabled={!isAddressSelected}
            >
              <SelectTrigger id={`elevator-${index}`} className="h-8 w-full">
                <SelectValue placeholder="Elevator" />
              </SelectTrigger>
              <SelectContent position="item-aligned" sideOffset={4}>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor={`walkDistance-${index}`} className={`mb-1 block text-xs ${!isAddressSelected ? 'text-gray-400' : ''}`}>Walk Distance</Label>
            <Select 
              value={currentAddress.walkDistance || 'Less than 100 feet'} 
              onValueChange={(value) => handleDestinationAddressChange(index, 'walkDistance', value)}
              disabled={!isAddressSelected}
            >
              <SelectTrigger id={`walkDistance-${index}`} className="h-8 w-full">
                <SelectValue placeholder="Walk Distance" />
              </SelectTrigger>
              <SelectContent position="item-aligned" sideOffset={4}>
                <SelectItem value="Less than 100 feet">Less than 100 feet</SelectItem>
                <SelectItem value="100-200 feet">100-200 feet</SelectItem>
                <SelectItem value="200-300 feet">200-300 feet</SelectItem>
                <SelectItem value="More than 300 feet">More than 300 feet</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {error && <p className="text-red-500 mb-4">{error}</p>}
      </div>
    )
  }

  const renderStopSteps = () => {
    return (
      <div className="pl-0">
        <div className="space-y-1.5">
          {/* Origin (1st stop) */}
          <div
            draggable={true}
            onDragStart={(e) => handleDragStart(e, 0)}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 0)}
            className={`relative cursor-grab active:cursor-grabbing`}
          >
            <div 
              className={`flex items-center py-2 px-2 rounded-md ${currentStep === Step.ORIGIN ? 'bg-white/10 shadow-md' : ''}`}
            >
              <div className="touch-none px-1 mr-1">
                <GripVertical className="h-4 w-4 text-white/60" />
              </div>
              <div 
                className={`flex items-center justify-center w-6 h-6 rounded-full ${currentStep === Step.ORIGIN ? 'bg-white text-blue-600' : 'bg-blue-700 text-white'}`}
                onClick={() => safeSetCurrentStep(Step.ORIGIN)}
              >
                {isStepCompleted(Step.ORIGIN) ? 
                  <Check className="h-4 w-4" /> : 
                  <Circle className="h-4 w-4" fill={currentStep === Step.ORIGIN ? 'currentColor' : 'none'} strokeWidth={2} />
                }
              </div>
              <span 
                className={`text-sm ml-2 ${currentStep === Step.ORIGIN ? 'font-medium text-white' : 'text-white/80'} flex-grow cursor-pointer`}
                onClick={() => safeSetCurrentStep(Step.ORIGIN)}
              >
                1st Stop
              </span>
              {formData.destinationAddresses.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white/70 hover:text-white hover:bg-red-500/20 p-1 h-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeOriginStop();
                  }}
                  title="Remove stop"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remove stop</span>
                </Button>
              )}
            </div>
          </div>

          {/* Destination stops */}
          {formData.destinationAddresses.map((stop, index) => {
            const stepValue = getStepForStop(index + 2);
            const stopIndex = index + 1; // Index in the combined list (origin + destinations)
            
            if (stepValue === null) return null;
            
            return (
              <div
                key={`destination-${index}`}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, stopIndex)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stopIndex)}
                className="relative cursor-grab active:cursor-grabbing"
              >
                <div 
                  className={`flex items-center py-2 px-2 rounded-md ${currentStep === stepValue ? 'bg-white/10 shadow-md' : ''}`}
                >
                  <div className="touch-none px-1 mr-1">
                    <GripVertical className="h-4 w-4 text-white/60" />
                  </div>
                  <div 
                    className={`flex items-center justify-center w-6 h-6 rounded-full ${currentStep === stepValue ? 'bg-white text-blue-600' : 'bg-blue-700 text-white'}`}
                    onClick={() => safeSetCurrentStep(stepValue)}
                  >
                    {isStepCompleted(stepValue) ? 
                      <Check className="h-4 w-4" /> : 
                      <Circle className="h-4 w-4" fill={currentStep === stepValue ? 'currentColor' : 'none'} strokeWidth={2} />
                    }
                  </div>
                  <span 
                    className={`text-sm ml-2 ${currentStep === stepValue ? 'font-medium text-white' : 'text-white/80'} flex-grow cursor-pointer`}
                    onClick={() => safeSetCurrentStep(stepValue)}
                  >
                    {getStopLabel(index + 2)}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white/70 hover:text-white hover:bg-red-500/20 p-1 h-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeDestinationStop(index);
                    }}
                    title="Remove stop"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove stop</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Stop button */}
        {formData.destinationAddresses.length < 4 && (
          <div 
            className="flex items-center py-2 px-2 mt-1 cursor-pointer hover:opacity-90 transition-opacity hover:bg-blue-600/10 rounded-md"
            onClick={handleAddStop}
          >
            <div className="touch-none px-1 mr-1 opacity-0">
              <GripVertical className="h-4 w-4 text-white/60" />
            </div>
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white">
              <Plus className="h-4 w-4" />
            </div>
            <span className="text-sm ml-2 text-white/80">Add Stop</span>
          </div>
        )}
      </div>
    );
  };

  const renderSidebarSteps = () => {
    return (
      <div className="flex flex-col space-y-1">
        <div 
          className={`flex items-center py-2 px-2 cursor-pointer rounded-md ${currentStep === Step.PERSONAL_INFO ? 'bg-white/10 shadow-md' : ''}`}
          onClick={() => safeSetCurrentStep(Step.PERSONAL_INFO)}
        >
          <div className="touch-none px-1 mr-1 opacity-0">
            <GripVertical className="h-4 w-4 text-white/60" />
          </div>
          <div className={`flex items-center justify-center w-6 h-6 rounded-full ${currentStep === Step.PERSONAL_INFO ? 'bg-white text-blue-600' : 'bg-blue-700 text-white'}`}>
            {isStepCompleted(Step.PERSONAL_INFO) ? <Check className="h-4 w-4" /> : <Circle className="h-4 w-4" fill={currentStep === Step.PERSONAL_INFO ? 'currentColor' : 'none'} strokeWidth={2} />}
          </div>
          <span className={`text-sm ml-2 ${currentStep === Step.PERSONAL_INFO ? 'font-medium text-white' : 'text-white/80'}`}>Personal Info</span>
        </div>

        {/* All stop-related steps */}
        {renderStopSteps()}
      </div>
    );
  };

  const getOrdinalSuffix = (num: number) => {
    if (num === 1) return "1st";
    if (num === 2) return "2nd";
    if (num === 3) return "3rd";
    return `${num}th`;
  };

  // Helper functions
  const getStepForStop = (stopIndex: number) => {
    if (stopIndex === 1) return Step.ORIGIN;
    if (stopIndex === 2) return Step.STOP_2;
    if (stopIndex === 3) return Step.STOP_3;
    if (stopIndex === 4) return Step.STOP_4;
    if (stopIndex === 5) return Step.STOP_5;
    return null;
  };

  const getStopLabel = (stopIndex: number) => {
    if (stopIndex === 1) return '1st Stop';
    if (stopIndex === 2) return '2nd Stop';
    if (stopIndex === 3) return '3rd Stop';
    if (stopIndex === 4) return '4th Stop';
    if (stopIndex === 5) return '5th Stop';
    return '';
  };

  const isPersonalInfoComplete = () => {
    return !!formData.name && 
           !!formData.serviceType && 
           !!formData.moveDate && 
           !!formData.moveSize && 
           !!formData.referralSource && 
           !!formData.packingIntensity;
  };

  const isOriginComplete = () => {
    if (customAddressModes.origin) {
      // Custom address mode validation
      return !!formData.originAddress.zipCode &&
             !!formData.originAddress.city &&
             !!formData.originAddress.state &&
             !!formData.originAddress.street &&
             !!formData.originAddress.stopType;
    }
    // Google Places mode validation
    return !!formData.originAddress.address && 
           !!formData.originAddress.stopType;
  };

  const isStopComplete = (stopIndex: number) => {
    if (stopIndex < 0 || stopIndex >= formData.destinationAddresses.length) {
      return false;
    }
    
    const stop = formData.destinationAddresses[stopIndex];
    const isCustomMode = customAddressModes.destinations[stopIndex];
    
    if (isCustomMode) {
      // Custom address mode validation
      return !!stop.zipCode &&
             !!stop.city &&
             !!stop.state &&
             !!stop.street &&
             !!stop.stopType;
    }
    // Google Places mode validation
    return !!stop.address && !!stop.stopType;
  };

  // Comprehensive validation for the entire form
  const isFormComplete = () => {
    // Check personal info is complete
    if (!isPersonalInfoComplete()) {
      return false;
    }
    
    // Check origin address is complete
    if (!isOriginComplete()) {
      return false;
    }
    
    // Check all destination addresses are complete
    for (let i = 0; i < formData.destinationAddresses.length; i++) {
      if (!isStopComplete(i)) {
        return false;
      }
    }
    
    // All validations passed
    return true;
  };

  const isStepCompleted = (step: Step) => {
    if (step === Step.PERSONAL_INFO) {
      return isPersonalInfoComplete();
    } else if (step === Step.ORIGIN) {
      return isOriginComplete();
    } else if (step >= Step.STOP_2 && step <= Step.STOP_5) {
      // Convert step value to destination index (Step.STOP_2 = index 0)
      const stopIndex = step - Step.STOP_2;
      
      // Make sure we have a valid destination index
      if (stopIndex >= 0 && stopIndex < formData.destinationAddresses.length) {
        return isStopComplete(stopIndex);
      }
      return false;
    }
    return false;
  };

  const StopTypeDropdown = ({ 
    value, 
    onChange 
  }: { 
    value: string; 
    onChange: (value: string) => void 
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      // Close dropdown when clicking outside
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    return (
      <div className="relative" ref={dropdownRef}>
        <div 
          className="flex items-center gap-1 text-blue-600 cursor-pointer" 
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="font-medium">
            {value === 'pickup' ? 'Origin' : 'Destination'}
          </span>
          <ChevronDown className="h-4 w-4 text-blue-600" />
        </div>
        
        {isOpen && (
          <div className="absolute top-full left-0 mt-1 bg-white rounded-md shadow-md z-10 w-32 py-1 border border-gray-200" style={{
            // Adjust position if it would be off-screen
            transform: `translateY(${formData.destinationAddresses.length >= 4 ? '-100%' : '0'})`,
            top: formData.destinationAddresses.length >= 4 ? '-0.25rem' : 'auto'
          }}>
            <div 
              className={`px-3 py-1.5 hover:bg-gray-100 cursor-pointer ${value === 'pickup' ? 'text-blue-600 font-medium' : ''}`}
              onClick={() => {
                onChange('pickup');
                setIsOpen(false);
              }}
            >
              Origin
            </div>
            <div 
              className={`px-3 py-1.5 hover:bg-gray-100 cursor-pointer ${value === 'dropoff' ? 'text-blue-600 font-medium' : ''}`}
              onClick={() => {
                onChange('dropoff');
                setIsOpen(false);
              }}
            >
              Destination
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderStepContent = (step: Step) => {
    switch (step) {
      case Step.PERSONAL_INFO:
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-5">Personal Information</h2>
            {renderPersonalInfoStep()}
          </div>
        )
      case Step.ORIGIN:
        return (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-xl font-semibold">1st Stop</h2>
              <StopTypeDropdown 
                value={formData.originAddress.stopType} 
                onChange={(value) => handleOriginAddressChange('stopType', value as 'pickup' | 'dropoff')}
              />
            </div>
            {renderOriginStep()}
          </div>
        )
      case Step.STOP_2:
        ensureStopExists(2);
        // Safety check to ensure the destination exists
        if (!formData.destinationAddresses[0]) return null;
        return (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-xl font-semibold">2nd Stop</h2>
              <StopTypeDropdown 
                value={formData.destinationAddresses[0].stopType} 
                onChange={(value) => handleDestinationAddressChange(0, 'stopType', value as 'pickup' | 'dropoff')}
              />
            </div>
            {renderStopStep(0)}
          </div>
        )
      case Step.STOP_3:
        ensureStopExists(3);
        // Safety check to ensure the destination exists
        if (!formData.destinationAddresses[1]) return null;
        return (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-xl font-semibold">3rd Stop</h2>
              <StopTypeDropdown 
                value={formData.destinationAddresses[1].stopType} 
                onChange={(value) => handleDestinationAddressChange(1, 'stopType', value as 'pickup' | 'dropoff')}
              />
            </div>
            {renderStopStep(1)}
          </div>
        )
      case Step.STOP_4:
        ensureStopExists(4);
        // Safety check to ensure the destination exists
        if (!formData.destinationAddresses[2]) return null;
        return (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-xl font-semibold">4th Stop</h2>
              <StopTypeDropdown 
                value={formData.destinationAddresses[2].stopType} 
                onChange={(value) => handleDestinationAddressChange(2, 'stopType', value as 'pickup' | 'dropoff')}
              />
            </div>
            {renderStopStep(2)}
          </div>
        )
      case Step.STOP_5:
        ensureStopExists(5);
        // Safety check to ensure the destination exists
        if (!formData.destinationAddresses[3]) return null;
        return (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-xl font-semibold">5th Stop</h2>
              <StopTypeDropdown 
                value={formData.destinationAddresses[3].stopType} 
                onChange={(value) => handleDestinationAddressChange(3, 'stopType', value as 'pickup' | 'dropoff')}
              />
            </div>
            {renderStopStep(3)}
          </div>
        )
      default:
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-5">Personal Information</h2>
            {renderPersonalInfoStep()}
          </div>
        )
    }
  };

  const removeOriginStop = () => {
    // Don't allow removing if it's the only stop
    if (formData.destinationAddresses.length === 0) {
      return;
    }
    
    // Get all addresses except the origin
    const allDestinations = [...formData.destinationAddresses];
    
    // The first destination becomes the new origin
    const newOrigin = { ...allDestinations[0], stopType: 'pickup' as 'pickup' };
    
    // Remove the first destination from the array
    const remainingDestinations = allDestinations.slice(1);
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      originAddress: newOrigin,
      destinationAddresses: remainingDestinations
    }));
    
    // Update custom address modes
    const allModes = [
      ...customAddressModes.destinations
    ];
    
    setCustomAddressModes({
      origin: allModes[0], // First destination mode becomes the origin mode
      destinations: allModes.slice(1) // Rest remain as destination modes
    });
    
    // Update selected addresses
    const allSelected = [
      ...selectedAddresses.destinations
    ];
    
    setSelectedAddresses({
      origin: allSelected[0], // First destination selected state becomes the origin state
      destinations: allSelected.slice(1) // Rest remain as destination states
    });
    
    // Navigate to the origin step
    safeSetCurrentStep(Step.ORIGIN);
  };

  const removeDestinationStop = (index: number) => {
    // Create a copy of the current addresses and remove the specified one
    const updatedAddresses = formData.destinationAddresses.filter((_, i) => i !== index);
    
    // Update the form data
    setFormData(prev => ({
      ...prev,
      destinationAddresses: updatedAddresses
    }));

    // Update custom address modes and selected states
    const newCustomModes = customAddressModes.destinations.filter((_, i) => i !== index);
    setCustomAddressModes(prev => ({
      ...prev,
      destinations: newCustomModes
    }));

    const newSelectedStates = selectedAddresses.destinations.filter((_, i) => i !== index);
    setSelectedAddresses(prev => ({
      ...prev,
      destinations: newSelectedStates
    }));

    // If we were viewing the stop that was removed, go back to the first stop
    const currentStopIndex = currentStep - Step.STOP_2;
    if (currentStopIndex === index) {
      safeSetCurrentStep(Step.ORIGIN);
    } else if (currentStopIndex > index) {
      // If we were viewing a stop after the one removed, adjust the step
      const newStep = currentStep - 1;
      safeSetCurrentStep(newStep as Step);
    }
  };

  const safeSetCurrentStep = (step: Step) => {
    // Log the current state before changing steps
    console.log('Current form data before step change:', formData);
    console.log('Changing from step', currentStep, 'to step', step);
    
    // Save the current serviceType value
    const currentServiceType = formData.serviceType;
    
    // Change the step
    setCurrentStep(step);
    
    // Ensure serviceType is preserved after step change
    if (currentServiceType) {
      setTimeout(() => {
        setFormData(prev => {
          // Only update if the value has changed
          if (prev.serviceType !== currentServiceType) {
            console.log('Restoring service type:', currentServiceType);
            return {
              ...prev,
              serviceType: currentServiceType
            };
          }
          return prev;
        });
      }, 0);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="sm:max-w-[925px] p-0 rounded-lg overflow-hidden max-h-[650px]" 
        ref={modalRef}
      >
        {/* Custom X button */}
        <div className="absolute right-4 top-4 z-10">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleClose}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        <DialogTitle className="sr-only">Create Opportunity</DialogTitle>
        <div className="flex h-[600px]">
          {/* Sidebar */}
          <div className="w-64 bg-blue-600 text-white p-6">
            <div className="space-y-5">
              <h2 className="text-xl font-semibold mb-6">Create Quote</h2>
              {renderSidebarSteps()}
              <div className="pt-4 mt-auto">
                <Button 
                  className={`w-full ${isFormComplete() ? 'bg-white hover:bg-white/90 text-blue-600' : 'bg-blue-700 hover:bg-blue-700/90 text-white/50 cursor-not-allowed'}`} 
                  onClick={isFormComplete() ? handleSubmit : undefined}
                  disabled={isPending || !isFormComplete()}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing
                    </>
                  ) : (
                    'Create Quote'
                  )}
                </Button>
                <div className="mt-4 text-sm text-white/70">
                  <div className="flex items-start space-x-2 max-w-[200px]">
                    <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <p className="break-words">Fill out all required fields marked with * across all stops before creating a quote.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <form autoComplete="off" onSubmit={(e) => e.preventDefault()} noValidate>
              {renderStepContent(currentStep)}
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
