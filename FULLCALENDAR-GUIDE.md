# FullCalendar Usage Guide

This guide explains how FullCalendar is used in your Hair Studio booking system.

## 📦 Installed Packages

Your project uses FullCalendar v6 with these packages:

- `@fullcalendar/core` - Core functionality
- `@fullcalendar/react` - React wrapper component
- `@fullcalendar/daygrid` - Month view plugin
- `@fullcalendar/timegrid` - Week/Day view plugin
- `@fullcalendar/interaction` - Click/drag interactions

## 🎨 CSS Import

FullCalendar CSS is automatically included in v6, but you can customize it in `globals.css`. Your current setup includes:

```css
/* FullCalendar Styles */
.fc {
	font-family: var(--font-plus-jakarta-sans), sans-serif;
}

.fc-daygrid-day.fc-day-today {
	background-color: rgba(251, 191, 36, 0.1) !important;
	border: 2px;
}

.fc-button-primary {
	background-color: #f59e0b !important;
	border-color: #d97706 !important;
}
```

If you need the base CSS explicitly, add to `globals.css`:

```css
@import '@fullcalendar/core/main.css';
@import '@fullcalendar/daygrid/main.css';
@import '@fullcalendar/timegrid/main.css';
```

## 🎯 Basic Setup

### 1. Import Required Modules

```typescript
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
```

### 2. Basic Calendar Component

```typescript
<FullCalendar
	plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
	initialView='dayGridMonth'
	headerToolbar={{
		left: 'prev,next today',
		center: 'title',
		right: 'dayGridMonth,timeGridWeek',
	}}
	height='auto'
	locale='en'
/>
```

## 🔧 Common Configurations

### View Options

```typescript
// Available views
initialView = 'dayGridMonth' // Month view (default)
initialView = 'timeGridWeek' // Week view with time slots
initialView = 'timeGridDay' // Single day view with time slots
```

### Header Toolbar Customization

```typescript
headerToolbar={{
  left: 'prev,next today',           // Navigation buttons
  center: 'title',                   // Current month/year
  right: 'dayGridMonth,timeGridWeek' // View switcher
}}

// Hide header completely
headerToolbar={false}
```

### Date Selection & Click Handling

```typescript
// Handle date clicks
dateClick={(arg) => {
  console.log('Clicked date:', arg.dateStr) // YYYY-MM-DD format
  console.log('Date object:', arg.date)
}}

// Handle date range selection
select={(selectInfo) => {
  console.log('Selected:', selectInfo.startStr, selectInfo.endStr)
}}
```

### Events Display

```typescript
// Simple events array
events={[
  {
    title: 'Booked',
    date: '2024-01-15',
    backgroundColor: '#ef4444'
  },
  {
    title: 'Available',
    date: '2024-01-16',
    backgroundColor: '#10b981'
  }
]}

// Background events (full day highlight)
events={[
  {
    title: 'Not available',
    date: '2024-01-15',
    backgroundColor: '#ef4444',
    display: 'background' // Shows as background color only
  }
]}
```

### Styling Days

```typescript
// Add custom CSS classes to day cells
dayCellClassNames={(arg) => {
  const classes: string[] = []

  // Past dates
  if (arg.date < new Date()) {
    classes.push('opacity-50', 'cursor-not-allowed')
  }

  // Specific dates
  if (arg.dateStr === '2024-01-15') {
    classes.push('bg-red-100')
  }

  return classes
}}
```

### Date Restrictions

```typescript
// Prevent selecting past dates
validRange={{
  start: new Date().toISOString().split('T')[0] // Today onwards
}}

// Specific date range
validRange={{
  start: '2024-01-01',
  end: '2024-12-31'
}}
```

## 📝 Your Current Implementation

### Public Calendar (`PublicCalendar.tsx`)

**Features:**

- Month and week views
- Click to select date
- Shows non-working days in red
- Disables past dates
- Background events for unavailable days

**Key Code:**

```typescript
<FullCalendar
	plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
	initialView='dayGridMonth'
	headerToolbar={{
		left: 'prev,next today',
		center: 'title',
		right: 'dayGridMonth,timeGridWeek',
	}}
	dateClick={handleDateClick}
	events={nonWorkingEvents}
	eventDisplay='background'
	dayCellClassNames={arg => {
		// Custom styling based on date status
	}}
	validRange={{
		start: new Date().toISOString().split('T')[0],
	}}
/>
```

