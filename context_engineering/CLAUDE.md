### 🔄 Project Awareness & Context
- **Always read `PLANNING.md`** at the start of a new conversation to understand the project's architecture, goals, style, and constraints.
- **Check `TASK.md`** before starting a new task. If the task isn't listed, add it with a brief description and today's date.
- **Use consistent naming conventions, file structure, and architecture patterns** as described in `PLANNING.md`.
- **Use proper Next.js project structure** with app router organization and follow TypeScript best practices.

### 🧱 Code Structure & Modularity
- **Never create a file longer than 500 lines of code.** If a file approaches this limit, refactor by splitting it into modules or helper files.
- **Organize code into clearly separated modules**, grouped by feature or responsibility.
  For CRM components this looks like:
    - `app/(auth)/login/page.tsx` - Login page with Supabase Auth integration
    - `app/(auth)/signup/page.tsx` - Signup page with email/Google options
    - `components/header/Header.tsx` - Main header with navigation elements
    - `components/sidebar/Sidebar.tsx` - Navigation sidebar component
- **Use clear, consistent imports** (prefer absolute imports with `@/` prefix).
- **Use NextJS environment variables** with proper typing for environment configuration.

### 🧪 Testing & Reliability
- **Always create Jest/React Testing Library tests** for new components and hooks.
- **After updating any logic**, check whether existing unit tests need to be updated. If so, do it.
- **Tests should live alongside components** using the `__tests__` folder pattern.
  - Include at least:
    - 1 test for expected rendering and functionality
    - 1 test for user interactions (e.g., form submission)
    - 1 test for error states (e.g., form validation errors)

### ✅ Task Completion
- **Mark completed tasks in `TASK.md`** immediately after finishing them.
- Add new sub-tasks or TODOs discovered during development to `TASK.md` under a "Discovered During Work" section.
- **CRITICAL: Push to git after every major change** - This includes new features, bug fixes, refactoring, or any significant code modifications. Version control is essential for tracking progress and preventing work loss.

### 📎 Code Style & Structure
- **Write concise, technical TypeScript code** with accurate examples.
- **Use functional and declarative programming patterns**; avoid classes.
- **Prefer iteration and modularization** over code duplication.
- **Use descriptive variable names** with auxiliary verbs (e.g., `isLoading`, `hasError`).
- Structure repository files as follows:
  - **`components/`**: Shared components across pages or modals
  - **`app/`**: Where actual pages are stored
  - **`api/`**: Where API routes are stored
  - **`lib/`**: Where shared utilities are stored
  - **`types/`**: Where types are shared (mainly using Supabase)

### 🔎 MCP Servers
- **Ref MCP**:
  - A ModelContextProtocol server that provides access to documentation for APIs, libraries, and services
  - Use this tool when you need to search for technical documentation or code snippets
  - **When to use**:
    - When working with unfamiliar libraries or APIs in the CRM project
    - When you need accurate, up-to-date documentation for Supabase, NextJS, or other project dependencies
    - When you need to minimize context usage while still getting relevant documentation
  
  - **Key tools**:
    ```typescript
    // Search for documentation
    ref_search_documentation({
      query: "Supabase realtime subscription TypeScript example"
    });
    
    // Read content from a URL
    ref_read_url({
      url: "https://supabase.com/docs/guides/realtime/subscribe-to-realtime-changes"
    });
    ```
  
  - **Benefits**:
    - Finds exactly the context needed with minimum tokens
    - Filters search results to avoid repetition
    - Fetches only the relevant parts of documentation pages
    - Improves response quality by reducing context bloat

