# Mock → API Migration (Dashboard, NotasFiscais, Manifestação)

## Goal
Replace mock data in `useStore.ts` with real API calls for 3 modules. Keep stores as state managers but feed them from services.

## Context
- `api.ts` already configured (axios, token interceptor, error handling)
- `dashboard.service.ts` exists (timeline + integrity), but no `getStats()` — to add
- `useStore.ts` has ~270 lines of mock data feeding 5 stores
- Stores to migrate: `useDashboardStore` (stats+charts), `useNotasStore` (notas+filtros), `useTagsStore` (tags CRUD)
- Types in `src/types/index.ts` already match backend shape
- `useNotificacoesStore` and `useUIStore` stay as-is (not API-backed yet)

## Tasks

- [ ] **1. Create `notas-fiscais.service.ts`** — API layer
  - `getNotas(filters)` → `GET /notas-fiscais` with query params, returns `{ data, meta }`
  - `getNota(id)` → `GET /notas-fiscais/:id`
  - `downloadXml(id)` → `GET /notas-fiscais/:id/xml` (blob)
  - `importXml(file)` → `POST /notas-fiscais/importar` (multipart, with upload progress)
  - `importLote(files)` → `POST /notas-fiscais/importar-lote`
  - `softDelete(id)` → `DELETE /notas-fiscais/:id`
  - `assignTags(id, tagIds)` → `POST /notas-fiscais/:id/tags`
  - `removeTag(id, tagId)` → `DELETE /notas-fiscais/:id/tags/:tagId`
  - `manifestar(id, dto)` → `POST /notas-fiscais/:id/manifestar`
  - `getManifestacoes(id)` → `GET /notas-fiscais/:id/manifestacoes`
  - Verify: files compile, no TS errors

- [ ] **2. Create `tags.service.ts`** — API layer
  - `getTags()` → `GET /tags`
  - `createTag(dto)` → `POST /tags`
  - `updateTag(id, dto)` → `PATCH /tags/:id`
  - `deleteTag(id)` → `DELETE /tags/:id`
  - Verify: file compiles

- [ ] **3. Extend `dashboard.service.ts`** — add `getStats(periodo)`
  - `getStats(periodo)` → `GET /dashboard/stats?periodo=30d`
  - Verify: file compiles

- [ ] **4. Rewrite `useNotasStore`** — remove mock, add API fetch
  - Remove `mockNotasFiscais` array
  - Add `fetchNotas(filters)` action using `notasFiscaisService.getNotas()`
  - Add `meta: { total, hasMore, nextCursor }` state
  - Change `filtrarNotas()` from client-side filter to API refetch
  - Keep `notaSelecionada`, `notasSelecionadas` UI state untouched
  - Add `loading` / `error` states
  - Verify: store compiles, Dashboard/NotasFiscais sections still import correctly

- [ ] **5. Rewrite `useDashboardStore`** — remove mock, real API
  - Remove `mockDasboardStats`, `mockGrafico*` references
  - `refreshStats()` calls `dashboardService.getStats(periodo)` for stats
  - Keep timeline/integrity calls (already real)
  - Add skeleton-safe defaults (zeros) instead of mock data
  - Verify: Dashboard section still renders with loading states

- [ ] **6. Rewrite `useTagsStore`** — remove mock, API-backed CRUD
  - Remove `mockTags` array
  - `fetchTags()` → `tagsService.getTags()`, sets state
  - `addTag()`, `updateTag()`, `removeTag()` call service then update state
  - Verify: NotasFiscais tag filter still works

- [ ] **7. Edit `Dashboard.tsx`** — loading skeletons + real data
  - Call `refreshStats()` on mount via `useEffect`
  - Add skeleton components for stat cards and charts while `isLoading`
  - Remove hardcoded fallbacks to mock values
  - Verify: page shows skeletons → loads real data or shows error

- [ ] **8. Edit `NotasFiscais.tsx`** — server-side filtering + pagination
  - Replace client-side `filtrarNotas()` with `fetchNotas(filters)` on filter change
  - Implement cursor-based pagination (nextCursor → load more / prev page)
  - `handleDownload` uses `notasFiscaisService.downloadXml()`
  - `handleManifestacao` uses `notasFiscaisService.manifestar()`
  - XML import dialog uses `notasFiscaisService.importXml()` with progress
  - Verify: filters trigger API calls, pagination works, XML download works

- [ ] **9. Edit `Manifestacao.tsx`** — real API actions
  - `confirmManifestacao()` calls `notasFiscaisService.manifestar(id, dto)`
  - Add loading states to action buttons
  - Refresh nota list after manifestação
  - Verify: manifestação actions call API, toast on success/error

- [ ] **10. Remove mock data from `useStore.ts`**
  - Delete: `mockEmpresa`, `mockUsuarios`, `mockNotasFiscais`, `mockDasboardStats`, `mockNotificacoes`, `mockTags`, `mockGrafico*`
  - Keep: `useNotificacoesStore`, `useUIStore` (not migrated yet), type imports
  - Verify: `npm run build` passes, no broken imports

## Done When
- [ ] `npm run build` — zero errors
- [ ] Dashboard loads real stats from API (or shows skeleton → error if API down)
- [ ] NotasFiscais filters send query params to backend, pagination uses cursor
- [ ] Manifestação actions hit real API endpoint
- [ ] Tags CRUD works via API
- [ ] `useStore.ts` has zero mock data arrays (only UI/notification stores remain)

## Notes
- `useNotificacoesStore` stays mock for now (no notification API yet)
- `useUIStore` stays as-is (client-only state, persist to localStorage)
- Error boundary component not yet created — handled via toast for now
- Upload progress requires `axios.post` with `onUploadProgress` config
