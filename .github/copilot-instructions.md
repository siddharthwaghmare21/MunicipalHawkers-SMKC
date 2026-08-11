# SMKC ERP — Authoritative Development Compatibility Manual

> Purpose: this document is the compatibility contract for developing new SMKC ERP modules inside this repository, on another machine, in another temporary repository, or by another developer or AI.
>
> It describes how the current ERP is built, how it looks, how it behaves, how it integrates with the backend, and how new work must be shaped so it can merge into the main ERP with minimal redesign and conflict.

## Read This First

**If you are an AI coding assistant developing a new SMKC ERP module, do not immediately start generating code from only the functional requirement. First read this entire instruction document and design the implementation according to the existing SMKC ERP architecture, UI/UX, behavioural, functional, database and integration standards described here.**

The functional requirement tells you **what** the module must accomplish.

This document tells you **how** that functionality must be implemented inside SMKC ERP.

Both must be respected.

If the requested functionality can be implemented using an existing SMKC ERP pattern, reuse that pattern.

Do not invent a new architecture, state model, route style, visual theme, alert system, table system, export workflow, or authentication approach simply because another approach looks newer or easier.

## Mandatory Decision Order

1. Reuse an existing SMKC ERP component, route pattern, helper, style class, or backend contract.
2. Extend an existing SMKC ERP pattern with the smallest safe change.
3. Create a module-specific implementation that still looks and behaves like existing SMKC ERP.
4. Introduce a new dependency or architectural pattern only if the requirement genuinely cannot be fulfilled with the current stack.

Before introducing a new dependency, document:

- why existing functionality is insufficient
- what dependency is proposed
- compatibility impact
- deployment impact
- integration impact

## Scope And Evidence Standard

- This document is based on the current repository contents of `smkc-erp` and the paired backend repository `apismkc`.
- Preserve verified project-specific rules.
- If multiple patterns exist, prefer the one used by current active shell pages and shared packages.
- When a pattern exists only in isolated micro-apps or older screens, mark it clearly.
- Never place credentials, secrets, tokens, connection strings, or private certificate content in this file.

---

## 1. Current System Snapshot

### 1.1 Primary Frontend Standard

| Concern | Current Standard |
|---|---|
| Main app | `apps/smkc-erp-shell` |
| Framework | Next.js 15 App Router |
| UI library | React 19 |
| Language | TypeScript 5 |
| Main visual stack | Bootstrap 5.3 + custom global CSS + Bootstrap Icons 1.13 |
| State style | local React state, `useEffect`, `useMemo`, `useCallback`; no global Redux-style store in the shell |
| Navigation | App Router filesystem routes + `next/link` + `useRouter()` |
| Shared shell | `app/layout.tsx` + `app/components/AuthShell.tsx` |
| Shared packages | `@smkc/auth`, `@smkc/types`, `@smkc/api-client`, `@smkc/config`, `@smkc/ui`, `@smkc/utils` |
| Node requirement | `>=20.0.0` |

### 1.2 Backend Standard

| Concern | Current Standard |
|---|---|
| Backend repo | `apismkc` |
| Framework | .NET Framework 4.5 Web API |
| Language | C# |
| API style | JSON Web API controllers, not MVC views, not ASPX UI pages |
| Authentication boundary | Next.js server routes call backend; browser should not call backend directly |
| HMAC auth | `X-API-Key`, `X-Timestamp`, `X-Signature` when required |
| DI | custom `SimpleDependencyResolver` |
| Database access | Oracle.ManagedDataAccess, repository/helper classes, stored procedure centric patterns |

### 1.3 Database Standard

| Connection Key | Schema / Purpose |
|---|---|
| `OracleDbUlberp` | ERP users, permissions, `ULBERP.USERDET` |
| `OracleDbAbas` | Accounts / finance / budget data |
| `OracleDb` | Water / WS schema |
| `OracleDbWebsite` | Public-facing website data |
| `OracleDbGad` | General administration workflows |

Connection factory: `apismkc/Repositories/OracleConnectionFactory.cs`

### 1.4 Main Repositories / Apps

- `smkc-erp/apps/smkc-erp-shell`: main ERP shell, current preferred UI standard.
- `smkc-erp/apps/deposit-manager`: separate micro-app using Tailwind CSS 4. This is **isolated**, not the shell standard.
- `smkc-erp/SMKC_Disabilities_Registration/nextjs-app`: separate micro-app workspace entry.
- `apismkc`: .NET Web API backend and Oracle integration layer.

### 1.5 Important Verified Reality Checks

- The main ERP does **not** use ASPX pages or `.master` files in the `smkc-erp` frontend repository.
- The frontend equivalent of a “master page” is `app/layout.tsx` plus `app/components/AuthShell.tsx` and department-local `layout.tsx` files where needed.
- Some routes import Bootstrap CSS locally via route layout files, for example:
  - `apps/smkc-erp-shell/app/general-administration/layout.tsx`
  - `apps/smkc-erp-shell/app/women-child-welfare/layout.tsx`
  - `apps/smkc-erp-shell/app/public/disability-registration/layout.tsx`
- New shell modules that rely on Bootstrap utility/button/table classes must ensure Bootstrap CSS is available in their route hierarchy.

---

## 2. Current Preferred Patterns Vs Legacy / Isolated Patterns

### 2.1 Preferred Patterns