- **Exa MCP**:
  - A powerful web search API integrated through Model Context Protocol for real-time information gathering
  - Use this tool for broad web searches, research, and finding current information beyond documentation
  - **When to use**:
    - When you need current market information, competitor analysis, or industry trends for the CRM
    - When researching best practices, examples, or solutions that aren't in specific documentation
    - When gathering general information about business processes, moving industry standards, or customer service approaches
    - When you need to find multiple sources or perspectives on a topic
  
  - **Key tools**:
    ```typescript
    // General web search for current information
    web_search_exa({
      query: "CRM lead management best practices 2025"
    });
    
    // Research academic papers and studies
    research_paper_search({
      query: "customer relationship management effectiveness studies"
    });
    
    // Company and competitor research
    company_research({
      query: "moving company CRM software solutions"
    });
    
    // LinkedIn search for industry professionals
    linkedin_search({
      query: "moving company customer service managers"
    });
    
    // GitHub search for code examples
    github_search({
      query: "NextJS CRM dashboard components"
    });
    
    // Wikipedia for foundational knowledge
    wikipedia_search_exa({
      query: "customer relationship management systems"
    });
    ```
  
  - **Benefits**:
    - Provides real-time, current information that documentation might not cover
    - Excellent for market research and competitive analysis
    - Helps find diverse examples and approaches from across the web
    - Complements Ref MCP by covering broader, less technical searches
  
  - **Usage Strategy**:
    - Use **Ref MCP** for specific technical documentation and API references
    - Use **Exa MCP** for market research, best practices, and general business knowledge
    - Combine both when you need technical implementation details AND current industry context

- **Supabase MCP**:
  - Direct integration between AI assistants and Supabase projects for comprehensive database management
  - Enables seamless database operations, project administration, and development workflows
  - **When to use**:
    - When managing Supabase projects, databases, or infrastructure
    - For schema migrations, data queries, and development branching
    - When debugging issues or monitoring application performance
    - For deploying Edge Functions or managing project resources
  
  - **Key tool categories**:
    ```typescript
    // Project Management
    list_projects(); // View all Supabase projects
    get_project({ id: "project-id" }); // Get project details
    create_project({ name: "new-project", organization_id: "org-id" });
    
    // Database Operations  
    list_tables({ project_id: "project-id", schemas: ["public"] });
    execute_sql({ project_id: "project-id", query: "SELECT * FROM leads" });
    apply_migration({ project_id: "project-id", name: "add_lead_status", query: "ALTER TABLE..." });
    generate_typescript_types({ project_id: "project-id" });
    
    // Development Tools
    get_project_url({ project_id: "project-id" });
    get_anon_key({ project_id: "project-id" });
    deploy_edge_function({ project_id: "project-id", name: "lead-processor", files: [...] });
    
    // Debugging & Monitoring
    get_logs({ project_id: "project-id", service: "api" });
    get_advisors({ project_id: "project-id", type: "security" });
    
    // Development Branches (requires paid plan)
    create_branch({ project_id: "project-id", name: "feature-branch" });
    merge_branch({ branch_id: "branch-id" });
    
    // Documentation Access
    search_docs({ graphql_query: `{ searchDocs(query: "realtime subscriptions") { nodes { title href content } } }` });
    ```
  
  - **Best practices**:
    - Use `apply_migration` for schema changes to ensure proper tracking
    - Use `execute_sql` for data queries and non-schema operations
    - Always confirm costs before creating new projects or branches
    - Use development branches for testing schema changes before production
    - Check advisors regularly for security vulnerabilities and performance issues
    - Use read-only mode when possible for safer operations

### 🛠️ Tech Stack

#### **Core Framework & Language**
- **NextJS 14** (Web application with App Router)
- **React 18** (Component library and hooks)
- **TypeScript** (Type safety across all platforms)
- **Expo** (Mobile development platform with Expo Router)
- **React Native** (Mobile UI components)

#### **Monorepo & Build Tools**
- **Turborepo** (Monorepo build system and task runner)
- **pnpm Workspaces** (Package management and workspace orchestration)
- **TypeScript Project References** (Cross-package type checking)
- **ESLint & Prettier** (Code quality and formatting across packages)

#### **Styling & UI Components**
- **Tailwind CSS** (Web styling)
- **NativeWind** (Tailwind for React Native)
- **Shadcn/UI** (Web component library)
- **React Native Elements/Paper** (Mobile component library)
- **Expo Vector Icons** (Cross-platform iconography)

