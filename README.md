# Kitchen Equipment Management Application

A role-based web application for tracking kitchen equipment across multiple sites. Built as a take-home technical assessment.

---

## 1. Summary

This app lets restaurant/franchise administrators manage their kitchen equipment (fridges, ovens, freezers, etc.) across one or more physical locations ("Sites"). Two roles exist:

- **Admin** — manages their own Sites and Equipment.
- **SuperAdmin** — has full visibility and management access across every Admin's Sites, Equipment, and User accounts.

The core relationships:

- A User can have many Sites and many pieces of Equipment.
- A Site belongs to exactly one User, and can hold many Equipment.
- A piece of Equipment belongs to exactly one User, and can be linked to at most one Site at a time (enforced at the database level, not just in application code).

**Stack:** Laravel 11 (API-only backend) + React (Vite) frontend, MySQL, Tailwind CSS, fully dockerized (LEMP: nginx + php-fpm + MySQL).

---

## 2. Features

### Core requirements (as specified)
- Login / Signup, with Login gating access to the Admin area
- Admin screen with role-conditional navigation (Users menu is SuperAdmin-only)
- User Maintenance — list, edit, delete (SuperAdmin only)
- Site Maintenance — list, add, edit, delete, with an "Edit Site Equipment" panel to assign/unassign equipment
- Equipment Maintenance — list, add, edit, delete
- Logout returns to the Login screen
- All ownership and cascade rules from the spec (see Design Decisions below for how each was interpreted)

