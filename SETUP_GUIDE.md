# Aviasales Flight API - UX/UI Setup Guide

Complete step-by-step guide to integrate the Aviasales Data API with the provided React components.

---

## 📋 Prerequisites

- React 16.8+ (hooks support)
- TypeScript 4.0+
- Node.js 14+
- Aviasales API token from [Travelpayouts](https://travelpayouts.com)

---

## 🚀 Installation

### 1. Install Dependencies

```bash
npm install axios
# or
yarn add axios
```

### 2. Set Up Environment Variables

Create a `.env.local` file in your project root:

```env
REACT_APP_AVIASALES_TOKEN=your_api_token_here
REACT_APP_AVIASALES_BASE_URL=https://api.travelpayouts.com
```

**Do NOT commit `.env.local` to version control.**

### 3. Load City/Airport Reference Data

The API uses IATA codes. Create `data/cities.json` with reference data from Aviasales:

```bash
# Download from Aviasales
curl https://api.travelpayouts.com/data/cities.json > src/data/cities.json
curl https://api.travelpayouts.com/data/airlines.json > src/data/airlines.json
```

Or manually fetch and cache these at app startup:

```typescript
// App.tsx
import { useEffect, useState } from 'react';

export function App() {
  const [citiesData, setCitiesData] = useState([]);

  useEffect(() => {
    async function loadReferenceData() {
      const citiesRes = await fetch('https://api.travelpayouts.com/data/cities.json');
      const cities = await citiesRes.json();
      setCitiesData(cities);
      // Cache in localStorage or state management
    }
    loadReferenceData();
  }, []);

  return <>{/* components */}</>;
}
```

---

## 🎯 Component Usage

### Basic Search Flow

```typescript
// App.tsx
import { useState } from 'react';
import FlightSearchForm from './FlightSearchForm';
import SearchResults from './SearchResults';
import { SearchFormState, SearchResultsState } from './types';
import apiClient from './api-client';

export function App() {
  const [results, setResults] = useState<SearchResultsState>({
    tickets: [],
    loading: false,
    error: null,
    hasResults: false,
    resultCount: 0,
  });

  const [airlinesMap, setAirlinesMap] = useState<Record<string, string>>({});

  const handleSearch = async (formState: SearchFormState) => {
    setResults(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Fetch using Tier 2 for flexible results
      const response = await apiClient.getPricesForDates(
        formState.origin,
        formState.destination,
        formState.departDate,
        formState.oneWay ? undefined : formState.returnDate,
        formState.currency
      );

      if (!response.success) {
        setResults(prev => ({
          ...prev,
          loading: false,
          error: response.error || 'Failed to fetch flights',
        }));
        return;
      }

      const tickets = response.data as any[];
      setResults({
        tickets,
        loading: false,
        error: null,
        hasResults: tickets.length > 0,
        resultCount: tickets.length,
      });
    } catch (error) {
      setResults(prev => ({
        ...prev,
        loading: false,
        error: 'Network error. Please try again.',
      }));
    }
  };

  return (
    <div>
      <FlightSearchForm onSearch={handleSearch} loading={results.loading} />
      <SearchResults
        tickets={results.tickets}
        currency="usd"
        loading={results.loading}
        error={results.error}
        airlinesMap={airlinesMap}
        sortBy="price"
      />
    </div>
  );
}
```

### Using the Price Calendar

```typescript
import PriceCalendar from './PriceCalendar';
import { useState } from 'react';

export function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const handleDateSelect = async (date: string) => {
    setSelectedDate(date);
    // Fetch prices for selected date
  };

  return (
    <PriceCalendar
      prices={calendarPrices}
      month="2025-07"
      currency="usd"
      onDateSelect={handleDateSelect}
      loading={false}
    />
  );
}
```

---

## 🔌 API Client Usage

### Fetch Cheapest Prices (Tier 1 - Simple Widget)

```typescript
const response = await apiClient.getCheapPrices(
  'LON',
  'BCN',
  '2025-07',
  '2025-08',
  'usd'
);

if (response.success) {
  console.log(response.data); // { onestop: {...}, twostop: {...} }
  console.log(response.currency); // "usd"
}
```

### Fetch Calendar Prices

```typescript
const response = await apiClient.getCalendarPrices('LON', 'BCN', '2025-07', 'usd');

if (response.success) {
  // prices: [
  //   { price: 120, day: "2025-07-01", number_of_changes: 0 },
  //   { price: 150, day: "2025-07-02", number_of_changes: 1 },
  // ]
}
```

### Search by Budget (Tier 2 - Price Range)

```typescript
const response = await apiClient.searchByPriceRange(
  'LON',
  'BCN',
  priceMax = 500,
  priceMin = 50,
  oneWay = false,
  direct = false,
  'usd'
);

if (response.success) {
  const filtered = apiClient.filterAffiliateTickets(response.data);
  const sorted = apiClient.sortByPrice(filtered);
  console.log(sorted);
}
```

### Fetch Latest Prices (Live Deal Feed)

```typescript
const response = await apiClient.getLatestPrices(
  origin = 'LON',
  destination = 'BCN',
  'usd',
  page = 1,
  limit = 30
);
```

---

## 🎨 Styling

### Tailwind CSS Setup

Import `aviasales-styles.css` in your main app:

```typescript
// App.tsx or main.tsx
import './aviasales-styles.css';
```

The CSS includes:
- Price tier colors (green/amber/red for calendars)
- Skeleton shimmer animation
- Button and form input utilities
- Accessibility focus states

### Customization

Override Tailwind classes in your own CSS:

```css
/* Custom branding */
.btn-primary {
  @apply bg-purple-600 hover:bg-purple-700;
}

.price-tier-green {
  @apply bg-emerald-300;
}
```

---

## 🔐 Security Best Practices

1. **Never expose API token in client code**
   - Store token in backend `.env`
   - Proxy API calls through your server
   - Use CORS proxy if needed

```typescript
// Server-side (Node.js/Express example)
app.get('/api/flights', async (req, res) => {
  const response = await fetch('https://api.travelpayouts.com/v1/prices/cheap', {
    params: {
      ...req.query,
      token: process.env.AVIASALES_TOKEN,
    },
  });
  res.json(response);
});
```

2. **Validate all user inputs before API calls**
   - IATA codes must be 2-3 chars, alphanumeric
   - Dates must be valid and not in past
   - Currency must be ISO 4217 code

3. **Rate limiting**
   - Cache API responses (minimum 1 hour)
   - Implement exponential backoff on 429 errors
   - Don't retry failed requests more than 3 times

---

## 🧪 Testing

### Mock API Responses

```typescript
// __mocks__/api-client.ts
const mockTickets = [
  {
    price: 120,
    origin: 'LON',
    destination: 'BCN',
    depart_date: '2025-07-15',
    airline: 'BA',
    number_of_changes: 0,
    departure_at: '2025-07-15T08:00:00Z',
    ticket_link: 'test-link',
    actual: true,
    show_to_affiliates: true,
    found_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default {
  getPricesForDates: jest.fn().mockResolvedValue({
    success: true,
    data: mockTickets,
    currency: 'usd',
  }),
};
```

### Component Test Example

```typescript
// SearchResults.test.tsx
import { render, screen } from '@testing-library/react';
import SearchResults from './SearchResults';

test('displays price cards', () => {
  const tickets = [/* mock data */];
  render(
    <SearchResults
      tickets={tickets}
      currency="usd"
      loading={false}
      error={null}
      airlinesMap={{ BA: 'British Airways' }}
    />
  );
  expect(screen.getByText('British Airways')).toBeInTheDocument();
});
```

---

## 📊 Performance Optimization

### Caching Strategy

```typescript
// cache-service.ts
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

class CacheService {
  private cache = new Map<string, { data: any; timestamp: number }>();

  set(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() - item.timestamp > CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }
}

export const cacheService = new CacheService();
```

### Memoization

```typescript
// In components, use React.memo to prevent unnecessary re-renders
const PriceCard = React.memo(({ ticket, currency }: Props) => {
  return <>{/* card content */}</>;
});
```

---

## 🐛 Debugging

### Enable Logging

```typescript
// api-client.ts - add debug logs
private handleError(error: any): ApiResponse<any> {
  console.error('🔴 Aviasales API Error:', {
    status: error.response?.status,
    message: error.message,
    timestamp: new Date().toISOString(),
  });
  // ...
}
```

### Monitor API Usage

```typescript
// Track API calls for analytics
const trackApiCall = (endpoint: string, params: any, status: number) => {
  console.log(`📡 ${endpoint}`, { params, status });
};
```

---

## 📚 Reference Links

- **API Docs**: https://support.travelpayouts.com/hc/en-us/articles/203956163
- **Playground**: https://api.travelpayouts.com/graphql/v1/playground
- **Rate Limits**: Check docs for tier limits
- **Data Files**: https://api.travelpayouts.com/data/

---

## ❓ FAQ

**Q: Why are my prices different from Aviasales?**
A: API prices are cached (7-day window). Always link users to Aviasales to verify before booking.

**Q: How often should I refresh prices?**
A: Don't refresh faster than every 4 hours. Cache for at least 1 hour to respect rate limits.

**Q: Can I use this on mobile?**
A: Yes! All components are responsive. Test on 375px (iPhone) and 768px (tablet) widths.

**Q: What's the rate limit?**
A: Varies by tier. Check `/v1/` endpoints have higher limits than `/v3/`. Implement exponential backoff.

---

## 🤝 Support

For API issues: https://support.travelpayouts.com
For component bugs: Create an issue in your repository