class Controller {
    constructor(model, view) {
        this._model = model;
        this._view = view;
        this._aiController = new AIController(model);
        this._useAI = true;

        this._startTime = Date.now();
        this._lag = 0;
        this._fps = 60; // Frame rate.
        this._frameDuration = 1000 / this._fps; // Avec 60 frame par seconde, la frame va durer 16.7ms.

        this._model.BindDisplay(this.Display.bind(this));
        this._view.BindSetDirection(this.SetDirection.bind(this));
    }

    Display(position, direction, platforms, score, gameOver, vectors) {
        this._view.Display(position, direction, platforms, score, gameOver, vectors, this._useAI);
    }

    SetDirection(newDirection) {
        if (!this._useAI) {
            this._model.direction = newDirection;
        }
    }

    Update() {
        let currentTime = Date.now();
        let deltaTime = currentTime - this._startTime;

        this._lag += deltaTime;
        this._startTime = currentTime;

        while (this._lag >= this._frameDuration) {
            if (this._useAI) {
                const action = this._aiController.getAction();
                this._model.direction = action;
            }

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
        this._aiController = new AIController(this._model);
        this._model.BindDisplay(this.Display.bind(this));
        this.Update();
    }

    toggleAI(useAI) {
        this._useAI = useAI;
        this.Restart();
    }
}