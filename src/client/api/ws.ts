import { WSAPISession, type WSAPISessionConfig } from "@/api/ws";
import type { MerkleClientConfig } from "@/client/config";

export class WSAPIClient {
  constructor(readonly config: MerkleClientConfig) {}

  async connectWsApi(
    config?: Partial<WSAPISessionConfig>,
  ): Promise<WSAPISession> {
    const session = new WSAPISession({
      wsURL: this.config.merkleConfig.wsURL,
      ...config,
    });
    await session.connect();
    return session;
  }
}