| Area | Preferred Standard | Evidence |
|---|---|---|
| Protected shell | `AuthShell` wraps authenticated pages and login UI | `apps/smkc-erp-shell/app/components/AuthShell.tsx` |
| Department navigation | `DeptSidebar` + `DEPT_MENUS` + permission filtering | `apps/smkc-erp-shell/app/components/DeptSidebar.tsx`, `app/lib/dept-menus.ts`, `app/lib/permissions.ts` |
| Modal / confirmation | `ErpPopup` or custom module modal matching ERP tone | `apps/smkc-erp-shell/app/components/ErpPopup.tsx`, WCWC registrations pages |
| Data tables | Plain HTML tables, Bootstrap table classes, or shared `dash-*` table styles | `DashboardPage.tsx`, `general-administration/work-order-list/page.tsx`, accounts reports |
| Search / filter bars | breadcrumb + page header + filter card/bar + list/report area | `water-tax/components/WaterDashboard.tsx`, `women-child-welfare/disability-registration/report/page.tsx` |
| Export | `xlsx` for true Excel export, CSV for lighter exports, dedicated print pages for print/PDF | accounts report pages, WCWC report and print pages |
| Print security | encrypted print tokens for sensitive print routes | `app/lib/printToken.server.ts`, GAD print routes |
| Session | `localStorage` key `smkc_session` | `packages/auth/src/index.ts` |
| Permissions cache | `sessionStorage` keys `smkc_permissions`, `smkc_permissions_user` | `app/lib/permissions.ts` |
| API contract | Next.js route handlers proxy to backend and return `{ success, message, data }` shape | `app/api/**/route.ts`, `packages/api-client/src/server.ts` |

### 2.2 Isolated Or Optional Patterns

| Area | Classification | Notes |
|---|---|---|
| Tailwind CSS 4 | Isolated / optional only for separate micro-apps | Used by `apps/deposit-manager`, not by `apps/smkc-erp-shell` |
| Module-local theme families | Optional within a department | Women & Child Welfare has its own blue/amber theme in `app/women-child-welfare/styles.css`, but it still sits inside the ERP shell and does not replace the global shell chrome |
| Inline `React.CSSProperties` style blocks | Accepted current pattern | Used heavily in GAD, accounts, and WCWC pages for module-specific styling |

### 2.3 Legacy / Do Not Use For New Work

| Pattern | Classification | Reason / Evidence |
|---|---|---|
| Native `alert()` for user-facing flow control | LEGACY / DO NOT USE | Still exists in some pages such as `accounts/budget-book-list/page.tsx`, `accounts/budget-cap/page.tsx`, `general-administration/work-proposals/page.tsx`; prefer `ErpPopup` or styled inline alert blocks |
| Direct browser calls to `apismkc` | DO NOT USE | Current architecture uses Next.js server routes or `@smkc/api-client` |
| Adding DataTables, Select2, SweetAlert, Toastr, Font Awesome into the shell by default | DO NOT USE | Not active in the main shell; no evidence of current standardized usage there |
| Creating a second dashboard shell or second auth system | DO NOT USE | Breaks compatibility with `AuthShell`, permission flow, and shared routing |

### 2.4 Mixed Reality That Must Be Understood

- Current deployments may expose ERP login through different upstream backend routes, but frontend modules must only call the local Next route `POST /api/erp-auth/login`.
- Some backend areas are HMAC-protected through `@smkc/api-client`; some internal ERP paths are whitelisted by `ApiKeyAuthenticationHandler` and proxied without HMAC.
- New modules must follow the existing local proxy pattern and must not hard-code backend assumptions in browser code.

---

## 3. Repository Structure And Placement Rules

### 3.1 Main Shell Layout

```
smkc-erp/
  apps/
    smkc-erp-shell/
      app/
        layout.tsx
        page.tsx
        components/
        lib/
        api/
        [department routes]
  packages/
    auth/
    api-client/
    types/
    config/
    ui/
    utils/
```

### 3.2 Route Placement Standard

```
/                              home department grid
/{dept-key}/                   redirects to /{dept-key}/dashboard
/{dept-key}/dashboard          department dashboard
/{dept-key}/{module-key}       module page
/admin/*                       admin-only shell pages
/profile                       current user profile
/public/*                      unauthenticated public pages
/verify/*                      verification / print validation pages
/depositmanager                proxied micro-app
```

### 3.3 Department Keys Already Registered

- `water-tax`
- `accounts`
- `property-tax`
- `general-administration`
- `marriage`
- `audit-department`
- `women-child-welfare`
- `health`
- `fire`
- `estate`
- `market-licenses`
- `pms`
- `pwd`

Source of truth: `packages/types/src/index.ts`

### 3.4 Where New Work Should Go

Use one of these paths only:

1. Extend an existing department route under `apps/smkc-erp-shell/app/{dept-key}/...`.
2. Add a new module route under an existing department and register it in `app/lib/dept-menus.ts`.
3. Add a separate micro-app under `apps/*` only when the module genuinely must run as a separately deployed app and later be proxied into the shell.

### 3.5 What Not To Create

- Do not create a second root app shell.
- Do not create a second login page for authenticated ERP users.
- Do not create a parallel permission store.
- Do not create a second global CSS architecture for the shell.
- Do not create a second icon set.

---

## 4. Representative Reference Files

Study these first when designing a compatible module.

### 4.1 Shell / Shared References

| Area | File | Why It Matters |
|---|---|---|
| Root shell | `apps/smkc-erp-shell/app/layout.tsx` | root providers and shell wrapping |
| Login and protected shell | `apps/smkc-erp-shell/app/components/AuthShell.tsx` | auth gate, login UX, header, language toggle, logout |
| Sidebar and menu rendering | `apps/smkc-erp-shell/app/components/DeptSidebar.tsx` | navigation structure, permission filtering, mobile overlay |
| Reusable popup | `apps/smkc-erp-shell/app/components/ErpPopup.tsx` | modal standard |
| Global styles | `apps/smkc-erp-shell/app/globals.css` | brand tokens, shell, forms, tables, dashboard patterns |
| Department menu registry | `apps/smkc-erp-shell/app/lib/dept-menus.ts` | routing, menu grouping, integration point |
| Permission model | `apps/smkc-erp-shell/app/lib/permissions.ts` | cache, fallback, access helpers |
| Types | `packages/types/src/index.ts` | shared shape contracts |
| Session/auth | `packages/auth/src/index.ts` | `smkc_session`, login, expiry |
| Server API wrapper | `packages/api-client/src/server.ts` | HMAC-aware server-side calls |

### 4.2 Department Module References

