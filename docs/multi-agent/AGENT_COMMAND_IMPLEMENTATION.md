# 🚀 Agent Command Implementation Guide

*Version: 2.0.0 | Last Updated: June 6, 2025*

## 📋 Overview

This document details how agent commands are implemented, processed, and executed within the multi-agent system.

## 🏗️ Command Processing Architecture

### Command Structure

```typescript
interface AgentCommand {
  agent: AgentType;
  command: string;
  action: string;
  parameters: Record<string, any>;
  context: CommandContext;
  timestamp: Date;
  priority: 'high' | 'medium' | 'low';
  async?: boolean;
}

interface CommandContext {
  projectId: string;
  sprintId?: string;
  taskId?: string;
  userId: string;
  environment: 'development' | 'staging' | 'production';
  metadata?: Record<string, any>;
}
```

### Command Parser

```typescript
class CommandParser {
  parse(input: string): AgentCommand {
    // Pattern: [Agent], [action] [parameters]
    const pattern = /^([^,]+),\s*(.+)$/;
    const match = input.match(pattern);
    
    if (!match) {
      throw new Error('Invalid command format');
    }
    
    const [, agent, fullCommand] = match;
    const { action, parameters } = this.parseAction(fullCommand);
    
    return {
      agent: this.validateAgent(agent),
      command: input,
      action,
      parameters,
      context: this.getCurrentContext(),
      timestamp: new Date(),
      priority: this.determinePriority(action),
      async: this.isAsyncCommand(action)
    };
  }
  
  private parseAction(command: string): { action: string; parameters: any } {
    // Extract action and parameters
    const tokens = command.split(' ');
    const action = tokens.slice(0, 2).join('_').toLowerCase();
    const params = this.extractParameters(tokens.slice(2));
    
    return { action, parameters: params };
  }
}
```

## 🎼 Manager Agent Implementation

### Command Handler

```typescript
class ManagerAgent {
  private subAgents: Map<string, SubAgent>;
  private taskManager: TaskManager;
  private projectContext: ProjectContext;
  
  constructor() {
    this.subAgents = new Map([
      ['git', new GitAgent()],
      ['devops', new DevOpsAgent()],
      ['eas', new EASBuildAgent()]
    ]);
  }
  
  async handleCommand(command: AgentCommand): Promise<CommandResult> {
    // Check if command should be delegated to sub-agent
    if (this.isSubAgentCommand(command)) {
      return this.delegateToSubAgent(command);
    }
    
    // Handle manager-specific commands
    switch (command.action) {
      case 'process_prd':
        return this.processPRD(command.parameters.path);
        
      case 'start_daily_standup':
        return this.startDailyStandup();
        
      case 'assign_task':
        return this.assignTask(
          command.parameters.taskId,
          command.parameters.agent
        );
        
      case 'show_sprint_progress':
        return this.showSprintProgress();
        
      // ... other commands
      
      default:
        throw new Error(`Unknown command: ${command.action}`);
    }
  }
  
  private async processPRD(prdPath: string): Promise<CommandResult> {
    // Load and analyze PRD
    const prd = await this.loadPRD(prdPath);
    const analysis = await this.analyzePRD(prd);
    
    // Generate architecture
    const architecture = await this.generateArchitecture(analysis);
    
    // Create tasks
    const tasks = await this.generateTasks(architecture);
    
    // Initialize project
    await this.initializeProject({
      prd,
      architecture,
      tasks
    });
    
    // Assign initial tasks
    await this.assignInitialTasks(tasks);
    
    return {
      success: true,
      message: 'PRD processed successfully',
      data: {
        projectId: this.projectContext.id,
        taskCount: tasks.length,
        estimatedDuration: this.estimateProjectDuration(tasks)
      }
    };
  }
  
  private async startDailyStandup(): Promise<CommandResult> {
    const agents = await this.getAllAgents();
    const updates = [];
    
    for (const agent of agents) {
      const status = await this.getAgentStatus(agent);
      updates.push({
        agent: agent.name,
        currentTask: status.currentTask,
        progress: status.progress,
        blockers: status.blockers,
        plannedToday: status.plannedToday
      });
    }
    
    // Analyze and adjust
    const adjustments = await this.analyzeStandupData(updates);
    await this.applyAdjustments(adjustments);
    
    return {
      success: true,
      message: 'Daily standup completed',
      data: {
        updates,
        adjustments,
        summary: this.generateStandupSummary(updates)
      }
    };
  }
}
```

### Sub-Agent: Git Agent

