class Model {
  constructor() {
    this._players = [];
    this._scoreManagers = [];
    this._platformManagers = [];
    this._gameOver = [];
    this.directions = [];
    this.scoreMax = 2000;
    this._aiControllers = [];
    this._useAI = true;
  }
  BindGetCanvasesNumber(callback) {
    this.b_getCanvasesNumber = callback;
  }
  get positions() {
    return this._players.map((player) => player.position);
  }
  get directions() {
    return this._players.map((player) => player.direction);
  }
  set directions(values) {
    values.forEach((value, index) => (this._players[index].direction = value));
  }
  get scores() {
    return this._scoreManagers.map((scoreManager) => scoreManager.score);
  }

  BindDisplay(callback) {
    this.b_Display = callback;
  }

  Move(fps) {
    if (this._useAI) {
      const actions = this._aiControllers.map((aiController) =>
        aiController.getAction()
      );
      this.directions = actions;
    }

    for (let i = 0; i < this.b_getCanvasesNumber(); i++) {
      this._players[i].move(fps);
      this._platformManagers[i].movePlatforms(fps);
      CollisionManager.checkPlayerPlatformCollision(
        this._players[i],
        this._platformManagers[i].platforms
      );

      if (this._players[i].position.y > 600) {
        this._endGame(i);
        continue;
      }
      if (
        this._players[i].position.y < PlatformManager.MAX_HEIGHT &&
        !this._gameOver[i]
      ) {
        const offset = PlatformManager.MAX_HEIGHT - this._players[i].position.y;
        this._players[i].position.y = PlatformManager.MAX_HEIGHT;
        this._scoreManagers[i].increment(offset);
        for (let platform of this._platformManagers[i].platforms) {
          platform.y += offset;
        }
        this._platformManagers[i].generateNewPlatforms(
          offset,
          this._scoreManagers[i].score
        );

        if (this._scoreManagers[i]._score > this.scoreMax - 300) {
          if (!this._platformManagers[i].hasGeneratedEndPlatforms) {
            let endingPlatforms = this._platformManagers[
              i
            ].generateEndingPlatforms(this._players[i].position.y);
            this._platformManagers[i].platforms.push(...endingPlatforms);
            this._platformManagers[i].hasGeneratedEndPlatforms = true;
          }
        }

        if (this._platformManagers[i].hasGeneratedEndPlatforms) {
          let yType3 = this._platformManagers[i].platforms.find(
            (platform) => platform.type === 3
          )?.y;

          if (yType3 !== undefined) {
            for (let platform of this._platformManagers[i].platforms) {
              // Modifier le type des plateformes qui ne sont PAS de type 3 et qui sont AU-DESSUS des plateformes de type 3
              if (platform.type !== 3 && platform.y <= yType3) {
                platform.type = 4;
              }
            }
          }
        }

        // Stop la génération
        if (this._scoreManagers[i]._score < this.scoreMax) {
          this._platformManagers[i].generateNewPlatforms(
            offset,
            this._scoreManagers[i].score
          );
        } else {
          this._platformManagers[i].platforms = this._platformManagers[
            i
          ].platforms.filter((platform) => platform.type !== 4);
        }

        if (this._scoreManagers[i]._score >= this.scoreMax) {
          this._scoreManagers[i]._score = this.scoreMax;
        }
      }
    }

    const inputVectors = this.getInputVectors();

    this.b_Display(
      this.positions,
      this.directions,
      this._platformManagers.map((pm) => pm.platforms),
      this.scores,
      this._gameOver,
      inputVectors,
      this._useAI
    );
  }
  get useAI() {
    return this._useAI;
  }
  _endGame(index) {
    // console.log(`Game Over for player ${index}`);
    this._platformManagers[index].platforms = [];
    this._gameOver[index] = true;
    this._scoreManagers[index].displayFinalScore();
  }

  getInputVectors() {
    return this._players.map((player, index) => {
      const closestPlatforms = this._platformManagers[
        index
      ].getClosestPlatforms(player.position);
      return closestPlatforms.map((platform) => {
        const dx = platform.x - player.position.x;
        const dy = platform.y - player.position.y;
        return { dx, dy, magnitude: Math.sqrt(dx * dx + dy * dy) };
      });
    });
  }

  allPlayersFinished() {
    return this._gameOver.every((gameOver) => gameOver);
  }

  getFinalScores() {
    return this._players
      .map((player, index) => ({
        index,
        score: this._scoreManagers[index].score,
        weights1: this._aiControllers[index].weights1,
        weights2: this._aiControllers[index].weights1,
      }))
      .sort((a, b) => b.score - a.score);
  }

  getTop30PercentPlayers(finalScores) {
    const top30PercentCount = Math.ceil(this.b_getCanvasesNumber() * 0.3);
    return finalScores.slice(0, top30PercentCount);
  }

  initializeGameEntities() {
    for (let i = 0; i < this.b_getCanvasesNumber(); i++) {
      this._players.push(new Player());
      this._scoreManagers.push(new ScoreManager(i));
      this._platformManagers.push(new PlatformManager(0));
      this._gameOver.push(false);
      this._aiControllers.push(new AIController(this, i));
    }
  }
  generateNewPopulation(topPlayers) {
    const topPlayersCount = topPlayers.length;

    for (let i = 0; i < topPlayersCount; i++) {
      this._aiControllers[i].weights1 = topPlayers[i].weights1;
      this._aiControllers[i].weights2 = topPlayers[i].weights2;
    }

    for (let i = topPlayersCount; i < this.b_getCanvasesNumber(); i++) {
      const parent = topPlayers[Math.floor(Math.random() * topPlayersCount)];

      const mutatedWeights1 = this.mutateWeights(parent.weights1);
      const mutatedWeights2 = this.mutateWeights(parent.weights2);

      this._aiControllers[i].weights1 = mutatedWeights1;
      this._aiControllers[i].weights2 = mutatedWeights2;
    }
  }
  mutateWeights(weights) {
    const mutationRate = 0.1;
    return weights.map((layer) =>
      layer.map((weight) =>
        Math.random() < mutationRate
          ? weight + (Math.random() - 0.5) * 0.1
          : weight
      )
    );
  }
}
