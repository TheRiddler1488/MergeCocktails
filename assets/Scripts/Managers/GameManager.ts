import { _decorator, Component, Node, Label, tween, v3, Vec3, Sprite, SpriteFrame, UITransform, director, Vec2 } from 'cc';
import { GameConfig } from './GameConfig';
import { GridModel } from './GridModel';
import { BoardView } from './BoardView';
import { PoolManager } from './PoolManager';
import { MergeItem } from './MergeItem';
import { CtaScreen } from './CtaScreen';
import { AudioManager } from './AudioManager';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    public static Instance: GameManager;

    @property(BoardView) boardView: BoardView = null!;
    @property(Node) spawnButton: Node = null!;
    @property(CtaScreen) ctaScreen: CtaScreen = null!;

    @property([SpriteFrame]) cocktailFrames: SpriteFrame[] = [];

    @property(Label) moneyLabel: Label = null!;
    @property(Label) energyLabel: Label = null!;
    @property(Label) orderRewardLabel: Label = null!;
    @property(Sprite) orderIcon: Sprite = null!;

    public gridModel: GridModel = null!;
    private static _tempPos = new Vec3();

    public isGameOver: boolean = false;
    private _ordersCompleted: number = 0;
    private _money: number = 0;
    private _energy: number = 2500;
    private _currentOrderTier: number = 3;
    private _orderReward: number = 100;

    onLoad() {
        GameManager.Instance = this;
        this.gridModel = new GridModel();
    }

    onEnable() {
        director.getScene()?.on('ITEM_MERGED', this.onItemMerged, this);
        director.getScene()?.on('TRY_MOVE_ITEM', this.onTryMoveItem, this);
    }

    onDisable() {
        director.getScene()?.off('ITEM_MERGED', this.onItemMerged, this);
        director.getScene()?.off('TRY_MOVE_ITEM', this.onTryMoveItem, this);
    }

    start() {
        this.isGameOver = false;
        this._ordersCompleted = 0;
        this._money = 0;
        this._energy = 2500;

        this.generateNewOrder();
        this.updateUI();
    }

    private getIndexByWorldPos(worldPos: Vec3): number {
        const uiTrans = this.boardView.itemsContainer.getComponent(UITransform);
        if (!uiTrans) return -1;

        uiTrans.convertToNodeSpaceAR(worldPos, GameManager._tempPos);
        const { GridWidth, GridHeight, CellSize, CellSpacing } = GameConfig;
        const step = CellSize + CellSpacing;

        const offsetX = (GridWidth * step) / 2;
        const offsetY = (GridHeight * step) / 2;

        const x = Math.floor((GameManager._tempPos.x + offsetX) / step);
        const y = Math.floor((GameManager._tempPos.y + offsetY) / step);

        if (x < 0 || x >= GridWidth || y < 0 || y >= GridHeight) return -1;
        return y * GridWidth + x;
    }

    private onTryMoveItem(item: MergeItem, touchPos: Vec2) {
        if (this.isGameOver) {
            item.returnToStart();
            return;
        }

        const worldPos = v3(touchPos.x, touchPos.y, 0);
        const targetIndex = this.getIndexByWorldPos(worldPos);

        if (targetIndex === -1) {
            item.returnToStart();
            return;
        }

        const targetTier = this.gridModel.getCellByIndex(targetIndex);

        if (targetTier === 0) {
            this.gridModel.setCellByIndex(item.currentIndex, 0);
            this.boardView.setItemNode(item.currentIndex, null);

            item.currentIndex = targetIndex;
            this.gridModel.setCellByIndex(item.currentIndex, item.tier);
            this.boardView.setItemNode(item.currentIndex, item.node);

            item.snapToGrid(this.boardView.getPosByIndex(targetIndex));
        } else if (targetTier === item.tier && item.tier < GameConfig.MaxTier) {
            const targetNode = this.boardView.getItemNode(targetIndex);
            if (targetNode && targetNode !== item.node) {
                const targetItem = targetNode.getComponent(MergeItem)!;
                if (!targetItem._isMerging) {
                    item._isMerging = true;
                    targetItem._isMerging = true;

                    this.gridModel.setCellByIndex(item.currentIndex, 0);
                    this.boardView.setItemNode(item.currentIndex, null);

                    item.mergeWith(targetItem);
                    return;
                }
            }
            item.returnToStart();
        } else {
            item.returnToStart();
        }
    }

    public onSpawnButtonClicked() {
        AudioManager.instance?.playBGM();

        director.getScene()?.emit('HIDE_TUTORIAL');

        if (this.isGameOver) return;

        const cost = GameConfig?.SpawnCost ?? 15;

        if (this._energy < cost) {
            this.endGame(false);
            return;
        }

        const emptyIndex = this.gridModel.getRandomEmptyIndex();
        if (emptyIndex === -1) {
            if (this._energy < cost) this.endGame(false);
            return;
        }

        this._energy -= cost;
        this.updateUI();

        AudioManager.instance?.playPutSound();
        this.spawnItemAnimated(emptyIndex);
    }

    private spawnItemAnimated(targetIndex: number) {
        let spawnTier = Math.random() > 0.7 ? 2 : 1;
        if (spawnTier === this._currentOrderTier) {
            spawnTier = spawnTier === 1 ? 2 : 1;
        }

        this.gridModel.setCellByIndex(targetIndex, spawnTier);

        const itemNode = PoolManager.Instance.getItem();
        this.boardView.setItemNode(targetIndex, itemNode);
        itemNode.setParent(this.boardView.itemsContainer);

        const btnUITrans = this.spawnButton.getComponent(UITransform);
        const gridUITrans = this.boardView.itemsContainer.getComponent(UITransform);

        let startPos = v3(0, -400, 0);
        if (btnUITrans && gridUITrans) {
            const btnWorldPos = btnUITrans.convertToWorldSpaceAR(v3(0, 0, 0));
            startPos = gridUITrans.convertToNodeSpaceAR(btnWorldPos);
        }

        const mergeItem = itemNode.getComponent(MergeItem)!;
        const frame = this.getSpriteFrameByTier(spawnTier);

        mergeItem.tier = spawnTier;
        mergeItem.currentIndex = targetIndex;
        if (frame && mergeItem.icon) mergeItem.icon.spriteFrame = frame;

        itemNode.setPosition(startPos);
        itemNode.setScale(0, 0, 1);
        itemNode.setSiblingIndex(999);

        const targetPos = this.boardView.getPosByIndex(targetIndex);
        const peakPos = v3((startPos.x + targetPos.x) / 2, Math.max(startPos.y, targetPos.y) + 150, 0);

        tween(itemNode)
            .to(0.2, { position: peakPos, scale: v3(1, 1, 1) }, { easing: 'quadOut' })
            .to(0.2, { position: targetPos }, { easing: 'quadIn' })
            .call(() => {
                mergeItem.init(spawnTier, targetIndex, frame);
            })
            .start();
    }

    private onItemMerged(item: MergeItem, newTier: number) {
        this.gridModel.setCellByIndex(item.currentIndex, newTier);

        const frame = this.getSpriteFrameByTier(newTier);
        if (frame && item.icon) item.icon.spriteFrame = frame;

        if (newTier === this._currentOrderTier) {
            this._ordersCompleted++;
            this._money += this._orderReward;
            this.updateUI();

            if (this._ordersCompleted >= 2) {
                this.endGame(true);
            } else {
                this.generateNewOrder();
            }
        }
    }

    public getSpriteFrameByTier(tier: number): SpriteFrame | null {
        if (this.cocktailFrames.length === 0) return null;
        const index = Math.min(tier - 1, this.cocktailFrames.length - 1);
        return this.cocktailFrames[index];
    }

    private generateNewOrder() {
        let newTier;

        do {
            newTier = Math.floor(Math.random() * 3) + 3;
        } while (newTier === this._currentOrderTier);

        this._currentOrderTier = newTier;
        this._orderReward = this._currentOrderTier * 50;

        const frame = this.getSpriteFrameByTier(this._currentOrderTier);
        if (frame && this.orderIcon) this.orderIcon.spriteFrame = frame;
    }

    private updateUI() {
        if (this.moneyLabel) this.moneyLabel.string = this._money.toString();
        if (this.energyLabel) this.energyLabel.string = this._energy.toString();
        if (this.orderRewardLabel) this.orderRewardLabel.string = `+${this._orderReward}$`;
    }

    private endGame(isWin: boolean) {
        if (this.isGameOver) return;
        this.isGameOver = true;

        if (this.ctaScreen) {
            this.ctaScreen.show();
        }
    }
}
