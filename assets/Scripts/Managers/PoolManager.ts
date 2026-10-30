import { _decorator, Component, Node, Prefab, instantiate } from 'cc';
import { GameConfig } from './GameConfig';
const { ccclass, property } = _decorator;

@ccclass('PoolManager')
export class PoolManager extends Component {
    public static Instance: PoolManager;

    @property(Prefab) slotPrefab: Prefab = null!;
    @property(Prefab) itemPrefab: Prefab = null!;

    private _slotsPool: Node[] = [];
    private _itemsPool: Node[] = [];

    onLoad() {
        PoolManager.Instance = this;

        const totalCells = GameConfig.GridWidth * GameConfig.GridHeight;
        this.prewarm(this.slotPrefab, this._slotsPool, totalCells);
        this.prewarm(this.itemPrefab, this._itemsPool, totalCells);
    }

    private prewarm(prefab: Prefab, pool: Node[], count: number) {
        if (!prefab) return;
        for (let i = 0; i < count; i++) {
            const node = instantiate(prefab);
            node.active = false;
            pool.push(node);
        }
    }

    public getSlot(): Node {
        return this.getNodeFromPool(this.slotPrefab, this._slotsPool);
    }

    public getItem(): Node {
        return this.getNodeFromPool(this.itemPrefab, this._itemsPool);
    }

    private getNodeFromPool(prefab: Prefab, pool: Node[]): Node {
        for (let i = 0; i < pool.length; i++) {
            if (!pool[i].active) {
                pool[i].active = true;
                return pool[i];
            }
        }
        const node = instantiate(prefab);
        pool.push(node);
        return node;
    }
}
