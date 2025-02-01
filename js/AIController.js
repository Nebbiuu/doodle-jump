class AIController {
    constructor(model, playerIndex) {
        this._model = model;
        this.playerIndex = playerIndex; // Store the player index
        this.weights1 = this._model.initializeWeights(6, 4);
        this.weights2 = this._model.initializeWeights(4, 3);
        this.previousScore = 0;
        this.stagnantMoves = 0;
        this.maxStagnantMoves = 250;
    }

    getAction() {
        const normalizedInputs = this._model.getNormalizedInputs(this.playerIndex);

        const neuronOutputs = this.calculateNeuronOutputs(normalizedInputs);

        const outputLayer = this.calculateOutputLayer(neuronOutputs);

        const probabilities = this.softmax(outputLayer);

        const maxProbability = Math.max(...probabilities);
        const actionIndex = probabilities.indexOf(maxProbability);


        const currentScore = Math.floor(this._model.scores[this.playerIndex]); // Round the score
        
        if (currentScore <= this.previousScore) {
            this.stagnantMoves++;
        } else {
            this.stagnantMoves = 0;
            this.previousScore = currentScore;
        }

        if (this.stagnantMoves >= this.maxStagnantMoves) {
            this._model._endGame(this.playerIndex); 
        }


        switch (actionIndex) {
            case 0:
                return -1; //  left
            case 1:
                return 1; // right
            case 2:
                return 0; // Stay
            default:
                return 0;
        }
    }

    calculateNeuronOutputs(inputs) {
        const outputs = [];
        for (let i = 0; i < this.weights1.length; i++) {
            let sum = 0;
            for (let j = 0; j < inputs.length; j++) {

                sum += inputs[j] * this.weights1[i][j];

            }

            outputs.push(this.relu(sum));
        }
        return outputs;
    }

    calculateOutputLayer(neuronOutputs) {
        const outputs = [];
        for (let i = 0; i < this.weights2.length; i++) {
            let sum = 0;
            for (let j = 0; j < neuronOutputs.length; j++) {
                sum += neuronOutputs[j] * this.weights2[i][j];
            }
            outputs.push(this.relu(sum));
        }
        return outputs;
    }

    relu(x) {
        return Math.max(0, x);
    }

    softmax(outputs) {
        const maxOutput = Math.max(...outputs);
        const expOutputs = outputs.map(output => Math.exp(output - maxOutput));
        const sumExpOutputs = expOutputs.reduce((sum, value) => sum + value, 0);
        return expOutputs.map(value => value / sumExpOutputs);
    }
}