import { wazadata } from "./data.ts";

export class localStorageManager {
    lsAble: boolean;
    constructor() {
        this.lsAble = window.localStorage ? true : false;
    }

    static appendItems(items: number[]) {
        if (!items) return;
        const length = localStorage.length;
        const seted_items = Array.from(
            new Set(
                items
                    .concat(localStorageManager.getAllItem())
                    .filter((item) => item !== undefined)
            )
        );
        seted_items.forEach(function (value, index) {
            if (value !== undefined) {
                const indexer = index + length;
                localStorage.setItem(`${indexer}`, value.toString());
            }
        });
    }

    static getAllItem() {
        let items = [];
        const indexer = localStorage.length;
        for (var i = 0; i < indexer; i += 1) {
            const item = localStorage[i];
            if (item !== undefined) {
                items.push(item);
            }
        }
        return items;
    }

    static clearStrage() {
        localStorage.clear();
    }
}

export class sessionStorageManager {
    ssAble: boolean;
    constructor() {
        this.ssAble = window.sessionStorage ? true : false;
    }

    static setItems(items: number[]) {
        if (!items) return;
        this.clearStrage();
        items.forEach(function (value, index) {
            if (value !== undefined) {
                const indexer = index;
                sessionStorage.setItem(indexer.toString(), value.toString());
            }
        });
    }

    static getAllItem() {
        let items: number[] = [];
        const indexer = sessionStorage.length;
        for (var i = 0; i < indexer; i += 1) {
            const item = sessionStorage[i];
            if (item !== undefined) {
                items.push(item);
            }
        }
        return items;
    }

    static clearStrage() {
        sessionStorage.clear();
    }
}

export class storage {
    constructor() {}

    saveTableCache(data: typeof wazadata) {
        if (!data) return;
        const values = data
            .filter((item) => item !== undefined)
            .map((data) => data.id);
        sessionStorageManager.setItems(values);
    }

    saveHistory() {
        const current = sessionStorageManager.getAllItem();
        if (current.length > 0) {
            localStorageManager.appendItems(current);
        }
    }

    clearHistory() {
        localStorageManager.clearStrage();
    }

    clearTable() {
        sessionStorageManager.clearStrage();

        const tableBody = document.querySelector("#table tbody");
        if (tableBody) {
            tableBody.innerHTML = "";
        }
    }
}
