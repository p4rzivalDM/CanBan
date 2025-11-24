"use client";

import * as React from "react";
import { CalendarIcon, X } from "lucide-react"

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";

export const DateTime = ({ id, value, onChange = (e) => { } }) => {
    const [completeDate, setCompleteDate] = React.useState<Date | undefined>(
        value ? new Date(value) : undefined
    );
    const [isOpen, setIsOpen] = React.useState(false);
    React.useEffect(() => {
        if (value) {
            const newDate = new Date(value);
            if (!isNaN(newDate.getTime())) {
                setCompleteDate(newDate);
            }
        }
    }, [value]);
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const handleDateSelect = (selectedDate: Date | undefined) => {
        if (selectedDate) {
            const newDate = completeDate ? new Date(completeDate) : new Date(selectedDate);
            newDate.setFullYear(selectedDate.getFullYear());
            newDate.setMonth(selectedDate.getMonth());
            newDate.setDate(selectedDate.getDate());

            setCompleteDate(newDate);

            onChange({
                target: {
                    id: id,
                    value: newDate.toISOString()
                }
            });
        }
    };
    const handleTimeChange = (type: "hour" | "minute", value: string) => {
        const newDate = completeDate ? new Date(completeDate) : new Date();

        if (type === "hour") {
            newDate.setHours(parseInt(value));
        } else if (type === "minute") {
            newDate.setMinutes(parseInt(value));
        }

        setCompleteDate(newDate);

        onChange({
            target: {
                id: id,
                value: newDate.toISOString()
            }
        });
    };

    return (
        <>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <div className="relative flex items-center">
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                "w-full justify-start text-left font-normal",
                                !completeDate && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {completeDate ? (
                                format(completeDate, "dd/MM/yyyy HH:mm")
                            ) : (
                                <span>25/12/1985 12:15</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <X
                        className="w-4 h-4 mt-0.5 justify-end text-gray-400 hover:text-red-500 transition-colors absolute top-2 right-2 cursor-pointer"
                        onClick={() => {
                            setCompleteDate(undefined);
                            onChange({
                                target: {
                                    id: id,
                                    value: undefined
                                }
                            });
                        }}
                    />
                </div>
                <PopoverContent className="w-auto p-0">
                    <div className="sm:flex">
                        <Calendar
                            mode="single"
                            selected={completeDate}
                            onSelect={handleDateSelect}
                        />
                        <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
                            <div className="w-64 sm:w-auto overflow-x-auto sm:overflow-y-auto">
                                <div className="flex sm:flex-col p-2">
                                    {hours.map((hour) => (
                                        <Button
                                            key={hour}
                                            size="icon"
                                            variant={completeDate && completeDate.getHours() === hour ? "default" : "ghost"}
                                            className="sm:w-full shrink-0 aspect-square"
                                            onClick={() => handleTimeChange("hour", hour.toString())}
                                        >
                                            {hour}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                            <div className="w-64 sm:w-auto overflow-x-auto sm:overflow-y-auto">
                                <div className="flex sm:flex-col p-2">
                                    {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                                        <Button
                                            key={minute}
                                            size="icon"
                                            variant={completeDate && completeDate.getMinutes() === minute ? "default" : "ghost"}
                                            className="sm:w-full shrink-0 aspect-square"
                                            onClick={() => handleTimeChange("minute", minute.toString())}
                                        >
                                            {minute.toString().padStart(2, '0')}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </>
    );
}