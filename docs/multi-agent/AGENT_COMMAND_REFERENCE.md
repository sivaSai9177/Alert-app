# 🤖 Complete Agent Command Reference

*Version: 2.0.0 | Last Updated: June 6, 2025*

## 📋 Overview

This document provides a comprehensive command reference for all agents in the multi-agent development system, including specialized sub-agents for specific tasks.

## 🎼 Manager Agent Commands

The Manager Agent orchestrates all other agents and handles high-level project management.

### Core Commands

```bash
# Project Initialization
Manager, process PRD at docs/projects/[name]/PRD.md
Manager, initialize project from PRD at [path]
Manager, create project structure for [project-name]
Manager, validate PRD at [path]

# Task Management
Manager, show current tasks
Manager, show sprint progress
Manager, assign task [TASK-ID] to [Agent]
Manager, reassign task [TASK-ID] to [Agent]
Manager, split task [TASK-ID] into subtasks
Manager, merge tasks [TASK-ID1] and [TASK-ID2]
Manager, prioritize task [TASK-ID] as [high|medium|low]
Manager, block task [TASK-ID] with reason "[reason]"
Manager, unblock task [TASK-ID]

# Sprint Management
Manager, start sprint [number]
Manager, end current sprint
Manager, plan next sprint
Manager, show sprint velocity
Manager, adjust sprint scope
Manager, generate sprint report

# Agent Coordination
Manager, start daily standup
Manager, get status from all agents
Manager, check agent availability
Manager, assign next task to [Agent]
Manager, balance workload
Manager, resolve conflict between [Agent1] and [Agent2]

# Progress Tracking
Manager, show project status
Manager, show completion percentage
Manager, estimate completion date
Manager, identify bottlenecks
Manager, show blocked tasks
Manager, show overdue tasks

# Quality Assurance
Manager, check code quality metrics
Manager, review task [TASK-ID]
Manager, approve task [TASK-ID]
Manager, request changes for task [TASK-ID]
Manager, enforce quality gates

# Reporting
Manager, generate daily report
Manager, generate weekly summary
Manager, generate sprint retrospective
Manager, create progress visualization
Manager, export metrics to [format]

# Git Operations (handled by Manager)
Manager, create branch for task [TASK-ID]
Manager, merge task [TASK-ID] to main
Manager, create pull request for task [TASK-ID]
Manager, review pull request [PR-ID]
Manager, tag release [version]
Manager, create hotfix branch for [issue]

# EAS/Build Operations (handled by Manager)
Manager, prepare build for [platform]
Manager, submit to EAS build
Manager, check build status
Manager, download build artifacts
Manager, distribute build to testers
Manager, submit to app store

# Communication
Manager, notify user: [message]
Manager, broadcast to all agents: [message]
Manager, schedule meeting for [topic]
Manager, create status update
Manager, escalate issue: [description]

# Ignore Files Management
Manager, update .gitignore for [pattern]
Manager, add to .gitignore: [files/folders]
Manager, update .easignore for [pattern]
Manager, add to .easignore: [files/folders]
Manager, update .dockerignore for [pattern]
Manager, create ignore file for [tool]
Manager, sync ignore files across project

# Environment Management
Manager, setup environment for [local|preview|development|staging|production]
Manager, switch to [environment] database
Manager, configure Neon DB for [environment]
Manager, setup local PostgreSQL with Docker
Manager, create environment file for [environment]
Manager, sync environment variables
Manager, validate environment configuration
Manager, show current environment
Manager, list all environments
```

### Advanced Commands

```bash
# Architecture & Design
Manager, design system architecture for [module]
Manager, create module dependency graph
Manager, identify reusable components
Manager, plan database schema
Manager, design API structure

# Resource Management
Manager, allocate resources for sprint
Manager, optimize agent utilization
Manager, identify skill gaps
Manager, request additional resources

# Risk Management
Manager, identify project risks
Manager, create mitigation plan for [risk]
Manager, assess technical debt
Manager, plan refactoring sprint

# Learning & Improvement
Manager, analyze sprint metrics
Manager, identify improvement areas
Manager, update best practices
Manager, create lessons learned document
```

## 🔧 Backend Developer Agent Commands

The Backend Developer handles all server-side implementation.

### Core Commands

