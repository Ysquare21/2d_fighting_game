class FightingGame {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 1024;
        this.canvas.height = 576;
        document.body.appendChild(this.canvas);
        
        this.inputSystem = new InputSystem();
        this.fighters = [];
        this.frameCount = 0;
        this.lastTime = 0;
        
        // Create fighters
        this.player1 = new Fighter(200, 400, 'Player 1', '#00f');
        this.player2 = new Fighter(800, 400, 'Player 2', '#f00');
        
        // Debug settings
        this.debugMode = {
            enabled: true,
            mode: 'basic' // 'basic', 'detailed', 'hitbox', 'all'
        };

        // Add debug controls
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Tab') {
                e.preventDefault();
                this.debugMode.enabled = !this.debugMode.enabled;
            }
            if (e.code === 'Backquote') { // ` key
                e.preventDefault();
                const modes = ['basic', 'detailed', 'hitbox', 'all'];
                const currentIndex = modes.indexOf(this.debugMode.mode);
                this.debugMode.mode = modes[(currentIndex + 1) % modes.length];
            }
        });
        
        // Add timer
        this.matchTime = 99; // 99 seconds
        this.currentTime = this.matchTime;
        this.lastSecond = Date.now();

        this.init();
    }

    init() {
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    gameLoop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame(this.gameLoop.bind(this));
    }

    update(deltaTime) {
        // Handle player 1 input
        const p1Input = this.inputSystem.getPlayerMovement(1);
        if (p1Input.x !== 0) this.player1.move(p1Input.x);
        if (p1Input.jump) this.player1.jump();
        if (p1Input.punch) this.player1.attack('punch');
        
        // Handle player 2 input
        const p2Input = this.inputSystem.getPlayerMovement(2);
        if (p2Input.x !== 0) this.player2.move(p2Input.x);
        if (p2Input.jump) this.player2.jump();
        if (p2Input.punch) this.player2.attack('punch');
        
        // Update fighters
        this.player1.update(deltaTime);
        this.player2.update(deltaTime);

        // Update timer
        if (Date.now() - this.lastSecond >= 1000) {
            this.currentTime--;
            this.lastSecond = Date.now();
            if (this.currentTime <= 0) {
                this.currentTime = 0;
                // Handle match end
            }
        }
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = '#000033';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw fighters
        this.player1.render(this.ctx);
        this.player2.render(this.ctx);
        
        // Draw UI
        this.renderUI();

        // Draw debug info if enabled
        if (this.debugMode.enabled) {
            this.renderDebugInfo();
        }
    }

    renderUI() {
        // Health bars
        const barWidth = 300;
        const barHeight = 30;
        const margin = 50;
        const topMargin = 30;

        // Player 1 health bar
        this.ctx.fillStyle = '#600';
        this.ctx.fillRect(margin, topMargin, barWidth, barHeight);
        this.ctx.fillStyle = '#f00';
        this.ctx.fillRect(margin, topMargin, (this.player1.health / 100) * barWidth, barHeight);
        
        // Player 2 health bar
        this.ctx.fillStyle = '#600';
        this.ctx.fillRect(this.canvas.width - margin - barWidth, topMargin, barWidth, barHeight);
        this.ctx.fillStyle = '#f00';
        this.ctx.fillRect(
            this.canvas.width - margin - ((this.player2.health / 100) * barWidth), 
            topMargin, 
            (this.player2.health / 100) * barWidth, 
            barHeight
        );

        // Timer
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            Math.ceil(this.currentTime).toString(),
            this.canvas.width / 2,
            topMargin + 40
        );
    }

    renderDebugInfo() {
        const panelStyle = {
            background: 'rgba(0, 0, 0, 0.7)',
            border: '2px solid #444',
            headerColor: '#0f0',
            textColor: '#fff',
            warningColor: '#f70',
            criticalColor: '#f00'
        };

        // Draw debug mode indicator
        this.ctx.fillStyle = panelStyle.headerColor;
        this.ctx.font = 'bold 12px Monospace';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`Debug Mode: ${this.debugMode.mode}`, this.canvas.width - 10, 20);

        if (this.debugMode.mode === 'basic' || this.debugMode.mode === 'all') {
            this.renderDebugPanel(10, 50, 300, 120, 'Player 1', this.player1, panelStyle);
            this.renderDebugPanel(this.canvas.width - 310, 50, 300, 120, 'Player 2', this.player2, panelStyle);
        }

        if (this.debugMode.mode === 'detailed' || this.debugMode.mode === 'all') {
            this.renderPerformancePanel(10, 180, 200, 100, panelStyle);
            this.renderInputPanel(this.canvas.width - 210, 180, 200, 100, panelStyle);
        }

        if (this.debugMode.mode === 'hitbox' || this.debugMode.mode === 'all') {
            this.renderHitboxes();
        }
    }

    renderDebugPanel(x, y, width, height, title, fighter, style) {
        // Panel background
        this.ctx.fillStyle = style.background;
        this.ctx.fillRect(x, y, width, height);
        this.ctx.strokeStyle = style.border;
        this.ctx.strokeRect(x, y, width, height);

        // Panel content
        this.ctx.font = 'bold 14px Monospace';
        this.ctx.textAlign = 'left';
        this.ctx.fillStyle = style.headerColor;
        this.ctx.fillText(title, x + 10, y + 20);

        this.ctx.font = '12px Monospace';
        this.ctx.fillStyle = style.textColor;
        
        const stats = [
            `Position: (${Math.round(fighter.x)}, ${Math.round(fighter.y)})`,
            `Health: ${fighter.health}`,
            `State: ${Object.entries(fighter.state)
                .filter(([_, value]) => value === true)
                .map(([key]) => key)
                .join(', ') || 'neutral'}`
        ];

        stats.forEach((stat, i) => {
            if (stat.includes('Health:')) {
                this.ctx.fillStyle = fighter.health < 30 ? style.criticalColor :
                                   fighter.health < 50 ? style.warningColor : style.textColor;
            }
            this.ctx.fillText(stat, x + 10, y + 40 + (i * 20));
        });
    }

    renderPerformancePanel(x, y, width, height, style) {
        this.ctx.fillStyle = style.background;
        this.ctx.fillRect(x, y, width, height);
        this.ctx.strokeStyle = style.border;
        this.ctx.strokeRect(x, y, width, height);

        this.ctx.font = 'bold 14px Monospace';
        this.ctx.fillStyle = style.headerColor;
        this.ctx.textAlign = 'left';
        this.ctx.fillText('Performance', x + 10, y + 20);

        this.ctx.font = '12px Monospace';
        this.ctx.fillStyle = style.textColor;
        this.ctx.fillText(`FPS: ${Math.round(1000 / this.deltaTime)}`, x + 10, y + 40);
        this.ctx.fillText(`Frame Time: ${Math.round(this.deltaTime)}ms`, x + 10, y + 60);
    }

    renderInputPanel(x, y, width, height, style) {
        this.ctx.fillStyle = style.background;
        this.ctx.fillRect(x, y, width, height);
        this.ctx.strokeStyle = style.border;
        this.ctx.strokeRect(x, y, width, height);

        this.ctx.font = 'bold 14px Monospace';
        this.ctx.fillStyle = style.headerColor;
        this.ctx.textAlign = 'left';
        this.ctx.fillText('Controls', x + 10, y + 20);

        this.ctx.font = '12px Monospace';
        this.ctx.fillStyle = style.textColor;
        this.ctx.fillText('Tab: Toggle Debug', x + 10, y + 40);
        this.ctx.fillText('`: Cycle Debug Mode', x + 10, y + 60);
    }

    renderHitboxes() {
        this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        this.ctx.lineWidth = 2;
        
        [this.player1, this.player2].forEach(fighter => {
            // Main hitbox - tighter to the body
            const bodyHitbox = {
                x: fighter.x + 10,
                y: fighter.y,
                width: fighter.width - 20,
                height: fighter.height
            };
            this.ctx.strokeRect(bodyHitbox.x, bodyHitbox.y, bodyHitbox.width, bodyHitbox.height);
            
            // Attack hitbox when attacking
            if (fighter.state.isAttacking) {
                this.ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
                const attackBox = {
                    x: fighter.state.facingRight ? 
                        fighter.x + fighter.width : 
                        fighter.x - fighter.attackBox.width,
                    y: fighter.y + fighter.attackBox.offset.y,
                    width: fighter.attackBox.width,
                    height: fighter.attackBox.height
                };
                this.ctx.strokeRect(attackBox.x, attackBox.y, attackBox.width, attackBox.height);
            }
        });
    }
}