'use client';
import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CalendarIcon from '../Icon/CalendarIcon';

interface DateProps {
  fontStyle?: string;
  onDateChange?: (date: Date | null) => void;
  defaultDate?: string | null;
}

export default function DateInput({
  fontStyle,
  onDateChange,
  defaultDate = null,
}: DateProps) {
  /** DatePicker selected용 - Date 타입 */
  const [date, setDate] = useState<Date | null>(
    defaultDate ? new Date(defaultDate) : null,
  );

  const handleDate = (date: Date | null) => {
    setDate(date);
    onDateChange?.(date);
  };

  return (
    <div className="flex flex-col text-gray-700">
      <label className={fontStyle}>마감일</label>
      <div className="w-full h-[48px] border border-gray-300 px-4 rounded-md flex items-center gap-2 bg-white focus-within:border-brand-violet transition-colors">
        <CalendarIcon
          className={`w-5 shrink-0 pb-[2px] ${date ? 'text-gray-700' : 'text-gray-400'}`}
        />
        <DatePicker
          selected={date}
          onChange={handleDate}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          dateFormat="yyyy-MM-dd HH:mm"
          placeholderText="날짜를 입력해 주세요"
          wrapperClassName="w-full"
          className="w-full outline-none text-gray-700 bg-transparent text-lg-regular placeholder:text-gray-400 leading-none"
        />
      </div>
    </div>
  );
}
