import { GameConfig } from './GameConfig';

export class GridModel {
    private _cells: Int8Array;

    constructor() {
        this._cells = new Int8Array(GameConfig.GridWidth * GameConfig.GridHeight);
    }

    public getCellByIndex(index: number): number {
        if (index < 0 || index >= this._cells.length) return -1;
        return this._cells[index];
    }

    public setCellByIndex(index: number, tier: number): void {
        if (index >= 0 && index < this._cells.length) {
            this._cells[index] = tier;
        }
    }

    public getRandomEmptyIndex(): number {
        const empty: number[] = [];
        for (let i = 0; i < this._cells.length; i++) {
            if (this._cells[i] === 0) empty.push(i);
        }
        if (empty.length === 0) return -1;
        return empty[Math.floor(Math.random() * empty.length)];
    }
}