#### **Backend & Database**
- **Supabase** (Database, authentication, real-time subscriptions, storage)
- **PostgreSQL** (Database engine via Supabase)
- **Row Level Security** (Database-level authorization)

#### **State Management & Data Flow**
- **Zustand** (Lightweight state management)
- **React Query/TanStack Query** (Server state management and caching)
- **Supabase Realtime** (Live data synchronization)

#### **Testing & Quality Assurance**
- **Jest** (Unit testing framework)
- **React Testing Library** (Component testing)
- **Detox** (Mobile end-to-end testing)
- **Storybook** (Component development and documentation)

#### **Data Visualization**
- **Tremor** (Web dashboard charts and analytics)
- **React Native Chart Kit** (Mobile data visualization)
- **Victory Native** (Advanced mobile charting)

### 🏗️ Project Architecture

**Cross-Platform Monorepo Structure**
This project uses a monorepo architecture designed for both web and mobile deployment:

```
packages/
├── shared/           # Core business logic (80%+ of codebase)
│   ├── api/         # Supabase clients & API integrations
│   ├── utils/       # Business utilities & calculations
│   ├── hooks/       # Shared React hooks
│   ├── stores/      # State management & real-time sync
│   └── types/       # TypeScript definitions
├── web/             # Next.js application (UI only)
├── mobile/          # Expo application (UI only)
└── components/      # Shared component logic
```

**Development Principles:**
- **Shared-First Development**: Always implement business logic in shared packages first
- **Platform UI Layers**: Web and mobile apps are thin UI layers consuming shared logic
- **Consistent Behavior**: Same validation, calculations, and data flow across all platforms
- **Real-Time Sync**: Supabase subscriptions work identically on web and mobile
- **Code Reuse**: 80%+ of codebase shared between platforms

**When building features:**
1. Implement business logic in `packages/shared/`
2. Create web UI in `packages/web/` using Next.js + Shadcn/UI
3. Create mobile UI in `packages/mobile/` using Expo + React Native
4. Ensure feature parity and consistent user experience

**Platform-Specific Considerations:**
- **Web**: Advanced reporting, complex data visualization, multi-window workflows
- **Mobile**: GPS integration, camera functionality, offline capability, voice input
- **Shared**: All business rules, API calls, data models, and real-time subscriptions

### 📝 Naming Conventions
- **Use lowercase with dashes** for directories (e.g., `components/form-wizard`).
- **Favor named exports** for components and utilities.
- **Use PascalCase** for component files (e.g., `VisaForm.tsx`).
- **Use camelCase** for utility files (e.g., `formValidator.ts`).

### 🔍 TypeScript Usage
- **Use TypeScript** for all code; prefer interfaces over types.
- **Avoid enums**; use const objects with 'as const' assertion.
- **Use functional components** with TypeScript interfaces.
- **Define strict types** for message passing between different parts of the application.
- **Use absolute imports** for all files `@/...`.
- **Avoid try/catch blocks** unless there's good reason to translate or handle error in that abstraction.
- **Use explicit return types** for all functions.

### 📚 Documentation & Explainability
- **Update `README.md`** when new features are added, dependencies change, or setup steps are modified.
- **Comment non-obvious code** and ensure everything is understandable to a mid-level developer.
- When writing complex logic, **add an inline `// Reason:` comment** explaining the why, not just the what.
- **Document authentication flows** for Supabase integration and role-based access control.
- **Create JSDoc comments** for utility functions and complex components.

### 🧠 AI Behavior Rules
- **Never assume missing context. Ask questions if uncertain.**
- **Never hallucinate libraries or functions** – only use known, verified React/NextJS/TypeScript packages.
- **Always confirm file paths and component names** exist before referencing them in code or tests.
- **Never delete or overwrite existing code** unless explicitly instructed to or if part of a task from `TASK.md`.
- **CRITICAL: Push to git after every major change** - This includes new features, bug fixes, refactoring, or any significant code modifications. Version control is essential for tracking progress and preventing work loss.
