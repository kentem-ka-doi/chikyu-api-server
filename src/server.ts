import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import Chikyu from "chikyu-sdk";
import { getSession } from "./session";

// 共通データ取得関数
const fetchData = async (
  collectionName: string,
  method: string,
  params: Record<string, any>
) => {
  try {
    await getSession();
    const data = await Chikyu.secure.invoke(
      `/entity/${collectionName}/${method}`,
      {
        ...params,
        is_async: true,
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
  paramHandler: (req: Request) => Record<string, any>
) => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const params = paramHandler(req);
      const result = await fetchData(collectionName, method, params);
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error processing your request" });
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
  const page_index = parseInt(req.query.page_index as string, 10) || 0;
  return {
    items_per_page,
    page_index,
  };
};

// Expressアプリケーション設定
const app = express();
app.use(bodyParser.json());

// エンドポイント設定
app.get(
  "/api/v1/companies/:kentem_id",
  createHandler("companies", "single", getKeySearchParams("kentem_id"))
);
app.get(
  "/api/v1/companies/shokon-code/:shokon_code",
  createHandler("companies", "single", getKeySearchParams("shokon_code"))
);
app.get(
  "/api/v1/business-discussions",
  createHandler("business_discussions", "list", getListParams)
);

// サーバー起動
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Chikyu API is running on http://localhost:${PORT}`);
});