| Page Type | File | Notes |
|---|---|---|
| Dashboard with filters | `apps/smkc-erp-shell/app/water-tax/components/WaterDashboard.tsx` | shared dashboard conventions, filter bar, refresh flow |
| GAD create form | `apps/smkc-erp-shell/app/general-administration/create-work-order/page.tsx` | transaction form, validation, confirm/save, print token workflow |
| GAD listing | `apps/smkc-erp-shell/app/general-administration/work-order-list/page.tsx` | list page, FY filter, table, print action |
| GAD searchable listing | `apps/smkc-erp-shell/app/general-administration/work-proposals/page.tsx` | search, sorting, pagination, print detail workflow |
| Accounts report | `apps/smkc-erp-shell/app/accounts/budget-liability-report/page.tsx` | KPI/report layout, CSV, XLSX, print export |
| WCWC public/department registration | `apps/smkc-erp-shell/app/women-child-welfare/page.tsx` | four-step form, draft persistence, validation |
| WCWC management list | `apps/smkc-erp-shell/app/women-child-welfare/registrations/page.tsx` | tabs, status actions, reject/duplicate flows |
| WCWC edit page | `apps/smkc-erp-shell/app/women-child-welfare/registrations/[id]/edit/page.tsx` | load/edit existing record, document previews, re-upload logic |
| WCWC report page | `apps/smkc-erp-shell/app/women-child-welfare/disability-registration/report/page.tsx` | report filters, print/export behavior |
| Public print/PDF | `apps/smkc-erp-shell/app/public/disability-registration/print/[registrationNumber]/page.tsx` | print/PDF via html2pdf.js |

### 4.3 Backend References

| Area | File | Notes |
|---|---|---|
| ERP auth controller | `apismkc/Controllers/ErpAuthController.cs` | login, profile, change password, lock/unlock flow |
| User rights controller | `apismkc/Controllers/UserRightsController.cs` | permission read/write and admin constraints |
| HMAC auth handler | `apismkc/Security/ApiKeyAuthenticationHandler.cs` | protected/public API boundary |
| Oracle connection factory | `apismkc/Repositories/OracleConnectionFactory.cs` | multi-schema connection creation |

---

## 5. Technical Architecture

### 5.1 Current Request Flow

```
Browser UI
  -> Next.js page or client component
  -> local fetch to /api/* route handler or @smkc/api-client
  -> server-side route handler / proxy
  -> .NET Web API controller in apismkc
  -> repository / service / Oracle connection factory
  -> Oracle schema / stored procedures / SQL
  -> JSON response envelope
  -> frontend state update, popup, table, print page, or redirect
```

### 5.2 Main Architecture Rules

- The browser should talk to local Next.js API routes, not to Oracle and not directly to `apismkc`.
- Shared auth/session types must come from `@smkc/types` and `@smkc/auth`.
- Server-to-backend HMAC logic belongs in `@smkc/api-client` or dedicated proxy helpers.
- New department pages belong inside the shell and should reuse `DeptSidebar`, breadcrumb, header, and existing filter/table patterns.

### 5.3 Not Applicable / Legacy Expectations

- ASP.NET Web Forms page lifecycle is **not** the frontend standard for the current main ERP shell.
- `.aspx`, `.ascx`, `.master` style integration is not part of the current `smkc-erp` UI repository.
- If you are asked to build “ERP pages” for this frontend, use Next.js routes and React components unless the task explicitly targets the backend repository only.

---

## 6. Authentication, Session, Roles, And Permissions

### 6.1 Session Standard

| Concern | Standard |
|---|---|
| Session storage | `localStorage['smkc_session']` |
| Session shape | `{ user, token, expiresAt }` |
| Expiry | 8 hours from login |
| Auth helper | `packages/auth/src/index.ts` |
| Session validity check | `isAuthenticated()` |

### 6.2 Login Flow

Current shell behavior in `AuthShell.tsx`:

1. User opens protected route.
2. `AuthShell` checks local session.
3. If absent/expired, login card is shown.
4. User ID is uppercased, both user ID and password are validated as alphanumeric and max 8 chars.
5. Shell calls `POST /api/erp-auth/login`.
6. Success stores `smkc_session`, clears password, redirects to prior non-public path or `/`.
7. Failure shows inline `.auth-error` message.

### 6.3 Backend ERP Auth Rules

Verified in `apismkc/Controllers/ErpAuthController.cs`:

- ERP auth uses `ULBERP.USERDET`.
- Passwords are BASE64-encoded in Oracle.
- Account lockout occurs after 3 consecutive failures.
- User ID and password are capped at 8 characters.
- Admin account unlock flow exists for `ADMIN001` and `PTTEST01`.

### 6.4 Roles

`@smkc/types` defines:

- `commissioner`
- `hod`
- `account`
- `bank`
- `operator`
- `unknown`

Dashboard tab visibility is role-driven in `DashboardPage.tsx` through `ROLE_VIEWS`.

### 6.5 Permissions

Verified standard in `app/lib/permissions.ts` and `apismkc/Controllers/UserRightsController.cs`:

- Permissions are fetched from `/api/user-rights/for-user?userId=...`.
- Permissions are cached in `sessionStorage`.
- Permissions are keyed as `deptKey -> menuItems[]`.
- `ADMIN001` and `PTTEST01` get unrestricted access.
- If a non-admin user has no custom DB rights, the shell currently grants default General Administration menu visibility so the shell is not blank.

### 6.6 Rules For New Modules

- Do not add another login form for authenticated ERP staff.
- Do not create another session key.
- Do not assume menu visibility alone is security; backend/route checks still matter.
- If your module adds new menu items, ensure rights seeding and admin-management implications are documented.

---

## 7. API And Integration Standards

### 7.1 API Envelope

Preferred response shape:

```json
{ "success": true, "message": "...", "data": { } }
```

This shape is expected throughout `@smkc/api-client`, route handlers, and UI pages.

### 7.2 Next.js Route Handler Standard

