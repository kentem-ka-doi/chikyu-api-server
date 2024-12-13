declare module "chikyu-sdk" {
  interface Session {
    login(tokenName: string, token: string, secretToken: string): Promise<void>;
    changeOrgan(organizationId: number): Promise<void>;
    data: {
      identityId: string | null;
      sessionId: string | null;
      credentials: any | null;
    };
  }

  interface Secure {
    invoke(endpoint: string, params: object): Promise<any>;
  }

  interface Token {
    create(
      tokenName: string,
      email: string,
      password: string,
      duration: number
    ): Promise<{
      login_secret_token: string | null;
      login_token: string | null;
    }>;

    renew(
      tokenName: string,
      loginToken: string,
      loginSecretToken: string
    ): Promise<{
      login_secret_token: string | null;
      login_token: string | null;
    }>;
  }

  export const session: Session;
  export const secure: Secure;
  export const token: Token;
}
