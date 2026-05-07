document.addEventListener('DOMContentLoaded', () => {
    const excelFile = document.getElementById('excelFile');
    const filterField = document.getElementById('filterField');
    const turnoSelect = document.getElementById('turnoSelect');
    const rangoSelect = document.getElementById('rangoSelect');
    const dateInput = document.getElementById('dateInput');
    const minInput = document.getElementById('minInput');
    const maxInput = document.getElementById('maxInput');
    const searchInput = document.getElementById('searchInput');
    const searchLabel = document.querySelector('label[for="searchInput"]');
    const table = document.getElementById('dataTable');
    const tableHead = table.tHead || table.createTHead();
    const tbody = table.tBodies[0] || table.createTBody();
    let rows = [];
    let headers = [];
    let currentExcelHeaders = null;
    let currentExcelRows = [];
    let currentDbHeaders = null;
    let currentDbRows = [];

    const headerAliases = {
        fecha: ['fecha'],
        turno: ['turno'],
        ph: ['pH cil', 'ph cil', 'ph'],
        cn: ['cn libre', 'cn'],
        solidos: ['solidos', 'sólidos'],
        caudal: ['caudal pulpa', 'caudal'],
        oxigeno: ['oxígeno disuelto', 'oxigeno disuelto', 'oxigeno'],
        ley: ['ley cola au', 'ley'],
    };

    let fieldIndex = {};

    function normalize(text) {
        return text
            .toString()
            .trim()
            .toLowerCase()
            .replace(/á/g, 'a')
            .replace(/é/g, 'e')
            .replace(/í/g, 'i')
            .replace(/ó/g, 'o')
            .replace(/ú/g, 'u');
    }

    function getHeaderIndexForField(field) {
        const aliases = headerAliases[field] || [];
        return headers.findIndex(header => aliases.some(alias => normalize(header) === normalize(alias)));
    }

    function updateFieldIndex() {
        Object.keys(headerAliases).forEach(field => {
            fieldIndex[field] = getHeaderIndexForField(field);
        });
    }

    function buildHeader(headerNames) {
        headers = headerNames.map(cell => cell.toString().trim());
        tableHead.innerHTML = '';
        const tr = document.createElement('tr');

        headers.forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            tr.appendChild(th);
        });

        tableHead.appendChild(tr);
        updateFieldIndex();
    }

    function calculateColumnStats(dataRows, headers) {
        const stats = {};
        headers.forEach((header, index) => {
            const values = dataRows.map(row => parseFloat(row[index])).filter(v => !isNaN(v));
            if (values.length > 0) {
                const mean = values.reduce((a, b) => a + b, 0) / values.length;
                const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
                const sd = Math.sqrt(variance);
                stats[header] = { mean, sd };
            }
        });
        return stats;
    }

    function buildTableRows(dataRows, stats) {
        tbody.innerHTML = '';

        dataRows.forEach(rowValues => {
            const row = document.createElement('tr');
            let rowClass = 'normal';
            headers.forEach((header, index) => {
                const cell = document.createElement('td');
                const value = rowValues[index];
                cell.textContent = value;
                if (stats[header] && !isNaN(parseFloat(value))) {
                    const num = parseFloat(value);
                    const { mean, sd } = stats[header];
                    if (num >= mean - sd && num <= mean + sd) {
                        cell.classList.add('normal');
                    } else if (num >= mean - 2 * sd && num <= mean + 2 * sd) {
                        cell.classList.add('alerta');
                    } else {
                        cell.classList.add('accion');
                        rowClass = 'accion';
                    }
                    if (cell.classList.contains('alerta') && rowClass !== 'accion') {
                        rowClass = 'alerta';
                    }
                }
                row.appendChild(cell);
            });
            row.classList.add(rowClass);
            tbody.appendChild(row);
        });

        rows = Array.from(tbody.rows);
        filterTable();
    }

    function buildTable(headerNames, dataRows) {
        buildHeader(headerNames);
        const stats = calculateColumnStats(dataRows, headerNames);
        buildTableRows(dataRows, stats);
    }

    function updateFilterInputVisibility() {
        const hideAll = () => {
            turnoSelect.style.display = 'none';
            document.getElementById('turnoLabel').style.display = 'none';
            rangoSelect.style.display = 'none';
            document.getElementById('rangoLabel').style.display = 'none';
            dateInput.style.display = 'none';
            document.getElementById('dateLabel').style.display = 'none';
            minInput.style.display = 'none';
            document.getElementById('minLabel').style.display = 'none';
            maxInput.style.display = 'none';
            document.getElementById('maxLabel').style.display = 'none';
            searchInput.style.display = 'none';
            searchLabel.style.display = 'none';
            searchInput.value = '';
        };

        hideAll();

        if (filterField.value === 'turno') {
            turnoSelect.style.display = '';
            document.getElementById('turnoLabel').style.display = '';
        } else if (filterField.value === 'rango') {
            rangoSelect.style.display = '';
            document.getElementById('rangoLabel').style.display = '';
        } else if (filterField.value === 'fecha') {
            dateInput.style.display = '';
            document.getElementById('dateLabel').style.display = '';
        } else {
            minInput.style.display = '';
            document.getElementById('minLabel').style.display = '';
            maxInput.style.display = '';
            document.getElementById('maxLabel').style.display = '';
        }
    }

    function filterTable() {
        const field = filterField.value;
        const column = fieldIndex[field];
        let query = '';

        if (field === 'turno') {
            query = turnoSelect.value.trim().toLowerCase();
        } else if (field === 'rango') {
            query = rangoSelect.value;
        } else if (field === 'fecha') {
            query = dateInput.value;
        } else {
            query = searchInput.value.trim().toLowerCase();
        }

        if (field === 'rango') {
            rows.forEach(row => {
                row.style.display = query === '' || row.classList.contains(query) ? '' : 'none';
            });
        } else if (field === 'fecha') {
            rows.forEach(row => {
                if (column < 0) {
                    row.style.display = '';
                    return;
                }
                const cell = row.cells[column];
                const text = cell ? cell.textContent.trim() : '';
                row.style.display = query === '' || text.startsWith(query) ? '' : 'none';
            });
        } else if (field !== 'turno' && fieldIndex[field] >= 0 && (minInput.value !== '' || maxInput.value !== '')) {
            const min = minInput.value !== '' ? parseFloat(minInput.value) : -Infinity;
            const max = maxInput.value !== '' ? parseFloat(maxInput.value) : Infinity;
            rows.forEach(row => {
                const cell = row.cells[column];
                const value = cell ? parseFloat(cell.textContent.trim()) : NaN;
                row.style.display = !isNaN(value) && value >= min && value <= max ? '' : 'none';
            });
        } else if (column < 0) {
            rows.forEach(row => (row.style.display = ''));
        } else {
            rows.forEach(row => {
                const cell = row.cells[column];
                const text = cell ? cell.textContent.trim().toLowerCase() : '';
                row.style.display = text.includes(query) ? '' : 'none';
            });
        }
    }

    function parseSheetToData(sheet) {
        const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
        if (raw.length === 0) {
            return { headers: [], rows: [] };
        }

        const headerRow = raw[0].map(cell => cell.toString().trim());
        const dataRows = raw.slice(1).map(row => headerRow.map((_, index) => (row[index] !== undefined ? row[index] : '')));
        return { headers: headerRow, rows: dataRows };
    }

    function handleFile(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = e => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const { headers: loadedHeaders, rows: loadedRows } = parseSheetToData(sheet);
            if (loadedHeaders.length) {
                currentExcelHeaders = loadedHeaders;
                currentExcelRows = loadedRows;
                buildTable(currentExcelHeaders, currentExcelRows);
            }
        };
        reader.readAsArrayBuffer(file);
    }

    async function loadFromDatabase() {
        try {
            const response = await fetch('/api/variables');
            if (!response.ok) {
                throw new Error(`Error al cargar datos: ${response.status}`);
            }
            const jsonData = await response.json();
            if (!Array.isArray(jsonData) || jsonData.length === 0) return { headers: [], rows: [] };

            const dbHeaders = Object.keys(jsonData[0]);
            const dbRows = jsonData.map(item => dbHeaders.map(header => (item[header] !== undefined ? item[header] : '')));
            return { headers: dbHeaders, rows: dbRows };
        } catch (error) {
            console.error(error);
            alert('No se pudo cargar datos desde la base de datos. Verifica el servidor.');
            return { headers: [], rows: [] };
        }
    }

    function mergeDataSources(headersA, rowsA, headersB, rowsB) {
        const mergedHeaders = [...new Set([...(headersA || []), ...(headersB || [])])];
        const toRow = (headersSource, rowValues) => mergedHeaders.map(header => {
            const index = (headersSource || []).findIndex(h => normalize(h) === normalize(header));
            return index >= 0 ? rowValues[index] : '';
        });
        const mergedRows = [];
        if (rowsA.length) mergedRows.push(...rowsA.map(row => toRow(headersA, row)));
        if (rowsB.length) mergedRows.push(...rowsB.map(row => toRow(headersB, row)));
        return { headers: mergedHeaders, rows: mergedRows };
    }

    async function loadFromDatabaseWithExcel() {
        const dbData = await loadFromDatabase();
        if (!currentExcelHeaders || currentExcelRows.length === 0) {
            alert('Selecciona primero un archivo Excel para combinarlo con la base de datos.');
            return;
        }
        currentDbHeaders = dbData.headers;
        currentDbRows = dbData.rows;
        const merged = mergeDataSources(currentExcelHeaders, currentExcelRows, currentDbHeaders, currentDbRows);
        buildTable(merged.headers, merged.rows);
    }

    async function loadFromDatabaseOnly() {
        excelFile.value = '';
        currentExcelHeaders = null;
        currentExcelRows = [];
        const dbData = await loadFromDatabase();
        currentDbHeaders = dbData.headers;
        currentDbRows = dbData.rows;
        if (currentDbHeaders.length) {
            buildTable(currentDbHeaders, currentDbRows);
        }
    }

    excelFile.addEventListener('change', handleFile);
    document.getElementById('loadDbWithExcelButton').addEventListener('click', loadFromDatabaseWithExcel);
    document.getElementById('loadDbOnlyButton').addEventListener('click', loadFromDatabaseOnly);
    filterField.addEventListener('change', () => {
        updateFilterInputVisibility();
        filterTable();
    });
    turnoSelect.addEventListener('change', filterTable);
    rangoSelect.addEventListener('change', filterTable);
    dateInput.addEventListener('change', filterTable);
    minInput.addEventListener('input', filterTable);
    maxInput.addEventListener('input', filterTable);
    searchInput.addEventListener('input', filterTable);
    updateFilterInputVisibility();
});
