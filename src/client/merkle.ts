import { APIClient } from "@/client/api/http";
import { WSAPIClient } from "@/client/api/ws";
import { AptosHelpers } from "./aptos/helpers";
import { MerklePayloadBuilder } from "./aptos/payloads";
import type { MerkleClientConfig } from "./config";

// biome-ignore lint/suspicious/noUnsafeDeclarationMerging: mixin
export class MerkleClient {
  config: MerkleClientConfig;

  api: APIClient;
  wsapi: WSAPIClient;
  payloads: MerklePayloadBuilder;
  aptos: AptosHelpers;

  constructor(config: MerkleClientConfig) {
    this.config = config;

    this.api = new APIClient(this.config);
    this.wsapi = new WSAPIClient(this.config);
    this.payloads = new MerklePayloadBuilder(this.config);
    this.aptos = new AptosHelpers(this.config);
  }
}

// extends MerkleClient so all the methods and properties
// from the other classes will be recognized by typescript.
export interface MerkleClient extends APIClient, WSAPIClient, AptosHelpers {}

/**
 * @see {@link https://www.typescriptlang.org/docs/handbook/mixins.html#alternative-pattern}
 * Here, we combine any subclass and the MerkleClient class.
 */
function applyMixin(targetClass: any, baseClass: any, baseClassProp: string) {
  // Mixin instance methods
  Object.getOwnPropertyNames(baseClass.prototype).forEach((propertyName) => {
    const propertyDescriptor = Object.getOwnPropertyDescriptor(
      baseClass.prototype,
      propertyName,
    );
    if (!propertyDescriptor) return;
    propertyDescriptor.value = function (...args: any) {
      return (this as any)[baseClassProp][propertyName](...args);
    };
    Object.defineProperty(
      targetClass.prototype,
      propertyName,
      propertyDescriptor,
    );
  });
}

applyMixin(MerkleClient, APIClient, "api");
applyMixin(MerkleClient, WSAPIClient, "wsapi");
applyMixin(MerkleClient, AptosHelpers, "aptos");
