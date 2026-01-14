# 🤖 Claude Code Workflow Guide

## Overview

This document outlines the sequential workflow for developing features using Claude Code as the single development agent. This approach ensures consistency, quality, and comprehensive implementation.

## 🎯 Core Principles

1. **Sequential Execution**: One task at a time, completed thoroughly
2. **Documentation First**: Document before implementing
3. **Test Driven**: Write tests alongside features
4. **Performance Aware**: Consider performance from the start
5. **Security Minded**: Security is not an afterthought

## 📋 Standard Workflow

### 1. Task Analysis Phase
```
- Understand the requirement fully
- Break down into subtasks
- Identify dependencies
- Estimate complexity
```

### 2. Documentation Phase
```
- Create/update relevant documentation
- Define interfaces and contracts
- Document design decisions
- Update CLAUDE.md if needed
```

### 3. Implementation Phase
```
- Write clean, typed code
- Follow existing patterns
- Implement error handling
- Add logging where appropriate
```

### 4. Testing Phase
```
- Write unit tests
- Add integration tests if needed
- Manual testing checklist
- Performance verification
```

### 5. Optimization Phase
```
- Apply React 19 optimizations
- Check bundle size impact
- Verify cross-platform compatibility
- Ensure accessibility
```

### 6. Documentation Update
```
- Update component docs
- Add usage examples
- Update migration guides
- Record in CLAUDE.md
```

## 🛠️ Task Categories

### 🎨 UI/Component Development
1. Check universal component library first
2. Ensure theme integration
3. Test on all platforms (iOS, Android, Web)
4. Add to component documentation
5. Include examples

### 🔐 Authentication Features
1. Security review first
2. Follow Better Auth patterns
3. Update auth documentation
4. Test edge cases
5. Add audit logging

### 📊 Data Management
1. Type-safe with tRPC
2. Optimistic updates where appropriate
3. Error handling and recovery
4. Cache management with TanStack Query
5. Loading and error states

### 🚀 Performance Features
1. Measure baseline first
2. Apply React 19 hooks
3. Monitor bundle size
4. Test on low-end devices
5. Document improvements

### 📱 Platform-Specific Features
1. Identify platform differences
2. Create unified API when possible
3. Document platform limitations
4. Test thoroughly on each platform
5. Provide fallbacks

## 📝 Task Template

```markdown
## Task: [Feature Name]

### Objective
Clear description of what needs to be built

### Requirements
- [ ] Requirement 1
- [ ] Requirement 2
- [ ] Requirement 3

### Implementation Plan
1. Step 1: [Description]
2. Step 2: [Description]
3. Step 3: [Description]

### Testing Strategy
- Unit tests for [components/functions]
- Integration tests for [flows]
- Manual testing on [platforms]

### Documentation Updates
- [ ] Component docs
- [ ] Usage examples
- [ ] Migration guide
- [ ] CLAUDE.md

### Success Criteria
- [ ] All tests passing
- [ ] No performance regression
- [ ] Works on all platforms
- [ ] Documentation complete
```

## 🔄 Continuous Improvement

### After Each Task
1. Update CLAUDE.md with learnings
2. Refactor if patterns emerge
3. Update documentation
4. Consider reusable abstractions
5. Share knowledge in docs

### Weekly Review
1. Review completed tasks
2. Identify common patterns
3. Update starter kit template
4. Improve workflows
5. Update documentation

## 💡 Best Practices

### Code Quality
- TypeScript for everything
- Consistent naming conventions
- Small, focused functions
- Comprehensive error handling
- Meaningful variable names

### Documentation
- Clear and concise
- Include examples
- Explain the "why"
- Keep up to date
- Use diagrams when helpful

### Testing
- Test behavior, not implementation
- Cover edge cases
- Performance benchmarks
- Cross-platform testing
- Accessibility testing

### Communication
- Clear task descriptions
- Update status regularly
- Document blockers
- Share learnings
- Ask for clarification

## 🚦 Quality Gates

Before marking a task complete:

- [ ] Code follows project conventions
- [ ] All tests passing
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] Performance verified
- [ ] Security reviewed
- [ ] Accessibility checked
- [ ] Cross-platform tested

## 📊 Progress Tracking

Use the TodoWrite tool to:
1. Create tasks with clear descriptions
2. Update status as you progress
3. Mark complete only when all criteria met
4. Add new tasks as discovered

## 🎯 Current Focus Areas

1. **Production Infrastructure**: Logging, monitoring, CI/CD
2. **Advanced Features**: Real-time, offline, push notifications
3. **Developer Experience**: Better examples, interactive docs
4. **Performance**: Further optimizations, benchmarks
5. **Security**: Advanced auth, compliance

---

*This workflow ensures consistent, high-quality development of the modern starter kit using Claude Code as the single development agent.*