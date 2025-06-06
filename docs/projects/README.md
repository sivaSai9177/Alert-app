# 📁 Project-Specific Documentation

This directory contains documentation for specific projects built using the starter kit. Each project should have its own subdirectory.

## 📋 Project Structure Template

When starting a new project, create a directory with this structure:

```
projects/
└── [project-name]/
    ├── PRD.md                    # Product Requirements Document
    ├── architecture/
    │   ├── system-design.md      # Overall architecture
    │   ├── database-schema.md    # Data models
    │   └── api-design.md         # API specifications
    ├── modules/
    │   └── [module-name].md      # Module specifications
    ├── tasks/
    │   ├── backlog.md           # Task backlog
    │   ├── current-sprint.md    # Active tasks
    │   └── completed.md         # Done tasks
    ├── progress/
    │   ├── daily-updates.md     # Daily progress
    │   ├── sprint-reports.md    # Sprint summaries
    │   └── metrics.md           # Project metrics
    └── testing/
        ├── test-plan.md         # Testing strategy
        ├── test-cases.md        # Test scenarios
        └── bug-reports.md       # Issue tracking
```

## 🚀 Starting a New Project

### 1. Create PRD
Use this template for your Product Requirements Document:

```markdown
# Project: [Project Name]

## 1. Executive Summary
Brief overview of the project

## 2. Problem Statement
What problem does this solve?

## 3. Target Users
- Primary User: Description
- Secondary User: Description

## 4. Core Features
### Feature 1: [Name]
- Description
- User Stories
- Acceptance Criteria

### Feature 2: [Name]
- Description
- User Stories
- Acceptance Criteria

## 5. Technical Requirements
- Platforms: iOS, Android, Web
- Authentication: Methods required
- Integrations: External services
- Performance: Requirements

## 6. UI/UX Requirements
- Design System: Custom or starter kit
- Accessibility: WCAG compliance
- Responsive: Mobile, tablet, desktop

## 7. Success Metrics
- KPI 1: Description
- KPI 2: Description

## 8. Timeline
- Phase 1: MVP (X weeks)
- Phase 2: Enhanced (X weeks)
- Phase 3: Polish (X weeks)

## 9. Constraints
- Budget: Limitations
- Technical: Constraints
- Business: Requirements
```

### 2. Initialize Project
```bash
# Create project directory
mkdir -p docs/projects/your-project-name

# Copy PRD
cp your-prd.md docs/projects/your-project-name/PRD.md

# Initialize structure
cd docs/projects/your-project-name
mkdir -p architecture modules tasks progress testing
```

### 3. Start Multi-Agent Workflow
```
Manager, initialize project from PRD at docs/projects/your-project-name/PRD.md
```

## 📊 Project Examples

### Example Projects
- `healthcare-app/` - Hospital management system
- `ecommerce-platform/` - Online marketplace
- `social-network/` - Community platform

## 🔧 Best Practices

1. **Keep PRD Updated**: As requirements change, update the PRD
2. **Track Everything**: Document all decisions and changes
3. **Regular Reports**: Update progress daily
4. **Test Early**: Create test plans with features
5. **Modular Design**: Break into independent modules

---

*Each project should maintain its own documentation separate from the starter kit docs.*