import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import Chikyu from "chikyu-sdk";

const organization_id: number = 10794;

const fetchCompanies = () => {
  const collection_name: string = "companies";
  Chikyu.session
    .login(
      process.env.TOKEN_NAME || "",
      process.env.TOKEN || "",
      process.env.SECRET_TOKEN || ""
    )
    .then(() => {
      Chikyu.session
        .changeOrgan(organization_id)
        .then(() => {
          return Chikyu.secure
            .invoke("/entity/" + collection_name, {})
            .then((d: any) => {
              console.log(d);
            });
        })
        .catch((e: Error) => {
          console.log(e);
        });
    })
    .catch((e: Error) => {
      console.log(e);
    });
};

const app = express();
app.use(bodyParser.json());

// シンプルなエンドポイント
app.get("/fetch-data", async (req: Request, res: Response) => {
  try {
    const result = fetchCompanies();
    console.log(result);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error processing your request" });
  }

  /*
  const { module, action, params } = req.body;
  try {
    const response = await client.request(module, action, params);
    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error processing your request" });
  }
    */
});

// サーバー起動
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Chikyu API is running on http://localhost:${PORT}`);
});
