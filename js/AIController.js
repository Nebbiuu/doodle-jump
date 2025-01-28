class AIController {
    constructor(model) {
        this._model = model;
        this.weights1 = this._model.initializeWeights(6, 4); // 6 inputs, 4 outputs for the first layer
        this.weights2 = this._model.initializeWeights(4, 3); // 4 inputs, 3 outputs for the second layer
        this.previousScore = 0;
        this.stagnantMoves = 0;
        this.maxStagnantMoves = 250; // Nombre de mouvements avant de considérer que l'IA est bloquée
   }

    getAction() {
        const normalizedInputs = this._model.getNormalizedInputs();
        const neuronOutputs = this.calculateNeuronOutputs(normalizedInputs);
        const outputLayer = this.calculateOutputLayer(neuronOutputs);
        const probabilities = this.softmax(outputLayer);

        const maxProbability = Math.max(...probabilities);
        const actionIndex = probabilities.indexOf(maxProbability);
        
        if (this._model.score === this.previousScore) {
            this.stagnantMoves++;
        } else {
            this.stagnantMoves = 0;
            this.previousScore = this._model.score;
        }

        if (this.stagnantMoves >= this.maxStagnantMoves) {
            this._model._endGame();
        }

        switch (actionIndex) {
            case 0:
                return -1; // Move left
            case 1:
                return 1; // Move right
            case 2:
                return 0; // Stay
            default:
                return 0; // Default to stay
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