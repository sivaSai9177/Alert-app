# 📁 Project Structure Tasks - Code Organization & Standards

## 📊 Module Status
- **Current Grade**: B+ (80% complete)
- **Target Grade**: A (100% complete)
- **Priority**: 🟠 High
- **Estimated Time**: 8 hours
- **Dependencies**: None (can be done in parallel)

## 🎯 Objective
Restructure the project to match the documented standards in README.md and EXPO_TRPC_BEST_PRACTICES.md, remove unused files, and establish proper code organization patterns.

## 🚨 Issues Identified
1. **Missing Route Groups**: No role-based routing structure
2. **Debug Files**: Production-ready code has debug/test endpoints
3. **Mixed Patterns**: Auth implementation mixing different paradigms
4. **Documentation Redundancy**: Multiple overlapping documentation files
5. **Component Organization**: Some components not following standards

## 📋 Task Breakdown

### **Task 1: Implement Role-Based Route Structure**
**Priority**: 🟠 High | **Time**: 3h | **Status**: ❌ Not Started

**Description**: Restructure app routes to match the documented role-based pattern from EXPO_TRPC_BEST_PRACTICES.md.

**Current Structure**:
```
app/
├── (auth)/          # ✅ Exists
├── (home)/          # ❌ Should be role-based
├── index.tsx        # ✅ Exists
└── _layout.tsx      # ✅ Exists
```

**Target Structure**:
```
app/
├── (auth)/                    # ✅ Keep existing
│   ├── login.tsx
│   ├── signup.tsx  
│   ├── complete-profile.tsx
│   ├── forgot-password.tsx
│   └── _layout.tsx
├── (roles)/                   # ❌ CREATE NEW
│   ├── _layout.tsx           # Role-based routing logic
│   ├── (operator)/           # Operator-specific routes
│   │   ├── dashboard.tsx
│   │   ├── create-alert.tsx
│   │   ├── alert-history.tsx
│   │   └── _layout.tsx
│   ├── (doctor)/             # Doctor-specific routes
│   │   ├── alerts/
│   │   │   ├── active.tsx
│   │   │   └── [alertId].tsx
│   │   ├── patients/
│   │   │   └── [patientId].tsx
│   │   └── _layout.tsx
│   ├── (nurse)/              # Nurse-specific routes
│   │   ├── tasks.tsx
│   │   ├── alerts/
│   │   │   ├── active.tsx
│   │   │   └── acknowledged.tsx
│   │   └── _layout.tsx
│   └── (admin)/              # Admin routes
│       ├── users/
│       │   ├── index.tsx
│       │   └── [userId].tsx
│       ├── analytics.tsx
│       └── _layout.tsx
├── (shared)/                  # ❌ CREATE NEW
│   ├── alert-detail/[id].tsx # Shared alert details
│   ├── profile.tsx           # User profile
│   └── settings.tsx          # App settings
├── index.tsx                  # ✅ Keep - role-based redirect
└── _layout.tsx               # ✅ Keep - root layout
```

**Implementation Steps**:

1. **Create Role-Based Route Groups**:
   ```typescript
   // app/(roles)/_layout.tsx
   export default function RolesLayout() {
     const { user, hasHydrated } = useAuth();
     
     if (!hasHydrated) return <LoadingScreen />;
     if (!user) return <Redirect href="/login" />;
     
     // Role-based routing
     const roleRoutes = {
       operator: '/(roles)/(operator)/dashboard',
       doctor: '/(roles)/(doctor)/alerts/active',  
       nurse: '/(roles)/(nurse)/tasks',
       head_doctor: '/(roles)/(doctor)/alerts/active',
       admin: '/(roles)/(admin)/users',
     };
     
     return <Redirect href={roleRoutes[user.role] || '/login'} />;
   }
   ```

2. **Migrate Existing Home Routes**:
   - Move `(home)/index.tsx` to appropriate role routes
   - Update navigation logic
   - Preserve existing functionality

3. **Create Shared Routes**:
   - Alert detail pages accessible by multiple roles
   - Profile and settings pages
   - Common UI components

**Acceptance Criteria**:
- [ ] Role-based route groups created and working
- [ ] Users redirected to appropriate dashboard based on role
- [ ] Shared routes accessible by authorized roles
- [ ] Navigation properly updated
- [ ] Deep linking works for all routes
- [ ] No broken links or 404 errors

**Files to Create**:
- `app/(roles)/_layout.tsx`
- `app/(roles)/(operator)/dashboard.tsx`
- `app/(roles)/(doctor)/alerts/active.tsx`
- `app/(roles)/(nurse)/tasks.tsx` 
- `app/(roles)/(admin)/users/index.tsx`
- `app/(shared)/profile.tsx`

