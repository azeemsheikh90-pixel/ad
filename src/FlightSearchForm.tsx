import React, { useState } from 'react';
import { DatePicker } from 'antd';
import 'antd/dist/antd.css';

const FlightSearchForm = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState(null);
  const [returnDate, setReturnDate] = useState(null);
  const [currency, setCurrency] = useState('USD');

  const handleSearch = () => {
    // Add search functionality here
    console.log({ origin, destination, departureDate, returnDate, currency });
  };

  return (
    <div>
      <h2>Search Flights</h2>
      <input 
        type="text" 
        placeholder="Origin" 
        value={origin} 
        onChange={(e) => setOrigin(e.target.value)}
      />
      <input 
        type="text" 
        placeholder="Destination" 
        value={destination} 
        onChange={(e) => setDestination(e.target.value)}
      />
      <DatePicker 
        style={{ margin: '10px 0' }} 
        onChange={(date) => setDepartureDate(date)} 
        placeholder="Departure Date"
      />
      <DatePicker 
        style={{ margin: '10px 0' }} 
        onChange={(date) => setReturnDate(date)} 
        placeholder="Return Date"
      />
      <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
        <option value="USD">USD</option>
        <option value="EUR">EUR</option>
        <option value="GBP">GBP</option>
        <option value="INR">INR</option>
      </select>
      <button onClick={handleSearch}>Search Flights</button>
    </div>
  );
};

export default FlightSearchForm;
