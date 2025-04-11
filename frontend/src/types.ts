export interface TestSet {
  id: string;
  name: string;
  description: string;
  testCases: TestCase[];
  createdAt: string;
  updatedAt: string;
  locked?: boolean;
}

export interface TestCase {
  id: string;
  name: string;
  description: string;
  steps: TestStep[];
  tags: string[];
  status: 'draft' | 'ready' | 'running' | 'passed' | 'failed';
  createdAt: string;
  updatedAt: string;
  locked?: boolean;
}

export interface TestStep {
  id: string;
  type: 'keyword' | 'function' | 'assertion';
  action: string;
  parameters: Record<string, string>;
  expected: string;
  content?: string;
}

export interface TestResult {
  testCaseId: string;
  name: string;
  status: 'running' | 'passed' | 'failed';
  steps: TestStepResult[];
  startTime: string;
  endTime: string;
}

export interface TestStepResult {
  step: string;
  status: 'passed' | 'failed';
  error?: string;
  timestamp: string;
}

export interface ObjectRepository {
  version: string;
  objects: {
    [pageName: string]: {
      [objectName: string]: ObjectDefinition;
    };
  };
}

export interface ObjectDefinition {
  type: string;
  locator: string;
  value: string;
  description: string;
}

export interface TestData {
  version: string;
  data: {
    [category: string]: any[];
  };
}