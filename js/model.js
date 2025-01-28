class Model {
    constructor() {
        this._score = 0;
        this._player = new Player();
        this._scoreManager = new ScoreManager();
        this._gameOver = false;
        this._platformManager = new PlatformManager(0);
        this.weights1 = this.initializeWeights(6, 4); // 6 inputs, 4 outputs for the first layer
        this.weights2 = this.initializeWeights(4, 3); // 4 inputs, 3 outputs for the second layer
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

        const inputVectors = this.getInputVectors();

        this.b_Display(this._player.position, this._player.direction, this._platformManager.platforms, this._scoreManager.score, this._gameOver, inputVectors, this._useAI);
    }

    _endGame() {
        console.log("Game Over");
        this._platformManager.platforms = [];
        this._gameOver = true;
        this._scoreManager.displayFinalScore();
    }

    getInputVectors() {
        const closestPlatforms = this._platformManager.getClosestPlatforms(this._player.position);
        const vectors = closestPlatforms.map(platform => {
            const dx = platform.x - this._player.position.x;
            const dy = platform.y - this._player.position.y;
            return { dx, dy, magnitude: Math.sqrt(dx * dx + dy * dy) };
        });

        return vectors;
    }

    normalize(value, max) {
        return value / max;
    }

    getNormalizedInputs() {
        const vectors = this.getInputVectors();
        const magnitudes = vectors.map(vector => vector.magnitude);
        const maxMagnitude = Math.max(...magnitudes);
        const normalizedMagnitudes = magnitudes.map(magnitude => this.normalize(magnitude, maxMagnitude));
        const normalizedX = this.normalize(this._player.position.x, 400);
        const normalizedY = this.normalize(this._player.position.y, 600);

        return [...normalizedMagnitudes, normalizedX, normalizedY];
    }

    initializeWeights(inputSize, outputSize) {
        const weights = [];
        for (let i = 0; i < outputSize; i++) {
            const row = [];
            for (let j = 0; j < inputSize; j++) {
                row.push(Math.random() * 2 - 1);
            }
            weights.push(row);
        }
        return weights;
    }
}