```typescript
class GitAgent extends SubAgent {
  async handleCommand(command: AgentCommand): Promise<CommandResult> {
    switch (command.action) {
      case 'create_branch':
        return this.createBranch(command.parameters.name);
        
      case 'create_pull_request':
        return this.createPullRequest(command.parameters);
        
      case 'merge_branch':
        return this.mergeBranch(
          command.parameters.source,
          command.parameters.target
        );
        
      default:
        return super.handleCommand(command);
    }
  }
  
  private async createBranch(name: string): Promise<CommandResult> {
    try {
      // Ensure we're on latest main
      await this.git.checkout('main');
      await this.git.pull('origin', 'main');
      
      // Create and checkout new branch
      await this.git.checkoutBranch(name, 'main');
      
      // Push to remote
      await this.git.push('origin', name, ['--set-upstream']);
      
      return {
        success: true,
        message: `Branch '${name}' created and pushed`,
        data: { branchName: name }
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to create branch: ${error.message}`,
        error
      };
    }
  }
  
  private async createPullRequest(params: any): Promise<CommandResult> {
    const pr = await this.github.createPullRequest({
      title: params.title,
      body: this.generatePRBody(params),
      head: params.sourceBranch,
      base: params.targetBranch || 'main',
      draft: params.draft || false
    });
    
    // Add labels
    if (params.labels) {
      await this.github.addLabels(pr.number, params.labels);
    }
    
    // Request reviewers
    if (params.reviewers) {
      await this.github.requestReviewers(pr.number, params.reviewers);
    }
    
    return {
      success: true,
      message: `Pull request #${pr.number} created`,
      data: { prNumber: pr.number, url: pr.html_url }
    };
  }
}
```

### Sub-Agent: EAS Build Agent

```typescript
class EASBuildAgent extends SubAgent {
  async handleCommand(command: AgentCommand): Promise<CommandResult> {
    switch (command.action) {
      case 'build_ios_preview':
        return this.buildIOS('preview');
        
      case 'submit_to_testflight':
        return this.submitToTestFlight();
        
      case 'configure_build_profile':
        return this.configureBuildProfile(command.parameters);
        
      default:
        return super.handleCommand(command);
    }
  }
  
  private async buildIOS(profile: string): Promise<CommandResult> {
    // Update app.json if needed
    await this.updateAppConfig(profile);
    
    // Run EAS build
    const buildResult = await this.eas.build({
      platform: 'ios',
      profile,
      wait: false,
      json: true
    });
    
    // Monitor build
    this.monitorBuild(buildResult.buildId);
    
    return {
      success: true,
      message: `iOS ${profile} build started`,
      data: {
        buildId: buildResult.buildId,
        buildUrl: buildResult.buildDetailsPageUrl,
        estimatedTime: '15-20 minutes'
      }
    };
  }
  
  private async monitorBuild(buildId: string): Promise<void> {
    // Set up monitoring
    const interval = setInterval(async () => {
      const status = await this.eas.getBuildStatus(buildId);
      
      if (status.status === 'finished') {
        clearInterval(interval);
        await this.notifyBuildComplete(buildId, status);
      } else if (status.status === 'errored') {
        clearInterval(interval);
        await this.notifyBuildFailed(buildId, status);
      }
    }, 30000); // Check every 30 seconds
  }
}
```

## 🔧 Backend Developer Agent Implementation

```typescript
class BackendDeveloperAgent {
  private codeGenerator: CodeGenerator;
  private testGenerator: TestGenerator;
  private documentationGenerator: DocumentationGenerator;
  
  async handleCommand(command: AgentCommand): Promise<CommandResult> {
    switch (command.action) {
      case 'implement_api_endpoint':
        return this.implementAPIEndpoint(command.parameters);
        
      case 'create_schema':
        return this.createDatabaseSchema(command.parameters);
        
      case 'add_authentication':
        return this.addAuthentication(command.parameters);
        
      default:
        throw new Error(`Unknown command: ${command.action}`);
    }
  }
  
  private async implementAPIEndpoint(params: any): Promise<CommandResult> {
    const { feature, operations } = params;
    
    // 1. Create validation schemas
    const schemas = await this.createValidationSchemas(feature);
    
    // 2. Create database operations
    const repository = await this.createRepository(feature);
    
    // 3. Create service layer
    const service = await this.createService(feature, repository);
    
    // 4. Create tRPC router
    const router = await this.createRouter(feature, service, schemas);
    
    // 5. Generate tests
    const tests = await this.testGenerator.generateTests({
      service,
      router,
      schemas
    });
    
    // 6. Update documentation
    await this.documentationGenerator.updateAPIDocs(router);
    
    return {
      success: true,
      message: `API endpoint for ${feature} implemented`,
      data: {
        files: [
          `lib/validations/${feature}.ts`,
          `src/db/repositories/${feature}.ts`,
          `src/server/services/${feature}.ts`,
          `src/server/routers/${feature}.ts`,
          `__tests__/api/${feature}.test.ts`
        ],
        endpoints: operations.map(op => `${feature}.${op}`),
        coverage: '95%'
      }
    };
  }
  
