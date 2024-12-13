import { Request, Response } from "express";
import Chikyu from "chikyu-sdk";
import { getSession } from "./session";

// Helper function to respond with error / エラー応答用のヘルパー関数
// Sends a standardized error response with status and message
// ステータスコードとエラーメッセージを含む標準化された応答を送信します
const respondWithError = (res: Response, status: number, error: string) => {
  res.status(status).json({ error });
};

// Helper function to handle Chikyu API calls / Chikyu API呼び出しを処理する関数
// Manages requests to Chikyu SDK and processes responses
// Chikyu SDKへのリクエストを管理し、レスポンスを処理します
const handleChikyuApiCall = async (
  collectionName: string, // Name of the collection to access / アクセスするコレクション名
  method: string, // API method to invoke (e.g., "list", "create") / 呼び出すAPIメソッド
  params: Record<string, any>, // Parameters to pass to the API / APIに渡すパラメータ
  isAsync: boolean = false // Whether to perform the call asynchronously / 非同期処理を行うかどうか
) => {
  try {
    await getSession();
    return await Chikyu.secure.invoke(`/entity/${collectionName}/${method}`, {
      ...params,
      is_async: isAsync,
    });
  } catch (error) {
    console.error(
      `Error in Chikyu API (${method} - ${collectionName}):`,
      error
    );
    throw error;
  }
};

// Extracts a human-readable error message from different error types
// 異なるエラータイプからわかりやすいエラーメッセージを抽出します
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.stack ? error.stack.split("\n")[0] : error.message;
  } else if (typeof error === "string") {
    return error;
  }
  return "Error processing your request";
};

// Generates parameters for creating a new entity / 新しいエンティティの作成パラメータを生成
export const createParams = (req: Request) => {
  return { fields: { ...req.body } };
};

// Generates parameters for updating an existing entity / 既存エンティティの更新パラメータを生成
export const updateParams = (key: string) => (req: Request) => {
  return { key, fields: { ...req.body } };
};

// Extracts pagination parameters from request queries / リクエストクエリからページネーションパラメータを抽出
export const getListParams = (req: Request) => {
  const items_per_page = parseInt(req.query.items_per_page as string, 10) || 10;
  const page_index = parseInt(req.query.page as string, 10) || 0;
  return { items_per_page, page_index };
};

// Extracts a key search parameter from request path / リクエストパスから検索キーを抽出
const getKeySearchParams = (fieldName: string) => (req: Request) => {
  const key = req.params[fieldName];
  if (!key) throw new Error(`${fieldName} parameter is required`);
  return {
    key,
    key_search_option: {
      input_field_name: fieldName,
      input_method: "by_field_value",
    },
  };
};

// PATCH request handler for updating records by a specific field
// 特定のフィールドによるレコードの更新用PATCHリクエストハンドラー
export const patchByFieldHandler =
  (collectionName: string, idFieldName: string) =>
  async (req: Request, res: Response) => {
    try {
      // Search for an existing entity by key / キーによる既存エンティティの検索
      const searchParams = getKeySearchParams(idFieldName)(req);
      const fetchResult = await handleChikyuApiCall(
        collectionName,
        "single",
        searchParams
      );
      const key = fetchResult?._id;

      if (!key) {
        respondWithError(
          res,
          404,
          `${collectionName} not found for the provided ${idFieldName}`
        );
        return;
      }

      // Perform the update operation / 更新操作の実行
      const updateParamsObj = updateParams(key)(req);
      const updateResult = await handleChikyuApiCall(
        collectionName,
        "save",
        updateParamsObj
      );
      res.json(updateResult);
    } catch (error) {
      console.error(error);
      respondWithError(res, 500, getErrorMessage(error));
    }
  };

// Generates a general API request handler / 一般的なAPIリクエストハンドラーを生成
export const createHandler =
  (collectionName: string) =>
  (method: string) =>
  (paramHandler: (req: Request) => Record<string, any>) =>
  async (req: Request, res: Response) => {
    try {
      const params = paramHandler(req);
      const isAsync = req.method === "GET";
      const result = await handleChikyuApiCall(
        collectionName,
        method,
        params,
        isAsync
      );
      res.json(result);
    } catch (error) {
      console.error(error);
      respondWithError(res, 500, getErrorMessage(error));
    }
  };

// Generates a handler for retrieving a single entity by a specific key
// 特定のキーによる単一エンティティの取得用ハンドラーを生成
export const generateSingleHandler = (handler: any, key: string) =>
  handler("single")(getKeySearchParams(key));