**Files to Move/Modify**:
- `app/(home)/index.tsx` → Distribute to role-specific routes
- `app/index.tsx` - Update redirect logic

---

### **Task 2: Remove Debug and Test Files**
**Priority**: 🟠 High | **Time**: 1h | **Status**: ❌ Not Started

**Description**: Remove all debug endpoints and test files that shouldn't be in production.

**Files to Remove**:
```bash
# Debug API endpoints (NOT for production)
❌ app/api/auth/debug+api.ts
❌ app/api/auth/debug-redirect+api.ts  
❌ app/api/auth/debug-session+api.ts
❌ app/api/auth/test-auth+api.ts
❌ app/api/auth/test-db+api.ts
❌ app/api/auth/test-session+api.ts

# Debug components
❌ components/AuthDebugger.tsx

# Redundant documentation
❌ AUTH_IMPROVEMENTS.md
❌ WEB_LOGIN_FIX.md
❌ LOGIN_FIX_SUMMARY.md  
❌ test-auth-flow.md
❌ test-google-oauth.md

# Keep these for development
✅ __tests__/* (all test files)
✅ jest.config.js
✅ jest.setup.js
```

**Consolidation Plan**:
1. **Merge Documentation**:
   - Keep: README.md, EXPO_TRPC_BEST_PRACTICES.md, OPTIMIZED_AUTH_FLOW_GUIDE.md
   - Remove: Redundant auth-specific .md files
   - Archive: Move removed files to `docs/archive/` if needed

2. **Clean API Routes**:
   - Remove all debug endpoints
   - Keep only production endpoints
   - Update any references in code

**Acceptance Criteria**:
- [ ] All debug API endpoints removed
- [ ] Debug components removed
- [ ] Redundant documentation consolidated
- [ ] No broken references to removed files
- [ ] Production endpoints still working
- [ ] Development tools (tests) preserved

**Files to Remove**: (Listed above)

**Files to Check for References**:
- Any component importing AuthDebugger
- Any navigation to debug routes
- Documentation links to removed files

---

### **Task 3: Standardize Component Organization**
**Priority**: 🟡 Medium | **Time**: 2h | **Status**: ❌ Not Started

**Description**: Organize components according to the documented standards and ensure consistent patterns.

**Current Issues**:
- Some components in wrong directories
- Inconsistent naming patterns
- Missing component documentation

**Target Organization**:
```
components/
├── auth/                     # ✅ Good organization
│   ├── GoogleSignInButton.tsx
│   ├── ProtectedRoute.tsx
│   └── __tests__/
├── alerts/                   # ❌ CREATE for Phase 2
│   ├── AlertCard.tsx
│   ├── AlertList.tsx
│   └── AlertNotification.tsx
├── ui/                       # ✅ Keep existing structure
│   ├── Button.tsx
│   ├── Input.tsx
│   └── ...
├── shadcn/                   # ✅ Keep existing
│   └── ui/
└── examples/                 # ✅ Keep for reference
    └── TRPCExample.tsx
```

**Improvements Needed**:

1. **Component Documentation**:
   ```typescript
   /**
    * GoogleSignInButton - Handles Google OAuth authentication
    * 
    * @param onSuccess - Callback for successful authentication
    * @param onError - Callback for authentication errors
    * @param disabled - Whether button is disabled
    * 
    * @example
    * <GoogleSignInButton 
    *   onSuccess={(user) => console.log('Welcome', user.name)}
    *   onError={(error) => console.error('Auth failed', error)}
    * />
    */
   ```

2. **Consistent Export Patterns**:
   ```typescript
   // Use named exports for components
   export { GoogleSignInButton } from './GoogleSignInButton';
   export { ProtectedRoute } from './ProtectedRoute';
   
   // Avoid default exports unless single component per file
   ```

3. **Props Interface Standardization**:
   ```typescript
   interface GoogleSignInButtonProps {
     onSuccess: (user: User) => void;
     onError: (error: AuthError) => void;
     disabled?: boolean;
     variant?: 'primary' | 'secondary';
   }
   ```

**Acceptance Criteria**:
- [ ] All components properly documented with JSDoc
- [ ] Consistent export patterns throughout
- [ ] Props interfaces properly typed
- [ ] Components in appropriate directories
- [ ] No unused or orphaned components
- [ ] Component examples provided where helpful

**Files to Modify**:
- All component files for documentation
- `components/index.ts` for consistent exports
- Component prop interfaces

---

### **Task 4: Update Import/Export Patterns**
**Priority**: 🟡 Medium | **Time**: 2h | **Status**: ❌ Not Started

**Description**: Standardize import/export patterns throughout the codebase for better maintainability.

