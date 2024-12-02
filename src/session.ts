import Chikyu from "chikyu-sdk";

let chikyuSession: any | null = null;
let sessionExpiry: number | null = null;
const organizationId = Number(process.env.ORGANIZATION_ID) || 10794;

// セッションが有効かをチェック
const isSessionValid = () => {
  if (!chikyuSession || !sessionExpiry) {
    return false;
  }
  return Date.now() < sessionExpiry;
};

// セッションを取得または新規作成
export const getSession = async () => {
  if (isSessionValid()) {
    return chikyuSession; // 再利用
  }

  try {
    // 新しいセッションを作成
    chikyuSession = await Chikyu.session.login(
      process.env.TOKEN_NAME || "",
      process.env.TOKEN || "",
      process.env.SECRET_TOKEN || ""
    );

    // 組織IDを固定
    await Chikyu.session.changeOrgan(organizationId);

    // セッションの有効期限を設定（1時間）
    sessionExpiry = Date.now() + 60 * 60 * 1000;

    return chikyuSession;
  } catch (error) {
    console.error("Error initializing session:", error);
    throw error;
  }
};
