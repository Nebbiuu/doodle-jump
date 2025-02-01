class Model {
    constructor() {
        this._score = 0;
        this._player = new Player();
        this._scoreManager = new ScoreManager();
        this._gameOver = false;
        this._platformManager = new PlatformManager(0);
        this.weights1 = this.initializeWeights(6, 4); // 6 inputs, 4 outputs for the first layer
        this.weights2 = this.initializeWeights(4, 3); // 4 inputs, 3 outputs for the second layer
        this._players = [];
        this._scoreManagers = [];
        this._platformManagers = [];
        this._gameOver = [];
        this.weights1 = [];
        this.weights2 = [];
        this.scoreMax = 1000;
        for (let i = 0; i < 10; i++) {
            this._players.push(new Player());
            this._scoreManagers.push(new ScoreManager(i)); // Pass the player index
            this._platformManagers.push(new PlatformManager(0));
            this._gameOver.push(false);
            this.weights1.push(this.initializeWeights(6, 4));
            this.weights2.push(this.initializeWeights(4, 3));
        }
    }

    get positions() { return this._players.map(player => player.position); }
    get directions() { return this._players.map(player => player.direction); }
    set directions(values) { values.forEach((value, index) => this._players[index].direction = value); }
    get scores() { return this._scoreManagers.map(scoreManager => scoreManager.score); }

    BindDisplay(callback) {
        this.b_Display = callback;
    }

    Move(fps) {
        for (let i = 0; i < 10; i++) {
            this._players[i].move(fps);
            this._platformManagers[i].movePlatforms(fps);
            CollisionManager.checkPlayerPlatformCollision(this._players[i], this._platformManagers[i].platforms);

            if (this._players[i].position.y > 600) {
                this._endGame(i);
                continue;
            }
            if (this._players[i].position.y < PlatformManager.MAX_HEIGHT && !this._gameOver[i]) {
                const offset = PlatformManager.MAX_HEIGHT - this._players[i].position.y;
                this._players[i].position.y = PlatformManager.MAX_HEIGHT;
                this._scoreManagers[i].increment(offset);
                for (let platform of this._platformManagers[i].platforms) {
                    platform.y += offset;
                }
                this._platformManagers[i].generateNewPlatforms(offset, this._scoreManagers[i].score);

                if (this._scoreManagers[i]._score > this.scoreMax - 100) {
                    if (!this._platformManagers[i].hasGeneratedEndPlatforms) {
                        let endingPlatforms = this._platformManagers[i].generateEndingPlatforms(this._player.position.y + 200);
                        this._platformManagers[i].platforms.push(...endingPlatforms);
                        this._platformManagers[i].hasGeneratedEndPlatforms = true;
                    }
                }
    
                if (this._platformManagers[i].hasGeneratedEndPlatforms) {
                    let yType3 = this._platformManagers[i].platforms.find(platform => platform.type === 3)?.y;
    
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
                    this._platformManagers[i].generateNewPlatforms(offset, this._scoreManager.score);
                } else {
                    this._platformManagers[i].platforms = this._platformManagers[i].platforms.filter(platform => platform.type !== 4);
                }
            }
        }

        const inputVectors = this.getInputVectors();

        this.b_Display(this.positions, this.directions, this._platformManagers.map(pm => pm.platforms), this.scores, this._gameOver, inputVectors, this._useAI);
    }

    _endGame(index) {
        // console.log(`Game Over for player ${index}`);
        this._platformManagers[index].platforms = [];
        this._gameOver[index] = true;
        this._scoreManagers[index].displayFinalScore();
    }

    getInputVectors() {
        return this._players.map((player, index) => {
            const closestPlatforms = this._platformManagers[index].getClosestPlatforms(player.position);
            return closestPlatforms.map(platform => {
                const dx = platform.x - player.position.x;
                const dy = platform.y - player.position.y;
                return { dx, dy, magnitude: Math.sqrt(dx * dx + dy * dy) };
            });
        });
    }

    normalize(value, max) {
        return value / max;
    }

    getNormalizedInputs(playerIndex) {
        const player = this._players[playerIndex];
        const vectors = this.getInputVectors()[playerIndex];
        const magnitudes = vectors.map(vector => vector.magnitude);
        const maxMagnitude = Math.max(...magnitudes);
        const normalizedMagnitudes = magnitudes.map(magnitude => this.normalize(magnitude, maxMagnitude));
        const normalizedX = this.normalize(player.position.x, 400);
        const normalizedY = this.normalize(player.position.y, 600);

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
    allPlayersFinished() {
        return this._gameOver.every(gameOver => gameOver);
    }
    getFinalScores() {
        return this._players.map((player, index) => ({
            index,
            score: this._scoreManagers[index].score,
            weights1: this.weights1[index],
            weights2: this.weights2[index]
        })).sort((a, b) => b.score - a.score);
    }
    getTop3Players(finalScores) {
        return finalScores.slice(0, 3);
    }
    generateNewPopulation(top3Players) {
        const newWeights1 = [];
        const newWeights2 = [];

        for (let i = 0; i < 3; i++) {
            newWeights1.push(top3Players[i].weights1);
            newWeights2.push(top3Players[i].weights2);
        }

        for (let i = 0; i < 7; i++) {
            const parent = top3Players[i % 3];
            newWeights1.push(this.mutateWeights(parent.weights1));
            newWeights2.push(this.mutateWeights(parent.weights2));
        }

        this.weights1 = newWeights1;
        this.weights2 = newWeights2;

        this._players = [];
        this._scoreManagers = [];
        this._platformManagers = [];
        this._gameOver = [];

        for (let i = 0; i < 10; i++) {
            this._players.push(new Player());
            this._scoreManagers.push(new ScoreManager(i));
            this._platformManagers.push(new PlatformManager(0));
            this._gameOver.push(false);
        }

    }
    mutateWeights(weights) {
        const mutationRate = 0.1;
        return weights.map(row => row.map(weight => {
            if (Math.random() < mutationRate) {
                return weight + (Math.random() * 2 - 1) * 0.1;
            }
            return weight;
        }));
    }
}