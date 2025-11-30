import { useState, useEffect } from 'react';
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
} from 'lucide-react';

import { formatDateSimple } from '../etc/helpers';

const CustomDatePicker = ({ value, onChange, error, id }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : new Date());
  const getInitialHour = () => {
    if (value) return new Date(value).getHours();
    const now = new Date();
    return now.getHours() + 1;
  };
  const [selectedHour, setSelectedHour] = useState(getInitialHour());

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setViewDate(d);
        setSelectedHour(d.getHours());
      }
    }
  }, [value]);

  const displayValue = value ? formatDateSimple(new Date(value)) : '';

  const handleConfirm = () => {
    const selected = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      selectedHour,
      0,
      0
    );

    const offsetDate = new Date(
      selected.getTime() - selected.getTimezoneOffset() * 60000
    );
    onChange(offsetDate.toISOString().slice(0, 16));
    setIsOpen(false);
  };

  const handleDateClick = (day) => {
    const newDate = new Date(viewDate);
    newDate.setDate(day);
    newDate.setHours(selectedHour);
    setViewDate(newDate);
    setSelectedDate(newDate);

    const now = new Date();
    const maxTime = new Date();
    maxTime.setFullYear(now.getFullYear() + 10);

    if (newDate <= now) {
      setSelectedHour(now.getHours() + 1);
    } else if (newDate >= maxTime) {
      setSelectedHour(now.getHours());
    }
  };

  const changeMonth = (delta) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setViewDate(newDate);
  };

  const renderCalendar = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).getTime();
    const maxTime = new Date(
      now.getFullYear() + 10,
      now.getMonth(),
      now.getDate()
    ).getTime();

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-9"></div>);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const dTime = d.getTime();
      const isPast = dTime < todayStart;
      const isOverMaxTime = dTime > maxTime;
      const isSelected = selectedDate.getDate() === i && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
      const isToday = now.toDateString() === d.toDateString();

      days.push(
        <button
          key={i}
          onClick={(e) => {
            e.stopPropagation();
            if (!isPast && !isOverMaxTime) handleDateClick(i);
          }}
          disabled={isPast || isOverMaxTime}
          className={`h-9 w-9 rounded-lg flex items-center justify-center text-sm transition-all
            ${isSelected ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-900/50' : ''}
            ${isToday && !isSelected ? 'border border-blue-500 text-blue-400' : ''}
            ${isPast || isOverMaxTime ? 'text-slate-700 cursor-not-allowed' : 'hover:bg-slate-800 text-slate-300'}
          `}
        >
          {i}
        </button>
      );
    }
    return days;
  };

  const renderTimeSlots = () => {
    const slots = [];
    const now = new Date();
    const maxTime = new Date();
    maxTime.setFullYear(now.getFullYear() + 10);

    const isToday = viewDate.toDateString() === now.toDateString();
    const isMaxDate = viewDate.toDateString() === maxTime.toDateString();
    const currentHour = now.getHours();

    const viewDateOnly = new Date(viewDate);
    const nowOnly = new Date(now);
    const maxTimeOnly = new Date(maxTime);
    viewDateOnly.setHours(0, 0, 0, 0);
    nowOnly.setHours(0, 0, 0, 0);
    maxTimeOnly.setHours(0, 0, 0, 0);

    if (nowOnly.getTime() > viewDateOnly.getTime() || viewDateOnly.getTime() > maxTimeOnly.getTime()) {
      return null;
    }

    for (let i = 0; i < 24; i++) {
      const isSelected = selectedHour === i;
      const isPastHour = isToday && i <= currentHour;
      const isOverMaxTime = isMaxDate && i > currentHour;
      if (isPastHour || isOverMaxTime) continue;

      slots.push(
        <button
          key={i}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedDate(viewDate);
            setSelectedHour(i);
          }}
          className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium border transition-all
            ${
              isSelected
                ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-900/50'
                : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
            }
          `}
        >
          {String(i).padStart(2, '0')}:00
        </button>
      );
    }
    return slots;
  };

  return (
    <>
      <div
        id={id}
        onClick={() => setIsOpen(true)}
        className={`w-full bg-[#1e293b] border ${
          error
            ? 'border-rose-500'
            : 'border-slate-700/50 hover:border-blue-500'
        } rounded-xl p-3.5 text-white text-sm cursor-pointer flex justify-between items-center transition-all group`}
      >
        <span
          className={displayValue ? 'text-white font-medium' : 'text-slate-600'}
        >
          {displayValue || '날짜와 시간을 선택하세요'}
        </span>
        <div className="flex items-center gap-2">
          {displayValue && (
            <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">
              변경
            </span>
          )}
          <CalendarIcon className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-[#1e293b] w-full max-w-sm rounded-2xl border border-slate-700 shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 flex items-center justify-between border-b border-slate-700/50 bg-slate-900/50">
              <button
                onClick={() => changeMonth(-1)}
                className="p-1 hover:bg-slate-700 rounded"
              >
                <ChevronLeft className="w-5 h-5 text-slate-400" />
              </button>
              <span className="text-white font-bold text-lg">
                {viewDate.getFullYear()}.{' '}
                {String(viewDate.getMonth() + 1).padStart(2, '0')}
              </span>
              <button
                onClick={() => changeMonth(1)}
                className="p-1 hover:bg-slate-700 rounded"
              >
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="overflow-y-auto custom-scrollbar">
              <div className="p-4 border-b border-slate-700/30">
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {['일', '월', '화', '수', '목', '금', '토'].map((d) => (
                    <span
                      key={d}
                      className="text-[10px] text-slate-500 font-bold uppercase"
                    >
                      {d}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1 place-items-center">
                  {renderCalendar()}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-bold text-white">시간 선택</span>
                </div>
                <div className="flex flex-wrap gap-2 justify-start max-h-32 overflow-y-auto custom-scrollbar pr-1">
                  {renderTimeSlots()}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-700/50 flex justify-between items-center bg-slate-900/30">
              <div className="text-xs text-slate-400">
                {selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일{' '}
                {selectedHour}시
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-5 py-2 text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg transition-colors"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomDatePicker;
