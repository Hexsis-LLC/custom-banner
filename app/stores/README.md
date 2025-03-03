# Zustand Stores

This directory contains Zustand stores that manage application state. Zustand provides a lightweight and flexible state management solution with minimal boilerplate.

## Stores Overview

### Banner List Store (`bannerListStore.ts`)

Manages the state for the banner/announcement list view, including:
- Current page and pagination
- Selected tab and filtering
- Sorting and searching
- Loading states
- Bulk actions

### Announcement Form Store (`announcementFormStore.ts`)

Manages the state for the announcement creation/editing form, including:
- Form data for all sections (basic, text, CTA, background, etc.)
- Validation state and error handling
- Form section updates

## Using the Stores

### Option 1: Direct Store Access

Import the store hook and use it directly with selectors:

```tsx
import { useBannerListStore } from '../stores/bannerListStore';

function MyComponent() {
  // Select only what you need from the store
  const currentPage = useBannerListStore(state => state.currentPage);
  const setPage = useBannerListStore(state => state.setPage);
  
  return (
    <button onClick={() => setPage(currentPage + 1)}>
      Next Page
    </button>
  );
}
```

### Option 2: Custom Hooks (Recommended)

Use the provided custom hooks for a more ergonomic API:

```tsx
import { useAnnouncementForm } from '../hooks/useAnnouncementForm';

function MyFormComponent() {
  const { 
    basicSection, 
    updateBasic, 
    hasError, 
    getFieldErrorMessage 
  } = useAnnouncementForm();
  
  return (
    <TextField
      label="Campaign Title"
      value={basicSection.campaignTitle}
      onChange={(value) => updateBasic({ campaignTitle: value })}
      error={hasError('basic.campaignTitle')}
      helpText={hasError('basic.campaignTitle') ? 
        getFieldErrorMessage('basic.campaignTitle') : undefined}
    />
  );
}
```

### Option 3: Legacy Context API (for Backward Compatibility)

For existing components, you can continue using the Context API which now uses Zustand internally:

```tsx
import { useFormContext } from '../contexts/AnnouncementFormContext';

function LegacyComponent() {
  const { formData, handleFormChange } = useFormContext();
  
  return (
    <TextField
      label="Campaign Title"
      value={formData.basic.campaignTitle}
      onChange={(value) => handleFormChange('basic', { campaignTitle: value })}
    />
  );
}
```

## Store Initialization

### Banner List Store

The Banner List Store initializes with default values and doesn't require explicit initialization.

### Announcement Form Store

Initialize the Announcement Form Store with initial data:

```tsx
import { initializeFormStore } from '../stores/announcementFormStore';

// In your component or route
useEffect(() => {
  initializeFormStore(initialData);
}, [initialData]);
```

## Benefits of Using Zustand

1. **Performance**: Only re-renders components when their selected state changes
2. **Simplicity**: No Provider wrappers needed
3. **Devtools**: Integrates with Redux DevTools for debugging
4. **Typescript**: Full type safety and auto-completion
5. **Immutability**: Ensures state updates are handled correctly

## Migration Path

1. Start by using the compatibility layer (`AnnouncementFormContext.tsx`)
2. For new components, use the custom hooks directly
3. Gradually refactor existing components to use the custom hooks
4. Eventually, you can remove the compatibility layer entirely 