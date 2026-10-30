import { _decorator, Component, view, ResolutionPolicy, screen } from 'cc';
const { ccclass } = _decorator;

@ccclass('ResponsiveAdapter')
export class ResponsiveAdapter extends Component {
    onLoad() {
        this.adjustResolution();

        view.setResizeCallback(() => this.adjustResolution());
    }

    private adjustResolution() {
        const screenSize = screen.windowSize;
        const designSize = view.getDesignResolutionSize();

        const screenRatio = screenSize.width / screenSize.height;
        const designRatio = designSize.width / designSize.height;

        if (screenRatio < designRatio) {
            view.setResolutionPolicy(ResolutionPolicy.FIXED_WIDTH);
        } else {
            view.setResolutionPolicy(ResolutionPolicy.FIXED_HEIGHT);
        }
    }
}
