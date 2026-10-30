import { _decorator, Component, tween, Vec3, easing } from 'cc';
import { AudioManager } from '../Managers/AudioManager';
const { ccclass } = _decorator;

@ccclass('CtaScreen')
export class CtaScreen extends Component {
    private readonly _hiddenScale: Vec3 = new Vec3(0, 0, 0);
    private readonly _normalScale: Vec3 = new Vec3(1, 1, 1);
    private _isShown: boolean = false;

    protected onLoad(): void {
        this.node.active = false;
    }

    public show(delay: number = 0): void {
        if (this._isShown) return;
        this._isShown = true;

        this.scheduleOnce(() => {
            this.node.active = true;
            this.node.setScale(this._hiddenScale);

            AudioManager.instance?.playCtaSound();

            tween(this.node).to(0.4, { scale: this._normalScale }, { easing: easing.backOut }).start();
        }, delay);
    }
}
