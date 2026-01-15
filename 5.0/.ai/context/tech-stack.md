# Coding Standards & Agent Instructions - SAMPLE FOR UPDATING

## Technology Stack

This project uses:

- **Frontend:** React 19 (JSX, functional components only), Vite
- **Styling:** TailwindCSS 3.x (utility-first, mobile-responsive)
- **Backend:** Firebase (Firestore, Cloud Functions, Auth)
- **Deployment:** GitHub Actions → Firebase Hosting

---

## 1. Code Style & Formatting

### Naming Conventions

- **Variables/Functions:** `camelCase` (e.g., `handleToggleChore`, `userIndex`)
- **React Components:** `PascalCase` (e.g., `ParentDashboard`, `ConfirmModal`)
- **Constants:** `UPPER_CASE_SNAKE` (e.g., `DEFAULTS`, `ASSETS`)
- **Files:** Components use `PascalCase.jsx`, utilities use `camelCase.js`

### Explicitness

- Avoid single-letter variable names. Use descriptive names: `userIndex` not `i`, `familyDoc` not `d`.
- Boolean variables should read as questions: `isLoading`, `hasPermission`, `canEdit`.

---

## 2. React Patterns

### Component Structure

- **One component per file** in `src/components/`
- Use **functional components** with hooks—no class components
- Extract reusable logic into **custom hooks** (e.g., `useAuth`, `useFamily`)

### State Management

- Use **React Context** for global state (`AuthContext`, `FamilyContext`)
- Prefer `useState` for local component state
- Use `useEffect` cleanup functions to prevent memory leaks

### Props

- Destructure props at the function signature level
- Document complex prop shapes with JSDoc comments

---

## 3. Firebase & Firestore

### Data Fetching

- Prefer **real-time listeners** (`onSnapshot`) over one-time fetches (`getDocs`) for UI data
- Use `getDocs` only for data that doesn't need live updates

### Cloud Functions

- Use Cloud Functions for **sensitive operations**: PIN hashing, email sending, data validation
- Never expose secrets or API keys in client code
- Cloud Functions should validate inputs and check authentication

### Security Rules

- All operations must be validated server-side in `firestore.rules`
- Follow principle of least privilege—only grant necessary permissions
- Test rules against edge cases before deployment

---

## 4. UI/UX Standards

### Modals (Critical)

> **⚠️ NEVER use browser popups. They are blocked and bad UX.**
>
> See workflow: `.agent/workflows/modals.md`

❌ **Banned:** `alert()`, `confirm()`, `prompt()`, `window.alert()`, etc.  
✅ **Use instead:** `InfoModal`, `ConfirmModal`, `LoadingModal` from `src/components/Shared`

### Styling

- Use **TailwindCSS utility classes**—avoid inline styles and custom CSS
- Follow **mobile-first** responsive design with Tailwind breakpoints
- Maintain visual consistency with existing components

### Feedback

- Show loading states during async operations
- Display user-friendly error messages (no raw error codes)
- Use modals for confirmations before destructive actions

---

## 5. Architecture & Patterns

### DRY (Don't Repeat Yourself)

- If logic is repeated twice, extract into a utility function in `src/utils/`

### SOLID Principles

- Single Responsibility: each function/component does one thing well
- Prefer composition over inheritance

### Guard Clauses

- Use early returns to avoid deep nesting:

```javascript
// ✅ Good
if (!user) return null;
if (!familyData) return <Loading />;
return <Dashboard data={familyData} />;

// ❌ Avoid
if (user) {
  if (familyData) {
    return <Dashboard data={familyData} />;
  } else {
    return <Loading />;
  }
} else {
  return null;
}
```

---

## 6. Error Handling & Safety

### No Silent Failures

- Always catch errors and log them with context
- Never use empty `catch` blocks

### Input Validation

- Validate at boundaries (Cloud Functions, form submissions)
- Fail fast with descriptive error messages

### Graceful Degradation

- UI should display fallback states, not crash
- Show helpful error messages to users

---

## 7. Documentation & Comments

### Comments

- Explain **why**, not **what**—the code shows what, comments explain reasoning
- Document complex business logic and non-obvious decisions

### JSDoc

- All exported functions should have JSDoc with `@param`, `@returns`, and `@throws`

---

## 8. Testing (Aspirational)

- When generating new features, consider unit tests alongside implementation
- Test happy paths and at least one edge case
- Verify Firebase security rules with the emulator before deploying

---

## 9. Enforcement

### ESLint

The project enforces rules via `eslint.config.js`:

- `no-alert: error` — Prevents browser popups
- `no-unused-vars: error` — Keeps code clean

### Workflows

Consult `.agent/workflows/` for specific patterns:

- `/modals` — How to display alerts and confirmations

### Verification

// turbo-all

Before completing work:

1. Run `npm run lint` to check for violations
2. Run `npm run build` to verify compilation
3. Test in browser to confirm functionality
