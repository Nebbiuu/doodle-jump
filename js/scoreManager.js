class ScoreManager {
    constructor() {
        this._score = 0;
    }

    get score() {
        return this._score;
    }

    increment(offset) {
        this._score += offset;
    }

    reset() {
        this._score = 0;
    }

    displayScore() {
        document.getElementById('score').innerText = `Score: ${Math.floor(this._score)}`;
    }

    displayFinalScore() {
        document.getElementById('final-score').innerText = `Final Score: ${Math.floor(this._score)}`;
        document.getElementById('final-score').style.display = 'block';
        document.getElementById('restart-button').style.display = 'block';
        document.getElementById('score').style.display = 'none';
    }

    hideFinalScore() {
        document.getElementById('final-score').style.display = 'none';
        document.getElementById('restart-button').style.display = 'none';
        document.getElementById('score').style.display = 'block';
    }
}