```bash
# API Development
Backend Developer, implement API endpoint for [feature]
Backend Developer, create CRUD operations for [entity]
Backend Developer, add authentication to [endpoint]
Backend Developer, implement rate limiting for [endpoint]
Backend Developer, add caching to [operation]
Backend Developer, optimize query for [operation]

# Database Operations
Backend Developer, create schema for [entity]
Backend Developer, generate migration for [change]
Backend Developer, add indexes for [table]
Backend Developer, implement soft delete for [entity]
Backend Developer, create seed data for [entity]
Backend Developer, backup database

# tRPC Procedures
Backend Developer, create procedure for [operation]
Backend Developer, add input validation for [procedure]
Backend Developer, implement middleware for [requirement]
Backend Developer, add output validation for [procedure]
Backend Developer, create subscription for [event]

# Authentication & Authorization
Backend Developer, implement role-based access for [resource]
Backend Developer, add permission check for [operation]
Backend Developer, create auth strategy for [provider]
Backend Developer, implement session management
Backend Developer, add audit logging for [operation]

# Service Implementation
Backend Developer, create service for [domain]
Backend Developer, implement business logic for [feature]
Backend Developer, add error handling for [service]
Backend Developer, create job queue for [task]
Backend Developer, implement webhook for [event]

# Testing
Backend Developer, write unit tests for [service]
Backend Developer, create integration tests for [API]
Backend Developer, add performance tests for [endpoint]
Backend Developer, mock external service [name]
Backend Developer, create test fixtures for [entity]

# Documentation
Backend Developer, document API endpoint [name]
Backend Developer, create swagger spec for [API]
Backend Developer, write migration guide
Backend Developer, document service architecture
Backend Developer, create API usage examples
```

### Specialized Sub-Commands

```bash
# Database Specialist Commands
Backend Developer, optimize database performance
Backend Developer, analyze query execution plan
Backend Developer, implement database partitioning
Backend Developer, setup database replication
Backend Developer, create database backup strategy

# Security Specialist Commands
Backend Developer, perform security audit
Backend Developer, implement OWASP best practices
Backend Developer, add input sanitization
Backend Developer, implement encryption for [field]
Backend Developer, create security headers

# Performance Specialist Commands
Backend Developer, profile API performance
Backend Developer, implement caching strategy
Backend Developer, optimize N+1 queries
Backend Developer, add request batching
Backend Developer, implement lazy loading
```

## 🎨 Frontend Developer Agent Commands

The Frontend Developer handles all client-side implementation.

### Core Commands

```bash
# Screen Development
Frontend Developer, create screen for [feature]
Frontend Developer, implement navigation for [flow]
Frontend Developer, add loading states to [screen]
Frontend Developer, add error handling to [screen]
Frontend Developer, make [screen] responsive
Frontend Developer, add animations to [interaction]

# Component Development
Frontend Developer, create component [name]
Frontend Developer, make component reusable
Frontend Developer, add props validation to [component]
Frontend Developer, implement component variants
Frontend Developer, add accessibility to [component]
Frontend Developer, optimize component performance

# State Management
Frontend Developer, implement state for [feature]
Frontend Developer, add store for [domain]
Frontend Developer, connect component to store
Frontend Developer, implement optimistic updates
Frontend Developer, add state persistence
Frontend Developer, implement state hydration

# API Integration
Frontend Developer, integrate API endpoint [name]
Frontend Developer, add loading state for API call
Frontend Developer, implement error recovery
Frontend Developer, add retry logic
Frontend Developer, implement offline support
Frontend Developer, cache API response

# Styling & Theming
Frontend Developer, implement dark mode for [screen]
Frontend Developer, add responsive styles
Frontend Developer, create style variants
Frontend Developer, implement theme switching
Frontend Developer, add custom animations
Frontend Developer, optimize style performance

# Form Handling
Frontend Developer, create form for [feature]
Frontend Developer, add validation to form
Frontend Developer, implement multi-step form
Frontend Developer, add file upload to form
Frontend Developer, create dynamic form fields
Frontend Developer, implement form autosave

# Testing
Frontend Developer, write component tests
Frontend Developer, add snapshot tests
Frontend Developer, create interaction tests
Frontend Developer, test responsive behavior
Frontend Developer, add accessibility tests
Frontend Developer, create visual regression tests
```

### Platform-Specific Commands

