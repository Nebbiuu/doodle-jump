class View {
  constructor() {
    this._canvases = [];
    this.ctxs = [];
    this._hold_right = false;
    this._hold_left = false;
    this.lastDirection = 1;

    this.doodlerLeft = new Image();
    this.doodlerLeft.src = "/img/lik-left@2x.png";
    this.doodlerRight = new Image();
    this.doodlerRight.src = "/img/lik-right@2x.png";

    this.tileManager = new TileManager();
    
    this.Events();
  }

  BindGetCanvasesNumber(callback) {
    this.b_getCanvasesNumber = callback;
  }

  initializeCanvases() {
    const gamesContainer = document.getElementById("games-container");
    gamesContainer.innerHTML = ""; // Clear any existing canvases
    console.log(this.b_getCanvasesNumber());
    for (let i = 0; i < this.b_getCanvasesNumber(); i++) {
      const canvasContainer = document.createElement("div");
      canvasContainer.className = "canvas-container";

      const canvas = document.createElement("canvas");
      canvas.id = `my_canvas_${i}`;
      canvas.width = 400;
      canvas.height = 600;

      const scoreDiv = document.createElement("div");
      scoreDiv.id = `score_${i}`;
      scoreDiv.className = "score";
      scoreDiv.innerText = "Score: 0";

      const finalScoreDiv = document.createElement("div");
      finalScoreDiv.id = `final-score_${i}`;
      finalScoreDiv.className = "final-score";
      finalScoreDiv.innerText = "Final Score: 0";

      canvasContainer.appendChild(canvas);
      canvasContainer.appendChild(scoreDiv);
      canvasContainer.appendChild(finalScoreDiv);
      gamesContainer.appendChild(canvasContainer);

      this._canvases.push(canvas);
      this.ctxs.push(canvas.getContext("2d"));
    }
  }

  BindSetDirections(callback) {
    this.b_SetDirections = callback;
  }

  Events() {
    document.addEventListener("keydown", (evt) => {
      if (evt.key == "ArrowLeft" || evt.key == "ArrowRight") {
        switch (evt.key) {
          case "ArrowLeft": // Move left.
            this._hold_left = true;
            this.b_SetDirections(-1);
            break;
          case "ArrowRight": // Move right.
            this._hold_right = true;
            this.b_SetDirections(1);
            break;
        }
      }
    });

    document.addEventListener("keyup", (evt) => {
      switch (evt.key) {
        case "ArrowLeft": // Move left.
          if (!this._hold_right) {
            this.b_SetDirections(0);
          }
          this._hold_left = false;
          break;
        case "ArrowRight": // Move right.
          if (!this._hold_left) {
            this.b_SetDirections(0);
          }
          this._hold_right = false;
          break;
      }
    });
  }

  Display(positions, directions, platforms, scores, gameOver, vectors, useAI) {
    for (let i = 0; i < this.b_getCanvasesNumber(); i++) {
      const ctx = this.ctxs[i];
      ctx.clearRect(0, 0, this._canvases[i].width, this._canvases[i].height);

      for (let platform of platforms[i]) {
        this.tileManager.drawPlatform(ctx, platform);
      }

      if (!gameOver[i]) {
        if (directions[i] === -1) {
          this.lastDirection = -1;
        } else if (directions[i] === 1) {
          this.lastDirection = 1;
        }

        if (this.lastDirection == 1) {
          ctx.drawImage(
            this.doodlerRight,
            positions[i].x,
            positions[i].y,
            70,
            70
          );
        } else {
          ctx.drawImage(
            this.doodlerLeft,
            positions[i].x,
            positions[i].y,
            70,
            70
          );
        }
      }

      const scoreElement = document.getElementById(`score_${i}`);
      if (scoreElement) {
        scoreElement.innerText = `Score: ${Math.floor(scores[i])}`;
      }

      if (useAI && vectors[i]) {
        this.drawVectors(ctx, positions[i], vectors[i]);
      }
    }
  }

  drawVectors(ctx, playerPosition, vectors) {
    const colors = ["red", "green", "yellow", "blue"];
    vectors.forEach((vector, index) => {
      ctx.beginPath();
      ctx.moveTo(playerPosition.x, playerPosition.y);
      ctx.lineTo(playerPosition.x + vector.dx, playerPosition.y + vector.dy);
      ctx.strokeStyle = colors[index % colors.length];
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }
}
