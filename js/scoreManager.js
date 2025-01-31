class ScoreManager {
    constructor(playerIndex) {
        this._score = 0;
        this.playerIndex = playerIndex;
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
        document.getElementById(`score_${this.playerIndex}`).innerText = `Score: ${Math.floor(this._score)}`;
    }

    displayFinalScore() {
        document.getElementById(`final-score_${this.playerIndex}`).innerText = `Final Score: ${Math.floor(this._score)}`;
        document.getElementById(`final-score_${this.playerIndex}`).style.display = 'block';
       document.getElementById(`score_${this.playerIndex}`).style.display = 'none';
    }

    hideFinalScore() {
        document.getElementById(`final-score_${this.playerIndex}`).style.display = 'none';
        document.getElementById(`score_${this.playerIndex}`).style.display = 'block';
    }
}