class CollisionManager {
    static checkPlayerPlatformCollision(player, platforms) {
        for (let i = 0; i < platforms.length; i++) {
            let platform = platforms[i];
            if (
                player.position.y + 70 >= platform.y &&
                player.position.y + 70 <= platform.y + platform.height &&
                player.position.x + 50 > platform.x &&
                player.position.x < platform.x + 40 &&
                player._gravitySpeed > 0
            ) {
                player.jump();
                if (platform.type === 2) {
                    platforms.splice(i, 1);
                    i--;
                }
            }
        }
    }
}