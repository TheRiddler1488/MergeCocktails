import { _decorator, Component, EventTouch, Node, tween, Vec3, Sprite, SpriteFrame, director } from 'cc';
import { AudioManager } from './AudioManager';
const { ccclass, property } = _decorator;

@ccclass('MergeItem')
export class MergeItem extends Component {
    @property(Sprite) icon: Sprite = null!;

    public tier: number = 1;
    public currentIndex: number = -1;

    public _isMerging: boolean = false;
    private _isDragging: boolean = false;
    private _startPos: Vec3 = new Vec3();

    private static _tempVec3 = new Vec3();
    public static _scaleSmall = new Vec3(0.5, 0.5, 1);
    public static _scaleBig = new Vec3(1.2, 1.2, 1);
    public static _scaleNormal = new Vec3(1, 1, 1);

    onEnable() {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        this._isMerging = false;
    }

    onDisable() {
        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    public init(tier: number, index: number, frame: SpriteFrame | null = null) {
        this.tier = tier;
        this.currentIndex = index;
        this._isMerging = false;

        this.node.setScale(MergeItem._scaleNormal);
        if (frame && this.icon) this.icon.spriteFrame = frame;
    }

    private onTouchStart(event: EventTouch) {
        if (this._isMerging) return;
        this._isDragging = true;
        this._startPos.set(this.node.position);
        this.node.setSiblingIndex(999);
    }

    private onTouchMove(event: EventTouch) {
        if (!this._isDragging || this._isMerging) return;

        const delta = event.getUIDelta();
        MergeItem._tempVec3.set(this.node.position.x + delta.x, this.node.position.y + delta.y, 0);
        this.node.setPosition(MergeItem._tempVec3);
    }

    private onTouchEnd(event: EventTouch) {
        if (!this._isDragging || this._isMerging) return;
        this._isDragging = false;

        const touchPos = event.getUILocation();
        director.getScene()?.emit('TRY_MOVE_ITEM', this, touchPos);
    }

    public mergeWith(targetItem: MergeItem) {
        tween(this.node)
            .to(0.15, {
                position: targetItem.node.position,
                scale: MergeItem._scaleSmall
            })
            .call(() => {
                const newTier = this.tier + 1;

                targetItem._isMerging = false;
                targetItem.tier = newTier;
                targetItem.playMergeEffect();

                AudioManager.instance?.playPopSound();

                director.getScene()?.emit('ITEM_MERGED', targetItem, newTier);
                this.node.active = false;
            })
            .start();
    }

    public playMergeEffect() {
        tween(this.node).to(0.1, { scale: MergeItem._scaleBig }).to(0.1, { scale: MergeItem._scaleNormal }).start();
    }

    public returnToStart() {
        tween(this.node).to(0.2, { position: this._startPos }).start();
    }

    public snapToGrid(pos: Vec3) {
        tween(this.node).to(0.1, { position: pos }).start();
    }
}
