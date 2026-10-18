---
applyTo: "src/**/*.ts,tests/**/*.ts"
---
# React Component Guidelines

## Component Structure
- Use function components with TypeScript
- Prefer named exports for components
- Keep components small (< 100 lines); extract sub-components
- Use `React.FC<Props>` or explicit `props: Props` parameter

## Props
- Define props as `interface Props { ... }`
- Make all props required by default; use `?` for optional
- Destructure props in parameter: `({ title, onClick }: Props)`
- Use `React.ReactNode` for children, not `JSX.Element`

## State & Effects
- Prefer `useState` for local state, `useReducer` for complex state
- Use `useCallback`/`useMemo` only when profiling shows benefit
- Clean up effects: return cleanup function from `useEffect`
- Avoid `useEffect` for data fetching — use React Query/SWR

## Styling
- Use CSS Modules or Tailwind (no inline styles)
- Co-locate styles: `Component.module.css` next to component
- Use `clsx` or `classnames` for conditional classes

## Testing
- Test user behavior, not implementation
- Use `@testing-library/react` for rendering
- Mock external APIs with MSW