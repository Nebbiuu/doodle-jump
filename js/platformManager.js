class PlatformManager {
    static MAX_HEIGHT = 0.25 * 600;

    constructor() {
        this.platforms = this._generatePlatforms(0);
        this.hasGeneratedEndPlatforms = false;
    }

    _generatePlatforms(score) {
        let platforms = [
            { x: 160, y: 580, width: 57, height: 17, type: 0, speed: 0 }
        ];

        let posY = 550;
        let platformSpacing = Math.min(100, Math.max(30, score / 100));

        let probabilities = this._getPlatformProbabilities(score);

        for (let i = 0; i < 25; i++) {
            let x = Math.random() * (400 - 57);
            let type = 0;
            let speed = 0;

            if (Math.random() < probabilities.moving) {
                type = 1;
                speed = 100;
            } else if (Math.random() < probabilities.disappearing) {
                type = 2;
            }

            platforms.push({ x: x, y: posY, width: 57, height: 17, type: type, speed: speed });
            posY -= platformSpacing;
        }

        return platforms;
    }

    _getPlatformProbabilities(score) {
        if (score <= 5000) {
            return { normal: 0.80, moving: 0.15, disappearing: 0.05 };
        } else if (score <= 7500) {
            return { normal: 0.70, moving: 0.20, disappearing: 0.10 };
        } else if (score <= 1000) {
            return { normal: 0.60, moving: 0.25, disappearing: 0.15, };
        } else {
            return { normal: 0.50, moving: 0.30, disappearing: 0.20 };
        }
    }

    movePlatforms(fps) {
        for (let platform of this.platforms) {
            if (platform.type === 1) {
                platform.x += platform.speed / fps;
                if (platform.x <= 0 || platform.x + platform.width >= 400) {
                    platform.speed = -platform.speed;
                }
            }
        }
    }

    _removeOldPlatforms() {
        const newPlatforms = this.platforms.filter(platform => platform.y < 600);
        const highestPlatformY = Math.min(...newPlatforms.map(platform => platform.y));

        return { newPlatforms, highestPlatformY };
    }

    _addNewPlatforms(newPlatforms, highestPlatformY, score) {
        let platformSpacing = Math.min(100, Math.max(30, score / 100));
        let probabilities = this._getPlatformProbabilities(score);

        while (newPlatforms.length < 25) {
            const x = Math.random() * (400 - 57);
            const y = highestPlatformY - platformSpacing;
            let type = 0;
            let speed = 0;

            if (Math.random() < probabilities.moving) {
                type = 1;
                speed = 100;
            } else if (Math.random() < probabilities.disappearing) {
                type = 2;
            }

            newPlatforms.push({ x: x, y: y, width: 57, height: 17, type: type, speed: speed });
            highestPlatformY -= platformSpacing;
        }

        this.platforms = newPlatforms;
    }

    generateNewPlatforms(offset, score) {
        const { newPlatforms, highestPlatformY } = this._removeOldPlatforms();
        this._addNewPlatforms(newPlatforms, highestPlatformY, score);
    }

    deleteAllPlatforms() {
        this.platforms = [];
    }

    reset() {
        this.platforms = this._generatePlatforms(0);
    }

    getClosestPlatforms(playerPosition, count = 4) {
        const platformsWithDistance = this.platforms.map(platform => {
            const dx = platform.x - playerPosition.x;
            const dy = platform.y - playerPosition.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return { platform, distance };
        });

        platformsWithDistance.sort((a, b) => a.distance - b.distance);

        const closestPlatforms = platformsWithDistance.slice(0, count).map(item => item.platform);

        return closestPlatforms;
    }

    generateEndingPlatforms(playerY) {
        let endingPlatforms = [];
        let gap = 57; // Espace entre les plateformes
        let screenWidth = 600; // Largeur de l'écran (ajuste si besoin)
        let numPlatforms = Math.ceil(screenWidth / gap); // S'assurer de couvrir toute la largeur
    
        let finalY = playerY - 200; // Décaler vers le bas pour l'effet smooth
    
        for (let i = 0; i < numPlatforms; i++) {
            endingPlatforms.push({
                x: i * gap, 
                y: finalY, // Nouvelle hauteur ajustée
                width: 57,
                height: 17,
                type: 3,
                speed: 0,
            });
        }
    
        return endingPlatforms;
    }
    

}