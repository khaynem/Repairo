# REPAIRO

**A Web-Based Platform for Reporting Damaged Items with Integrated Repair Service Matching**

---

## Lightweight Data Fetching Layer

Simple, environment-driven service + hooks for clean, reusable data access.

```
src/
	constants/api.js          # BASE_URL + endpoint map
	services/requestService.js # Generic fetch wrapper (get/post/put/delete)
	hooks/useApi.js           # Reusable data fetching hook
	hooks/useAuth.js          # Auth actions (login/register/logout)
	hooks/useAssignedJobs.js  # Example domain hook (technician jobs)
```

### Examples

Generic fetch:

```jsx
import { useApi } from "@/src/hooks/useApi";
const { data, loading, error } = useApi({ endpoint: "/repairs" });
```

Auth:

```jsx
import { useAuth } from "@/src/hooks/useAuth";
const { login, register, logout, user } = useAuth();
```

Assigned jobs with fallback:

```jsx
import useAssignedJobs from "@/src/hooks/useAssignedJobs";
const { data, fallback } = useAssignedJobs();
const assigned = data?.length ? data : fallback;
```

### Configure API Base URL

Add to `.env.local` (optional):

```
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
```

Falls back to `http://localhost:3001`.

### Extend

1. Add paths in `constants/api.js`.
2. Compose `useApi` in new domain hooks (e.g. `useRepairHistory`).
3. Replace placeholder auth simulation with real backend.

### Error Handling

Non-2xx responses throw an Error (`error.status`, `error.data`). Show fallback UI easily.

### Why

Centralized endpoints, testable hooks, no duplication, minimal state handling.

---

## Members:

- Mon, Catherine I.
- Ong, Vincent David P.

**BSIT 3A**
