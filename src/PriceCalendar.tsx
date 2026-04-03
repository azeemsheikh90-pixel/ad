import React from 'react';
import './PriceCalendar.css';

const PriceCalendar = ({ prices }) => {
    const getColor = (price) => {
        if (price < 100) return 'green';
        if (price < 200) return 'yellow';
        return 'red';
    };

    const cheapestDay = Math.min(...prices.map(p => p.price));

    return (
        <div className='calendar'>
            {prices.map((priceInfo, index) => (
                <div key={index} className='day' style={{ backgroundColor: getColor(priceInfo.price) }}>
                    <span>{priceInfo.date}</span>
                    {priceInfo.price === cheapestDay && <span className='badge'>Cheapest Day!</span>}
                </div>
            ))}
        </div>
    );
};

export default PriceCalendar;
