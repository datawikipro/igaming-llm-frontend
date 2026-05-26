export interface LlmGatewayNode {
  id?: number;
  name: string;
  endpointUrl: string;
  providerType?: string;
  modelName?: string;
  apiKey?: string;
  model?: LlmModel;
  active: boolean;
  status: 'IDLE' | 'STARTED' | 'HEALTHY' | 'EXHAUSTED' | 'DOWN';
  suspendedUntil: string | null;
  leasedByPod?: string | null;
  leasedAt?: string | null;
  successCount: number;
  failureCount: number;
  totalTokensUsed: number;
  lastRequestTime: string | null;
}

export interface LlmProviderKey {
  id?: number;
  label: string;
  apiKey: string;
  active: boolean;
  suspendedUntil?: string | null;
  createdAt?: string;
}

export interface LlmProvider {
  id: number;
  name: string;
  displayName: string;
  active: boolean;
  keys?: LlmProviderKey[];
}

export interface LlmModel {
  id: number;
  modelId: string;
  displayName: string;
  active: boolean;
  provider?: LlmProvider;
}

export interface SupportedProviderConfig {
  name: string;
  displayName: string;
  models: string[];
}

export interface LlmQueueLink {
  id?: number;
  sourceProvider: string;
  sourceModel: string;
  targetProvider: string;
  targetModel: string;
  active: boolean;
  createdAt?: string;
}

export interface LlmRoutingRule {
  id?: number;
  logicalType: string;
  googleRequired: boolean | null;
  urgency: string | null;
  targetModel: LlmModel;
  active: boolean;
  createdAt?: string;
}


