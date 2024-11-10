class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.velocity = {
            x: (Math.random() - 0.5) * 10,
            y: (Math.random() - 0.5) * 10
        };
        this.life = 1;
        this.decay = 0.02;
    }

    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.life -= this.decay;
        return this.life > 0;
    }

    render(ctx) {
        ctx.fillStyle = `rgba(255, 200, 0, ${this.life})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3 * this.life, 0, Math.PI * 2);
        ctx.fill();
    }
} 