  private async createValidationSchemas(feature: string): Promise<any> {
    const schemas = {
      create: z.object({
        name: z.string().min(1).max(100),
        description: z.string().optional(),
        // ... other fields based on feature
      }),
      update: z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
      }),
      // ... other schemas
    };
    
    // Write to file
    await this.writeFile(
      `lib/validations/${feature}.ts`,
      this.codeGenerator.generateSchemaFile(feature, schemas)
    );
    
    return schemas;
  }
}
```

## 🎨 Frontend Developer Agent Implementation

```typescript
class FrontendDeveloperAgent {
  private componentGenerator: ComponentGenerator;
  private screenGenerator: ScreenGenerator;
  private styleGenerator: StyleGenerator;
  
  async handleCommand(command: AgentCommand): Promise<CommandResult> {
    switch (command.action) {
      case 'create_screen':
        return this.createScreen(command.parameters);
        
      case 'create_component':
        return this.createComponent(command.parameters);
        
      case 'integrate_api_endpoint':
        return this.integrateAPI(command.parameters);
        
      default:
        throw new Error(`Unknown command: ${command.action}`);
    }
  }
  
  private async createScreen(params: any): Promise<CommandResult> {
    const { feature, screenType } = params;
    
    // 1. Analyze requirements
    const requirements = await this.analyzeScreenRequirements(feature);
    
    // 2. Generate screen component
    const screen = await this.screenGenerator.generate({
      name: feature,
      type: screenType,
      requirements
    });
    
    // 3. Create supporting components
    const components = await this.createSupportingComponents(requirements);
    
    // 4. Add navigation
    await this.updateNavigation(feature, screen);
    
    // 5. Connect to API
    if (requirements.hasAPI) {
      await this.connectToAPI(screen, requirements.endpoints);
    }
    
    // 6. Add tests
    const tests = await this.generateScreenTests(screen);
    
    return {
      success: true,
      message: `Screen for ${feature} created`,
      data: {
        screenPath: `app/(home)/${feature}.tsx`,
        components: components.map(c => c.path),
        hasNavigation: true,
        hasAPIIntegration: requirements.hasAPI,
        testCoverage: '90%'
      }
    };
  }
  
  private async createSupportingComponents(requirements: any): Promise<any[]> {
    const components = [];
    
    if (requirements.needsList) {
      components.push(
        await this.componentGenerator.generateList({
          name: `${requirements.feature}List`,
          itemType: requirements.itemType
        })
      );
    }
    
    if (requirements.needsForm) {
      components.push(
        await this.componentGenerator.generateForm({
          name: `${requirements.feature}Form`,
          fields: requirements.formFields
        })
      );
    }
    
    // ... other component types
    
    return components;
  }
}
```

## 🧪 Tester Agent Implementation

```typescript
class TesterAgent {
  private testRunner: TestRunner;
  private testReporter: TestReporter;
  private bugTracker: BugTracker;
  
  async handleCommand(command: AgentCommand): Promise<CommandResult> {
    switch (command.action) {
      case 'create_test_plan':
        return this.createTestPlan(command.parameters);
        
      case 'run_unit_tests':
        return this.runUnitTests(command.parameters);
        
      case 'perform_e2e_test':
        return this.performE2ETest(command.parameters);
        
      case 'report_bug':
        return this.reportBug(command.parameters);
        
      default:
        throw new Error(`Unknown command: ${command.action}`);
    }
  }
  
  private async runUnitTests(params: any): Promise<CommandResult> {
    const { module, coverage = 80 } = params;
    
    // Run tests
    const results = await this.testRunner.runTests({
      pattern: module ? `**/${module}/**/*.test.ts` : '**/*.test.ts',
      coverage: true
    });
    
    // Check coverage
    if (results.coverage.percentage < coverage) {
      // Generate additional tests
      const additionalTests = await this.generateAdditionalTests(
        results.coverage.uncoveredLines
      );
      
      // Re-run tests
      const newResults = await this.testRunner.runTests({
        pattern: module ? `**/${module}/**/*.test.ts` : '**/*.test.ts',
        coverage: true
      });
      
      results.coverage = newResults.coverage;
    }
    
    // Generate report
    const report = await this.testReporter.generateReport(results);
    
    return {
      success: results.passed,
      message: `Unit tests ${results.passed ? 'passed' : 'failed'}`,
      data: {
        total: results.total,
        passed: results.passed,
        failed: results.failed,
        coverage: results.coverage.percentage,
        report: report.path
      }
    };
  }
  
