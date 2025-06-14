'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
}

export function DateRangePicker({ dateRange, onDateRangeChange }: DateRangePickerProps) {
  return (
    <div className="grid gap-2">
      <div className="text-sm font-medium mb-1">Click below to select a date range:</div>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal border-2 border-blue-300 hover:border-blue-500 p-4 h-auto",
              !dateRange && "text-gray-500"
            )}
          >
            <CalendarIcon className="mr-2 h-5 w-5 text-blue-500" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  <span className="font-medium">Selected Range: </span>
                  {format(dateRange.from, "LLL dd, y")} -{" "}
                  {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                <>
                  <span className="font-medium">Selected Date: </span>
                  {format(dateRange.from, "LLL dd, y")}
                </>
              )
            ) : (
              <span className="text-blue-500 font-medium">Click here to select date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={onDateRangeChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
