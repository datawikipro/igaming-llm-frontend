export interface LlmGatewayNode {
  id?: number;
  name: string;
  endpointUrl: string;
  providerType?: string;
  modelName?: string;
  apiKey?: string;
  model?: LlmModel;
  active: boolean;
  status: 'HEALTHY' | 'DOWN' | 'EXHAUSTED';
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
