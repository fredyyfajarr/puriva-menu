```text
                    .__               
______  __ _________|__|__  _______   
\____ \|  |  \_  __ \  \  \/ /\__  \  
|  |_> >  |  /|  | \/  |\   /  / __ \_
|   __/|____/ |__|  |__| \_/  (____  /
|__|                               \/ 
```

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="NextJS" />
  <img src="https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=3ECF8E" alt="Supabase" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
</div>

## 📑 Table of Contents
- [About The Project](#about-the-project)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Contributing](#contributing)
- [License / Copyright](#license--copyright)

## 🚀 About The Project

**Puriva Menu** is a sleek, highly responsive digital menu and catalog management platform designed to elevate the modern dining or service experience. By offering a digital-first approach to presenting items, descriptions, and pricing, this application allows customers to intuitively browse offerings via beautiful, fluid interfaces built on top of Next.js 16 and React 19.

The backbone of Puriva Menu is powered by Supabase, enabling robust backend-as-a-service functionalities including instantaneous database queries via `@supabase/ssr` and reliable schema validations utilizing `zod`. Furthermore, the integration of Framer Motion (via `motion`) ensures that every page transition and interaction feels premium, snappy, and perfectly polished.

## ✨ Key Features
- **Dynamic Digital Catalog**: A fast, deeply optimized front-end enabling users to browse menus and categories instantly without page reloads.
- **Server-Side Data Sync**: Implements `@supabase/ssr` for pristine server-side rendering and secure data hydration directly to the client.
- **Premium Fluid Animations**: Employs `motion` for physics-based, 60fps UI animations that guide user interactions seamlessly.
- **Robust Type Safety & Validation**: Zod validators paired closely with TypeScript interfaces ensure absolute runtime and compile-time data integrity.
- **Modern Utility Styling**: Designed completely with Tailwind CSS v4 to guarantee high maintainability and consistent design language across all components.

## 🛠 Tech Stack
- **Framework:** Next.js (16.x)
- **Library:** React (19.x)
- **Database & Auth:** Supabase / `@supabase/ssr`
- **Styling:** Tailwind CSS (v4)
- **Animations:** Motion
- **Validation:** Zod

## 📂 Project Structure
```text
puriva-menu/
├── src/                  # Core application components and Next.js App Router
├── supabase/             # Supabase schema definitions and local config
├── public/               # Public assets and graphical resources
├── next.config.ts        # Next.js architectural configurations
├── eslint.config.mjs     # Strict linting configurations
└── package.json          # Project automation scripts and dependencies
```

## 🏁 Getting Started

### Prerequisites
- **Node.js**: v18.x or newer
- **npm**: v9.x or newer

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/fredyyfajarr/puriva-menu.git
   ```
2. Navigate into the directory:
   ```bash
   cd puriva-menu
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```
4. Setup environment configurations by copying `.env.example` (if provided) or manually linking your Supabase credentials to `.env.local`.

## 💻 Usage

To run the application locally in development mode:

```bash
npm run dev
```

You can view the digital menu interface by visiting `http://localhost:3000`. To ensure type safety before deployment, use:

```bash
npm run typecheck
```

For production builds:
```bash
npm run build
npm run start
```

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License / Copyright

Copyright &copy; 2026 Fredy Fajar Adi Putra. All Rights Reserved.