### Admin Calendar (`AdminCalendar.tsx`)

**Features:**

- All public features plus:
- Click to toggle working/non-working days
- Modal to set custom working hours
- Color-coded working days (green) vs non-working (red)

**Key Code:**

```typescript
<FullCalendar
	plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
	initialView='dayGridMonth'
	headerToolbar={{
		left: 'prev,next today',
		center: 'title',
		right: 'dayGridMonth,timeGridWeek,timeGridDay',
	}}
	dateClick={handleDateClick}
	events={events}
	validRange={{
		start: new Date().toISOString().split('T')[0],
	}}
/>
```

## 🎨 Customization Examples

### Change First Day of Week

```typescript
firstDay={1} // Monday (0 = Sunday, 1 = Monday, etc.)
```

### Custom Event Rendering

```typescript
eventContent={(eventInfo) => {
  return (
    <div className="custom-event">
      <strong>{eventInfo.event.title}</strong>
      <p>{eventInfo.timeText}</p>
    </div>
  )
}}
```

### Custom Button Text

```typescript
buttonText={{
  today: 'Today',
  month: 'Month',
  week: 'Week',
  day: 'Day'
}}
```

### Locale/Language

```typescript
import nlLocale from '@fullcalendar/core/locales/nl'
;<FullCalendar
	locale={nlLocale}
	// ... other props
/>
```

### Height Options

```typescript
height="auto"        // Auto height based on content
height={600}         // Fixed height in pixels
height="100%"        // Full container height
```

## 🔗 Useful Props Reference

| Prop                | Type           | Description                                          |
| ------------------- | -------------- | ---------------------------------------------------- |
| `plugins`           | Array          | Required array of plugins                            |
| `initialView`       | String         | Starting view (`dayGridMonth`, `timeGridWeek`, etc.) |
| `headerToolbar`     | Object/Boolean | Header configuration or `false` to hide              |
| `dateClick`         | Function       | Callback when date is clicked                        |
| `events`            | Array          | Array of event objects                               |
| `height`            | String/Number  | Calendar height                                      |
| `locale`            | String/Object  | Language/locale                                      |
| `firstDay`          | Number         | First day of week (0-6)                              |
| `validRange`        | Object         | Date range restrictions                              |
| `dayCellClassNames` | Function       | Add CSS classes to day cells                         |
| `eventDisplay`      | String         | Event display mode (`auto`, `block`, `background`)   |

## 📚 Full Documentation

- **Official Docs:** https://fullcalendar.io/docs
- **React Integration:** https://fullcalendar.io/docs/react
- **Event API:** https://fullcalendar.io/docs/event-object
- **Date Click:** https://fullcalendar.io/docs/dateClick

## 💡 Tips

1. **Always use `'use client'`** - FullCalendar requires client-side rendering
2. **Import plugins separately** - Each view/feature needs its plugin
3. **Date format** - FullCalendar uses ISO date strings (`YYYY-MM-DD`)
4. **Event updates** - Update the `events` array to refresh the calendar
5. **Performance** - Use `useCallback` for event handlers to prevent re-renders
6. **CSS** - FullCalendar v6 includes CSS automatically, but you can override styles in `globals.css`

## 🚀 Quick Start Example

Here's a minimal working example:

```typescript
'use client'

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'

export default function MyCalendar() {
	return (
		<FullCalendar
			plugins={[dayGridPlugin, interactionPlugin]}
			initialView='dayGridMonth'
			dateClick={arg => {
				alert('Clicked: ' + arg.dateStr)
			}}
			events={[
				{ title: 'Event 1', date: '2024-01-15' },
				{ title: 'Event 2', date: '2024-01-16' },
			]}
		/>
	)
}
```

## 🐛 Common Issues

### Calendar not showing

- Check that `'use client'` is at the top of the file
- Verify all plugins are imported and added to `plugins` array

### Click events not working

- Ensure `interactionPlugin` is in the `plugins` array
- Check that `dateClick` handler is properly defined

### Styling not applied

- FullCalendar CSS is imported in `globals.css`
- Use `dayCellClassNames` for custom day styling
- Use Tailwind classes in event content renderers
