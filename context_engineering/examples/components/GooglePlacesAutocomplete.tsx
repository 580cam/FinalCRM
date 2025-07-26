'use client'

import { useEffect, useRef, useState, RefObject } from 'react'
import { Input } from '@/components/ui/input'
import styles from './GooglePlacesAutocomplete.module.css'

// Define Google Maps API types
declare global {
  interface Window {
    google: {
      maps: {
        places: {
          Autocomplete: new (
            inputElement: HTMLInputElement,
            options?: {
              types?: string[];
              componentRestrictions?: {
                country: string | string[];
              };
              fields?: string[];
              bounds?: {
                b: number;
                f: number;
                j: number;
                l: number;
              };
            }
          ) => {
            addListener: (event: string, callback: () => void) => void;
            getPlace: () => {
              formatted_address?: string;
              geometry?: any;
              [key: string]: any;
            };
          };
        };
        event?: {
          clearInstanceListeners: (instance: any) => void;
        };
        Circle: new (
          options: {
            center: {
              lat: number;
              lng: number;
            };
            radius: number;
          }
        ) => {
          getBounds: () => {
            b: number;
            f: number;
            j: number;
            l: number;
          };
        };
      };
    };
    initializeGooglePlaces: () => void;
  }
}

interface GooglePlacesAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  apiKey: string
  onDropdownStatusChange?: (isOpen: boolean) => void
  modalRef?: RefObject<HTMLDivElement | null>
  useLocationBias?: boolean
  onPlaceSelect?: () => void
  lastValidSelection?: string
  onUpdateLastValidSelection?: (selection: string) => void
  strict?: boolean
}

