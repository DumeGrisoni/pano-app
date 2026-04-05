import 'react-datepicker/dist/react-datepicker.css';
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';

// CSS Modules, react-datepicker-cssmodules.css
// import 'react-datepicker/dist/react-datepicker-cssmodules.css';

const DatePickerItem = () => {
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  return (
    <DatePicker
      selected={startDate}
      onChange={(date: Date | null) => setStartDate(date)}
    />
  );
};

export default DatePickerItem;
