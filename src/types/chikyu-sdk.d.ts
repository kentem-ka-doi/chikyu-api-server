declare module "chikyu-sdk" {
  interface Session {
    login(tokenName: string, token: string, secretToken: string): Promise<void>;
    changeOrgan(organizationId: number): Promise<void>;
  }

  interface Secure {
    invoke(endpoint: string, params: object): Promise<any>;
  }

  export const session: Session;
  export const secure: Secure;
}
