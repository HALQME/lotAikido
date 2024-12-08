#!/usr/bin/env python3

# Define the sorting order for the categories and techniques
first_level_order = [
	"体の", "座法", "正面打ち", "片手取り", "交差取り", "突き", "横面打ち", "両手取り", "諸手取り", "後ろ両手取り" , "袖口取り", "袖取り", "肩取り", "胸取り", "両肩取り", "後胸取り", "後ろ襟取り"
]

second_level_order = [
	"一教(表)", "一教(裏)", "二教(表)", "二教(裏)", "三教(表)", "三教(裏)", "四教(表)", "四教(裏)", "四方投げ(表)", "四方投げ(裏)", "入り身投げ", "小手返し", "回転投げ", "呼吸投げ", "十字投げ", "腰投げ"
]

# ソートキーを定義する関数
def sorting_key(row):
    technique, _ = row
    for first_level in first_level_order:
        if technique.startswith(first_level):
            first_index = first_level_order.index(first_level)
            break
    else:
        first_index = len(first_level_order)  # 見つからない場合は最後に配置

    for second_level in second_level_order:
        if second_level in technique:
            second_index = second_level_order.index(second_level)
            break
    else:
        second_index = len(second_level_order)  # 見つからない場合は最後に配置

    return (first_index, second_index)



# Input CSV data
data = []
with open('./data.csv') as f:
    for line in f:
       data.append(line.replace('\n', ''))
data = [line.split(",") for line in data]

# ソートキーを基にデータを並べ替え
try:
    data.sort(key=sorting_key)
except ValueError:
    print("ソート済みの可能性があります")

# 並べ替えたデータをCSV形式に戻す
sorted_csv = "\n".join(["{},{}".format(row[0], row[1]) for row in data])
f = open('./data.csv', 'w')
f.writelines(sorted_csv)