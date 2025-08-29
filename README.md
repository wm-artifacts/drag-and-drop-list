# Drag and Drop List

A draggable and droppable list component for React Native applications in WaveMaker. This component allows users to display a list that can be moved around the screen, with support for grouping items and handling tap events.

## Features

- Draggable list that can be positioned anywhere on the screen
- Support for grouping items
- Tap events for list items
- Customizable title and styling
- Drop event for detecting when the list is released

## Usage

```jsx
import DragAndDropList from 'draganddroplist';

// Sample data
const listData = [
  { id: 1, title: 'Task 1', subtitle: 'High priority', category: 'Tasks' },
  { id: 2, title: 'Task 2', subtitle: 'Medium priority', category: 'Tasks' },
  { id: 3, title: 'Meeting 1', subtitle: '10:00 AM', category: 'Meetings' },
  { id: 4, title: 'Meeting 2', subtitle: '2:00 PM', category: 'Meetings' }
];

// Basic usage
<DragAndDropList 
  data={listData} 
  title="My Draggable List"
/>

// With grouping
<DragAndDropList 
  data={listData} 
  title="Grouped List"
  groupBy="category"
/>

// With events
<DragAndDropList 
  data={listData} 
  title="Interactive List"
  onTap={(item, index) => console.log('Tapped item:', item)}
  onDrop={(position) => console.log('List dropped at:', position)}
/>
```

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| data | Array | Yes | Array of items to display in the list. Each item should have title and subtitle properties. |
| title | String | No | Optional title to display at the top of the list. |
| groupBy | String or Function | No | Property name or function to group items by. |
| style | Object | No | Custom style for the list container. |

## Events

| Event | Parameters | Description |
|-------|------------|-------------|
| onTap | (item, index) | Triggered when a list item is tapped. |
| onDrop | ({x, y}) | Triggered when the list is dropped, with the final position coordinates. |

## Requirements

- React Native project in WaveMaker
- No additional dependencies required