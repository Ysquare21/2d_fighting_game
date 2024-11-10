class Projectile {
    constructor(x, y, direction, type = 'fireball') {
        this.x = x;
        this.y = y;
        this.direction = direction; // 1 for right, -1 for left
        this.type = type;
        
        // Projectile properties
        this.width = 20;
        this.height = 20;
        this.speed = 10;
        this.damage = 25;
        this.active = true;
        
        // Animation properties
        this.frameCount = 0;
        this.rotation = 0;
    }

    update() {
        this.x += this.speed * this.direction;
        this.rotation += 0.2;
        this.frameCount++;
        
        // Deactivate if off screen
        if (this.x < -50 || this.x > 1074) { // canvas width + buffer
            this.active = false;
        }
    }

    render(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        ctx.rotate(this.rotation);
        
        // Fireball effect
        const gradient = ctx.createRadialGradient(0, 0, 2, 0, 0, 12);
        gradient.addColorStop(0, '#fff');
        gradient.addColorStop(0.1, '#ff0');
        gradient.addColorStop(0.4, '#f50');
        gradient.addColorStop(1, 'rgba(255, 85, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();
        
        // Trail effect
        for (let i = 1; i <= 3; i++) {
            ctx.fillStyle = `rgba(255, 85, 0, ${0.3 / i})`;
            ctx.beginPath();
            ctx.arc(-15 * i * this.direction, 0, 10 - i * 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }

    checkCollision(fighter) {
        return (
            this.x < fighter.x + fighter.width &&
            this.x + this.width > fighter.x &&
            this.y < fighter.y + fighter.height &&
            this.y + this.height > fighter.y
        );
    }
} 