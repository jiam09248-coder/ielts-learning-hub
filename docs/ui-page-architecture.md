# UI Page Architecture

## Rule

All pages in this project must use two independent UI trees:

- `Desktop...View`
- `Mobile...View`

This project does not use "one responsive page that adapts everywhere" as the default page architecture.
Business state can be shared, but visual structure must be split by device type.

## Required Pattern

Every new page should follow this shape:

```tsx
export default function SomePage() {
  const isDesktop = useIsDesktop();

  const sharedProps = {
    // shared data
    // shared handlers
  };

  return isDesktop
    ? <DesktopSomePageView {...sharedProps} />
    : <MobileSomePageView {...sharedProps} />;
}
```

## What Can Be Shared

- data fetching
- state
- event handlers
- business logic
- formatting helpers

## What Must Be Split

- page layout
- header layout
- card layout
- button layout
- typography scale
- spacing
- dialog/sheet presentation
- section ordering when desktop and mobile differ

## Current Examples

- `src/pages/CatalogPage.tsx`
- `src/pages/LessonPage.tsx`
- `src/pages/LoginPage.tsx`
- `src/pages/ExpressionsPage.tsx`

## Hook Standard

Use `src/hooks/useIsDesktop.ts` for page-level device branching.

Avoid:

- mixing desktop/mobile with large amounts of `lg:` classes
- hiding one layout with CSS while keeping a second full layout embedded in the same branch
- introducing a new page with only one shared responsive JSX tree unless explicitly requested
