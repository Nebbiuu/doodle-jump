class TileManager {
    constructor() {
        this.platformImage = new Image();
        this.platformImage.src = "/img/game-tiles.png";
        this.platformImage.onload = () => {
            this.platformImageLoaded = true;
            console.log("Platform image loaded");
        };

        this.platformTypes = {
            0: { sx: 1, sy: 1, sw: 57, sh: 17 },
            1: { sx: 1, sy: 19, sw: 57, sh: 17 },
            2: { sx: 1, sy: 55, sw: 57, sh: 17 }
        };
    }

    drawPlatform(ctx, platform) {
        if (this.platformImageLoaded) {
            const type = this.platformTypes[platform.type];
            ctx.drawImage(this.platformImage, type.sx, type.sy, type.sw, type.sh, platform.x, platform.y, platform.width, platform.height);
        }
    }
}