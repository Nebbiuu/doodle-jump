class Model {
    constructor() {
        this._score = 0;
        this._player = new Player();
        this._scoreManager = new ScoreManager();
        this._gameOver = false;
        this._platformManager = new PlatformManager(0);
    }

    get position() { return this._player.position; }
    get direction() { return this._player.direction; }
    set direction(value) { this._player.direction = value; }
    get score() { return this._scoreManager.score; }

    BindDisplay(callback) {
        this.b_Display = callback;
    }

    Move(fps) {
        this._player.move(fps);
        this._platformManager.movePlatforms(fps);
        CollisionManager.checkPlayerPlatformCollision(this._player, this._platformManager.platforms);

        if (this._player.position.y > 600) {
            this._endGame();
            return;
        }
        if (this._player.position.y < PlatformManager.MAX_HEIGHT && !this._gameOver) {
            const offset = PlatformManager.MAX_HEIGHT - this._player.position.y;
            this._player.position.y = PlatformManager.MAX_HEIGHT;
            this._scoreManager.increment(offset);
            for (let platform of this._platformManager.platforms) {
                platform.y += offset;
            }
            this._platformManager.generateNewPlatforms(offset, this._scoreManager.score);
        }

        this.b_Display(this._player.position, this._player.direction, this._platformManager.platforms, this._scoreManager.score, this._gameOver);
    }

    // _resetGame() {
    //     this._score = 0;
    //     this._player.reset();
    //     this._platformManager.reset();
    //     this._scoreManager.reset();
    //     this.b_Display(this._player.position, this._player.direction, this._platformManager.platforms, this._scoreManager.score, this._gameOver);
    // }



    _endGame() {
        console.log("Game Over");
        this._platformManager.platforms = [];
        this._gameOver = true;
        this._scoreManager.displayFinalScore();
    }
}