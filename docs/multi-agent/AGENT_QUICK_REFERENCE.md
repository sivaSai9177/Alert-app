# 🎯 Agent Quick Reference Cards

*Version: 2.0.0 | Last Updated: June 6, 2025*

## 🎼 Manager Agent Quick Reference

### Primary Role
Orchestrates all development activities, manages tasks, and ensures project delivery.

### Top 10 Commands
```bash
1. Manager, process PRD at [path]
2. Manager, start daily standup
3. Manager, show sprint progress
4. Manager, assign task [ID] to [Agent]
5. Manager, show project status
6. Manager, identify bottlenecks
7. Manager, create pull request for task [ID]
8. Manager, prepare build for [platform]
9. Manager, generate sprint report
10. Manager, notify user: [message]
```

### Sub-Agents Managed
- **Git Agent**: Version control operations
- **DevOps Agent**: CI/CD and infrastructure
- **EAS Agent**: Mobile app builds and distribution

### Key Responsibilities
- ✅ PRD analysis and task generation
- ✅ Sprint planning and tracking
- ✅ Agent coordination
- ✅ Quality gate enforcement
- ✅ Stakeholder communication

---

## 🔧 Backend Developer Agent Quick Reference

### Primary Role
Implements server-side logic, APIs, database operations, and ensures backend quality.

### Top 10 Commands
```bash
1. Backend Developer, implement API endpoint for [feature]
2. Backend Developer, create schema for [entity]
3. Backend Developer, add authentication to [endpoint]
4. Backend Developer, optimize query for [operation]
5. Backend Developer, generate migration for [change]
6. Backend Developer, write unit tests for [service]
7. Backend Developer, add caching to [operation]
8. Backend Developer, implement rate limiting for [endpoint]
9. Backend Developer, create service for [domain]
10. Backend Developer, document API endpoint [name]
```

### Specializations
- **Database**: Schema design, migrations, optimization
- **Security**: Authentication, authorization, encryption
- **Performance**: Caching, query optimization, scaling

### Key Technologies
- tRPC for type-safe APIs
- Drizzle ORM for database
- Better Auth for authentication
- Zod for validation
- PostgreSQL database

---

## 🎨 Frontend Developer Agent Quick Reference

### Primary Role
Creates user interfaces, implements client-side logic, and ensures excellent UX.

### Top 10 Commands
```bash
1. Frontend Developer, create screen for [feature]
2. Frontend Developer, create component [name]
3. Frontend Developer, integrate API endpoint [name]
4. Frontend Developer, make [screen] responsive
5. Frontend Developer, add loading states to [screen]
6. Frontend Developer, implement state for [feature]
7. Frontend Developer, add animations to [interaction]
8. Frontend Developer, create form for [feature]
9. Frontend Developer, implement dark mode for [screen]
10. Frontend Developer, optimize component performance
```

### Platform Specializations
- **iOS**: Native features, gestures, widgets
- **Android**: Material design, back button, notifications
- **Web**: SEO, PWA features, web-specific optimizations

### Key Technologies
- React Native + Expo
- Universal Design System
- TanStack Query
- Zustand state management
- NativeWind styling

---

## 🧪 Tester Agent Quick Reference

### Primary Role
Ensures quality through comprehensive testing, bug tracking, and performance validation.

### Top 10 Commands
```bash
1. Tester, create test plan for [feature]
2. Tester, write unit tests for [component]
3. Tester, run E2E test for [user flow]
4. Tester, report bug in [component]
5. Tester, test API integration for [feature]
6. Tester, run load test for [endpoint]
7. Tester, verify bug fix for [BUG-ID]
8. Tester, test cross-platform compatibility
9. Tester, check accessibility compliance
10. Tester, generate test coverage report
```

### Testing Types
- **Unit**: Component and function testing
- **Integration**: API and service testing
- **E2E**: User flow testing
- **Performance**: Load and stress testing
- **Security**: Vulnerability testing

### Quality Metrics
- Code coverage target: 80%+
- Performance benchmarks
- Accessibility standards: WCAG 2.1 AA
- Security compliance checks

---

## 🔀 Git Agent Quick Reference (Sub-agent)

### Primary Role
Manages version control, branching strategies, and code collaboration.

### Top 5 Commands
```bash
1. Git Agent, create feature branch [name]
2. Git Agent, create pull request
3. Git Agent, merge branch [name] to [target]
4. Git Agent, create release tag [version]
5. Git Agent, resolve merge conflicts
```

### Branching Strategy
- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: New features
- `hotfix/*`: Emergency fixes
- `release/*`: Release preparation

---

## 📦 EAS Build Agent Quick Reference (Sub-agent)

### Primary Role
Handles Expo Application Services builds, submissions, and distributions.

### Top 5 Commands
```bash
1. EAS Agent, build iOS preview
2. EAS Agent, build Android production
3. EAS Agent, submit to TestFlight
4. EAS Agent, distribute to internal testers
5. EAS Agent, update OTA
```

### Build Profiles
- **development**: Local testing
- **preview**: Internal testing
- **production**: Store submission

---

## 🚀 DevOps Agent Quick Reference (Sub-agent)

### Primary Role
Manages CI/CD pipelines, infrastructure, and deployment processes.

### Top 5 Commands
```bash
1. DevOps Agent, deploy to staging
2. DevOps Agent, setup CI pipeline
3. DevOps Agent, configure monitoring
4. DevOps Agent, build Docker images
5. DevOps Agent, rollback deployment
```

### Environments
- **development**: Local Docker
- **staging**: Pre-production testing
- **production**: Live environment

---

## 📊 Common Workflows

### Daily Development Flow
```bash
# Morning
Manager, start daily standup
→ All agents report status
→ Manager assigns tasks

# During Day
[Agent], update task progress
[Agent], request code review
[Agent], report blocker

# End of Day
Manager, collect progress updates
Manager, generate daily summary
```

### Feature Development Flow
```bash
# 1. Task Assignment
Manager, assign task [ID] to Backend Developer

# 2. Backend Implementation
Backend Developer, implement API endpoint for [feature]
Backend Developer, write unit tests for [service]

# 3. Frontend Implementation
Frontend Developer, create screen for [feature]
Frontend Developer, integrate API endpoint [name]

# 4. Testing
Tester, create test plan for [feature]
Tester, run E2E test for [user flow]

# 5. Deployment
Git Agent, create pull request
Manager, review and merge
DevOps Agent, deploy to staging
```

### Bug Fix Flow
```bash
# 1. Bug Report
Tester, report bug in [component]

# 2. Assignment
Manager, assign bug [BUG-ID] to [Developer]

# 3. Fix Implementation
[Developer], fix bug [BUG-ID]
[Developer], write test to prevent regression

# 4. Verification
Tester, verify bug fix for [BUG-ID]

# 5. Deployment
Git Agent, create hotfix branch [issue]
Manager, merge hotfix to production
```

---

## 💡 Pro Tips

### For Manager
- Start each day with standup
- Review sprint progress mid-week
- Keep blockers list updated
- Communicate progress to stakeholders

### For Backend Developer
- Always write tests first (TDD)
- Use transactions for data integrity
- Implement proper error handling
- Document API changes immediately

### For Frontend Developer
- Use Universal Design System components
- Test on all platforms regularly
- Implement loading and error states
- Follow responsive design principles

### For Tester
- Create comprehensive test plans
- Automate repetitive tests
- Report bugs with reproduction steps
- Track quality metrics continuously

---

*Keep this reference handy for quick command lookup during development!*