# Sprint Plan: New Pages (Tasks 6-10)

> Tasks 1-5 ✅ already completed and pushed (main-layout, getAuthUser, /perfil, /configuracoes, /planos)

## Task 6: Page /contato
**Goal:** Contact page with form + contact info sidebar

### Steps
1. Create `app/contato/layout.tsx` using `MainLayout` + `getAuthUser`
2. Create `components/contact-form.tsx` as Client Component (`"use client"`)
   - Fields: name, email, subject, message
   - Submit handler logs form data (no real send yet — shows "Mensagem enviada!" toast or state)
3. Create `app/contato/page.tsx` as Server Component
   - Two-column layout: left = `<ContactForm />`, right = contact info sidebar (email, social, response time)

### Verification
- `npx tsc --noEmit` passes (no TS errors)
- File exists at app/contato/page.tsx

---

## Task 7: Page /marketplace
**Goal:** Grid of service cards — all "Em breve" placeholders

### Steps
1. Create `app/marketplace/layout.tsx` using `MainLayout` + `getAuthUser`
2. Create `app/marketplace/page.tsx` as Server Component
   - Header: "Marketplace" title + description
   - Grid of 6 service cards: Mentoria, Design, Dev, Marketing, Jurídico, Financeiro
   - Each card: icon, name, description, "Em breve" badge
   - Full-width banner at bottom: "Seja um parceiro" CTA (disabled)

### Verification
- `npx tsc --noEmit` passes

---

## Task 8: Page /ranking
**Goal:** Top projects by score, live data from Supabase

### Steps
1. Create `app/ranking/layout.tsx` using `MainLayout` + `getAuthUser`
2. Create `app/ranking/page.tsx` as Server Component
   - Query `supabase.from("projects").select("id, name, score").order("score", { ascending: false }).limit(10)`
   - Render ranked list: medal icon for top 3 (🥇🥈🥉 via lucide Trophy/Medal or emoji fallback), project name, score
   - Empty state if no projects

### Verification
- `npx tsc --noEmit` passes

---

## Task 9: Fix sidebar links
**Goal:** Update sidebar link targets to match new pages

### Steps
1. Read `FrontEnd/ideor/components/app-sidebar-p.tsx` (or app-sidebar.tsx — whichever has nav links)
2. Change `/profile` → `/perfil`
3. Change `/settings` → `/configuracoes`
4. Verify no other stale links (marketplace, ranking, planos, contato)

### Verification
- `npx tsc --noEmit` passes
- Links in sidebar file match new routes

---

## Task 10: Final push & smoke test
**Goal:** Push all changes and verify Vercel build

### Steps
1. Run `npx tsc --noEmit` across the whole project — fix any errors
2. `git add` only the new/modified files
3. `git commit -m "feat: add /contato, /marketplace, /ranking pages + fix sidebar links"`
4. `git push origin main`
5. Check Vercel dashboard or wait for build log — report result