Use local route handlers under `app/api/*` to:

- validate input
- attach HMAC when required
- normalize backend envelopes
- hide backend base URLs and secrets from the browser
- convert backend/network failures into ERP-safe UI responses

Representative files:

- `apps/smkc-erp-shell/app/api/erp-auth/login/route.ts`
- `apps/smkc-erp-shell/app/api/user-rights/for-user/route.ts`
- `apps/smkc-erp-shell/app/api/general-administration/work-proposals/list/route.ts`
- `apps/smkc-erp-shell/app/api/women-child-welfare/proxy.ts`

### 7.3 HMAC Standard

Verified in `packages/api-client/src/hmac.ts` and `apismkc/Security/ApiKeyAuthenticationHandler.cs`:

- String to sign: `METHOD + pathWithQuery + body + timestamp + apiKey`
- Hash: HMAC-SHA256
- Headers:
  - `X-API-Key`
  - `X-Timestamp`
  - `X-Signature`

### 7.4 Public / Internal Backend Paths

`ApiKeyAuthenticationHandler` whitelists several internal ERP paths and public form endpoints. This means:

- some route handlers call the backend without HMAC because the backend intentionally allows them
- this is an implementation detail of the server boundary
- browser code must still use the local Next.js route and must not bypass it

### 7.5 Print Token Standard

Sensitive print routes in General Administration use encrypted print tokens rather than raw query parameters.

Reference:

- `apps/smkc-erp-shell/app/lib/printToken.server.ts`
- `general-administration/create-work-order/print/page.tsx`
- `general-administration/create-samaj/print/page.tsx`

Rule:

- if a printable view exposes sensitive lookup identifiers, prefer tokenized access rather than openly exposing all parameters

---

## 8. Database And Backend Development Standards

### 8.1 Current Backend Architecture

The live pattern is:

```
Web API controller
  -> service or repository layer
  -> OracleConnectionFactory
  -> OracleCommand / parameterized call / stored procedure or SQL
  -> ApiResponse<T>
```

### 8.2 Oracle Standard

Verified from `OracleConnectionFactory.cs`:

- Oracle is the authoritative database.
- Multiple schemas are used by domain.
- Connections are created explicitly per schema.
- New backend code should use the correct schema factory method instead of creating ad hoc connection handling.

### 8.3 What External Modules Must Match

- Use Oracle-compatible naming and parameterized commands.
- Preserve existing response envelopes.
- Preserve existing authentication expectations.
- Do not introduce a new ORM for one isolated module unless explicitly approved.
- If the current backend area is stored-procedure-centric, continue with that pattern.

### 8.4 Database Naming And Audit Guidance

Use the naming and audit conventions already present in the target backend area. Common fields in the ERP ecosystem include concepts such as:

- created by / entered by
- created date / entry date
- modified by / reviewed by
- active/inactive
- status
- department code / name
- financial year

Do not invent a new status vocabulary if an existing module already defines one.

---

## 9. SMKC ERP UI Design System

### 9.1 Root Brand Tokens

Primary token source: `apps/smkc-erp-shell/app/globals.css`

```css
:root {
  --brand-primary: #C0392B;
  --brand-primary-dark: #962d22;
  --brand-secondary: #D4AF37;
  --brand-cta: #E74C3C;
  --brand-cta-hover: #C0392B;
  --color-white: #FDFEFE;
  --color-gray-50: #F2F3F4;
  --color-gray-100: #E8EAEB;
  --color-gray-200: #CCD1D1;
  --color-text-muted: #7B7D7D;
  --color-text-body: #4a5568;
  --color-heading: #2C3E50;
  --color-dark: #1a252f;
  --surface: #FDFEFE;
  --surface-soft: #F2F3F4;
  --surface-border: #E8EAEB;
}
```

### 9.2 Typography

- Base font: `'Segoe UI', system-ui, -apple-system, sans-serif`
- Some Marathi-heavy modules also include `'Noto Sans Devanagari'` in inline/module font stacks.
- Headings: `700` to `800`
- Body: `400` to `600`
- Labels: often uppercase, compact, muted, `0.68rem` to `0.82rem`

### 9.3 Icon Standard

Use Bootstrap Icons only.

Pattern:

```html
<i class="bi bi-house-door-fill" aria-hidden="true"></i>
```

Do not introduce Font Awesome or another icon system for shell modules.

### 9.4 Shell Header

Current shell header in `AuthShell.tsx`:

- sticky white header
- 64px height
- left brand logo + ERP name + corporation name
- right language toggle + profile + admin settings + logout
- bottom accent divider: red to gold gradient

### 9.5 Sidebar

Current sidebar standard in `DeptSidebar.tsx`:

- department icon tile
- department label
- close button
- dashboard link
- grouped accordion menus
- active item highlight
- permission-based item visibility
- mobile backdrop overlay when open

### 9.6 Shared Dashboard Styles

Important global classes from `globals.css`:

- `.dash-breadcrumb`
- `.dash-dept-header`
- `.dash-view-tabs`
- `.dash-view-tab`
- `.dash-filters`
- `.dash-filter-group`
- `.dash-filter-label`
- `.dash-filter-input`
- `.dash-filter-btn-apply`
- `.dash-filter-btn-reset`
- `.dash-stats-grid`
- `.dash-stat-card`
- `.dash-data-section`

### 9.7 Module-Specific Theme Extensions

Women & Child Welfare intentionally extends the shell with a department identity:

- primary blue `#0f5fa8`
- darker blue `#0b457c`
- amber accent `#d97706`
- green `#117a5d`
- red `#c63b31`

Use this only when working in WCWC or when a future department already has its own established sub-theme.

### 9.8 Non-Negotiable Design Rules

- Do not create an unrelated visual theme.
- Do not replace the root shell chrome.
- Do not remove brand tokens.
- Do not add a second design language if existing classes or patterns already solve the layout.

---

## 10. SMKC ERP UI/UX Behaviour Standards

### 10.1 General Interaction Pattern

