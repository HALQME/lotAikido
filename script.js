window.addEventListener('DOMContentLoaded', () => {
    initializeForm();
    initializeEventListeners();
    autoExecuteIfParamsExist();
});

function initializeForm() {
    const count = document.getElementById('count');
    count.value = 4; // 初期値設定
    syncParamsWithURL(); // URL パラメータを反映
}

function initializeEventListeners() {
    const executeButton = document.getElementById('exe');
    const form = document.getElementById('form');
    const rankInput = document.getElementById('rank');
    const countInput = document.getElementById('count');
    const isSort = document.getElementById('sort');
    const filtervalue = document.getElementById('filter');

    // フォームの値変更時に URL を更新
    form.addEventListener('input', () => updateURLParams(rankInput.value, countInput.value, isSort.checked, filtervalue.value));

    // ボタン押下時の処理
    executeButton.addEventListener('click', executeTechniques);

        let techniques = getRandomTechniques(data, rankInput.value, countInput.value, filtervalue.value);
        if (isSort.checked) {
            techniques = restoreOrder(data, techniques);
        }
        displayDataInTable(techniques, 'table');
    });
}

async function executeTechniques() {
    const rankInput = document.getElementById('rank');
    const countInput = document.getElementById('count');
    const isSort = document.getElementById('sort');
    const filtervalue = document.getElementById('filter');

    const data = await fetchCSVData('./data.csv');
    if (!data) {
        console.error("データの取得に失敗しました。");
        return;
    }

    let techniques = getRandomTechniques(data, rankInput.value, countInput.value, filtervalue.value);
    if (isSort.checked) {
        techniques = restoreOrder(data, techniques);
    }
    displayDataInTable(techniques, 'table');
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

function parseCSV(csvText) {
    return csvText.split(/\r?\n/).map(line => line.split(',')).filter(row => row.length > 1);
}

function updateURLParams(rank, count, sort, filter) {
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('rank', rank);
    newUrl.searchParams.set('count', count);
    newUrl.searchParams.set('sort', sort);
    newUrl.searchParams.set('filter', filter);
    window.history.replaceState(null, '', newUrl.toString());
}

function syncParamsWithURL() {
    const params = new URLSearchParams(window.location.search);
    const rankParam = params.get('rank');
    const countParam = params.get('count');
    const sortParam = params.get('sort');
    const filterParam = params.get('filter');
    if (rankParam) document.getElementById('rank').value = rankParam;
    if (countParam) document.getElementById('count').value = countParam;
    if (sortParam) document.getElementById('sort').checked = sortParam === 'true';
    if (filterParam) document.getElementById('filter').value = filterParam;
}

function getRandomTechniques(data, minLevel, count, filter) {
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

    return filteredData.slice(0, Number(count));
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
function autoExecuteIfParamsExist() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('rank') && params.get('count') && params.get('sort') && params.get('filter')) {
        executeTechniques();
    }
}