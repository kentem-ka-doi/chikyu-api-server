# Node.jsの軽量イメージをベースにする
FROM node:22.11.0-alpine3.20

# 必要なパッケージをインストール
RUN apk add --no-cache git openssh-client

# 作業ディレクトリを設定
WORKDIR /usr/src/app

# 必要なファイルをコピー
COPY package.json yarn.lock tsconfig.json ./

# パッケージマネージャーとしてyarnを使用
RUN corepack enable

# package.jsonとyarn.lockをコピー
COPY package.json yarn.lock ./

# ホストのSSHキーをコンテナにコピーする
# 必要な鍵だけをコピーして安全性を保つ
COPY .ssh /root/.ssh
RUN chmod 600 /root/.ssh/id_ed25519_github2
RUN ssh-keyscan github.com >> /root/.ssh/known_hosts

# 依存関係をインストール
RUN yarn install --frozen-lockfile

# 不要なパッケージをアンインストール
RUN apk del git openssh-client

# 不要な認証情報をアンインストール
RUN rm -rf /root/.ssh

# TypeScriptをグローバルにインストール
RUN yarn global add typescript

# ソースコードをコピー
COPY src ./src

# TypeScriptコードをコンパイル
RUN yarn build

# サーバーを起動
CMD ["yarn", "start"]