Most interactive pages follow this sequence:

1. Render breadcrumb and header.
2. Render a filter or search surface if the page is list/report-oriented.
3. Load data asynchronously after mount or after explicit filter action.
4. Show loading state using Bootstrap spinner classes.
5. Show inline alert block, popup, or empty-state text on failure/no data.
6. Disable active action buttons while saving/loading.
7. Re-enable actions after response and show success/error message.

### 10.2 Loading Behaviour

Current live conventions:

- use `spinner-border` or `spinner-border-sm`
- place spinners inside buttons during save/search
- use full-page or inline loading text for initial list/report fetches
- keep sidebar and header visible while content loads

### 10.3 Duplicate Submission Prevention

Current live convention:

- buttons are disabled while an async operation is in progress
- labels change to a spinner + “Saving…”, “Loading…”, “Searching…” or Marathi equivalent

### 10.4 Modal Behaviour

- `ErpPopup` supports Escape close and backdrop close when allowed
- workflow modals often require explicit reason text before enabling the destructive or final action
- multi-step confirmations exist in WCWC duplicate-marking flow

### 10.5 Search And Filter Behaviour

Common pattern:

- financial year defaults to current April-to-March year
- page number resets when search/filter/sort changes
- some pages fetch server data once and then filter client-side
- some report pages call server only when “Generate” or “Refresh” is clicked

### 10.6 Navigation Behaviour

- Back buttons usually return to the department list/report page, not browser history-driven unpredictable navigation
- sidebar toggle is present at the start of the page title row on many department pages
- public flows bypass `AuthShell` if route starts with `/public`

### 10.7 Empty State And No Data Behaviour

Existing shell convention:

- show centered muted message or inline alert-like text
- do not crash the page and do not leave blank white space without explanation

### 10.8 Responsive Behaviour

Current shell conventions include:

- filter bars wrap onto multiple lines
- dashboard tabs are horizontally scrollable if needed
- sidebar collapses with overlay backdrop
- tables either use `table-responsive`, dedicated scroll containers, or horizontally scrollable card content
- print buttons and top controls are hidden with `.no-print` or equivalent print CSS

---

## 11. Standard SMKC ERP Page Types

The current ERP does not have one universal CRUD scaffolder. Instead, it has repeatable patterns by page family.

### A. Registration Page

Representative references:

- `apps/smkc-erp-shell/app/women-child-welfare/page.tsx`
- `apps/smkc-erp-shell/app/public/disability-registration/page.tsx`
- `apps/smkc-erp-shell/app/women-child-welfare/single-women-registration/page.tsx`

Current standards:

- often multi-step rather than one long uncontrolled form
- field-level validation happens before moving to next section
- public and department flows may share structure but keep separate entry routes
- document upload fields are part of the registration workflow
- success flow may open printable receipt/application options
- public disability registration persists a draft in `sessionStorage`
- mobile verification / OTP may be required depending on module flow

### B. Master Entry Page

Current shell has fewer classic “master screens” than legacy ERP systems. When building one:

- follow the GAD/accounts form layout style
- place listing and entry together only if the existing department already uses that pattern
- preserve active/inactive status vocabulary if the target backend already defines it

### C. Transaction Entry Page

Representative references:

- `general-administration/create-work-order/page.tsx`
- `general-administration/work-proposal-under-10l/page.tsx`
- `accounts/primary-budget-entry/page.tsx`
- `accounts/final-budget-entry/page.tsx`

Standards:

- derive or validate financial year
- load dependent dropdowns and reference data first
- validate server preconditions before allowing final create
- use current user ID from session for entered-by fields
- show confirmation before final generation where the module already does so

### D. Add / Create Form

Common pattern:

- initialize defaults in state
- fetch supporting reference data in `useEffect`
- disable save until mandatory fields and prerequisites are satisfied
- use button spinner during submission
- show success card, popup, or redirect after save

### E. Edit / Update Form

Representative reference:

- `women-child-welfare/registrations/[id]/edit/page.tsx`

Standards:

- load record from route param
- normalize backend keys when casing is inconsistent
- preserve document previews and allow selective re-upload
- some fields become conditionally blank/read-only based on toggles and status
- update only after re-validating the same form rules used at create time

### F. View / Details Page

Representative reference:

- WCWC detail modal inside `women-child-welfare/registrations/page.tsx`

Standards:

- show read-only sectioned detail blocks
- surface status clearly
- surface document links / previews where applicable
- provide back/edit/print/download according to current status and module permissions

### G. Listing Page

Representative references:

- `general-administration/work-order-list/page.tsx`
- `general-administration/work-proposals/page.tsx`
- `women-child-welfare/registrations/page.tsx`

Standards:

- breadcrumb + page header + filter/search row
- sortable columns when needed
- page size commonly 20 for client-side pagination pages
- action buttons in last column
- empty state and loading state are explicit

### H. Search Page

Representative references:

- GAD work proposals list
- WCWC registration management list
- water dashboard filter bar

Standards:

- live search for small local result sets is acceptable
- explicit “Refresh” or “Generate” button is common for server-backed lists/reports
- search input usually supports registration no/name/mobile/ID-like quick lookup depending on module

### I. Report Page

Representative references:

- `accounts/budget-liability-report/page.tsx`
- `accounts/fund-wise-budget-liability-report/page.tsx`
- `accounts/bill-payment-report/page.tsx`
- `women-child-welfare/disability-registration/report/page.tsx`

Standards:

- report header / hero card
- filter panel above data
- KPI summary cards when useful
- export buttons near the filters
- print button usually maps to `window.print()` and can be used to save PDF
- Excel export uses `xlsx` in newer accounts reports
- CSV export is still used in some modules

### J. Dashboard Page

Representative references:

- `components/DashboardPage.tsx`
- `water-tax/components/WaterDashboard.tsx`

Standards:

- stat cards / KPI cards
- filter bar or view tabs
- tables or charts by role/view
- refresh button if data is backend-driven
- role-dependent data slicing where required

