# FE-05 Accessible Component Comparison Notes

## 1. Scope

The `playground/` folder is a standalone accessibility drill for FE-05. It is not a Lynkroam capstone feature or route.

Modal Dialog, Tabs, and Disclosure were first built manually with React and TypeScript. shadcn Dialog and Tabs were generated later so their structure could be compared with the hand-built work. The generated shadcn source was retained unchanged.

## 2. Hand-built implementation

The hand-built Disclosure uses a native button with `aria-expanded` and `aria-controls`. React state controls the expanded value, and the related content uses the native `hidden` attribute when collapsed. Enter and Space behavior comes from the native button rather than a custom keyboard handler.

The hand-built Tabs renders explicit `tablist`, `tab`, and `tabpanel` roles. It creates `aria-controls` and `aria-labelledby` relationships, gives only the selected tab `tabIndex={0}`, and gives the other tabs `tabIndex={-1}`. Its keyboard handler supports ArrowLeft, ArrowRight, Home, and End, including wrapping at each edge. Moving keyboard focus also activates the destination tab, so it follows the automatic-activation pattern.

The hand-built Modal Dialog renders into `document.body` with a React portal. It assigns the dialog role, modal state, title relationship, and optional description relationship directly. When opened, it focuses the visible Close button, traps Tab and Shift+Tab using a custom focusable-element selector, closes on Escape or a backdrop click, makes background body children inert, and locks body scrolling. Cleanup removes the keyboard listener, restores previous inert and body-overflow values, and returns focus to the supplied opener reference.

The three hand-built components have 21 automated regression tests in total. They were also reviewed manually using keyboard-only interaction.

## 3. shadcn and Radix implementation

The generated `dialog.tsx` and `tabs.tsx` files are styled composition wrappers. They arrange Radix primitives, attach `data-slot` attributes, and add generated class names. They do not directly contain the complex modal or tabs keyboard algorithms.

The generated Button wrapper supplies button sizes and visual variants. It can render a normal button or use the Radix Slot primitive when `asChild` is enabled. `class-variance-authority` defines the Button and Tabs visual variants, while the shared `cn` utility combines conditional classes with `clsx` and resolves Tailwind conflicts with `tailwind-merge`.

Each wrapper inherits its public props with `React.ComponentProps<typeof RadixPrimitive>`. This preserves the relevant Radix prop contract instead of redefining a smaller custom interface. Dialog semantics, focus handling, dismissal, and interaction behavior are delegated to the Dialog primitives from `radix-ui`. Tabs semantics, item state, keyboard navigation, and focus management are delegated to the Tabs primitives from `radix-ui`.

## 4. Modal Dialog comparison

### API and composition

The hand-built modal has a single component API with required `isOpen`, `onClose`, and `returnFocusRef` props. Its title, optional description, and children are passed into that component. It is controlled by its parent.

The shadcn version exposes compositional wrappers such as `Dialog`, `DialogTrigger`, `DialogContent`, `DialogTitle`, `DialogDescription`, and `DialogClose`. These wrappers inherit Radix props, so the composition can use Radix's controlled or uncontrolled root behavior. The trigger belongs to the same composition and gives the primitive an ownership relationship it can use for focus restoration.

### Portal and ARIA ownership

The hand-built component calls `createPortal` directly and renders into `document.body`. It manually assigns `role="dialog"`, `aria-modal`, `aria-labelledby`, and optional `aria-describedby` values.

The shadcn `DialogContent` composes `DialogPrimitive.Portal`, `Overlay`, and `Content`. The wrapper does not manually wire the dialog role or title and description identifiers. Those responsibilities belong to the Radix primitives used by the wrapper.

### Initial focus and focus containment

The hand-built modal deliberately focuses its visible Close button when it opens. It queries a custom list of focusable selectors and handles Tab and Shift+Tab on `document` to keep focus inside.

The shadcn wrapper contains no focus query or keydown listener. It delegates initial focus and containment to Radix. During manual review of this specific demo, initial focus moved to the checkbox. That is an observation about the tested composition, not a guarantee that every Radix Dialog will initially focus a checkbox. Both tested implementations kept keyboard focus inside the open dialog.

### Escape, outside interaction, and background isolation

The hand-built modal explicitly handles Escape in its document listener. It closes only when a click target is the backdrop itself. It also records the previous `inert` value of each background body child, sets those siblings inert while open, and restores their exact values during cleanup.

The generated shadcn wrapper has no custom Escape, outside-click, or inert implementation. Those behaviors are handled by the Radix Dialog primitives. The shadcn demo's equivalent keyboard and closing interactions passed manual review. Radix also exposes a broader primitive event API for outside-interaction scenarios, whereas the hand-built API exposes only its fixed backdrop behavior.

### Body scrolling and focus restoration

The hand-built modal explicitly stores `document.body.style.overflow`, changes it to `hidden`, and restores the previous value. The generated wrapper does not directly manipulate body overflow, so any scroll containment comes from the underlying Radix behavior rather than code in `dialog.tsx`.

The hand-built component restores focus through the required `returnFocusRef`. The Radix composition owns the trigger and handles restoration through its primitives. Manual review confirmed that both implementations returned focus to their opener after closing.

### Edge cases and TypeScript

