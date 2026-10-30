import { _decorator, Component, Vec3, tween, easing, Tween, Node, input, Input, director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TutorialHand')
export class TutorialHand extends Component {
    @property({ tooltip: 'Начальная точка анимации руки' })
    public startPos: Vec3 = new Vec3(-100, 300, 0);

    @property({
        tooltip: 'Конечная точка (если равна startPos — будет просто анимация тапа)'
    })
    public endPos: Vec3 = new Vec3(100, 300, 0);

    private readonly _scaleIdle: Vec3 = new Vec3(1, 1, 1);
    private readonly _scalePressed: Vec3 = new Vec3(0.85, 0.85, 1);
    private readonly _scaleHidden: Vec3 = new Vec3(0, 0, 1);

    private _handTween: Tween<Node> | null = null;
    private _isHidden: boolean = false;

    protected onLoad(): void {
        input.on(Input.EventType.TOUCH_START, this.hide, this);
        director.getScene()?.on('HIDE_TUTORIAL', this.hide, this);
    }

    protected start(): void {
        this.playTutorialLoop();
    }

    protected onDestroy(): void {
        input.off(Input.EventType.TOUCH_START, this.hide, this);
        director.getScene()?.off('HIDE_TUTORIAL', this.hide, this);
    }

    private playTutorialLoop(): void {
        if (this._isHidden) return;

        this.node.setPosition(this.startPos);
        this.node.setScale(this._scaleIdle);

        this._handTween = tween(this.node)
            .repeatForever(tween().set({ position: this.startPos, scale: this._scaleIdle }).to(0.25, { scale: this._scalePressed }, { easing: easing.quadOut }).to(0.65, { position: this.endPos }, { easing: easing.sineInOut }).to(0.15, { scale: this._scaleIdle }, { easing: easing.quadIn }).to(0.15, { scale: this._scaleHidden }).delay(0.25))
            .start();
    }

    public hide(): void {
        if (this._isHidden) return;
        this._isHidden = true;

        input.off(Input.EventType.TOUCH_START, this.hide, this);

        if (this._handTween) {
            this._handTween.stop();
            this._handTween = null;
        }
        this.node.active = false;
    }
}
