// Imports for request handlers and parameter processing functions
import { Application } from "express";
import {
  createHandler,
  getListParams,
  createParams,
  updateParams,
  generateSingleHandler,
  patchByFieldHandler,
} from "./handlers";

// Define API endpoints for the express application
export const defineEndpoints = (app: Application): void => {
  const companiesHandler = createHandler("companies");
  const businessDiscussionsHandler = createHandler("business_discussions");

  // Define routes for companies

  /**
   * @swagger
   * /api/v1/companies:
   *   get:
   *     summary: 全企業のリストを取得
   *     description: 登録されているすべての企業を返します。
   *     responses:
   *       200:
   *         description: 正常に企業リストを取得
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 total_count:
   *                   type: integer
   *                   description: 全体の企業数
   *                 page_item_count:
   *                   type: integer
   *                   description: 現在のページに含まれる企業数
   *                 page_index:
   *                   type: integer
   *                   description: 現在のページインデックス
   *                 page_count:
   *                   type: integer
   *                   description: 全体のページ数
   *                 start_index:
   *                   type: integer
   *                   description: 開始インデックス
   *                 last_index:
   *                   type: integer
   *                   description: 終了インデックス
   *                 is_last_page:
   *                   type: boolean
   *                   description: 最終ページであるかどうか
   *                 list:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Company'
   *       500:
   *         $ref: '#/components/responses/UnauthorizedError'
   */
  app.get("/api/v1/companies", companiesHandler("list")(getListParams));
  app.post("/api/v1/companies", companiesHandler("create")(createParams));

  app.get(
    "/api/v1/companies/shokon-code/:shokon_code",
    generateSingleHandler(companiesHandler, "shokon_code")
  );
  app.patch(
    "/api/v1/companies/shokon-code/:shokon_code",
    patchByFieldHandler("companies", "shokon_code")
  );

  app.patch(
    "/api/v1/companies/id/:key",
    companiesHandler("save")(updateParams("key"))
  );

  /**
   * @swagger
   * /api/v1/companies/{kentem_id}:
   *   get:
   *     summary: Kentem ID をもとに企業を取得
   *     description: Kentem ID に紐づく企業を返します。
   *     parameters:
   *       - in: path
   *         name: kentem_id
   *         required: true
   *         description: 企業のKentem ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: 正常に企業を取得
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Company'
   *       404:
   *         description: 指定されたKentem ID の企業が見つかりません
   *       500:
   *         $ref: '#/components/responses/UnauthorizedError'
   */
  app.get(
    "/api/v1/companies/:kentem_id",
    generateSingleHandler(companiesHandler, "kentem_id")
  );
  app.patch(
    "/api/v1/companies/:kentem_id",
    patchByFieldHandler("companies", "kentem_id")
  );

  // Define routes for business discussions

  /**
   * @swagger
   * /api/v1/business_discussions:
   *   get:
   *     summary: ビジネス会議のリストを取得(作成中)
   *     description: 登録されているすべてのビジネス会議を返します。
   *     responses:
   *       200:
   *         description: 正常にビジネス会議リストを取得
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   id:
   *                     type: integer
   *                     description: ビジネス会議ID
   *                   title:
   *                     type: string
   *                     description: ビジネス会議のタイトル
   */
  app.get(
    "/api/v1/business-discussions",
    businessDiscussionsHandler("list")(getListParams)
  );
  app.post(
    "/api/v1/business-discussions",
    businessDiscussionsHandler("create")(createParams)
  );
};