### K. Approval / Workflow Page

Representative references:

- `women-child-welfare/registrations/page.tsx`
- `accounts/work-proposal-remarks/page.tsx`
- `audit-department/work-proposal-remarks/page.tsx`

Verified workflow behaviors:

- buttons are status-dependent
- destructive actions may require remarks
- approval/reject/duplicate flows surface confirmation UI
- in-place optimistic state update after successful status change is acceptable if backed by server confirmation

### L. Document Upload Page / Section

Representative references:

- WCWC registration form sections
- WCWC edit page

Standards:

- uploads are part of the form state
- existing uploaded files may be previewed via download/inline routes
- document code naming matters and must stay aligned between frontend, backend, and DB constraints
- do not silently rename document codes without coordinating all layers

### M. Print / Receipt / Certificate Page

Representative references:

- `general-administration/create-work-order/print/page.tsx`
- `general-administration/create-samaj/print/page.tsx`
- `women-child-welfare/disability-registration/print/[registrationNumber]/page.tsx`
- `public/disability-registration/print/[registrationNumber]/page.tsx`

Standards:

- dedicated printable route
- print toolbar hidden in print mode
- `window.print()` support
- HTML-to-PDF allowed where already used
- QR code allowed where already part of current document pattern

---

## 12. SMKC ERP Form Standards

### 12.1 Common Structure

Common form composition:

- breadcrumb
- page header
- one or more cards/panels/sections
- labels above controls
- stateful validation messages
- action button row at the bottom or top-right

### 12.2 Layout Style

Actual live shell patterns include a mix of:

- Bootstrap grid and utility classes
- custom global classes such as `.dash-filter-input`
- module-local inline styles for exact spacing and theme color use

Do not try to “normalize” existing modules into one new design system. Match the surrounding department pattern.

### 12.3 Input Standards

- inputs are full-width within their container
- border radius commonly 8px to 10px
- border color is light gray/blue until focus
- focus states often use red brand ring for global shell controls
- labels are compact and semibold

### 12.4 Conditional Form Logic

Current ERP forms frequently clear dependent fields when a parent toggle changes. Example: WCWC registration clears certificate, pass, employment, benefit, and guardianship subfields when the user flips controlling answers.

Rule:

- if a parent answer disables a section, clear the dependent values rather than leaving stale data in hidden fields

### 12.5 Draft And Partial Data Behaviour

Public disability registration currently stores non-file draft data in `sessionStorage`.

Use temporary draft persistence only when:

- the target flow is multi-step
- losing progress would materially harm UX
- the pattern is already present in that module family

### 12.6 Form Buttons

- primary action uses Bootstrap primary styling or equivalent established module style
- buttons show spinners while processing
- disabled state is used to prevent duplicate submission
- cancel/back usually returns to list/detail rather than hard reloading the page

---

## 13. SMKC ERP Action Button Standards

### 13.1 Common Button Vocabulary

Current live shell commonly uses these actions:

- Add New
- Save
- Submit
- Update
- Edit
- View
- Search
- Refresh
- Print
- Download
- Export CSV
- Export Excel (.xlsx)
- Approve
- Reject
- Mark Under Review
- Mark Duplicate
- Back
- Cancel

### 13.2 Appearance Standard

- use Bootstrap button classes where present in surrounding module: `btn`, `btn-sm`, `btn-primary`, `btn-outline-secondary`, `btn-outline-primary`
- use Bootstrap Icons inside buttons
- use module-local inline color styling only when the module already does so for workflow states

### 13.3 Behaviour Standard

- validate before calling backend
- disable button while request is active
- show `spinner-border-sm` for in-progress state
- show popup or inline success/error message after completion
- for print/download, use dedicated print/download routes where available

### 13.4 Special Workflow Buttons

In WCWC registration management:

- `UNDER_REVIEW` can be applied from `SUBMITTED` or `DRAFT`
- `APPROVED`, `REJECTED`, `DUPLICATE` can be applied from `SUBMITTED` or `UNDER_REVIEW`
- reject requires a stronger reason flow
- duplicate uses a two-step warning flow

When building new workflow buttons, use this as the benchmark for seriousness and audit visibility.

---

## 14. Record Status And Workflow Behaviour

### 14.1 Verified Status Vocabulary In Current ERP

Confirmed in Women & Child Welfare registration flows:

- `DRAFT`
- `SUBMITTED`
- `UNDER_REVIEW`
- `APPROVED`
- `REJECTED`
- `DUPLICATE`
- `CANCELLED`

### 14.2 Status Badge Pattern

Current status badges are colored pill-like labels with semantic colors.

Examples from WCWC:

- blue: submitted/new
- amber: under review
- green: approved
- red: rejected
- purple: duplicate
- gray: cancelled/draft

### 14.3 Global Workflow Warning

There is no single universal workflow engine shared by all departments.

Rule:

- do not invent a fake “ERP-wide workflow” abstraction unless the repository already provides one
- preserve module-specific status transitions
- document the exact statuses and transitions for the module you are extending

---

## 15. SMKC ERP Reporting Standard

### 15.1 Reporting Layout

Current report pages typically contain:

- breadcrumb
- report hero/header
- filter panel
- action buttons for refresh/export/print
- KPI summary cards when useful
- report table / detail sheet

### 15.2 Export Standards

| Export Type | Current Standard | Evidence |
|---|---|---|
| XLSX | `xlsx` dynamic import and workbook generation | accounts report pages |
| CSV | Blob + BOM + client download | accounts and WCWC report pages |
| Print/PDF | dedicated print page or `window.print()`; some pages also use `html2pdf.js` | GAD print pages, WCWC print pages |

### 15.3 PDF Generation

Current PDF/print libraries in the shell:

- `html2pdf.js`
- `jspdf`
- `html2canvas`

Use them only where needed and preferably by following an existing print page pattern.

### 15.4 QR And Printable Validation

Current printable civic-document pages may include QR code output via `qrcode.react`.

