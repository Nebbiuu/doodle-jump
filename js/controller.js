class Controller {
    constructor(model, view) {
        this._model = model;
        this._view = view;

        this._startTime = Date.now();
        this._lag = 0;
        this._fps = 60; // Frame rate.
        this._frameDuration = 1000 / this._fps; // Avec 60 frame par seconde, la frame va durer 16.7ms.

        this._model.BindDisplay(this.Display.bind(this));
        this._view.BindSetDirection(this.SetDirection.bind(this));
    }

    Display(position, direction, platforms, score, gameOver,vectors) {
        this._view.Display(position, direction, platforms, score, gameOver,vectors);
    }

    SetDirection(newDirection) {
        this._model.direction = newDirection;
    }

    Update() {
        let currentTime = Date.now();
        let deltaTime = currentTime - this._startTime; // La durée entre deux appels (entre 2 frames).

        this._lag += deltaTime;
        this._startTime = currentTime;

        while (this._lag >= this._frameDuration) {
            this._model.Move(this._fps);
            this._lag -= this._frameDuration;
        }

        if (this._model._platformManager.platforms.length > 0) {
            requestAnimationFrame(this.Update.bind(this));
        }
    }

    Restart() {
        this._model._scoreManager.hideFinalScore();
        this._model = new Model();
        this._model.BindDisplay(this.Display.bind(this));
        this.Update();
    }
}