export default function GooglePlacesAutocomplete({
  value,
  onChange,
  placeholder = 'Enter an address',
  className = '',
  disabled = false,
  apiKey,
  onDropdownStatusChange,
  modalRef,
  useLocationBias = true,
  onPlaceSelect,
  lastValidSelection,
  onUpdateLastValidSelection,
  strict = true
}: GooglePlacesAutocompleteProps) {
  // Input and autocomplete references
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<any>(null)
  const scriptLoadedRef = useRef(false)
  
  // State for tracking dropdown visibility
  const [dropdownVisible, setDropdownVisible] = useState(false)
  
  // State for tracking place selection
  const [isSelectingPlace, setIsSelectingPlace] = useState(false)
  
  // Track last valid user selection
  const [lastValidSelectionState, setLastValidSelectionState] = useState<string>(lastValidSelection || value || '');
  
  // Generate a unique ID for this instance
  const instanceId = useRef(`google-places-${Math.random().toString(36).substring(2, 9)}`)
  
  // Notify parent about dropdown status changes - add debounce for stability
  useEffect(() => {
    // Use a timeout to debounce status changes and prevent race conditions
    const timeoutId = setTimeout(() => {
      if (onDropdownStatusChange) {
        onDropdownStatusChange(dropdownVisible);
      }
    }, 50);
    
    return () => clearTimeout(timeoutId);
  }, [dropdownVisible, onDropdownStatusChange])
  
  // Patch the global google places pac-container to prevent dialog closure
  useEffect(() => {
    if (dropdownVisible) {
      // Function to modify the pac-container behavior
      const modifyPacContainer = () => {
        const pacContainer = document.querySelector('.pac-container') as HTMLElement;
        
        if (pacContainer) {
          // Stop event propagation on all pac-container clicks
          const preventClose = (e: Event) => {
            e.stopPropagation();
          };
          
          // Remove any previous listeners
          pacContainer.removeEventListener('mousedown', preventClose, true);
          pacContainer.removeEventListener('click', preventClose, true);
          
          // Add listeners to stop propagation
          pacContainer.addEventListener('mousedown', preventClose, true);
          pacContainer.addEventListener('click', preventClose, true);
        }
      };
      
      // Apply immediately and set interval to handle delay in pac-container creation
      modifyPacContainer();
      const intervalId = setInterval(modifyPacContainer, 200);
      
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [dropdownVisible]);

  // Function to handle place selection
  const handlePlaceSelected = () => {
    if (!autocompleteRef.current) return;
    
    try {
      const place = autocompleteRef.current.getPlace();
      if (place && place.formatted_address) {
        setLastValidSelectionState(place.formatted_address);
        // Call external onPlaceSelect if provided
        if (onPlaceSelect) {
          onPlaceSelect();
        }
        // Update parent component about last valid selection if callback provided
        if (onUpdateLastValidSelection) {
          onUpdateLastValidSelection(place.formatted_address);
        }
      }
    } catch (error) {
      console.error('Error getting place:', error);
    }
  };
  
  // Handle blur events on the input to check if user entered text but didn't select an address
  const handleInputBlur = () => {
    // Only apply strict validation in strict mode
    if (!strict) return;
    
    if (inputRef.current) {
      const currentInputValue = inputRef.current.value;
      
      // Case 1: If field was previously empty and user typed something without selecting = clear
      if (!lastValidSelectionState && currentInputValue && !isSelectingPlace) {
        inputRef.current.value = '';
        onChange('');
      }
      // Case 2: If field had a valid selection and user modified it without selecting new one = revert
      else if (lastValidSelectionState && currentInputValue !== lastValidSelectionState && !isSelectingPlace) {
        inputRef.current.value = lastValidSelectionState;
        onChange(lastValidSelectionState);
      }
    }
  };
  
  // Load Google Maps script
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      // Don't load if already loaded
      if (scriptLoadedRef.current || document.getElementById('google-places-script')) {
        return
      }
      
      // Define callback for script load
      window.initializeGooglePlaces = () => {
        scriptLoadedRef.current = true
        initializeAutocomplete()
      }
      
      // Create and load script
      const script = document.createElement('script')
      script.id = 'google-places-script'
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initializeGooglePlaces`
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }
    
    // Helper function to initialize autocomplete
    const initializeAutocomplete = () => {
      if (!window.google?.maps?.places || !inputRef.current) return
      
      // Clean up any existing instance
      if (autocompleteRef.current && window.google.maps.event) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }
      
      try {
        // Default location bias coordinates for OKC area
        // These coordinates represent 149 S Sunnylane Rd, Del City, OK 73115
        const defaultLocation = {
          lat: 35.450941,
          lng: -97.425752
        }

        // Options for the autocomplete
        const autocompleteOptions: any = {
          types: ['address'],
          componentRestrictions: { country: 'us' },
          fields: ['address_components', 'formatted_address', 'geometry', 'place_id'],
        }

        // Add location bias if enabled
        if (useLocationBias) {
          // Create circle with ~10 mile radius (in meters)
          const circle = new window.google.maps.Circle({
            center: defaultLocation,
            radius: 16000 // approximately 10 miles in meters
          })
          
          // Add bounds bias from the circle
          autocompleteOptions.bounds = circle.getBounds()
        }
        
        // Create new autocomplete instance with location bias
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          inputRef.current, 
          autocompleteOptions
        )
        
        // Set up place change listener
        autocompleteRef.current.addListener('place_changed', () => {
          if (inputRef.current) {
            const place = autocompleteRef.current?.getPlace()
            
            if (place && place.formatted_address) {
              onChange(place.formatted_address)
              handlePlaceSelected();
              setIsSelectingPlace(false)
            }
          }
        })
      } catch (error) {
        console.error('Error initializing autocomplete:', error)
      }
    }
    
    // Load script if needed
    if (window.google?.maps?.places) {
      scriptLoadedRef.current = true
      initializeAutocomplete()
    } else {
      loadGoogleMapsScript()
    }
    
    // Setup observer to track dropdown appearance
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          const pacContainers = document.querySelectorAll('.pac-container')
          
          // For each container
          pacContainers.forEach(container => {
            // Check if this container is for our input
            if (inputRef.current && !container.hasAttribute('data-bound-to')) {
              const rect = inputRef.current.getBoundingClientRect()
              const containerEl = container as HTMLElement
              
              // Position the dropdown
              containerEl.style.position = 'fixed'
              containerEl.style.left = `${rect.left}px`
              containerEl.style.top = `${rect.bottom}px`
              containerEl.style.width = `${rect.width}px`
              containerEl.style.zIndex = '10000'
              
              // Mark this container as being ours
              containerEl.setAttribute('data-bound-to', instanceId.current)
            }
          })
        }
        
        // Check for removals to update visibility state
        if (mutation.removedNodes.length > 0 && dropdownVisible) {
          const hasVisibleContainer = Array.from(document.querySelectorAll('.pac-container'))
            .some(container => container.getAttribute('data-bound-to') === instanceId.current)
          
          if (!hasVisibleContainer) {
            setDropdownVisible(false)
          }
        }
      }
    })
    
    // Watch for DOM changes
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
    
    // Cleanup function
    return () => {
      observer.disconnect()
      
      if (autocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current)
        autocompleteRef.current = null
      }
      
      // Remove any containers still bound to this instance
      document.querySelectorAll('.pac-container').forEach(container => {
        if (container.getAttribute('data-bound-to') === instanceId.current) {
          document.body.removeChild(container)
        }
      })
    }
  }, [apiKey, dropdownVisible])
  
  // When dropdown is visible, prevent any dialog closures by stopping mousedown propagation
  useEffect(() => {
    if (dropdownVisible) {
      const preventDialogClose = (e: MouseEvent) => {
        // Only stop propagation if click is within or related to the autocomplete
        if (
          inputRef.current?.contains(e.target as Node) || 
          document.querySelector('.pac-container')?.contains(e.target as Node)
        ) {
          e.stopPropagation()
        }
      }
      
      document.addEventListener('mousedown', preventDialogClose, true)
      return () => {
        document.removeEventListener('mousedown', preventDialogClose, true)
      }
    }
  }, [dropdownVisible])
  
  // When place is selected, prevent any potential dialog closures
  useEffect(() => {
    if (isSelectingPlace) {
      // Create a click handler that prevents event propagation during selection
      const preventDialogClose = (e: MouseEvent) => {
        // Stop event from bubbling up to dialog
        e.stopPropagation();
      };
      
      // Attach the handler with capture to catch events before they reach dialog
      document.addEventListener('mousedown', preventDialogClose, true);
      document.addEventListener('click', preventDialogClose, true);
      
      return () => {
        // Clean up listeners when no longer selecting
        document.removeEventListener('mousedown', preventDialogClose, true);
        document.removeEventListener('click', preventDialogClose, true);
      };
    }
  }, [isSelectingPlace]);
  
  // Add listeners for window events
  useEffect(() => {
    const handleScroll = () => {
      if (inputRef.current && dropdownVisible) {
        const rect = inputRef.current.getBoundingClientRect()
        
        document.querySelectorAll('.pac-container').forEach(container => {
          if (container.getAttribute('data-bound-to') === instanceId.current) {
            const containerEl = container as HTMLElement
            containerEl.style.left = `${rect.left}px`
            containerEl.style.top = `${rect.bottom}px`
          }
        })
      }
    }
    
    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleScroll)
    
    return () => {
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleScroll)
    }
  }, [dropdownVisible])
  
  // Keep input value in sync
  useEffect(() => {
    // Only update if input exists and value has changed
    if (inputRef.current && inputRef.current.value !== value) {
      inputRef.current.value = value
    }
  }, [value])
  
  return (
    <div className={styles.autocompleteWrapper} onMouseDown={e => e.stopPropagation()}>
      <Input
        ref={inputRef}
        id={instanceId.current}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${styles.autocompleteInput} ${className}`}
        disabled={disabled}
        autoComplete="off"
        onFocus={() => {
          // Re-initialize autocomplete on focus to ensure it's bound to this input
          if (window.google?.maps?.places) {
            setTimeout(() => {
              if (autocompleteRef.current && window.google.maps.event) {
                window.google.maps.event.clearInstanceListeners(autocompleteRef.current)
              }
              
              if (inputRef.current) {
                autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
                  types: ['address'],
                  componentRestrictions: { country: 'us' },
                  fields: ['address_components', 'formatted_address', 'geometry', 'place_id'],
                })
                
                autocompleteRef.current.addListener('place_changed', () => {
                  if (inputRef.current) {
                    const place = autocompleteRef.current?.getPlace()
                    
                    if (place && place.formatted_address) {
                      onChange(place.formatted_address)
                      handlePlaceSelected();
                      setIsSelectingPlace(false)
                    }
                  }
                })
              }
            }, 100)
          }
        }}
        onBlur={handleInputBlur}
      />
    </div>
  )
}
