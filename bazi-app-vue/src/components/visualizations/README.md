# Visual Component Library

This directory contains reusable visualization components for the Peixuan astrology platform.

## Architecture

The library follows a **Hybrid Approach** (Option C from visual_plan_review.md):
- **Shared Constants**: Common color palettes and types in `constants.ts`
- **Alternative Visualizations**: Multiple chart types (bar, radar) for the same data
- **Modular Design**: Each visualization is a standalone component

## Components

### WuXingRadar.vue

A radar (pentagon) chart for visualizing Five Elements (WuXing) distribution.

**Features:**
- Native SVG implementation (no external dependencies)
- Responsive design with mobile optimization
- Supports both raw and adjusted scores
- Optional score labels
- Accessible with ARIA labels
- Smooth animations with `prefers-reduced-motion` support

**Props:**
```typescript
interface Props {
  distribution: WuXingDistribution;  // Required: element scores
  showRaw?: boolean;                 // Default: true
  showScoreLabels?: boolean;         // Default: false
  size?: number;                     // Default: 300
}
```

**Usage:**
```vue
<WuXingRadar
  :distribution="wuxingData"
  :show-raw="true"
  :show-score-labels="false"
/>
```

## Shared Resources

### constants.ts

**Exports:**
- `ELEMENT_COLORS`: Color palette for the five elements
- `ELEMENT_NAMES`: Array of element names in order
- `ElementName`: TypeScript type for element names
- `WuXingDistribution`: Interface for element distribution data

**Color Scheme:**
```typescript
{
  木: '#10b981',  // Green (Emerald-500)
  火: '#ef4444',  // Red (Red-500)
  土: '#f59e0b',  // Amber (Amber-500)
  金: '#fbbf24',  // Gold (Yellow-400)
  水: '#3b82f6',  // Blue (Blue-500)
}
```

## Integration

The visualizations are integrated via the updated `WuXingChart.vue` component, which provides:
- Chart type toggle (bar/radar)
- Consistent summary display
- Responsive layout
- Conditional legend display

## Testing

Unit tests are located in `__tests__/`:
- `WuXingRadar.spec.ts`: Comprehensive tests for radar chart
- See also: `../components/__tests__/WuXingChart.spec.ts`

Run tests:
```bash
npm run test
```

## Design Principles

1. **Accessibility**: ARIA labels, semantic HTML, keyboard navigation
2. **Performance**: Native SVG, GPU acceleration, lazy rendering
3. **Responsiveness**: Mobile-first design with fluid scaling
4. **Maintainability**: Shared constants, type safety, comprehensive tests
5. **Progressive Enhancement**: Works without JavaScript, enhanced with interactivity

## Future Enhancements

Potential additions (as needed):
- Additional chart types (line, area, sunburst)
- Interactive tooltips with detailed information
- Export to PNG/SVG functionality
- Animation controls and transitions
- Dark mode color variants
- Customizable themes
