# Greetely / Employee Recognition Dashboard

A modern, role-based Employee Recognition & Rewards Management Platform built with Next.js 16 (App Router), React 19, TypeScript, Redux Toolkit, and Tailwind CSS.

## 🚀 Features

- **Multi-Role Access Control**:
  - **Super Admin**: Platform-wide management, organization management, and system metrics.
  - **Organization Admin**: Department & employee management, recognition programs, rewards catalog, and support ticket management.
  - **Department Admin**: Department-level oversight and team recognition tracking.
  - **User (Employee)**: Give and receive peer-to-peer recognitions, claim rewards, and submit support requests.
- **Employee Recognition System**: Interactive peer-to-peer and manager-to-employee recognition workflows with previews and customizable templates.
- **Rewards & Claim Management**: Catalogs for rewards, claiming workflows, and request status tracking.
- **Modern UI/UX**: Built with Tailwind CSS v4, Radix UI / Shadcn UI components, Framer Motion animations, and Lucide React icons.
- **State Management**: Redux Toolkit integrated with Redux Persist for persistent client-side state.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **UI & Styling**: [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/), [Framer Motion](https://www.framer.com/motion/)
- **State Management**: [@reduxjs/toolkit](https://redux-toolkit.js.org/), `redux-persist`
- **Data Table & Forms**: [@tanstack/react-table](https://tanstack.com/table/v8), `react-hook-form`, `zod`
- **HTTP Client**: `axios`
- **Notifications**: `sonner`, `react-toastify`
- **Icons**: `lucide-react`

## 📦 Project Structure

```text
src/
├── app/                  # Next.js App Router pages and layouts
│   └── (dashboards)/     # Dynamic & role-based dashboard routes ([orgSlug], super-admin, user)
├── components/           # Reusable UI components (buttons, tables, modals, layout)
├── config/               # App configuration files
├── hooks/                # Custom React hooks
├── lib/                  # Library configurations & helper functions
├── modules/              # Core feature modules
│   ├── auth/             # Authentication & authorization module
│   ├── super-admin/      # Super Admin management screens
│   ├── org-admin/        # Organization Admin management screens
│   ├── dept-admin/       # Department Admin views
│   └── user/             # Employee dashboard, recognitions, rewards
├── providers/            # React context & state providers
├── redux/                # Redux store, slices, and API services
├── services/             # API services & HTTP integration
├── types/                # TypeScript type definitions
└── utils/                # Utility & helper scripts
```

## ⚙️ Getting Started

### Prerequisites

- **Node.js**: `v18.x` or higher
- **npm** / **yarn** / **pnpm** / **bun**

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/greetely-llc/greetely-dashboard.git
   cd greetely-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and configure the required API endpoints.

### Running Development Server

Run the development server on port `3010`:

```bash
npm run dev
```

Open [http://localhost:3010](http://localhost:3010) in your browser to view the dashboard.

### Available Scripts

- `npm run dev` - Runs Next.js dev server with Turbopack on port 3010
- `npm run build` - Creates an optimized production build
- `npm run start` - Runs the production server on port 3010
- `npm run lint` - Runs ESLint code check

## 📜 License

Greetely Private Repository - All rights reserved.
