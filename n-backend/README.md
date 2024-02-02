# cainz-next-backend

cainz のバックエンド処理をまとめたリポジトリとなります。

## Requirement

- typescript ^4.5.3
- nvm ^0.39.3
- nodejs 18.16.0（2023.04.25 時点での Nodejs LTS 最新版）

## often used command

```bash
# npm install
npm ci

# build
npm run build

# unit test
npm run test

# install new package to specify workspace
npm i -w [workspaceName] [packageName]
# example: install firebase-admin into product workspaceName
cd /path/to/your/source_code/cainz-next-backend
npm i -w product firebase-admin

# run test for specified workspace
npx turbo run test --scope [workspaceName]
```

## 資料/documents

環境構築や設計資料等、ドキュメントは基本的に以下のリポジトリにある、Backend フォルダ以下で管理しています。

- [cainz-next-blueprint](https://github.com/cainz-technology/cainz-next-blueprint)
- [cainz-next-blueprint/backend](https://github.com/cainz-technology/cainz-next-blueprint/tree/main/docs/blueprints/backend)
