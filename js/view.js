class View {
    constructor() {
        this._canvases = [];
        this.ctxs = [];
        this._hold_right = false;
        this._hold_left = false;
        this.lastDirection = 1;

        this.doodlerLeft = new Image();
        this.doodlerLeft.src = '/img/lik-left@2x.png';
        this.doodlerRight = new Image();
        this.doodlerRight.src = "/img/lik-right@2x.png";

        this.tileManager = new TileManager();

        this.initializeCanvases();
        this.Events();
    }

    initializeCanvases() {
        for (let i = 0; i < 10; i++) {
            const canvas = document.getElementById(`my_canvas_${i}`);
            this._canvases.push(canvas);
            this.ctxs.push(canvas.getContext('2d'));
        }
    }

    BindSetDirection(callback) {
        this.b_SetDirection = callback;
    }

    Events() {
        document.addEventListener('keydown', (evt) => {
            if (evt.key == 'ArrowLeft' || evt.key == 'ArrowRight') {
                switch (evt.key) {
                    case 'ArrowLeft': // Move left.
                        this._hold_left = true;
                        this.b_SetDirection(-1);
                        break;
                    case 'ArrowRight': // Move right.
                        this._hold_right = true;
                        this.b_SetDirection(1);
                        break;
                }
            }
        });

        document.addEventListener('keyup', (evt) => {
            switch (evt.key) {
                case 'ArrowLeft': // Move left.
                    if (!this._hold_right) {
                        this.b_SetDirection(0);
                    }
                    this._hold_left = false;
                    break;
                case 'ArrowRight': // Move right.
                    if (!this._hold_left) {
                        this.b_SetDirection(0);
                    }
                    this._hold_right = false;
                    break;
            }
        });
    }

    Display(positions, directions, platforms, scores, gameOver, vectors, useAI) {
        for (let i = 0; i < 10; i++) {
            const ctx = this.ctxs[i];
            ctx.clearRect(0, 0, this._canvases[i].width, this._canvases[i].height);

            for (let platform of platforms[i]) {
                this.tileManager.drawPlatform(ctx, platform);
            }

            if (directions[i] === -1) {
                this.lastDirection = -1;
            } else if (directions[i] === 1) {
                this.lastDirection = 1;
            }

            if (this.lastDirection == 1) {
                ctx.drawImage(this.doodlerRight, positions[i].x, positions[i].y, 70, 70);
            } else {
                ctx.drawImage(this.doodlerLeft, positions[i].x, positions[i].y, 70, 70);
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
        const colors = ['red', 'green', 'yellow', 'blue'];
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