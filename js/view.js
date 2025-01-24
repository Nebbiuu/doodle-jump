class View {
    constructor() {
        this._canvas = document.getElementById('my_canvas');
        this.ctx = this._canvas.getContext('2d');
        this._hold_right = false;
        this._hold_left = false;
        this.lastDirection = 1;

        this.doodlerLeft = new Image();
        this.doodlerLeft.src = '/img/lik-left@2x.png';
        this.doodlerRight = new Image();
        this.doodlerRight.src = "/img/lik-right@2x.png";

        this.tileManager = new TileManager();

        this.doodlerLeft.onload = () => {
            this.doodlerLeftLoaded = true;
            console.log("Doodler left image loaded");
        };
        this.doodlerRight.onload = () => {
            this.doodlerRightLoaded = true;
            console.log("Doodler right image loaded");
        };

        this.Events();
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

    Display(position, direction, platforms, score, gameOver) {
        //console.log("Display called with gameOver:", gameOver);
        this.ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

        if (gameOver) {
            document.getElementById('final-score').innerText = `Final Score: ${score}`;
            document.getElementById('final-score').style.display = 'block';
            document.getElementById('restart-button').style.display = 'block';
            document.getElementById('score').style.display = 'none';
            return;
        }

        for (let platform of platforms) {
            this.tileManager.drawPlatform(this.ctx, platform);
        }

        if (direction === -1) {
            this.lastDirection = -1;
        } else if (direction === 1) {
            this.lastDirection = 1;
        }

        if (this.lastDirection == 1) {
            this.ctx.drawImage(this.doodlerRight, position.x, position.y, 70, 70);
        } else {
            this.ctx.drawImage(this.doodlerLeft, position.x, position.y, 70, 70);
        }

        document.getElementById('score').innerText = `Score: ${Math.floor(score)}`;
    }
}