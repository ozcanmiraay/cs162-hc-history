import React, { useState, useRef, useEffect } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
  displayLimit?: number;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options",
  className,
  displayLimit = 2,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Get labels for selected values
  const selectedLabels = options
    .filter((option) => selected.includes(option.value))
    .map((option) => option.label);

  // Handle selecting/deselecting an item
  const handleSelect = (value: string) => {
    const isSelected = selected.includes(value);
    
    if (isSelected) {
      onChange(selected.filter((item) => item !== value));
    } else {
      onChange([...selected, value]);
    }

    // Client-side only scrolling effect
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
        }
      }, 10);
    }
  };

  // Remove a selected item
  const handleRemove = (value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter((item) => item !== value));
  };

  // Clear all selected items
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  // Ensure focus is maintained correctly - client-side only
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  // Fixed badge limit to ensure consistent rendering
  const showAsBadges = selectedLabels.length <= 1;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between relative", className)}
        >
          <div className="flex items-center justify-start w-full overflow-hidden">
            {selectedLabels.length === 0 && (
              <span className="text-muted-foreground truncate">{placeholder}</span>
            )}
            
            {selectedLabels.length > 0 && (
              <>
                {showAsBadges ? (
                  <div className="flex flex-wrap gap-1 max-w-[calc(100%-24px)]">
                    {selectedLabels.map((label, i) => (
                      <Badge key={i} variant="secondary" className="px-1 py-0 h-6">
                        {label}
                        <span
                          className="ml-1 text-muted-foreground rounded-full outline-none cursor-pointer"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onClick={(e) => {
                            const value = options.find((option) => option.label === label)?.value || "";
                            handleRemove(value, e);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </span>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="px-2 py-0 h-6">
                      {selectedLabels.length} selected
                    </Badge>
                    <div 
                      ref={scrollContainerRef}
                      className="flex flex-nowrap gap-1 overflow-x-auto max-w-[calc(100%-120px)] no-scrollbar"
                    >
                      {selectedLabels.map((label, i) => (
                        <Badge 
                          key={i} 
                          variant="outline" 
                          className="px-1 py-0 h-6 whitespace-nowrap flex-shrink-0 text-xs border-dashed"
                        >
                          {label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 absolute right-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command className="max-h-[300px]">
          <CommandInput placeholder="Search options..." ref={inputRef} />
          <CommandEmpty>No options found.</CommandEmpty>
          <CommandGroup className="overflow-auto max-h-[210px]">
            {options.map((option) => {
              const isSelected = selected.includes(option.value);
              return (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelect(option.value)}
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      isSelected ? "bg-primary text-primary-foreground" : "opacity-50"
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                  </div>
                  <span>{option.label}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
          {selected.length > 0 && (
            <div className="flex items-center justify-between p-2 border-t">
              <span className="text-sm text-muted-foreground">
                {selected.length} selected
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-8 px-2 text-xs"
              >
                Clear
              </Button>
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Styles with safer class name
export const MultiSelectStyles = `
  /* Hide scrollbar for Chrome, Safari and Opera */
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  
  /* Hide scrollbar for IE, Edge and Firefox */
  .no-scrollbar {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
`; 
export const MultiSelectStyleInjector = () => {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: MultiSelectStyles,
      }}
    />
  );
};
