export interface LlmGatewayNode {
  id?: number;
  name: string;
  endpointUrl: string;
  providerType: string;
  modelName: string;
  apiKey: string;
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

export interface LlmProvider {
  id: number;
  name: string;
  displayName: string;
  active: boolean;
}

export interface LlmModel {
  id: number;
  modelId: string;
  displayName: string;
  active: boolean;
  provider?: LlmProvider;
}