Reference:

- `general-administration/create-work-order/print/page.tsx`
- `general-administration/create-samaj/print/page.tsx`

### 15.5 File Upload / Document Management

Current WCWC document handling shows these rules:

- uploads are tied to document codes
- preview/download is routed through secure local API endpoints
- inline preview and download both exist
- edit flows preserve existing server documents unless replaced

Important consistency rule:

- keep document-code enums in sync across frontend, backend, and Oracle constraints

---

## 16. Front-End Dependency Compatibility Table

| Technology / Library | Current Version / Evidence | Usage | External Module Requirement | Conflict Risk |
|---|---|---|---|---|
| Next.js | `^15.0.0` | main shell framework | match for shell modules | high if replaced |
| React | `^19.0.0` | UI runtime | match existing shell | medium |
| TypeScript | `^5.0.0` | all shell code | match existing shell | low |
| Bootstrap | `^5.3.8` | buttons, grids, tables, utilities | reuse for shell modules | high if duplicated/replaced |
| Bootstrap Icons | `^1.13.1` | all icons | reuse only this icon set | medium |
| `xlsx` | `^0.18.5` | Excel export | reuse for real `.xlsx` export | low |
| `html2pdf.js` | `^0.14.0` | print-to-PDF pages | reuse if needed | low |
| `jspdf` | `^4.2.1` | PDF support | reuse only if print page needs it | low |
| `html2canvas` | `^1.4.1` | PDF capture support | reuse only if needed | low |
| `qrcode.react` | `^4.2.0` | print QR codes | reuse where already appropriate | low |
| Oracle.ManagedDataAccess | backend repo | Oracle provider | do not replace lightly | high |
| Tailwind CSS 4 | isolated micro-apps only | deposit manager / non-shell apps | do not introduce into main shell by default | high |

Absent from current shell standard:

- DataTables
- Select2
- SweetAlert / SweetAlert2
- Toastr
- Font Awesome

Do not add these by default to the main shell.

---

## 17. Validation, Alerts, Error Handling, And Security

### 17.1 Validation

Current validation patterns include:

- required text checks
- Aadhaar 12-digit checks where applicable
- 10-digit mobile validation
- IFSC validation
- pincode validation
- ward / committee numeric range validation
- date not in future validation
- duplicate-prevention status flows where applicable

Validation is often implemented close to the form rather than through one global library.

### 17.2 Alert And Message Standard

Preferred order:

1. `ErpPopup` for important success/error/confirm states
2. styled inline alert block inside the page/card
3. native `alert()` only in legacy screens already carrying that debt

### 17.3 Error Handling Standard

- route handlers should convert upstream/network failures into safe JSON responses
- UI should show user-friendly messages
- do not expose stack traces
- use warning tone for connectivity issues where helpful

### 17.4 Security Rules

- never expose API keys, HMAC secrets, connection strings, or tokens in frontend code or this document
- keep backend calls server-side when secrets are involved
- preserve session validation
- preserve server-side permission checks
- use parameterized Oracle access
- validate file uploads and document-code mappings
- do not hard-code local machine paths or development URLs into deliverables

---

## 18. External / Separate Device Development Mode

If you are building a new module outside the main repository, treat this document as the compatibility contract.

### 18.1 You Must Assume Final Integration Into The Main ERP

Therefore:

- do not invent another shell
- do not invent another login model
- do not invent another permission model
- do not replace Bootstrap in the shell
- do not switch icon libraries
- do not add DataTables/Select2/SweetAlert/Toastr unless the main ERP adopts them first
- do not create a competing route vocabulary
- do not redesign shared button language
- do not redesign shared report layout language

### 18.2 If Shared Files Are Missing On The External Machine

Temporary compatibility code is allowed only when unavoidable for isolated development or compilation.

Rules:

- clearly mark temporary placeholders
- keep them minimal
- document what must be replaced during integration
- never let placeholder auth/session/helpers silently become permanent ERP behavior

### 18.3 Safe External Module Strategy

Best external strategy for shell-compatible work:

1. mirror `@smkc/types` shapes
2. mirror `@smkc/auth` session shape
3. mirror shell brand tokens and header/sidebar structure
4. mirror route naming under `/{dept-key}/{module-key}`
5. mirror local API route envelope design
6. prepare menu and permission integration notes from day one

---

## 19. New Module Integration Contract

Every independently developed module must:

- fit into the current shell layout
- use the current department route structure
- reuse current shared packages where applicable
- reuse Bootstrap 5.3 and Bootstrap Icons for shell pages
- use existing auth/session/permission patterns
- use existing API envelope style
- use existing Oracle/backend integration style
- follow current status vocabulary for the target domain
- match the surrounding department’s UI density, spacing, typography, and action behavior
- supply database and deployment notes for integration

### 19.1 Menu Integration Requirements

For shell modules, integration usually requires:

1. route files under the correct department path
2. new menu entry in `app/lib/dept-menus.ts`
3. permission mapping implications in backend/user-rights data
4. possibly a new department entry only if the module introduces a brand-new department

### 19.2 Shared File Modification Policy

Prefer new module files over editing shared files.

When shared edits are required:

- keep them minimal
- avoid reformatting unrelated code
- avoid global renames
- avoid package upgrades unrelated to the module

---

## 20. Merge-Safe Development Rules

- Prefer adding new files under the target module folder.
- Avoid modifying `app/globals.css` unless the new style is truly shared across multiple modules.
- Avoid modifying `app/layout.tsx` unless the requirement is truly shell-wide.
- Avoid modifying `packages/types` unless the new type is genuinely shared.
- Avoid changing backend auth or permission logic for one module unless required for ERP-wide consistency.
- Avoid changing `Web.config` or environment requirements unless strictly necessary.
- Avoid changing unrelated departments while implementing one department module.

---

## 21. Handover Record Requirements

Every separately developed module should hand over at least:

