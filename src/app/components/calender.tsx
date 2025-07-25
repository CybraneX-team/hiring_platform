import React, { useState } from "react";

const CalendarSec = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 2, 1)); // March 2025
  const [selectedDate, setSelectedDate] = useState(12);
  const [events, setEvents] = useState({
    21: [{ time: "4:30 pm", title: "Interview at Riverleaf" }],
  });

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-20"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = day === selectedDate;
      const hasEvent = events[day];
      const isSunday = (firstDay + day - 1) % 7 === 0;

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(day)}
          className={`
            h-20 flex items-center justify-center text-base font-semibold cursor-pointer relative rounded-xl text-black
            ${isSunday ? "bg-rose-100" : "bg-gray-50 hover:bg-gray-100"}
            ${isSelected ? "border-2 border-blue-400 bg-white" : ""}
            transition-colors duration-150
          `}
        >
          {day}
          {hasEvent && (
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
              <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
              <div className="w-1 h-1 bg-blue-500 rounded-full mt-0.5"></div>
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const selectedDateEvents = events[selectedDate] || [];

  return (
    <div className="bg-white w-full shadow-lg rounded-lg overflow-hidden ">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white border-b">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-black"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <div className="flex items-center space-x-6">
          <span className="text-2xl font-semibold text-black">
            {selectedDate}
          </span>
          <span className="text-2xl font-semibold text-black">
            {months[currentDate.getMonth()]}
          </span>
          <span className="text-2xl font-semibold text-black">
            {currentDate.getFullYear()}
          </span>
        </div>

        <button
          onClick={() => navigateMonth(1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-black"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 bg-gray-50">
        {daysOfWeek.map((day, index) => (
          <div
            key={day}
            className={`
              p-4 text-sm font-semibold text-center
              ${index === 0 ? "bg-rose-100 text-rose-800" : "text-gray-600"}
            `}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-3 p-4 border-b">
        {renderCalendarDays()}
      </div>

      {/* Selected day events */}
      <div className="p-6">
        <div className="text-lg font-semibold text-gray-800 mb-4">Day</div>
        {selectedDateEvents.length > 0 ? (
          <div className="space-y-3">
            {selectedDateEvents.map((event, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-base font-semibold text-gray-900">
                  {event.time}
                </span>
                <span className="text-base text-gray-700">{event.title}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-base text-gray-500 p-3">No events scheduled</div>
        )}
      </div>
    </div>
  );
};

export default CalendarSec;
