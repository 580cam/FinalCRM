name: "Base PRP Template v2 - Context-Rich with Validation Loops"
description: |

## Purpose
Template optimized for AI agents to implement features with sufficient context and self-validation capabilities to achieve working code through iterative refinement.

## Core Principles
1. **Context is King**: Include ALL necessary documentation, examples, and caveats
2. **Validation Loops**: Provide executable tests/lints the AI can run and fix
3. **Information Dense**: Use keywords and patterns from the codebase
4. **Progressive Success**: Start simple, validate, then enhance
5. **Global rules**: Be sure to follow all rules in CLAUDE.md

---

## Goal
[What needs to be built - be specific about the end state and desires]

## Why
- [Business value and user impact]
- [Integration with existing features]
- [Problems this solves and for whom]

## What
[User-visible behavior and technical requirements]

### Success Criteria
- [ ] [Specific measurable outcomes]

## All Needed Context

### Documentation & References (list all context needed to implement the feature)
```yaml
# MUST READ - Include these in your context window
- url: [Official API docs URL]
  why: [Specific sections/methods you'll need]
  
- file: [path/to/example.py]
  why: [Pattern to follow, gotchas to avoid]
  
- doc: [Library documentation URL] 
  section: [Specific section about common pitfalls]
  critical: [Key insight that prevents common errors]

- docfile: [PRPs/ai_docs/file.md]
  why: [docs that the user has pasted in to the project]

```

### Current Codebase tree (run `tree` in the root of the project) to get an overview of the codebase
```bash

```

### Desired Codebase tree with files to be added and responsibility of file
```bash

```

### Known Gotchas of our codebase & Library Quirks
```typescript
// CRITICAL: [Library name] requires [specific setup]
// Example: Next.js 14 App Router requires async Server Components
// Example: Supabase client requires different initialization for server vs client
// Example: We use TypeScript strict mode and Tailwind CSS
// Example: Shared business logic must be in packages/shared/ for monorepo consistency
```

## Implementation Blueprint

### Data models and structure

Create the core data models and TypeScript interfaces to ensure type safety and consistency.
```typescript
Examples: 
 - Supabase database types
 - TypeScript interfaces and types  
 - Zod schemas for validation
 - React component prop types
 - API request/response types

```

### list of tasks to be completed to fullfill the PRP in the order they should be completed

```yaml
Task 1:
MODIFY packages/shared/types/index.ts:
  - FIND pattern: "export interface ExistingType"
  - INJECT after existing interfaces
  - PRESERVE existing type structure

CREATE packages/shared/api/new-feature.ts:
  - MIRROR pattern from: packages/shared/api/similar-feature.ts
  - MODIFY function names and core logic
  - KEEP error handling pattern identical

CREATE packages/crm-web/app/new-feature/page.tsx:
  - MIRROR pattern from: packages/crm-web/app/existing-page/page.tsx
  - MODIFY component logic for new feature
  - KEEP layout and navigation structure

...(...)

Task N:
...

```


### Per task pseudocode as needed added to each task
```typescript

// Task 1
// Pseudocode with CRITICAL details dont write entire code
async function newFeature(param: string): Promise<Result> {
    // PATTERN: Always validate input first (see packages/shared/utils/validation.ts)
    const validated = validateInput(param); // throws ValidationError
    
    // GOTCHA: Supabase requires proper client initialization
    const supabase = createClient(); // see packages/shared/supabase/client.ts
    
    // PATTERN: Use existing error handling
    try {
        // CRITICAL: Row Level Security must be enabled
        const { data, error } = await supabase
            .from('table_name')
            .select('*')
            .eq('param', validated);
        
        if (error) throw error;
        
        // PATTERN: Standardized response format  
        return formatResponse(data); // see packages/shared/utils/responses.ts
    } catch (error) {
        // PATTERN: Consistent error handling
        return handleError(error); // see packages/shared/utils/errors.ts
    }
}
```

### Integration Points
```yaml
DATABASE:
  - migration: "Add column 'feature_enabled' to users table via Supabase migration"
  - index: "CREATE INDEX idx_feature_lookup ON users(feature_id)"
  - RLS: "Enable Row Level Security policies for new table"
  
TYPES:
  - add to: packages/shared/types/database.ts
  - pattern: "export interface NewFeatureType { ... }"
  
ROUTES:
  - add to: packages/crm-web/app/api/new-feature/route.ts  
  - pattern: "export async function GET/POST/PUT/DELETE"
  
COMPONENTS:
  - add to: packages/shared/components/
  - pattern: "Mirror existing component structure and props"
```

## Validation Loop

### Level 1: Syntax & Style
```bash
# Run these FIRST - fix any errors before proceeding
npm run lint --fix                   # Auto-fix ESLint errors
npm run type-check                   # TypeScript type checking

# Expected: No errors. If errors, READ the error and fix.
```

### Level 2: Unit Tests each new feature/file/function use existing test patterns
```typescript
// CREATE __tests__/new-feature.test.tsx with these test cases:
describe('NewFeature', () => {
  test('renders correctly with valid props', () => {
    const result = render(<NewFeature prop="valid_input" />);
    expect(result.getByText('Expected Text')).toBeInTheDocument();
  });

  test('handles validation errors', () => {
    expect(() => {
      validateInput("");
    }).toThrow('ValidationError');
  });

  test('handles API errors gracefully', async () => {
    // Mock Supabase client
    vi.mocked(supabase).mockResolvedValueOnce({ data: null, error: new Error('API Error') });
    
    const result = await newFeature("valid");
    expect(result.status).toBe("error");
    expect(result.message).toContain("API Error");
  });
});
```

```bash
# Run and iterate until passing:
npm test new-feature
# If failing: Read error, understand root cause, fix code, re-run (never mock to pass)
```

### Level 3: Integration Test
```bash
# Start the development server
npm run dev

# Test the API endpoint
curl -X POST http://localhost:3000/api/new-feature \
  -H "Content-Type: application/json" \
  -d '{"param": "test_value"}'

# Expected: {"status": "success", "data": {...}}
# If error: Check browser dev tools and terminal for error logs

# Test the UI component
# Navigate to http://localhost:3000/new-feature in browser
# Verify component renders and functions work correctly
```

## Final validation Checklist
- [ ] All tests pass: `npm test`
- [ ] No linting errors: `npm run lint`
- [ ] No type errors: `npm run type-check`
- [ ] Build succeeds: `npm run build`
- [ ] Manual test successful: [specific curl/browser test]
- [ ] Error cases handled gracefully  
- [ ] Console logs are informative but not verbose
- [ ] Documentation updated if needed

---

## Anti-Patterns to Avoid
- ❌ Don't create new patterns when existing ones work
- ❌ Don't skip validation because "it should work"  
- ❌ Don't ignore failing tests - fix them
- ❌ Don't mix server and client components incorrectly in Next.js
- ❌ Don't hardcode values that should be environment variables
- ❌ Don't catch all errors - be specific with error types
- ❌ Don't put business logic in UI components - keep it in shared packages
- ❌ Don't skip TypeScript types - always define proper interfaces