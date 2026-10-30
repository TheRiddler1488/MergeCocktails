import { _decorator, Component, Node, v3, Vec3 } from 'cc';
import { GameConfig } from './GameConfig';
import { PoolManager } from './PoolManager';
const { ccclass, property } = _decorator;

@ccclass('BoardView')
export class BoardView extends Component {
    @property(Node) boardContainer: Node = null!;
    @property(Node) itemsContainer: Node = null!;

    private _itemNodes: (Node | null)[] = [];

    onLoad() {
        const totalCells = GameConfig.GridWidth * GameConfig.GridHeight;
        this._itemNodes = new Array(totalCells).fill(null);
    }

    start() {
        this.buildBoardVisuals();
    }

    private buildBoardVisuals() {
        const totalCells = GameConfig.GridWidth * GameConfig.GridHeight;
        for (let i = 0; i < totalCells; i++) {
            const slotNode = PoolManager.Instance.getSlot();
            slotNode.setParent(this.boardContainer);

            slotNode.setPosition(this.getPosByIndex(i));
        }
    }

    public setItemNode(index: number, node: Node | null) {
        if (index >= 0 && index < this._itemNodes.length) {
            this._itemNodes[index] = node;
        }
    }

    public getItemNode(index: number): Node | null {
        if (index >= 0 && index < this._itemNodes.length) {
            return this._itemNodes[index];
        }
        return null;
    }

    public getPosByIndex(index: number): Vec3 {
        const { GridWidth, GridHeight, CellSize, CellSpacing } = GameConfig;
        const step = CellSize + CellSpacing;

        const x = index % GridWidth;
        const y = Math.floor(index / GridWidth);

        const offsetX = (GridWidth * step) / 2 - step / 2;
        const offsetY = (GridHeight * step) / 2 - step / 2;

        return v3(x * step - offsetX, y * step - offsetY, 0);
    }
}
