class Player {
    static GRAVITY = 20;
    static JUMP_FORCE = 600;
    static SPEED = 400;

    constructor() {
        this._position = { x: 155, y: 500 };
        this._direction = 0;
        this._gravitySpeed = 0;
    }

    get position() { return this._position; }
    get direction() { return this._direction; }
    set direction(value) { this._direction = value; }

    move(fps) {
        this._gravitySpeed += Player.GRAVITY;
        this._position.y += this._gravitySpeed / fps;
        this._position.x += this._direction * Player.SPEED / fps;

        if (this._position.x > 400) {
            this._position.x = -50;
        }
        if (this._position.x < -50) {
            this._position.x = 400;
        }
    }

    jump() {
        this._gravitySpeed = -Player.JUMP_FORCE;
    }

    reset() {
        this._position = { x: 155, y: 300 };
        this._direction = 0;
        this._gravitySpeed = 0;
    }
}