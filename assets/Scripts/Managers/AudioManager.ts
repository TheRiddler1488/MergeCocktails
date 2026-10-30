import { _decorator, Component, AudioSource, AudioClip, input, Input } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AudioManager')
export class AudioManager extends Component {
    private static _instance: AudioManager | null = null;
    public static get instance(): AudioManager | null {
        return this._instance;
    }

    @property(AudioSource)
    public bgmSource: AudioSource | null = null;

    @property(AudioSource)
    public sfxSource: AudioSource | null = null;

    @property(AudioClip)
    public bgmMusic: AudioClip | null = null;

    @property(AudioClip)
    public ctaClip: AudioClip | null = null;

    @property(AudioClip)
    public putClip: AudioClip | null = null;

    @property(AudioClip)
    public popClip: AudioClip | null = null;

    private _isBgmStarted: boolean = false;

    protected onLoad(): void {
        if (!AudioManager._instance) {
            AudioManager._instance = this;
        } else {
            this.node.destroy();
            return;
        }

        if (this.bgmSource && this.bgmMusic) {
            this.bgmSource.clip = this.bgmMusic;
            this.bgmSource.loop = true;
            this.bgmSource.volume = 0.05;
            this.bgmSource.playOnAwake = false;
        }

        input.on(Input.EventType.TOUCH_START, this.onFirstTouch, this);
    }

    protected onDestroy(): void {
        input.off(Input.EventType.TOUCH_START, this.onFirstTouch, this);
        if (AudioManager._instance === this) {
            AudioManager._instance = null;
        }
    }

    private onFirstTouch(): void {
        if (this._isBgmStarted) return;
        this._isBgmStarted = true;
        this.playBGM();

        input.off(Input.EventType.TOUCH_START, this.onFirstTouch, this);
    }

    public playBGM(): void {
        if (!this.bgmSource || this.bgmSource.playing) return;
        this.bgmSource.play();
    }

    public stopBGM(): void {
        if (this.bgmSource) this.bgmSource.stop();
    }

    private playSFX(clip: AudioClip | null, volume: number = 1.0): void {
        if (clip && this.sfxSource) {
            this.sfxSource.playOneShot(clip, volume);
        }
    }

    public playPutSound(): void {
        this.playSFX(this.putClip, 1.0);
    }

    public playPopSound(): void {
        this.playSFX(this.popClip, 0.8);
    }

    public playCtaSound(): void {
        if (this.bgmSource && this.bgmSource.playing) {
            this.bgmSource.volume = 0.01;
        }
        this.playSFX(this.ctaClip, 1.0);
    }
}
