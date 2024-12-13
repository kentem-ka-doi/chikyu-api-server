import Chikyu from "chikyu-sdk";

let chikyuSession: any | null = null;
let tokenExpiry: number | null = null;
let createSessionTokenResponse: {
  login_secret_token: string | null;
  login_token: string | null;
};

const organizationId = Number(process.env.ORGANIZATION_ID) || 10794;
/**
 * Token name / トークン名
 */
const tokenName = process.env.TOKEN_NAME || "";
/**
 * e-mail / メールアドレス
 */
const email = process.env.EMAIL || "";
/**
 * password / パスワード
 */
const password = process.env.PASSWORD || "";
/**
 * duration / 持続期間
 * 24時間
 */
const duration = Number(process.env.DURATION) || 86400;

// Checks if the current session is still valid / セッションが有効かをチェック
Chikyu.session.hasSession = () =>
  !!(
    Chikyu.session != null &&
    Chikyu.session.data != null &&
    Chikyu.session.data.sessionId &&
    Chikyu.session.data.identityId &&
    Chikyu.session.data.credentials != null
  );

const isTokenValid = (): boolean => {
  if (!createSessionTokenResponse || !tokenExpiry) {
    return false; // Invalid if no token or expiry / トークンまたは有効期限がない場合は無効
  }
  return Date.now() < tokenExpiry; // Check if current time is before expiry / 現在の時間が有効期限前か確認
};

const hasToken = (): boolean => {
  return !!createSessionTokenResponse;
};

// Creates a new token / トークンを新規作成
const createToken = async () => {
  try {
    createSessionTokenResponse = await Chikyu.token.create(
      tokenName,
      email,
      password,
      duration
    );

    return createSessionTokenResponse;
  } catch (error) {
    console.error("Error create token:", error); // Log the error / エラーをログに出力
    throw error;
  }
};

// Renews a token / トークンを更新
const renewToken = async () => {
  try {
    createSessionTokenResponse = await Chikyu.token.renew(
      tokenName,
      createSessionTokenResponse.login_token || "", // Token / トークン
      createSessionTokenResponse.login_secret_token || "" // Secret token / シークレットトークン
    );

    return createSessionTokenResponse;
  } catch (error) {
    console.error("Error renew token:", error); // Log the error / エラーをログに出力
    throw error;
  }
};

// Retrieves or creates a new session / セッションを取得または新規作成
export const getSession = async () => {
  if (Chikyu.session.hasSession()) {
    return chikyuSession; // Reuse the existing session / 既存のセッションを再利用
  }

  if (!hasToken()) {
    createSessionTokenResponse = await createToken();
  }

  if (!isTokenValid()) {
    createSessionTokenResponse = await renewToken();
  }

  try {
    // Create a new session / 新しいセッションを作成
    chikyuSession = await Chikyu.session.login(
      tokenName,
      createSessionTokenResponse.login_token || "", // Token / トークン
      createSessionTokenResponse.login_secret_token || "" // Secret token / シークレットトークン
    );

    // Fix the organization ID / 組織IDを固定
    await Chikyu.session.changeOrgan(organizationId);

    // Set session expiry to 1 hour / セッションの有効期限を1時間に設定
    tokenExpiry = Date.now() + duration * 1000;

    return chikyuSession;
  } catch (error) {
    console.error("Error initializing session:", error); // Log the error / エラーをログに出力
    throw error;
  }
};
