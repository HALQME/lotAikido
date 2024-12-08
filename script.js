window.addEventListener('DOMContentLoaded', () => {
    initializeForm();
    initializeEventListeners();
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

    // フォームの値変更時に URL を更新
    form.addEventListener('input', () => updateURLParams(rankInput.value, countInput.value));

    // ボタン押下時の処理
    executeButton.addEventListener('click', async () => {
        const data = await fetchCSVData('./data.csv');
        if (!data) {
            console.error("CSVの取得に失敗しました。");
            return;
        }
        const techniques = getRandomTechniques(data, rankInput.value, countInput.value);
        displayDataInTable(techniques, 'table');
    });
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

function updateURLParams(rank, count) {
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('rank', rank);
    newUrl.searchParams.set('count', count);
    window.history.replaceState(null, '', newUrl.toString());
}

function syncParamsWithURL() {
    const params = new URLSearchParams(window.location.search);
    const rankParam = params.get('rank');
    const countParam = params.get('count');

    if (rankParam) document.getElementById('rank').value = rankParam;
    if (countParam) document.getElementById('count').value = countParam;
}

function getRandomTechniques(data, minLevel, count) {
    const filteredData = data.filter(row => Number(row[1]) >= Number(minLevel));

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