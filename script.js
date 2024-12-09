window.addEventListener('DOMContentLoaded', () => {
    initializeForm();
    initializeEventListeners();
    autoExecuteIfParamsExist();
});

function initializeForm() {
    const count = document.getElementById('count');
    count.value = 10; // 初期値設定
    syncParamsWithURL(); // URL パラメータを反映
}

function initializeEventListeners() {
    const executeButton = document.getElementById('exe');
    const form = document.getElementById('form');
    const rankInput = document.getElementById('rank');
    const countInput = document.getElementById('count');
    const isSort = document.getElementById('sort');
    const filtervalue = document.getElementById('filter');
    const buttons = document.querySelectorAll('.observed');

    // フォームの値変更時に URL を更新
    form.addEventListener('input', () =>
        updateURLParams(rankInput.value, countInput.value, isSort.checked, filtervalue.value, disable_dup.checked));

    // ボタン押下時の処理
    executeButton.addEventListener('click', executeTechniques);

    buttons.forEach(button => {
        button.addEventListener('click', async () => {
            const data = await fetchCSVData('./data.csv');
            if (!data) {
                console.error("データの取得に失敗しました。");
                return;
            }
           updateTable('table', isSort, disable_dup, data);
        });
    });

    document.getElementById("clearHistoryBtn").addEventListener("click", clearHistory);
    document.getElementById("clearTableBtn").addEventListener("click", clearTable);

}

async function executeTechniques() {
    saveHistory();
    const rankInput = document.getElementById('rank');
    const countInput = document.getElementById('count');
    const isSort = document.getElementById('sort');
    const filtervalue = document.getElementById('filter');
    const disable_dup = document.getElementById('disable_dup');

    const data = await fetchCSVData('./data.csv');
    if (!data) {
        console.error("データの取得に失敗しました。");
        return;
    }

    let techniques = getRandomTechniques(data, rankInput.value, countInput.value, filtervalue.value, disable_dup);

    updateTable('table', isSort, disable_dup, data)
}

async function fetchCSVData(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`HTTPエラー: ${response.status}`);
        const text = await response.text();
        return parseCSV(text);
    } catch (error) {
        console.error("CSVファイルの読み込み中にエラーが発生:", error);
        return null;
    }
}

function updateTable(tableid, isSort, disable_dup, data) {
    const tableData = restoreDataFromStorage(data);

    if (isSort.checked) {
        const sortedData = restoreOrder(data, tableData);
        displayDataInTable(sortedData, tableid);
    } else {
        displayDataInTable(tableData, tableid);
    }

    if (disable_dup.checked) {
        const filteredData = filterReferenceData(localStorageManager.getAllItem(), tableData);
        displayDataInTable(filteredData, tableid);
    } else {
        displayDataInTable(tableData, tableid);
    }
}

function displayDataInTable(data, tableId) {
    const table = document.getElementById(tableId);
    const tbody = table.querySelector('tbody') || table.appendChild(document.createElement('tbody'));
    tbody.innerHTML = ''; // 既存の内容をクリア
    data.forEach((row, index) => {
        const tableRow = document.createElement('tr');
        // 行番号を追加
        const noCell = createTableCell(index + 1);
        tableRow.appendChild(noCell);
        // データセルを追加
        row.forEach((cellData, colIndex) => {
            const cell = createTableCell(colIndex === 1 ? convertRank(cellData) : cellData);
            tableRow.appendChild(cell);
        });
        tbody.appendChild(tableRow);
    });
}

function getCurrentTable(){
    const sesItems = sessionStorageManager.getAllItem();
}

function parseCSV(csvText) {
    return csvText.split(/\r?\n/).map(line => line.split(',')).filter(row => row.length > 1);
}

function updateURLParams(rank, count, sort, filter, disable_dup) {
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('rank', rank);
    newUrl.searchParams.set('count', count);
    newUrl.searchParams.set('sort', sort);
    newUrl.searchParams.set('disable_dup', disable_dup)
    newUrl.searchParams.set('filter', filter);
    window.history.replaceState(null, '', newUrl.toString());
}

