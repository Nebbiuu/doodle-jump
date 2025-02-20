class Controller {
  constructor(model, view) {
    this._model = model;
    this._view = view;
    this._useAI = true;
    this._running = true;
    this.bestScores = [];
    this.canvasesNumber = 30;

    this._startTime = Date.now();
    this._lag = 0;
    this._fps = 60; // Frame rate.
    this._frameDuration = 1000 / this._fps; // Avec 60 frame par seconde, la frame va durer 16.7ms.

    const filename = window.location.pathname.split("/").pop();
    if (filename == "solo.html") {
      this.canvasesNumber = 1;
      document
        .getElementById("restart-button")
        .addEventListener("click", () => {
          this.Restart();
        });

      document.getElementById("manual-button").addEventListener("click", () => {
        this.toggleAI(false);
      });

      document.getElementById("ai-button").addEventListener("click", () => {
        this.toggleAI(true);
      });
    } else {
      document
        .getElementById("stop-button")
        .addEventListener("click", this.stopAndShowBestWeights.bind(this));
      document
        .getElementById("copy-button")
        .addEventListener("click", this.copyToClipboard.bind(this));
    }

    this._model.BindDisplay(this.Display.bind(this));
    this._model.BindGetCanvasesNumber(this.getCanvasesNumber.bind(this));
    this._model.BindGetUseAI(this.getUseAI.bind(this));
    this._view.BindSetDirections(this.SetDirection.bind(this));
    this._view.BindGetCanvasesNumber(this.getCanvasesNumber.bind(this));
    this._model.initializeGameEntities();
    this._view.initializeCanvases();

  }
  getCanvasesNumber() {
    return this.canvasesNumber;
  }
  getUseAI() {
    return this._useAI;
  }
  toggleAI(bool) {
    this._useAI = bool;
    this.Restart();
  }

  Display(positions, directions, platforms, scores, gameOver, vectors) {
    this._view.Display(
      positions,
      directions,
      platforms,
      scores,
      gameOver,
      vectors,
      this._useAI
    );
  }

  SetDirection(newDirections) {
    let newDirectionArray = [];
    newDirectionArray.push(newDirections);
    if (!this._useAI) {
      this._model.directions = newDirectionArray;
    }
  }

  Update() {
    if (!this._running) return;

    let currentTime = Date.now();
    let deltaTime = currentTime - this._startTime;

    this._lag += deltaTime;
    this._startTime = currentTime;

    while (this._lag >= this._frameDuration) {
      this._model.Move(this._fps);
      this._lag -= this._frameDuration;
    }

    if (this._model.allPlayersFinished()) {
      const finalScores = this._model.getFinalScores();
      const top30PercentPlayers = this._model.getTop30PercentPlayers(finalScores);
      this.bestScores.push(top30PercentPlayers);
      if (this.canvasesNumber > 1) {
        this._view.addScoresToChart(top30PercentPlayers);
      }
      if (top30PercentPlayers[0].score === 0) {
        this.Restart();
      } else {
        this._model.generateNewPopulation(top30PercentPlayers);
        this.Restart();
      }
    } else {
      requestAnimationFrame(this.Update.bind(this));
    }
  }

  Restart() {
    this._model._scoreManagers.forEach((scoreManager) =>
      scoreManager.hideFinalScore()
    );
    this._model = new Model();
    this._model.BindDisplay(this.Display.bind(this));
    this._model.BindGetCanvasesNumber(this.getCanvasesNumber.bind(this));
    this._model.BindGetUseAI(this.getUseAI.bind(this));
    this._model.initializeGameEntities();
    this.Update();
  }

  stopAndShowBestWeights() {
    this._running = false;
    const finalScores = this._model.getFinalScores();
    const bestPlayer = finalScores[0];
    const weights = {
      weights1: bestPlayer.weights1,
      weights2: bestPlayer.weights2,
    };
    const weightsText = JSON.stringify(weights, null, 2);
    document.getElementById("weights-textarea").value = weightsText;
    document.getElementById("best-weights").classList.remove("hidden");
  }

  copyToClipboard() {
    const textarea = document.getElementById("weights-textarea");
    textarea.select();
    document.execCommand("copy");
  }

  toggleAi() {
    this._useAI = !this._useAI;
  }
}
