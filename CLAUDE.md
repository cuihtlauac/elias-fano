# Elias-Fano Animation

## Stack (reusable for other animated SVG explainers)

Vite + React + TypeScript + Framer Motion, rendering to SVG.

- **Vite** — dev server with HMR so edits appear instantly in the browser
- **React** — component tree maps to SVG elements
- **Framer Motion** — `motion.*` wrappers on SVG elements for spring/tween animations, `AnimatePresence` for enter/exit
- **SVG** — all visuals are `<svg>` with `viewBox`, no canvas/WebGL

Workflow: Claude edits code, Vite HMR pushes changes to the browser.

### Reusable patterns

- **Step-based player** (`steps.ts`, `useStepPlayer.ts`): define an ordered list of named steps; the hook provides `prev`/`next`/`reached(step)`. Components use `reached()` to decide what's visible — steps are cumulative (reaching step N means steps 0..N are all active).
- **Positioned SVG components**: each visual piece is a component receiving `(x, y)` and using `<motion.g animate={{ x, y }}>` so elements glide when positions change.

### Animation style preferences

The user prefers animations that feel deliberate and readable:

- **"Flying copies"**: when data moves from one part of the diagram to another, a copy of the text flies from source to destination (the original stays). Each piece departs staggered (delay ~0.15s between items). Use slow springs (`stiffness: 30, damping: 14`) so the movement is easy to follow.
- **"Pen-drawn" borders**: after flying elements land, the enclosing box draws itself using `strokeDasharray`/`strokeDashoffset` animation, as if traced by a pen.
- Overall: keep transitions slow enough to read. Avoid snappy/instant appearances — things should visibly travel or grow.

### Running

```sh
cd anim
npm install
npm run dev        # http://localhost:5173/
```

## Elias-Fano topic

The animation explains Elias-Fano encoding of a sorted integer sequence step by step.

### Data (`data.ts`)

Example: `[2, 3, 5, 7, 11, 13, 24]`, with `w=5` total bits, `l=2` lower bits.
Precomputes: binary representations, upper/lower bit splits, bucket counts, unary encoding.

### Steps (`steps.ts`)

1. **unsorted** — show the integers in arbitrary order
2. **sorted** — slide them into sorted order
3. **binary** — binary representation appears below each number
4. **color-split** — upper bits red, lower bits blue
5. **lower-to-bottom** — lower-bits fly to bottom-right bar
6. **buckets-decimal** — 8 bucket boxes appear with decimal labels 0–7
7. **buckets-binary** — decimal labels crossfade to binary 000–111
8. **buckets-arrows** — arrows extend from upper bits to matching buckets; counts pop in as arrows land
9. **counts-fade-zero** — zero counts fade away
10. **counts-fly** — non-zero counts fly to bottom-left bar area
11. **counts-to-unary** — counts morph to unary encoding, orange→red, pen-drawn box
12. **upper-plus** — "+" sign appears between upper and lower bars

### Components

| File | Role |
|---|---|
| `NumberBox.tsx` | One element: square decimal box + tight binary rectangle below |
| `Buckets.tsx` | Bucket boxes, arrows, count circles, flying counts→unary bar, "+" sign |
| `LowerBitsBar.tsx` | Blue lower-bits bitvector bar |
| `EliasFanoAnimation.tsx` | Orchestrator: lays out components, wires step logic |
