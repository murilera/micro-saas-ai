This is a [Next.js](https://nextjs.org) project that implements a complete micro‑SaaS for **managing user API keys** with authentication, including:

- User authentication (signup/login) with session management
- A landing page with login form
- A full CRUD UI for API keys (scoped per user)
- API key validation and protected routes
- API playground for testing keys
- Auto-hiding sidebar navigation
- Supabase‑backed storage for users and API keys

## 1. Prerequisites

- **Node.js** 18+ (or the version recommended by Next.js 16)
- A **Supabase** project (`https://supabase.com`)
- Package manager: `npm` (used in examples below)

## 2. Clone & Install

```bash
git clone <this-repo-url>
cd micro-saas-ai
npm install
```

## 3. Supabase Setup (Database)

1. **Create a Supabase project**
   - Go to the Supabase dashboard
   - Create a new project (or use an existing one)

2. **Create the database tables**
   - In the Supabase UI, go to **SQL Editor** → **New query**
   - Run these SQL queries in order:

   **First, create the `app_users` table:**

   ```sql
   create table public.app_users (
     id uuid primary key default gen_random_uuid(),
     username text not null unique,
     password_hash text not null,
     created_at timestamptz not null default now()
   );
   ```

   **Then, create the `api_keys` table with user relationship:**

   ```sql
   create table public.api_keys (
     id uuid primary key default gen_random_uuid(),
     user_id uuid not null references public.app_users(id) on delete cascade,
     name text not null,
     description text,
     key text not null,
     is_active boolean not null default true,
     created_at timestamptz not null default now(),
     last_used timestamptz
   );

   -- Create index for faster queries
   create index idx_api_keys_user_id on public.api_keys(user_id);
   ```

3. (Optional but recommended) **Configure RLS policies**
   - For a simple demo, you can keep RLS disabled.
   - For production, add row‑level security policies appropriate to your auth model.

## 4. Environment Variables

In the root of the project, create a `.env.local` file:

```bash
touch .env.local
```

Add your Supabase credentials (from the Supabase project settings → API):

```bash
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Then restart your dev server after changing env vars.

## 5. Project Structure (Key Files)

### Pages

- `app/page.tsx`  
  Landing page with login form. Server component that redirects logged-in users to dashboard.

- `app/components/LoginForm.tsx`  
  Client component for the login form with authentication handling.

- `app/signup/page.tsx`  
  Signup page. Server component that redirects logged-in users to dashboard.

- `app/components/SignupForm.tsx`  
  Client component for the signup form with user creation.

- `app/dashboards/page.tsx`  
  Server component that checks authentication and loads user's API keys.

- `app/dashboards/DashboardClient.tsx`  
  **Client UI** for managing API keys:
  - List all keys (scoped to logged-in user)
  - Search/filter with pagination
  - Create / Edit / Delete
  - Activate / Deactivate
  - Copy key, show/hide masked key
  - Page size selector (5, 10, 20, 50 per page)

- `app/playground/page.tsx`  
  API playground page for validating API keys.

- `app/protected/page.tsx`  
  Protected page that requires valid API key session.

- `app/components/Sidebar.tsx`  
  Auto-hiding sidebar with navigation and user info.

### API Routes

- `app/api/users/route.ts`  
  **POST** `/api/users` – create a new user account

- `app/api/auth/login/route.ts`  
  **POST** `/api/auth/login` – authenticate user and create session

- `app/api/auth/logout/route.ts`  
  **POST** `/api/auth/logout` – clear user session

- `app/api/auth/me/route.ts`  
  **GET** `/api/auth/me` – get current logged-in user info

- `app/api/api-keys/route.ts`  
  **GET** `/api/api-keys` – list all keys for current user (reads from Supabase)  
  **POST** `/api/api-keys` – create a new key for current user (writes to Supabase)

- `app/api/api-keys/[id]/route.ts`  
  **PATCH** `/api/api-keys/:id` – update name/description/key/status (user-scoped)  
  **DELETE** `/api/api-keys/:id` – delete a key (user-scoped)

- `app/api/validate-key/route.ts`  
  **POST** `/api/validate-key` – validate an API key and create protected session

### Utilities

- `lib/supabaseClient.ts`  
  Shared Supabase client using `@supabase/supabase-js` and the env vars above.

## 6. How the Application Works

### Authentication Flow

1. **User Signup** (`/signup`):
   - User fills out signup form (username, password, confirm password)
   - On submit, calls `POST /api/users`
   - Password is hashed with bcryptjs
   - User session cookie is set automatically
   - Redirects to `/dashboards`

2. **User Login** (`/`):
   - User enters username and password
   - On submit, calls `POST /api/auth/login`
   - Password is verified against stored hash
   - User session cookie is set
   - Redirects to `/dashboards`

3. **Session Management**:
   - All protected routes check for `user_session` cookie
   - If missing, user is redirected to login page
   - Sidebar displays current user info from `/api/auth/me`

### API Keys CRUD Flow

1. The user opens `/dashboards` (protected route).
2. Server component checks authentication and loads user's API keys from Supabase.
3. When creating/updating a key:
   - The UI opens a modal.
   - On submit, it calls:
     - `POST /api/api-keys` for a new key (automatically scoped to user), or
     - `PATCH /api/api-keys/:id` for an existing key (with ownership verification).
   - The response is used to update React state so the UI stays in sync.
4. When deleting a key:
   - The UI confirms via `window.confirm`.
   - Calls `DELETE /api/api-keys/:id` (with ownership verification).
   - On success, removes the key from state.
5. Activating/deactivating a key:
   - Calls `PATCH /api/api-keys/:id` with `isActive`.
   - Updates local state and shows a toast.

### API Key Validation Flow

1. User goes to `/playground` page.
2. Enters an API key in the form.
3. On submit, calls `POST /api/validate-key`.
4. If valid and active:
   - Sets `api_key_session` cookie
   - Shows success toast
   - Redirects to `/protected` page
5. If invalid:
   - Shows error toast
   - Stays on playground page

### Dashboard Features

- Toast notifications for success/error/info
- Search + count of filtered vs total keys
- Pagination with configurable page size (5, 10, 20, 50)
- Masked display of keys with show/hide + copy actions
- All operations are scoped to the logged-in user

## 7. Running the App Locally

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Available Routes

- **Home/Login**: `/` - Login page (redirects to dashboard if already logged in)
- **Signup**: `/signup` - Create new account (redirects to dashboard if already logged in)
- **API Keys Dashboard**: `/dashboards` - Manage your API keys (requires authentication)
- **API Playground**: `/playground` - Test and validate API keys
- **Protected Page**: `/protected` - Protected resource (requires valid API key session)

### Features

- **User Authentication**: Signup, login, logout with session management
- **User-Scoped API Keys**: Each user only sees and manages their own API keys
- **Pagination**: Navigate through API keys with configurable page sizes
- **Search & Filter**: Find API keys by name, description, or key value
- **Auto-Hiding Sidebar**: Sidebar appears on hover near left edge
- **Protected Routes**: Both user authentication and API key validation
- **Toast Notifications**: Visual feedback for all actions

You can customize the UI by editing:
- `app/page.tsx` and `app/components/LoginForm.tsx` for the landing page
- `app/signup/page.tsx` and `app/components/SignupForm.tsx` for signup
- `app/dashboards/DashboardClient.tsx` for the dashboard experience
- `app/components/Sidebar.tsx` for navigation

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
