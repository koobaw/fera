## 修正内容(Describe your changes)

1. A
1. B
1. C

## セルフチェックリスト(Self check list before requesting a review)

- [x] 項目名は用語集を参照して定義しているか？(Are the item names defined by referring to the glossary?)[用語集/glossary](https://github.com/cainz-technology/cainz-next-blueprint/blob/main/docs/blueprints/backend/05-operations/glossary.md)
- [ ] OpenAPI の定義に従っているか？(Does it follow the OpenAPI definition?)
- [ ] タイポはないか？(Are there any typos?)
- [ ] 外部 API を呼び出すメソッドは開始と終了時にログを出力しているか？(Are the methods that call the external API outputting logs at the start and end?)
- [ ] try{}catch() で捕獲した exception を commonService.logException()メソッドに渡しているか？(Are you passing the exception caught by try{}catch() to the commonService.logException() method?)
- [ ] unit test は実行済か？(Have you run the unit test?)
- [ ] Package に共通処理を作成した場合、メソッドに適切な説明を記載しているか？(If you create common processing in Package, do you describe the method with an appropriate description?)
- [ ] Package に共通処理を作成した場合、unit test を作成しているか？(If you create common processing in Package, do you create unit tests?)