  private async reportBug(params: any): Promise<CommandResult> {
    const bug = await this.bugTracker.create({
      title: params.title,
      description: params.description,
      severity: params.severity || 'medium',
      component: params.component,
      reproducible: params.reproducible || true,
      steps: params.steps,
      expectedBehavior: params.expected,
      actualBehavior: params.actual,
      screenshots: params.screenshots,
      logs: await this.collectLogs(params.component)
    });
    
    // Notify relevant developer
    await this.notifyDeveloper(bug);
    
    return {
      success: true,
      message: `Bug ${bug.id} reported`,
      data: {
        bugId: bug.id,
        assignedTo: bug.assignee,
        priority: bug.priority
      }
    };
  }
}
```

## 🔄 Command Execution Flow

### 1. Command Reception

```typescript
class CommandReceiver {
  private commandQueue: CommandQueue;
  private commandParser: CommandParser;
  
  async receiveCommand(input: string): Promise<void> {
    try {
      // Parse command
      const command = this.commandParser.parse(input);
      
      // Validate command
      await this.validateCommand(command);
      
      // Queue command
      await this.commandQueue.enqueue(command);
      
      // Acknowledge receipt
      await this.acknowledgeCommand(command);
      
    } catch (error) {
      await this.handleCommandError(input, error);
    }
  }
}
```

### 2. Command Routing

```typescript
class CommandRouter {
  private agents: Map<string, Agent>;
  
  async routeCommand(command: AgentCommand): Promise<void> {
    const agent = this.agents.get(command.agent);
    
    if (!agent) {
      throw new Error(`Unknown agent: ${command.agent}`);
    }
    
    // Check agent availability
    if (!await agent.isAvailable()) {
      await this.queueForLater(command);
      return;
    }
    
    // Execute command
    const result = await agent.handleCommand(command);
    
    // Store result
    await this.storeResult(command, result);
    
    // Notify completion
    await this.notifyCompletion(command, result);
  }
}
```

### 3. Result Processing

```typescript
class ResultProcessor {
  async processResult(command: AgentCommand, result: CommandResult): Promise<void> {
    // Update task status if applicable
    if (command.context.taskId) {
      await this.updateTaskStatus(command.context.taskId, result);
    }
    
    // Trigger follow-up commands
    const followUpCommands = await this.determineFollowUpCommands(result);
    for (const cmd of followUpCommands) {
      await this.queueCommand(cmd);
    }
    
    // Update metrics
    await this.updateMetrics(command, result);
    
    // Generate notifications
    await this.generateNotifications(command, result);
  }
}
```

## 📊 Command Analytics

### Command Tracking

```typescript
interface CommandMetrics {
  totalCommands: number;
  commandsByAgent: Record<AgentType, number>;
  commandsByAction: Record<string, number>;
  averageExecutionTime: number;
  successRate: number;
  queueDepth: number;
  activeCommands: number;
}

class CommandAnalytics {
  async trackCommand(command: AgentCommand, result: CommandResult): Promise<void> {
    await this.metrics.increment('totalCommands');
    await this.metrics.increment(`commandsByAgent.${command.agent}`);
    await this.metrics.increment(`commandsByAction.${command.action}`);
    
    const executionTime = result.timestamp - command.timestamp;
    await this.metrics.recordTime('executionTime', executionTime);
    
    if (result.success) {
      await this.metrics.increment('successfulCommands');
    } else {
      await this.metrics.increment('failedCommands');
    }
  }
  
  async getMetrics(): Promise<CommandMetrics> {
    return {
      totalCommands: await this.metrics.get('totalCommands'),
      commandsByAgent: await this.metrics.getGroup('commandsByAgent'),
      commandsByAction: await this.metrics.getGroup('commandsByAction'),
      averageExecutionTime: await this.metrics.getAverage('executionTime'),
      successRate: await this.calculateSuccessRate(),
      queueDepth: await this.queue.getDepth(),
      activeCommands: await this.getActiveCommandCount()
    };
  }
}
```

## 🔧 Command Configuration

### Command Registry

```yaml
commands:
  manager:
    process_prd:
      description: "Process a Product Requirements Document"
      parameters:
        - name: path
          type: string
          required: true
      async: true
      timeout: 300000  # 5 minutes
      
    start_daily_standup:
      description: "Start the daily standup meeting"
      parameters: []
      async: false
      timeout: 60000   # 1 minute
      
  backend_developer:
    implement_api_endpoint:
      description: "Implement a new API endpoint"
      parameters:
        - name: feature
          type: string
          required: true
        - name: operations
          type: array
          required: true
      async: true
      timeout: 600000  # 10 minutes
```

---

*This implementation guide provides the foundation for building a robust command execution system for the multi-agent development platform.*