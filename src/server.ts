import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import Chikyu from "chikyu-sdk";

const organizationId: number = Number(process.env.ORGANIZATION_ID) || 10794;

const fetchCompanyByKentemId = async (kentemId: string) => {
  const collectionName: string = "companies";
  try {
    // ログイン
    await Chikyu.session.login(
      process.env.TOKEN_NAME || "",
      process.env.TOKEN || "",
      process.env.SECRET_TOKEN || ""
    );

    // 組織変更
    await Chikyu.session.changeOrgan(organizationId);

    // データ取得
    const data = await Chikyu.secure.invoke(
      `/entity/${collectionName}/single`,
      {
        key: kentemId,
        key_search_option: {
          input_field_name: "kentem_id",
          input_method: "by_field_value",
        },
      }
    );
    return data;
  } catch (error) {
    console.error("Error in fetchCompanyByKentemId:", error);
    throw error;
  }
};

const fetchCompanyByShokonCode = async (shokonCode: string) => {
  const collectionName: string = "companies";
  try {
    // ログイン
    await Chikyu.session.login(
      process.env.TOKEN_NAME || "",
      process.env.TOKEN || "",
      process.env.SECRET_TOKEN || ""
    );

    // 組織変更
    await Chikyu.session.changeOrgan(organizationId);

    // データ取得
    const data = await Chikyu.secure.invoke(
      `/entity/${collectionName}/single`,
      {
        key: shokonCode,
        key_search_option: {
          input_field_name: "shokon_code",
          input_method: "by_field_value",
        },
      }
    );
    return data;
  } catch (error) {
    console.error("Error in fetchCompanyByShokonCode:", error);
    throw error;
  }
};

const app = express();
app.use(bodyParser.json());

app.get(
  "/api/v1/companies/:kentemId",
  async (req: Request, res: Response): Promise<void> => {
    const { kentemId } = req.params;

    if (!kentemId) {
      res.status(400).json({ error: "kentem-id parameter is required" });
      return;
    }

    try {
      const result = await fetchCompanyByKentemId(kentemId);
      console.log(result);
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error processing your request" });
    }
  }
);

app.get(
  "/api/v1/companies/shokon-code/:shokonCode",
  async (req: Request, res: Response): Promise<void> => {
    const { shokonCode } = req.params;

    if (!shokonCode) {
      res.status(400).json({ error: "shokon-code parameter is required" });
      return;
    }

    try {
      const result = await fetchCompanyByShokonCode(shokonCode);
      console.log(result);
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error processing your request" });
    }
  }
);

// サーバー起動
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Chikyu API is running on http://localhost:${PORT}`);
});