```bash
# iOS Specific
Frontend Developer, implement iOS-specific feature [name]
Frontend Developer, add iOS gesture handling
Frontend Developer, optimize for iOS performance
Frontend Developer, implement iOS widgets
Frontend Developer, add iOS notifications

# Android Specific
Frontend Developer, implement Android-specific feature [name]
Frontend Developer, add Android back button handling
Frontend Developer, optimize for Android performance
Frontend Developer, implement Android widgets
Frontend Developer, add Android notifications

# Web Specific
Frontend Developer, implement web-specific feature [name]
Frontend Developer, add SEO optimization
Frontend Developer, implement PWA features
Frontend Developer, add web analytics
Frontend Developer, optimize for web performance
```

## 🧪 Tester Agent Commands

The Tester Agent ensures quality through comprehensive testing.

### Core Commands

```bash
# Test Planning
Tester, create test plan for [feature]
Tester, identify test scenarios for [module]
Tester, prioritize test cases
Tester, estimate testing effort
Tester, create test data set

# Unit Testing
Tester, write unit tests for [component]
Tester, test edge cases for [function]
Tester, mock dependencies for [test]
Tester, achieve coverage target for [module]
Tester, fix failing unit tests

# Integration Testing
Tester, test API integration for [feature]
Tester, test database operations
Tester, test third-party integrations
Tester, test service communication
Tester, verify data flow

# E2E Testing
Tester, create E2E test for [user flow]
Tester, test cross-platform compatibility
Tester, test offline scenarios
Tester, test error scenarios
Tester, test performance under load

# Manual Testing
Tester, perform exploratory testing
Tester, test user experience
Tester, verify visual design
Tester, test accessibility compliance
Tester, perform usability testing

# Bug Management
Tester, report bug in [component]
Tester, verify bug fix for [BUG-ID]
Tester, categorize bugs by severity
Tester, create bug reproduction steps
Tester, track bug resolution

# Performance Testing
Tester, run load test for [endpoint]
Tester, test response times
Tester, identify memory leaks
Tester, test battery usage
Tester, profile rendering performance

# Security Testing
Tester, test authentication flows
Tester, test authorization rules
Tester, test input validation
Tester, test for vulnerabilities
Tester, verify data encryption
```

### Specialized Testing Commands

```bash
# Accessibility Testing
Tester, test screen reader compatibility
Tester, verify WCAG compliance
Tester, test keyboard navigation
Tester, check color contrast
Tester, test touch target sizes

# Localization Testing
Tester, test language switching
Tester, verify translations
Tester, test RTL layout
Tester, check date/time formats
Tester, test currency displays

# Device Testing
Tester, test on iOS devices
Tester, test on Android devices
Tester, test on tablets
Tester, test on different screen sizes
Tester, test on slow devices
```

## 🔄 Sub-Agent Specialists

### Git Agent (Sub-agent of Manager)

```bash
# Repository Management
Git Agent, initialize repository
Git Agent, create .gitignore
Git Agent, setup branch protection
Git Agent, configure git hooks
Git Agent, setup CI/CD workflows

# Branching
Git Agent, create feature branch [name]
Git Agent, create release branch [version]
Git Agent, create hotfix branch [issue]
Git Agent, merge branch [name] to [target]
Git Agent, delete merged branches

# Commits
Git Agent, commit changes with message "[message]"
Git Agent, amend last commit
Git Agent, squash commits in [branch]
Git Agent, cherry-pick commit [hash]
Git Agent, revert commit [hash]

# Collaboration
Git Agent, create pull request
Git Agent, review pull request [PR-ID]
Git Agent, resolve merge conflicts
Git Agent, update PR description
Git Agent, merge pull request [PR-ID]

# Tagging & Releases
Git Agent, create tag [version]
Git Agent, create release notes
Git Agent, prepare changelog
Git Agent, create release branch
Git Agent, finalize release [version]

# Ignore Files Management
Git Agent, update .gitignore
Git Agent, add pattern to .gitignore: [pattern]
Git Agent, remove pattern from .gitignore: [pattern]
Git Agent, create .gitignore from template: [language/framework]
Git Agent, check ignored files status
Git Agent, clean ignored files from repo
```

### DevOps Agent (Sub-agent of Manager)