The manual implementation is intentionally limited to the exercise's one-dialog scenario. Its global keydown listener, body-child inert handling, and custom selector would require additional coordination for nested dialogs, stacked dialogs, and more complex outside-interaction cases. Radix provides a reusable primitive designed to coordinate a wider set of dialog states and interactions.

The hand-built props are a small explicit TypeScript type. The shadcn wrappers use `React.ComponentProps` to inherit the broader primitive contracts, including the root's controlled and uncontrolled options and the specialized props for triggers, portals, content, and close controls.

## 5. Tabs comparison

### API and composition

The hand-built Tabs accepts a data-driven array of items containing an id, label, and React content. It renders the complete tab structure from that array. The shadcn API is compositional: callers arrange `Tabs`, `TabsList`, `TabsTrigger`, and `TabsContent` and connect each trigger and panel with the same stable string value.

### Semantics and focus

The hand-built source directly creates all roles, ARIA relationships, selected states, hidden panels, and roving `tabIndex` values. It stores button refs and moves focus itself. The shadcn wrapper does not declare those details; its Radix Tabs primitives own the roles, relationships, selection state, roving focus, and panel visibility.

Both tested implementations supported Tab entry, ArrowLeft, ArrowRight, Home, End, wrapping, automatic activation, and moving from the active tab into focusable panel content during manual keyboard review.

### Orientation and disabled items

The hand-built handler is written only for horizontal ArrowLeft and ArrowRight navigation. Its API does not expose orientation. The Radix root props inherited by the shadcn wrapper include orientation behavior, and the generated styling accounts for horizontal and vertical states.

The hand-built `TabItem` type has no disabled property, and its navigation does not skip disabled items. Radix trigger props support disabled items, with navigation behavior delegated to the primitive.

### Styling and TypeScript

The hand-built Tabs uses dedicated plain-CSS class names and includes a visible “Selected” text marker. The generated wrapper combines Tailwind classes with `cn`; its list has CVA variants for default and line presentations.

The hand-built component defines `TabItem` and `TabsProps` itself. The generated wrappers inherit the Radix root, list, trigger, and content prop types with `React.ComponentProps`, and the list adds a typed CVA variant contract.

## 6. Concrete gaps in the hand-built components

These are deliberate scope limitations of the exercise. They do not mean that the manual components failed the required FE-05 behavior.

1. **Custom modal focus selector and trap:** The hand-built modal maintains its own focusable-element selector and Tab loop. Radix supplies a mature reusable focus-management primitive instead of requiring each consumer to maintain that logic.
2. **No nested or stacked modal coordination:** The manual modal's document listener, body overflow update, and direct-body-sibling inert changes are designed for one open dialog. It does not coordinate nested or stacked dialogs or more complex outside-interaction scenarios.
3. **Controlled-only modal API:** The manual modal requires `isOpen`, `onClose`, and an explicit `returnFocusRef`. Radix composition supports broader controlled and uncontrolled usage and owns the trigger relationship used for focus restoration.
4. **Horizontal-only manual Tabs:** The hand-built Tabs implements ArrowLeft and ArrowRight and does not expose vertical orientation behavior. The Radix primitive API supports orientation.
5. **No disabled-tab model:** The manual `TabItem` type has no disabled state and its navigation logic has no disabled-item handling. Radix trigger props and navigation support disabled items.
6. **Less composition flexibility:** The hand-built components expose APIs tailored to these demonstrations. Radix/shadcn separates roots, triggers, content, portals, and close controls so consumers can compose a broader range of structures.

## 7. What the hand-built exercise taught

Building the components from scratch made the ARIA relationships concrete. The Tabs exercise showed how selection, panel ownership, and roving `tabIndex` must stay synchronized. The Disclosure showed how much correct behavior comes from using a native button and the `hidden` attribute.

The Modal exercise showed that focus containment and restoration require deliberate lifecycle work. Background state and body scrolling also have to be restored rather than merely changed while the dialog is open.

This work makes generated or library code easier to review critically. The small shadcn wrappers should not be mistaken for the complete accessibility implementation: important responsibilities are delegated to Radix. Understanding the manual behavior helps identify that boundary instead of trusting generated code without inspection.

## 8. Verification performed

### Hand-built automated verification

- TypeScript typecheck passed.
- ESLint passed.
- 3 test files passed.
- 21 tests passed.
- The Vite production build passed.

### Manual keyboard verification

- **Disclosure:** Enter and Space activation, hidden collapsed content, and focus order were reviewed.
- **Tabs:** Tab, ArrowLeft, ArrowRight, Home, End, wrapping, and movement into focusable panel content were reviewed.
- **Modal Dialog:** Initial focus, forward and backward trapping with Tab and Shift+Tab, Escape, close controls, backdrop closing, and focus restoration were reviewed.
- **shadcn Dialog and Tabs:** Equivalent keyboard interactions were manually reviewed successfully, including dialog focus containment and restoration and horizontal automatic-activation tab navigation.

No screen-reader testing was performed as part of this exercise.

## 9. Conclusion

The hand-built versions satisfy the keyboard and ARIA behaviors required by FE-05. Their code makes each relationship and focus-management responsibility visible, but their APIs intentionally cover a smaller set of scenarios.

The generated shadcn wrappers backed by Radix provide broader composition, reusable primitive contracts, and more support for edge cases. Understanding the manual implementations makes it easier to evaluate what the generated wrappers implement themselves, what they delegate to Radix, and whether a library is being used correctly rather than trusted blindly.
