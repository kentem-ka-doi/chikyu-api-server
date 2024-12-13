import Chikyu from "chikyu-sdk";

let chikyuSession: any | null = null;
let sessionExpiry: number | null = null;
const organizationId = Number(process.env.ORGANIZATION_ID) || 10794;

// Checks if the current session is still valid / セッションが有効かをチェック
const isSessionValid = () => {
  if (!chikyuSession || !sessionExpiry) {
    return false; // Invalid if no session or expiry / セッションまたは有効期限がない場合は無効
  }
  return Date.now() < sessionExpiry; // Check if current time is before expiry / 現在の時間が有効期限前か確認
};

// Retrieves or creates a new session / セッションを取得または新規作成
export const getSession = async () => {
  if (isSessionValid()) {
    return chikyuSession; // Reuse the existing session / 既存のセッションを再利用
  }

  try {
    // Create a new session / 新しいセッションを作成
    chikyuSession = await Chikyu.session.login(
      process.env.TOKEN_NAME || "", // Token name / トークン名
      process.env.TOKEN || "", // Token / トークン
      process.env.SECRET_TOKEN || "" // Secret token / シークレットトークン
    );

    // Fix the organization ID / 組織IDを固定
    await Chikyu.session.changeOrgan(organizationId);

    // Set session expiry to 1 hour / セッションの有効期限を1時間に設定
    sessionExpiry = Date.now() + 60 * 60 * 1000;

    return chikyuSession;
  } catch (error) {
    console.error("Error initializing session:", error); // Log the error / エラーをログに出力
    throw error;
  }
};