```bash
# CI/CD Pipeline
DevOps Agent, setup CI pipeline
DevOps Agent, configure build steps
DevOps Agent, add test automation
DevOps Agent, setup deployment pipeline
DevOps Agent, configure environment variables

# Docker Management
DevOps Agent, build Docker images
DevOps Agent, push images to registry
DevOps Agent, update docker-compose
DevOps Agent, optimize Dockerfile
DevOps Agent, setup container orchestration

# Deployment
DevOps Agent, deploy to staging
DevOps Agent, deploy to production
DevOps Agent, rollback deployment
DevOps Agent, configure auto-scaling
DevOps Agent, setup blue-green deployment

# Monitoring
DevOps Agent, setup application monitoring
DevOps Agent, configure alerts
DevOps Agent, create dashboards
DevOps Agent, setup log aggregation
DevOps Agent, implement health checks

# Infrastructure
DevOps Agent, provision infrastructure
DevOps Agent, configure load balancer
DevOps Agent, setup SSL certificates
DevOps Agent, configure CDN
DevOps Agent, optimize infrastructure costs
```

### EAS Build Agent (Sub-agent of Manager)

```bash
# Build Configuration
EAS Agent, configure build profile
EAS Agent, setup build environment
EAS Agent, configure app credentials
EAS Agent, add build secrets
EAS Agent, optimize build cache

# iOS Builds
EAS Agent, build iOS development
EAS Agent, build iOS preview
EAS Agent, build iOS production
EAS Agent, configure iOS certificates
EAS Agent, submit to TestFlight

# Android Builds
EAS Agent, build Android development
EAS Agent, build Android preview
EAS Agent, build Android production
EAS Agent, configure Android keystore
EAS Agent, submit to Play Store

# Distribution
EAS Agent, distribute to internal testers
EAS Agent, create public test link
EAS Agent, update OTA
EAS Agent, manage build artifacts
EAS Agent, create release channels

# EAS Ignore Configuration
EAS Agent, update .easignore
EAS Agent, add pattern to .easignore: [pattern]
EAS Agent, exclude files from build: [files]
EAS Agent, optimize build size
EAS Agent, check build contents
```

## 🎯 Workflow Commands

### Daily Workflow

```bash
# Morning
Manager, start daily standup
All Agents, report status
Manager, review blockers
Manager, assign daily tasks

# During Day
[Agent], update task progress
[Agent], request code review
[Agent], report blocker
[Agent], ask for help with [issue]

# End of Day
Manager, collect progress updates
Manager, update sprint board
Manager, plan tomorrow's work
Manager, generate daily summary
```

### Sprint Workflow

```bash
# Sprint Start
Manager, kick off sprint [number]
Manager, review sprint goals
Manager, assign sprint tasks
All Agents, confirm task understanding

# Sprint Execution
Manager, monitor sprint progress
Manager, conduct mid-sprint review
Manager, adjust sprint scope if needed
Manager, facilitate problem solving

# Sprint End
Manager, conduct sprint review
Manager, gather sprint metrics
Manager, facilitate retrospective
Manager, plan next sprint
```

## 📊 Reporting Commands

### Status Reports

```bash
# Individual Agent Reports
[Agent], show current task
[Agent], show completed tasks
[Agent], show task history
[Agent], estimate remaining time

# Manager Reports
Manager, show team velocity
Manager, show burndown chart
Manager, show blocker analysis
Manager, show quality metrics
Manager, show completion forecast
```

### Quality Reports

```bash
# Code Quality
Manager, show code coverage
Manager, show complexity metrics
Manager, show technical debt
Manager, show security scan results

# Performance
Manager, show performance metrics
Manager, show load test results
Manager, show optimization opportunities
Manager, show resource usage
```

## 🔧 Utility Commands

### Help & Documentation

```bash
# General Help
[Agent], help
[Agent], show available commands
[Agent], explain command [name]
[Agent], show examples for [command]

# Context
[Agent], show current context
[Agent], load context for [project]
[Agent], update context with [information]
[Agent], share context with [Agent]
```

### Debugging

```bash
# Debug Commands
[Agent], enable debug mode
[Agent], show detailed logs
[Agent], trace execution for [operation]
[Agent], analyze error [ID]
[Agent], suggest fix for [issue]
```

## 🎮 Interactive Commands

### Conversational Commands

```bash
# Questions
[Agent], what are you working on?
[Agent], can you help with [task]?
[Agent], what's blocking you?
[Agent], how long will [task] take?

# Collaboration
[Agent], collaborate with [Agent] on [task]
[Agent], share findings about [topic]
[Agent], review [Agent]'s work
[Agent], provide feedback on [implementation]
```

---

*This command reference is continuously updated as the system evolves. Each agent understands these commands and can execute them within their domain of expertise.*