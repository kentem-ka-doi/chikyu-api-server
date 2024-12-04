import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import Chikyu from "chikyu-sdk";
import { getSession } from "./session";

// 共通データ取得関数
const fetchData = async (
  collectionName: string,
  method: string,
  params: Record<string, any>,
  is_async: boolean = false
) => {
  try {
    await getSession();

    const data = await Chikyu.secure.invoke(
      `/entity/${collectionName}/${method}`,
      {
        ...params,
        is_async: is_async,
      }
    );
    return data;
  } catch (error) {
    console.error(`Error in fetchData (${collectionName}):`, error);
    throw error;
  }
};

// 共通のAPIハンドラー作成関数
const createHandler = (
  collectionName: string,
  method: string,
  paramHandler: (req: Request) => Record<string, any>,
  is_async: boolean = false
) => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const params = paramHandler(req);
      const result = await fetchData(collectionName, method, params, is_async);
      res.json(result);
    } catch (error) {
      console.error(error);

      // エラーが 'Error' 型か確認しつつ安全に処理
      let errorMessage = "Error processing your request"; // デフォルトメッセージ

      if (error instanceof Error) {
        // 'Error' 型ならスタックトレースからメッセージを取得
        errorMessage = error.stack
          ? error.stack.split("\n")[0] // スタックトレースの1行目を取得
          : error.message || "Error processing your request";
      } else if (typeof error === "string") {
        // エラーが文字列の場合
        errorMessage = error;
      }

      res.status(500).json({ error: errorMessage });
    }
  };
};

// パラメータ処理関数
const getKeySearchParams = (fieldName: string) => (req: Request) => {
  const key = req.params[fieldName];
  if (!key) {
    throw new Error(`${fieldName} parameter is required`);
  }
  return {
    key,
    key_search_option: {
      input_field_name: fieldName,
      input_method: "by_field_value",
    },
  };
};

const getListParams = (req: Request) => {
  const items_per_page = parseInt(req.query.items_per_page as string, 10) || 10;
  const page_index = parseInt(req.query.page as string, 10) || 0;
  return {
    items_per_page,
    page_index,
  };
};

const createParams = (req: Request) => {
  return {
    fields: {
      ...req.body,
    },
  };
};

// Expressアプリケーション設定
const app = express();
app.use(bodyParser.json());

// エンドポイント設定
app.get(
  "/api/v1/companies/:kentem_id",
  createHandler("companies", "single", getKeySearchParams("kentem_id"), true)
);
app.get(
  "/api/v1/companies/shokon-code/:shokon_code",
  createHandler("companies", "single", getKeySearchParams("shokon_code"), true)
);
app.get("/api/v1/companies", createHandler("companies", "list", getListParams));
app.post(
  "/api/v1/companies",
  createHandler("companies", "create", createParams)
);

app.get(
  "/api/v1/business-discussions",
  createHandler("business_discussions", "list", getListParams)
);
app.post(
  "/api/v1/business-discussions",
  createHandler("business_discussions", "create", createParams)
);

// サーバー起動
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Chikyu API is running on http://localhost:${PORT}`);
});
