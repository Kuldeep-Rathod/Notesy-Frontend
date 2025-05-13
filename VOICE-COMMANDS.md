# Voice Command System in Notesy

This document explains how the voice command system is implemented in Notesy, including both global navigation commands and page-specific commands.

## Architecture Overview

The voice command system has two main components:

1. **Global Voice Router**: Handles app-wide navigation and wake word detection
2. **Page-specific Voice Commands**: Allows individual pages to define their own commands

## Global Navigation Commands

The global voice navigation system is implemented in `src/components/VoiceRouter.tsx`. It's loaded at the application root level and is always active.

### How it works:

1. When the app loads, a user gesture (click or key press) is required to activate the voice recognition system
2. After activation, the user can say one of the wake words like "Hey Notsy" or "Hey Assistant"
3. Once the assistant is activated, global navigation commands like "Go to dashboard" or "Navigate to profile" can be used

### Global Commands:

- **Wake words**: "Hey Notsy", "Hey Assistant", "Hey Note", "Hey App"
- **Navigation**: "Go to [page]", "Navigate to [page]", "Open [page]"
  - Valid pages: dashboard, archive, bin, profile
- **Deactivation**: "Never mind"

## Page-Specific Commands

Page-specific commands are implemented using the custom hook `usePageVoiceCommands` defined in `src/hooks/usePageVoiceCommands.tsx`.

### How to add page-specific commands:

1. Import the hook in your page component:
   ```tsx
   import usePageVoiceCommands from '@/hooks/usePageVoiceCommands';
   ```

2. Define your page commands and use the hook:
   ```tsx
   const { isActive } = usePageVoiceCommands(
     {
       '/your-page-path': [
         {
           command: ['command phrase', 'alternative phrase'],
           callback: () => {
             // Action to take when command is recognized
           },
           isFuzzyMatch: true, // Optional: Enable fuzzy matching
           fuzzyMatchingThreshold: 0.7, // Optional: Set matching threshold
         },
         // Additional commands...
       ],
     },
     { debug: true, requireWakeWord: true }
   );
   ```

3. Optionally display a UI element to indicate when commands are active:
   ```tsx
   {isActive && (
     <div>Page voice commands active</div>
   )}
   ```

### Example: Dashboard Page Commands

The dashboard page has the following voice commands:

- "Create note" / "New note" / "Add note"
- "Search [query]" / "Find [query]" / "Look for [query]"
- "Clear search" / "Reset search"
- "Grid view" / "Switch to grid" / "Show grid"
- "List view" / "Switch to list" / "Show list"

### Example: Profile Page Commands

The profile page has the following voice commands:

- "Show profile" / "View profile" / "Go to profile section"
- "Show preferences" / "View preferences" / "Go to preferences"
- "Show statistics" / "View stats" / "Show activity" / "Show insights"
- "Tell me about my notes" / "How many notes do I have"
- "Update profile picture" / "Change my photo"

## How Commands Are Activated

1. Global commands are always listening once the initial user gesture is provided
2. Page commands only activate:
   - When the user is on the specific page
   - After the global wake word has been detected (if `requireWakeWord: true`)

## Communication Between Systems

The two systems communicate through a custom event:

1. The `VoiceRouter` emits a `voiceAssistantStateChange` event when the assistant is activated/deactivated
2. The `usePageVoiceCommands` hook listens for this event to know when to activate page-specific commands

## Adding New Voice Commands

To add new voice commands:

1. **For global navigation**: Add new routes to the `validRoutes` array in `VoiceRouter.tsx`
2. **For page-specific commands**: 
   - Import the `usePageVoiceCommands` hook in your page component
   - Define your commands as shown above
   - Make sure your UI components can be controlled by these commands

## Debugging Voice Commands

A debugging page is available at `/voice-test` to test basic speech recognition.

You can also enable debug mode in the hook options:
```tsx
usePageVoiceCommands(commands, { debug: true });
```

This will log detailed information about command recognition in the browser console.

## Best Practices

1. Keep commands short and distinctive
2. Provide alternative phrasings for each command
3. Use fuzzy matching with an appropriate threshold (0.6-0.8 works well)
4. Always provide visual feedback when a voice command is executed
5. Ensure commands are intuitive and relate to visible UI elements 