function syncParamsWithURL() {
    const params = new URLSearchParams(window.location.search);
    const rankParam = params.get('rank');
    const countParam = params.get('count');
    const sortParam = params.get('sort');
    const filterParam = params.get('filter');
    const disable_dup = document.getElementById('disable_dup');

    if (rankParam) document.getElementById('rank').value = rankParam;
    if (countParam) document.getElementById('count').value = countParam;
    if (sortParam) document.getElementById('sort').checked = sortParam === 'true';
    if (filterParam) document.getElementById('filter').value = filterParam;
    if (disable_dup) document.getElementById('disable_dup').checked = disable_dup == 'true' ;
}

function getRandomTechniques(data, minLevel, count, filter, disable_dup) {
    let filteredData;
    switch (filter) {
        case 'under':
            filteredData = data.filter(row => Number(row[1]) >= Number(minLevel));
            break;
        case 'only':
            filteredData = data.filter(row => Number(row[1]) == Number(minLevel));
            break;
        case 'over':
            filteredData = data.filter(row => Number(row[1]) <= Number(minLevel));
            break;
        default:
            filteredData = data;
    }

    for (let i = filteredData.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filteredData[i], filteredData[j]] = [filteredData[j], filteredData[i]];
    }

    let returnData = filteredData.slice(0, Number(count));

    saveTableCache(returnData);

    return returnData;
}

function createTableCell(content) {
    const cell = document.createElement('td');
    cell.textContent = content;
    return cell;
}

function convertRank(rank) {
    const rankMapping = {
        5: '五級',
        3: '三級',
        1: '一級',
        '-1': '初段'
    };
    return rankMapping[rank] || rank;
}

function restoreOrder(A, B) {
    // Aの各要素をキーとして、インデックスを値とするオブジェクトを作成
    const indexMap = {};
    A.forEach((item, index) => {
        indexMap[item[0]] = index;
    });

    // BをAの順序に従ってソート
    return B.sort((a, b) => {
        return indexMap[a[0]] - indexMap[b[0]];
    });
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function autoExecuteIfParamsExist() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('rank') && params.get('count') && params.get('sort') && params.get('filter')) {
        executeTechniques();
    }
}

class localStorageManager {
    constructor() {
        this.lsAble =  window.localStorage ? true : false ;
    }

    static appendItems(items) {
        const length = localStorage.length;
        const seted_items = Array.from(new Set(items.concat(localStorageManager.getAllItem())));
        seted_items.forEach( function( value, index ) {
            const indexer = index + length ;
            localStorage.setItem(indexer, value);
        });
    }

    static getAllItem() {
        let items = [];
        const indexer = localStorage.length;
        for (var i = 0; i < indexer; i += 1){
            items.push(localStorage[i]);
        }
        return items;
    }

    static clearStrage() {
        localStorage.clear();
    }
}

class sessionStorageManager {
    constructor() {
        this.ssAble = window.sessionStorage ? true : false ;
    }

    static setItems(items) {
        this.clearStrage();
        items.forEach( function( value, index ) {
            const indexer = index;
            sessionStorage.setItem(indexer, value);
        });
    }

    static getAllItem() {
        let items = [];
        const indexer = sessionStorage.length;
        for (var i = 0; i < indexer; i += 1){
            items.push(sessionStorage[i]);
        }
        return items;
    }

    static clearStrage() {
        sessionStorage.clear();
    }
}

function saveTableCache(data){
    let stores = data.map(value => value[0]);
    sessionStorageManager.setItems(stores);
}

function saveHistory(){
    const current = sessionStorageManager.getAllItem();
    localStorageManager.appendItems(current);
}

function clearHistory() {
    localStorageManager.clearStrage();
}

function clearTable() {
    sessionStorageManager.clearStrage();

    const tableBody = document.querySelector("#table tbody");
    tableBody.innerHTML = "";
}

function restoreDataFromStorage(csvData) {
    const sesData = sessionStorageManager.getAllItem();
    const restoredData = csvData.filter(row => row.some(value => sesData.includes(value)));

    const referenceMap = new Map(restoredData);

    // 入力データをキーとしてソートし、参照データを取得
    return sesData.map(sesData => {
        const reference = referenceMap.get(sesData);
        return [sesData, reference || null]; // 参照データがない場合はnull
    });
}

function filterReferenceData(techniquesToExclude, referenceData) {
  // 除外する技名をSetで管理 (検索効率向上のため)
  const excludeSet = new Set(techniquesToExclude);

  // 参照データをフィルター
  return referenceData.filter(([technique, value]) => {
    return !excludeSet.has(technique);
  });
}
