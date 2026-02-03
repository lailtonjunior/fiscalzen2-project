# Performance Optimizer Agent Playbook

---

## Overview

This playbook provides actionable guidance for a Performance Optimizer agent tasked with identifying and addressing performance bottlenecks in the FiscalZenProject codebase. It focuses on strategic inspection of service layer logic, utility functions, and flow orchestration within the backend API and shared application libraries. This guide prescribes systematic workflows, code conventions, best practices, and delineates key files and their purposes for effective performance optimization.

---

## 1. Areas of Focus

### Service Layer: Business Logic & Orchestration

- **Directory**: `fiscalzen-api\src`
- **Key File**: `app.service.ts`
  - Exports the core `AppService` class
  - Manages major business logic and orchestrates internal data flows

### Utilities: Shared Functions & Helpers

- **Directory**: `fiscalzen-app\src\lib`
- **Key File**: `utils.ts`
  - Hosts utility functions for string manipulation, formatting, parsing, etc.
  - Widely used; any inefficiency propagates system-wide

### Controller Layer (Indirect):
- **File**: `app.controller.ts`
  - Interfaces with HTTP requests; possible middleman for input data and entry point for profiling and bottleneck isolation

---

## 2. Workflows & Steps for Performance Optimization

### A. Bottleneck Identification

1. **Trace Execution Flow**
   - Map incoming controller calls (especially via `AppController`) to service (`AppService`) and underlying utility functions.
2. **Profile High-Load Paths**
   - Focus on endpoints with highest usage or known latency.
   - Use logging/profiling tools (e.g., Node.js `console.time`, external profilers).
3. **Examine Loops, Recursions, and Expensive Computations**
   - Identify nested iterations, unbounded recursions, or synchronous blocking operations.
4. **Analyze Database/API Calls**
   - Check for repeated, unnecessary, or slow external calls.
   - Ensure calls in `AppService` and related modules are properly batched or optimized.

### B. Code Audit for Utilities

1. **Evaluate Shared Functions (`utils.ts`)**
   - Check for heavy computations that could be memoized or otherwise optimized.
   - Ensure format/parse functions do not re-parse or re-calculate data unnecessarily.
2. **Assess String and Data Processing**
   - Detect inefficient handling of large strings/arrays (avoid repeated concatenation or copying).
3. **Recommend Lazy Evaluation or Caching**
   - For pure functions, suggest memoization where repetitive inputs are likely.

### C. Service Layer Optimization

1. **Minimize Redundant Operations**
   - Cross-reference which utility methods are called and how often.
   - Remove or batch repeated calls within service methods.
2. **Asynchronous Execution**
   - Identify synchronous sequences that can be executed concurrently (e.g., `Promise.all` for independent async calls).
3. **Error Handling Efficiency**
   - Prevent performance penalties from repeated try/catch or deep stack traces.

### D. Continuous Validation

1. **Benchmark Before & After**
   - Always take baseline performance metrics before making optimization changes.
2. **Automated Test Coverage**
   - Ensure benchmarks are paired with passing tests (using any existing test suites in the repo).
3. **Document Observed Gains**
   - Attach metrics and diffs as code comments and/or pull request notes.

---

## 3. Best Practices

- **Favor Pure, Stateless Utility Functions**
  - Side-effect-free functions in `utils.ts` are easier to optimize and cache.
- **Prefer Batch Processing** 
  - Where applicable, process data in batches to exploit array methods or async concurrency.
- **Optimize for Common Paths**
  - Accelerate hot paths, especially those used in main business logic in `AppService`.
- **Profiling-Driven Development**
  - Use profiling data to guide optimization—avoid premature, speculative changes.
- **Error Handling Overhead**
  - Structure error handling for performance-sensitive sections—use narrow try/catch blocks.

#### Conventions Observed:

- Consistent export of primary functions/classes in respective files.
- Grouped formatting helpers; consider co-locating heavy logic with consumers for easier batching or refactor.
- Centralized service logic; optimize here for maximum downstream gain.

---

## 4. Key Files & Their Purposes

| File/Directory                                 | Purpose                                                      |
|------------------------------------------------|--------------------------------------------------------------|
| `fiscalzen-api\src\app.service.ts`             | Primary service logic layer; orchestrates API operations     |
| `fiscalzen-api\src\app.controller.ts`          | Handles all HTTP endpoints, routes traffic into services     |
| `fiscalzen-app\src\lib\utils.ts`               | Contains all core utility/formatting functions used broadly  |

---

## 5. Code Patterns & Conventions

- **Export Patterns:** Each core class/function exported at top-level for module clarity.
- **Utility Function Usage:** Utility calls are typically direct, single-responsibility, and co-located for reuse.
- **Layer Separation:** Controllers handle routing; services encapsulate business rules; utilities provide shared logic.

---

## 6. Sample Optimization Task Workflow

1. **Identify Endpoint/Function to Analyze**
   - E.g., `/get-data` handled by `AppService.getData()`
2. **Instrument with Profiling Markers**
   - Insert `console.time` before and after heavy blocks
3. **Run Load Test or Use Sample Requests**
   - Gather metrics, note slow points
4. **Drill Down Into Utility Calls**
   - Check for expensive or redundant calls in `utils.ts`
5. **Refactor for Performance**
   - Batch calls, offload to async if possible, memoize heavy helpers
6. **Re-benchmark & Validate**
   - Compare before/after results, run regression tests
7. **Document Change**
   - Summarize improvement and changed code paths

---

## 7. Reference Checklist for Agent

- [ ] Trace controller -> service -> utility flow for each key endpoint
- [ ] Profile hot/business-critical paths for time and memory
- [ ] Inspect and optimize utility functions for common/costly tasks
- [ ] Batch, memoize, or parallelize where possible in `AppService`
- [ ] Validate that optimizations yield measurable benefit
- [ ] Document before/after impact

---

## 8. Summary

The Performance Optimizer agent should systematically prioritize the service layer and shared utilities for widest impact. Focus on high-throughput paths, instrument, and optimize based on real-world profiling. Adhere to project conventions around modularity and explicit export patterns, and always validate that optimizations improve actual system performance.

---
