# 審査技ジェネレーター
https://halqme.github.io/lotAikido/

- 選ばれた級段位の昇級・昇段審査で見られる技を出力します
- 出力数がデータの数を上回った場合は，全てが出力されます

## 使い方
1. 級段位と範囲を選ぶ（3級 以下 の場合，3級と5級の技が適応されます）
2. 出力数を選ぶ
3. ソートするかを決める（ルールは後述します）
4. 実行

### ソートアルゴリズムについて
```
体の
座法
正面打ち
片手取り
交差取り
突き
横面打ち
両手取り
諸手取り
後ろ両手取り
袖口取り
袖取り
肩取り
胸取り
両肩取り
後胸取り
後ろ襟取り
```

```
一教(表)
一教(裏)
二教(表)
二教(裏)
三教(表)
三教(裏)
四教(表)
四教(裏)
四方投げ(表)
四方投げ(裏)
入り身投げ
小手返し
回転投げ
呼吸投げ
十字投げ
腰投げ
```

の順序でソートされます。

### リストされている技について
[data.csv](https://github.com/HALQME/lotAikido/blob/b6fa10849fce200873cef229e9a6eca97be0b81d/data.csv)に記載されています。
5: 5級
-1: 初段
です。リストは開発者の所属道場でのもの拠ります。違うリストを使いたい場合は，Issueではなく，フォークしてお使いください。

data.csvの内容のみ変更するなら，問題なく利用可能です。（名称の違いでソートスクリプトが動かない可能性はあります。）

### ソートスクリプトについて
改変の頻度は多くないのでActionsには登録していません。なんらかの都合でPRを出す場合は先に`python3 sort.py`を実行してからお願いします。

## 開発者向け
ブラウザの保護機能により，直接HTMLをひらく場合，csvの読み込みが出来ません。
`http-server`などを利用しての開発をお勧めします。