**Current Issues**:
- Mixed import patterns (default vs named)
- Long relative import paths
- No barrel exports

**Target Patterns**:

1. **Barrel Exports**:
   ```typescript
   // lib/index.ts
   export { authClient } from './auth-client';
   export { trpc } from './trpc';
   export { useAuth } from './stores/auth-store';
   
   // components/index.ts
   export { GoogleSignInButton } from './auth/GoogleSignInButton';
   export { ProtectedRoute } from './auth/ProtectedRoute';
   ```

2. **Consistent Import Style**:
   ```typescript
   // GOOD: Named imports with barrel exports
   import { authClient, trpc, useAuth } from '@/lib';
   import { GoogleSignInButton, ProtectedRoute } from '@/components';
   
   // AVOID: Long relative paths
   import { authClient } from '../../../lib/auth-client';
   ```

3. **Path Aliases**:
   ```typescript
   // tsconfig.json paths
   {
     "paths": {
       "@/*": ["./"],
       "@/components/*": ["./components/*"],
       "@/lib/*": ["./lib/*"],
       "@/hooks/*": ["./hooks/*"],
       "@/types/*": ["./types/*"]
     }
   }
   ```

**Implementation Steps**:

1. **Set Up Barrel Exports**:
   - Create index.ts files in major directories
   - Export commonly used items
   - Update imports throughout codebase

2. **Configure Path Aliases**:
   - Update tsconfig.json
   - Update Metro config for React Native
   - Update jest.config.js for tests

3. **Standardize Imports**:
   - Replace relative imports with aliases
   - Use named imports consistently
   - Group imports logically

**Acceptance Criteria**:
- [ ] Barrel exports created for all major directories
- [ ] Path aliases configured and working
- [ ] All imports use aliases instead of relative paths
- [ ] Import groups organized consistently
- [ ] No unused imports
- [ ] Build and tests work with new import patterns

**Files to Create**:
- `lib/index.ts`
- `components/index.ts`
- `hooks/index.ts`
- `types/index.ts`

**Files to Modify**:
- `tsconfig.json` - Add path aliases
- `metro.config.js` - Add resolver aliases
- All source files - Update import statements

---

## 🧪 Testing Requirements

### **Structure Validation**
- [ ] All routes accessible and working
- [ ] Role-based routing functions correctly
- [ ] Import/export patterns work in all environments
- [ ] No broken links or missing dependencies

### **Build Verification**
- [ ] TypeScript compilation succeeds
- [ ] Bundle builds without errors
- [ ] All platforms (iOS/Android/Web) work
- [ ] Performance not degraded

### **Navigation Testing**
- [ ] Deep linking works for new routes
- [ ] Role-based redirects function
- [ ] Shared routes accessible by appropriate roles
- [ ] Navigation state preserved

## 🔍 Quality Assurance

### **Code Quality Checks**
- [ ] ESLint passes with no errors
- [ ] Prettier formatting consistent
- [ ] TypeScript strict mode compliance
- [ ] No unused variables or imports

### **Documentation Quality**
- [ ] All components documented
- [ ] README.md updated with new structure
- [ ] Development guide updated
- [ ] API documentation current

### **Performance Verification**
- [ ] Bundle size not increased significantly
- [ ] Navigation performance maintained
- [ ] Memory usage stable
- [ ] No performance regressions

## 🚀 Implementation Order

1. **Task 2**: Remove debug files (cleanup first)
2. **Task 4**: Update import patterns (foundation)
3. **Task 1**: Implement role routes (main feature)
4. **Task 3**: Standardize components (polish)

## 📝 Documentation Updates

### **Files to Update**:
- [ ] README.md - Update project structure section
- [ ] Developer documentation - New routing patterns
- [ ] Component documentation - Usage examples
- [ ] API documentation - Updated import patterns

### **New Documentation**:
- [ ] Routing guide for role-based navigation
- [ ] Component development guidelines
- [ ] Import/export standards document

## 🎯 Success Criteria

### **Technical Success**
- [ ] All routes working and accessible
- [ ] Clean, organized codebase structure
- [ ] Consistent patterns throughout
- [ ] No production debug code
- [ ] Improved developer experience

### **Business Success**
- [ ] Role-based access working correctly
- [ ] Fast navigation between views
- [ ] Maintainable code structure
- [ ] Easy onboarding for new developers

## 📞 Support

**Questions/Issues**: Create issue with "project-structure" label
**Code Review**: Required for structural changes
**Testing**: Verify on all platforms before merge

---

**Next Steps**: Start with Task 2 (Remove debug files) for quick cleanup, then move to Task 4 (Import patterns) to establish foundation for the rest of the work.