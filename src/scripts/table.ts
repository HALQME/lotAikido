import { wazadata } from "../assets/data.ts";
import { localStorageManager, storage } from "./session.ts";
import { Random } from "./random.ts";
import { seed, setSeed, genSeed } from "./seed.ts";
import { getParams } from "./param";

// 現在のURLをパラメーター付きで取得
const shareTableBtn = document.getElementById("shareTableBtn");
shareTableBtn?.addEventListener("click", () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("seed");
    const shareUrl = url.href + `&seed=${seed}`;
    navigator.clipboard.writeText(shareUrl);
    alert("URLをコピーしました");
});

document.getElementById("shuffle")?.addEventListener("click", () => {
    genSeed();
    const newUrl = new URL(window.location.href);
    const seedvalue = newUrl.searchParams.get("seed");
    if (seedvalue == "0" || seedvalue == null) {
        console.log(seed);
        createTable();
    } else {
        setSeed(seed);
    }
});

document.addEventListener("DOMContentLoaded", () => {
    createTable();
});

// パラメーターを受け取って、テーブルを生成する関数
export function createTable() {
    // localStorageにSessionStrageの内容を保存し，sessionStorgaeはクリア
    const storageManager = new storage();
    storageManager.saveHistory();
    storageManager.clearTable();

    const { rank, count, filter, disable_dup, sort, positive, negative } =
        getParams();

    const seedValue = Number(seed);
    const rankValue = Number(rank) || 0;
    const countValue = Number(count) || 10;

    let filteredData = filterData(
        rankValue,
        filter,
        disable_dup,
        positive,
        negative
    );

    filteredData = randomizer(seedValue, filteredData);

    // スライス
    const slicedData = slice(filteredData, countValue);

    if (sort == "true") {
        slicedData.sort((a, b) => a.id - b.id);
    }

    // テーブルを生成
    const table = document.getElementById("table")?.querySelector("tbody");
    if (table) {
        table.innerHTML = "";
        slicedData.forEach((data, indexer) => {
            if (data) {
                const tr = document.createElement("tr");
                const id = document.createElement("td");
                const waza = document.createElement("td");
                const rank = document.createElement("td");

                id.style.padding = "8px 10px";
                waza.style.padding = "8px 10px";
                rank.style.padding = "9px 10px";

                id.textContent = `${indexer + 1}`;
                waza.textContent = `${data.waza_in}${data.waza_out}`;
                rank.textContent = convertRank(data.rank);

                tr.appendChild(id);
                tr.appendChild(waza);
                tr.appendChild(rank);

                table.appendChild(tr);
            }
        });
    }

    // sessionStrageに現在の値を格納
    storageManager.saveTableCache(slicedData);
}

// data.jsから技のデータを取得して条件に合うものをフィルタリングする関数
function filterData(
    rank: number,
    filter: string | null,
    disable_dup: string | null,
    positive: string | null,
    negative: string | null
) {
    let filtered = wazadata;

    // 重複の技を除く
    if (disable_dup == "true") {
        const lsItems = localStorageManager.getAllItem();
        filtered = filtered.filter((data) => !lsItems.includes(data.id));
    }
    // ランクのフィルタリング
    // rankとfilterで処理
    if (filter === "under") {
        filtered = filtered.filter((wazadata) => wazadata.rank >= Number(rank));
    } else if (filter === "only") {
        filtered = filtered.filter(
            (wazadata) => wazadata.rank === Number(rank)
        );
    } else if (filter === "over") {
        filtered = filtered.filter((filtered) => filtered.rank <= Number(rank));
    }

    // ポジティブなキーワードでフィルタリング
    if (positive) {
        const positiveKeywords = positive.split(",");

        // あるキーワードが，data.waza_inのものか，data.waza_outのものか，どちらでもないか確認
        positiveKeywords.forEach((keyword) => {
            const matchesIn = filtered.some((data) =>
                data.waza_in.includes(keyword)
            );
            const matchesOut = filtered.some((data) =>
                data.waza_out.includes(keyword)
            );
            if (!matchesIn && !matchesOut) {
                console.warn(`Keyword "${keyword}" not found in database.`);
            }
        });

        // Split keywords into waza_in and waza_out groups
        const inKeywords: string[] = [];
        const outKeywords: string[] = [];

        positiveKeywords.forEach((keyword) => {
            if (wazadata.some((data) => data.waza_in.includes(keyword))) {
                inKeywords.push(keyword);
            }
            if (wazadata.some((data) => data.waza_out.includes(keyword))) {
                outKeywords.push(keyword);
            }
        });

        filtered = filtered.filter((data) => {
            // If either group is empty, only check the non-empty group
            if (inKeywords.length === 0) {
                return outKeywords.some((keyword) =>
                    data.waza_out.includes(keyword)
                );
            }
            if (outKeywords.length === 0) {
                return inKeywords.some((keyword) =>
                    data.waza_in.includes(keyword)
                );
            }
            // If both groups have keywords, check AND condition between groups
            return (
                inKeywords.some((keyword) => data.waza_in.includes(keyword)) &&
                outKeywords.some((keyword) => data.waza_out.includes(keyword))
            );
        });
    }

    // ネガティブキーワードを除外
    if (negative) {
        const negativeKeywords = negative.split(",");
        filtered = filtered.filter((data) => {
            return negativeKeywords.every(
                (keyword) =>
                    !data.waza_in.includes(keyword) &&
                    !data.waza_out.includes(keyword)
            );
        });
    }

    return filtered;
}

function randomizer(seed: number, filteredData: typeof wazadata) {
    // Random.shuffleArrayを実行
    const random = new Random(seed);
    const numberArray: number[] = Array.from(
        { length: filteredData.length },
        (_, i) => i
    );
    const shuffledNumbers = random.shuffleArray(numberArray);

    // シャッフルした配列を使ってデータを並び替え
    restoreOrder(shuffledNumbers, filteredData);

    return filteredData;
}

function restoreOrder(keys: number[], target: typeof wazadata) {
    // Create a new array with the same order as the shuffled keys
    const orderedArray = new Array(target.length);
    keys.forEach((key, index) => {
        orderedArray[index] = target[key];
    });

    // Copy ordered elements back to the target array
    for (let i = 0; i < orderedArray.length; i++) {
        target[i] = orderedArray[i];
    }

    return target;
}

function slice(filteredData: typeof wazadata, count: number) {
    // countの数だけ配列を切り取る
    const slicedData = filteredData.slice(0, count);
    return slicedData;
}

function convertRank(rank: number) {
    if (rank >= 1) {
        return `${rank}級`;
    } else if (rank <= -1) {
        const kanjiNums = [
            "",
            "初",
            "二",
            "三",
            "四",
            "五",
            "六",
            "七",
            "八",
            "九",
        ];
        const rankChar: string = kanjiNums[Math.abs(rank)];
        return `${rankChar}段`;
    } else {
        return "不明";
    }
}