- module name
- module purpose
- functional summary
- routes/pages added
- frontend files added/modified
- backend files added/modified
- database objects added/modified
- menu entries required
- permission entries required
- status/workflow behavior
- export/print behavior
- file storage/document handling behavior
- environment/config changes
- temporary compatibility code to remove at merge time
- deployment sequence
- rollback notes
- known limitations

---

## 22. AI Pre-Development Checklist

Before generating a new SMKC ERP module, determine:

- [ ] Which existing department or micro-app pattern this module belongs to
- [ ] Which route path and menu group must be used
- [ ] Which shared package types/helpers already exist
- [ ] Which shell layout, header, sidebar, and breadcrumb pattern applies
- [ ] Which filters, tables, and action buttons the neighboring module already uses
- [ ] Which export style applies: CSV, XLSX, print, PDF, QR
- [ ] Which auth/session/permission checks apply
- [ ] Which backend API route pattern applies
- [ ] Which Oracle schema / backend area owns the data
- [ ] Which status vocabulary already exists for this workflow
- [ ] Which document codes or file-upload conventions already exist
- [ ] Which responsive and print behavior already exists in the target module family

---

## 23. AI Pre-Merge Compatibility Checklist

Before merging into the main ERP, verify:

- [ ] UI visually matches the surrounding SMKC ERP module family
- [ ] Route placement matches existing department structure
- [ ] Sidebar/menu integration is correct
- [ ] Session and permission usage matches current shell behavior
- [ ] No duplicate Bootstrap or competing CSS framework was introduced into the shell
- [ ] No duplicate icon library was introduced
- [ ] No direct browser calls to backend were introduced
- [ ] API envelope matches ERP expectation
- [ ] Workflow/status logic matches target department behavior
- [ ] Report/export/print behavior matches ERP conventions
- [ ] Validation and loading states are explicit and safe
- [ ] No hard-coded local URLs, local users, or secret values remain
- [ ] Database deployment and rollback notes are supplied

---

## 24. Repository Reference Index

### Shell And Shared UI

- Root layout: `apps/smkc-erp-shell/app/layout.tsx`
- Login and shell header: `apps/smkc-erp-shell/app/components/AuthShell.tsx`
- Sidebar: `apps/smkc-erp-shell/app/components/DeptSidebar.tsx`
- Popup: `apps/smkc-erp-shell/app/components/ErpPopup.tsx`
- Global styles: `apps/smkc-erp-shell/app/globals.css`
- Menu registry: `apps/smkc-erp-shell/app/lib/dept-menus.ts`
- Permissions: `apps/smkc-erp-shell/app/lib/permissions.ts`
- Language provider: `apps/smkc-erp-shell/app/lib/i18n/LanguageContext.tsx`
- Shared types: `packages/types/src/index.ts`
- Shared auth: `packages/auth/src/index.ts`
- Shared server API client: `packages/api-client/src/server.ts`
- HMAC signing: `packages/api-client/src/hmac.ts`

### Representative Pages

- Home department grid: `apps/smkc-erp-shell/app/page.tsx`
- Dashboard template: `apps/smkc-erp-shell/app/components/DashboardPage.tsx`
- Water dashboard: `apps/smkc-erp-shell/app/water-tax/components/WaterDashboard.tsx`
- GAD create form: `apps/smkc-erp-shell/app/general-administration/create-work-order/page.tsx`
- GAD list page: `apps/smkc-erp-shell/app/general-administration/work-order-list/page.tsx`
- GAD searchable proposals list: `apps/smkc-erp-shell/app/general-administration/work-proposals/page.tsx`
- Accounts report page: `apps/smkc-erp-shell/app/accounts/budget-liability-report/page.tsx`
- WCWC registration page: `apps/smkc-erp-shell/app/women-child-welfare/page.tsx`
- WCWC registration management: `apps/smkc-erp-shell/app/women-child-welfare/registrations/page.tsx`
- WCWC edit page: `apps/smkc-erp-shell/app/women-child-welfare/registrations/[id]/edit/page.tsx`
- WCWC report page: `apps/smkc-erp-shell/app/women-child-welfare/disability-registration/report/page.tsx`
- GAD work order print: `apps/smkc-erp-shell/app/general-administration/create-work-order/print/page.tsx`
- Public disability print: `apps/smkc-erp-shell/app/public/disability-registration/print/[registrationNumber]/page.tsx`

### Backend References

- ERP auth controller: `apismkc/Controllers/ErpAuthController.cs`
- User rights controller: `apismkc/Controllers/UserRightsController.cs`
- HMAC auth handler: `apismkc/Security/ApiKeyAuthenticationHandler.cs`
- Oracle connection factory: `apismkc/Repositories/OracleConnectionFactory.cs`

---

## 25. Architecture Diagram

```
SMKC ERP Shell (Next.js 15 / React 19 / TypeScript)
  -> app/layout.tsx
    -> LanguageProvider
    -> DeptProvider
    -> AuthShell
      -> Login screen when no session
      -> ERP shell header when authenticated
      -> Department routes, dashboards, forms, reports, print pages

Client components / pages
  -> local fetch('/api/...') or @smkc/api-client

Next.js route handlers / proxy helpers
  -> HMAC signing when required
  -> backend request normalization

apismkc (.NET Framework 4.5 Web API)
  -> controllers
  -> repositories / services
  -> OracleConnectionFactory
  -> Oracle schemas
```

---

## 26. Final Principle

This file must teach future developers and AI not only how SMKC ERP code is written, but also:

- how SMKC ERP looks
- how SMKC ERP behaves
- how SMKC ERP forms function
- how SMKC ERP registration pages function
- how SMKC ERP listing pages function
- how SMKC ERP reports function
- how SMKC ERP search and filter flows function
- how SMKC ERP action buttons function
- how SMKC ERP validations function
- how SMKC ERP approvals and workflows function
- how SMKC ERP database operations function
- how separately developed modules must be prepared for low-conflict future merge

If a separate module cannot convincingly pass as something originally built inside the current SMKC ERP shell, it is not compatible enough yet.
