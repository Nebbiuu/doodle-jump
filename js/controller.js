class Controller {
    constructor(model, view) {
        this._model = model;
        this._view = view;
        this._aiControllers = [];
        this._useAI = true;

        for (let i = 0; i < 10; i++) {
            this._aiControllers.push(new AIController(model, i)); // Pass the player index
        }

        this._startTime = Date.now();
        this._lag = 0;
        this._fps = 60; // Frame rate.
        this._frameDuration = 1000 / this._fps; // Avec 60 frame par seconde, la frame va durer 16.7ms.

        this._model.BindDisplay(this.Display.bind(this));
        this._view.BindSetDirection(this.SetDirection.bind(this));
    }

    Display(positions, directions, platforms, scores, gameOver, vectors) {
        this._view.Display(positions, directions, platforms, scores, gameOver, vectors, this._useAI);
    }

    SetDirection(newDirections) {
        if (!this._useAI) {
            this._model.directions = newDirections;
        }
    }

    Update() {
        let currentTime = Date.now();
        let deltaTime = currentTime - this._startTime;

        this._lag += deltaTime;
        this._startTime = currentTime;

        while (this._lag >= this._frameDuration) {
            if (this._useAI) {
                const actions = this._aiControllers.map(aiController => aiController.getAction());
                this._model.directions = actions; // Apply AI actions to player directions
            }

            this._model.Move(this._fps);
            this._lag -= this._frameDuration;
        }

        if (this._model.allPlayersFinished()) {
            const finalScores = this._model.getFinalScores();
            const top3Players = this._model.getTop3Players(finalScores);

            console.log(top3Players);
            if (top3Players[0].score === 0) {
                this.Restart();
            } else {
                this._model.generateNewPopulation(top3Players);
                this.Restart();
            }
        } else {
            requestAnimationFrame(this.Update.bind(this));
        }
    }

    Restart() {
        this._model._scoreManagers.forEach(scoreManager => scoreManager.hideFinalScore());
        this._model = new Model();
        this._aiControllers = [];
        for (let i = 0; i < 10; i++) {
            this._aiControllers.push(new AIController(this._model, i)); // Pass the player index
        }
        this._model.BindDisplay(this.Display.bind(this));
        this.Update();
    }
}