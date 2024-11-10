class InputSystem {
    constructor() {
        this.keys = {};
        
        this.player1Keys = {
            up: 'KeyW',
            down: 'KeyS',
            left: 'KeyA',
            right: 'KeyD',
            punch: 'KeyF',
            kick: 'KeyG'
        };
        
        this.player2Keys = {
            up: 'ArrowUp',
            down: 'ArrowDown',
            left: 'ArrowLeft',
            right: 'ArrowRight',
            punch: 'NumpadOne',
            kick: 'NumpadTwo'
        };
        
        this.initializeControls();
    }

    initializeControls() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    getPlayerMovement(player) {
        const keys = player === 1 ? this.player1Keys : this.player2Keys;
        return {
            x: (this.keys[keys.right] ? 1 : 0) - (this.keys[keys.left] ? 1 : 0),
            y: (this.keys[keys.down] ? 1 : 0) - (this.keys[keys.up] ? 1 : 0),
            jump: this.keys[keys.up],
            punch: this.keys[keys.punch],
            kick: this.keys[keys.kick]
        };
    }
}