### Additional features added beyond the spec
- **Table filtering** — client-side search/filter on the Users, Sites, and Equipment tables, so records can be found quickly without pagination.
- **Dashboard counters** — the Admin landing page shows live counts of the current user's Sites and Equipment records.
- **Automated test suite** — a PHPUnit feature test suite covering authentication, role-based access, equipment assignment rules, and cascade-delete behavior (see [Running Tests](#5-running-tests) below).
- **Styled admin dashboard UI** — a deliberately designed interface (not default framework styling) using a slate/teal color scheme and a legible, dashboard-appropriate typeface, rather than an unstyled or default Bootstrap/Tailwind look.

---

## 3. Design Decisions

### Why Laravel Sanctum (SPA/cookie auth) instead of issuing API tokens
The frontend and backend are a first-party pairing — one team building both, not a public API meant for third-party consumption. Sanctum's SPA mode uses secure, httpOnly session cookies rather than a token the frontend has to store and manually attach to every request. This avoids the main risk of token-based auth for a same-origin SPA — a token sitting in localStorage or JS-readable storage is vulnerable to XSS-based theft, whereas an httpOnly cookie is not accessible to JavaScript at all. Sanctum's SPA mode is also what Laravel's own documentation recommends specifically for this "one frontend, one backend, same team" scenario; token-based auth (via `createToken()`) is a separate Sanctum feature intended for mobile apps or genuine third-party API consumers, which this app is not.

### Why API Resources (`UserResource`, `SiteResource`, `EquipmentResource`)
Returning Eloquent models directly from controllers would expose every column, including `password` (even hashed, it has no reason to ever leave the server) and internal timestamps not needed by the frontend. API Resources give a single, explicit, versionable place to define exactly what shape the API returns, decoupling the API's public contract from the database schema — a column can be renamed or added to the `users` table without silently changing the API response.

### Why native Laravel Policies instead of a package like `spatie/laravel-permission`
This app has exactly two fixed roles (`admin`, `superadmin`) stored as a single enum column — not a dynamic, many-to-many system where roles and granular permissions are assigned and revoked at runtime. Spatie's package is built for that more complex case (multiple roles per user, custom permission sets managed through an admin UI). Introducing it here would add a dependency, extra database tables, and a learning curve for a reviewer, all to solve a problem this app doesn't have. Laravel's built-in Policies express the actual rule needed — "SuperAdmin, OR the resource's owner" — in a few lines per model, with zero extra dependencies, and are the idiomatic first-party solution the Laravel documentation itself recommends before reaching for a package.

### Why the `UNIQUE` constraint on `registered_equipment.equipment_id`
The business rule "an Equipment can only have one Site" needs to be enforced somewhere. Enforcing it only in application code (checking "is this already assigned?" before every insert) leaves a race-condition window and depends on every code path remembering to check. A database-level `UNIQUE` constraint makes the rule impossible to violate, regardless of which code path attempts it — it is the single source of truth for that rule, and the application-level check exists only to return a clean error message instead of a raw database exception.

### Why cascade deletes differ between User and Site
- **Deleting a User** cascades to delete their Sites, Equipment, and any Site–Equipment links — confirmed explicitly by the employer ("deleting a user deletes all data under it").
- **Deleting a Site** removes only the Site–Equipment *link* row; the Equipment itself survives, unassigned — also explicitly confirmed ("won't delete the orphaned equipment but unlinks them").

Both behaviors are implemented via `onDelete('cascade')` on the relevant foreign keys at the migration level, rather than in application code, so the guarantee holds even for a direct database operation, not just requests that go through the API.

### Why the equipment-assignment scope is "the site's owner," not strictly "the logged-in user"
The requirements state equipment assignment is limited to equipment "the logged in user has created." Taken literally, this would mean SuperAdmin could only attach their *own* equipment to any site — including sites belonging to other Admins, which doesn't reflect a coherent inventory model (a SuperAdmin's own kitchen equipment appearing at an Admin's restaurant location makes no sense operationally). This was interpreted as scoped to **the site's owner** instead, so SuperAdmin can help set up or manage an Admin's site using that Admin's own equipment, without being able to inject unrelated equipment into someone else's inventory. For an Admin acting on their own site, this produces identical behavior to the literal reading, since they are always both the site's owner and the logged-in user — the interpretation only changes behavior in the SuperAdmin-assisting case.

### Why Laravel API + React SPA, rather than Blade views or Inertia
A separate API and SPA is the standard, widely-recognized architecture for this pairing of technologies, keeps the backend fully decoupled and independently testable (as shown by the feature test suite, which never touches the frontend), and matches the assessment's explicit instruction to use a "modern JavaScript UI library" for the frontend.

### Why Tailwind CSS with a custom design system, not default component styling
An unstyled or default-framework-styled interface reads as unfinished. A small, deliberate design system — a slate/teal color palette (teal reserved for primary actions only, so it stays meaningful), Public Sans for legibility in dense tabular UI, and JetBrains Mono reserved specifically for serial numbers/IDs — signals attention to the end-user experience without the time cost of a full custom component library.

### Why Docker Compose (LEMP)
A single `docker compose up --build` reproduces the entire environment — nginx, PHP-FPM, MySQL, and the frontend dev server — identically regardless of the reviewer's local PHP/Node/MySQL versions, removing "works on my machine" as a possible failure point during evaluation.

---

## 4. Setup Instructions

### Prerequisites
- Docker + Docker Compose

### Steps

```bash
git clone <this-repository-url>
cd kitchen-equipment-app

docker compose up -d --build

docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate --seed
```

Visit the app at **http://localhost:5173**
API base URL: **http://localhost:8000**

### Seeded test accounts

| Role | Username | Password |
|---|---|---|
| SuperAdmin | `superadmin` | `password` |
| Admin | `demoadmin` | `password` |

---

## 5. Running Tests

The test files in this submission are provided separately from the main app folders (see `backend-additions/` if delivered that way, or already merged into `backend/tests` and `backend/database/factories`).

If the test database driver needs setup, the simplest option is SQLite in-memory (no separate database needed):

1. Add `RUN apt-get install -y libsqlite3-dev && docker-php-ext-install pdo_sqlite` to `docker/php/Dockerfile`, then rebuild: `docker compose up -d --build`
2. In `backend/phpunit.xml`, ensure these are set (Laravel's default file already includes them, sometimes commented out):
   ```xml
   <env name="DB_CONNECTION" value="sqlite"/>
   <env name="DB_DATABASE" value=":memory:"/>
   ```
3. Run the suite:
   ```bash
   docker compose exec app php artisan test
   ```

Test coverage included:
- **AuthTest** — registration forces the `admin` role regardless of client input, login success/failure
- **RoleAccessTest** — Admin blocked from `/api/users`, SuperAdmin allowed, Admin sees only their own Sites, SuperAdmin sees all, Admin cannot delete another Admin's Site
- **EquipmentAssignmentTest** — the one-equipment-one-site rule holds under the `UNIQUE` constraint, equipment can only be assigned by the site's owner, SuperAdmin can assign an owner's equipment on their behalf, deleting a Site unlinks (not deletes) its Equipment
- **UserDeletionTest** — deleting a User cascades to their Sites/Equipment, an Admin cannot delete another user

---

## 6. Assumptions Made

Where the requirements were silent or ambiguous, the following choices were made (each also noted inline above where relevant):

- **Login field:** Sign-in uses `user_name`, not `email`, matching the ERD's field naming.
- **Signup role:** Every new signup is assigned `Admin`; the first `SuperAdmin` is created via a database seeder.
- **Equipment assignment scope:** Scoped to the site's owner rather than strictly the logged-in user (see Design Decisions above) — this only changes behavior for SuperAdmin acting on another user's site.
- **Admin's menu:** Shows only Sites, Equipments, and Logout — the Users item is omitted entirely for Admins rather than shown in a disabled state.
- **User role editing:** SuperAdmin can change another user's role via the Edit User form. This wasn't explicitly confirmed by the employer; it was included as a reasonable default for a User Maintenance screen and can be removed if the employer prefers a stricter reading of the spec.
- **Site "Active" flag:** Currently a display-only flag with no enforced behavioral effect (e.g., it does not block equipment assignment on an inactive site). Noted as a possible future enhancement below.
- **Deletes:** All deletes are permanent (hard deletes), not soft deletes, since the spec did not request delete history/recovery.

---

## 7. Future Enhancements

Given more time, the following would be reasonable next steps:

- **Pagination** on the Users, Sites, and Equipment tables, for datasets larger than a page.
- **Server-side search**, to complement the current client-side filter once record counts grow beyond what's practical to filter in the browser.
- **Enforce "Active" site behavior** — e.g., block new equipment assignment to an inactive site, if that's the intended meaning of the flag.
- **Soft deletes** with a restore option, particularly for Equipment, so accidental deletions aren't unrecoverable.
- **Audit logging** of who assigned/unassigned equipment and when, useful in a multi-admin environment.
- **E2E tests** (e.g., Playwright/Cypress) covering the full login → manage → logout flow through the actual UI, complementing the current backend feature test suite.
- **CI pipeline** (GitHub Actions) to run the test suite automatically on every push.
- **Rate limiting tuning** on the login endpoint specifically, beyond Laravel's default API throttle.