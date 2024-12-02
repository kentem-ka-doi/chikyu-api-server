import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import Chikyu from "chikyu-sdk";
import { getSession } from "./session";

// 共通の会社情報取得関数
const fetchCompany = async (key: string, fieldName: string) => {
  const collectionName: string = "companies";
  try {
    await getSession();

    // データ取得
    const data = await Chikyu.secure.invoke(
      `/entity/${collectionName}/single`,
      {
        key,
        key_search_option: {
          input_field_name: fieldName,
          input_method: "by_field_value",
        },
      }
    );
    return data;
  } catch (error) {
    console.error(`Error in fetchCompany (${fieldName}):`, error);
    throw error;
  }
};

// 共通のAPIハンドラー
const handleFetchCompany = (fieldName: string) => {
  return async (req: Request, res: Response): Promise<void> => {
    const key = req.params[fieldName];

    if (!key) {
      res.status(400).json({ error: `${fieldName} parameter is required` });
      return;
    }

    try {
      const result = await fetchCompany(key, fieldName);
      console.log(result);
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error processing your request" });
    }
  };
};

// Expressアプリケーション設定
const app = express();
app.use(bodyParser.json());

// エンドポイント設定
app.get("/api/v1/companies/:kentem_id", handleFetchCompany("kentem_id"));
app.get(
  "/api/v1/companies/shokon-code/:shokon_code",
  handleFetchCompany("shokon_code")
);

// サーバー起動
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Chikyu API is running on http://localhost:${PORT}`);
});
