class Fighter {
    constructor(x, y, name, color = '#fff') {
        this.x = x;
        this.y = y;
        this.name = name;
        this.color = color;
        
        // Dimensions
        this.width = 50;
        this.height = 100;
        
        // Physics properties
        this.velocity = { x: 0, y: 0 };
        this.acceleration = { x: 0, y: 0 };
        this.gravity = 0.7;
        this.friction = 0.85;
        this.groundLevel = 576 - this.height - 50; // Canvas height - fighter height - 50px
        
        // Movement properties
        this.speed = 5;
        this.jumpForce = -15;
        this.maxSpeed = { x: 8, y: 15 };
        
        // Combat stats
        this.health = 100;
        this.isBlocking = false;
        this.currentAnimation = 'idle';
        
        // Fighter states
        this.state = {
            isGrounded: false,
            isJumping: false,
            isCrouching: false,
            isAttacking: false,
            facingRight: true
        };
        
        // Combat properties
        this.attackBox = {
            width: 30,
            height: 30,
            offset: { x: 30, y: 30 }
        };
    }

    update(deltaTime) {
        this.updatePhysics(deltaTime);
        this.updatePosition();
        this.checkBounds();
    }

    updatePhysics(deltaTime) {
        // Apply gravity when not grounded
        this.acceleration.y = this.gravity;
        
        // Update velocity with acceleration
        this.velocity.x += this.acceleration.x;
        this.velocity.y += this.acceleration.y;
        
        // Apply friction when on ground
        if (this.state.isGrounded) {
            this.velocity.x *= this.friction;
        }
        
        // Clamp velocities to max speed
        this.velocity.x = Math.max(-this.maxSpeed.x, Math.min(this.maxSpeed.x, this.velocity.x));
        this.velocity.y = Math.max(-this.maxSpeed.y, Math.min(this.maxSpeed.y, this.velocity.y));
        
        // Reset acceleration
        this.acceleration.x = 0;
    }

    updatePosition() {
        // Update position based on velocity
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        
        // Ground check
        if (this.y >= this.groundLevel) {
            this.y = this.groundLevel;
            this.velocity.y = 0;
            this.state.isGrounded = true;
            this.state.isJumping = false;
        } else {
            this.state.isGrounded = false;
        }
    }

    move(direction) {
        // Apply acceleration instead of direct movement
        const moveForce = 0.8;
        this.acceleration.x = direction * moveForce;
        this.state.facingRight = direction > 0;
    }

    jump() {
        if (this.state.isGrounded) {
            this.velocity.y = this.jumpForce;
            this.state.isJumping = true;
            this.state.isGrounded = false;
        }
    }

    attack(type = 'normal') {
        if (this.state.isAttacking) return;
        
        this.state.isAttacking = true;
        this.currentAnimation = type;
        
        setTimeout(() => {
            this.state.isAttacking = false;
            this.currentAnimation = 'idle';
        }, 400);
    }

    render(ctx) {
        ctx.save();
        
        // Draw stickman body
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Calculate leg positions based on movement
        const legSpread = 20;
        const legLength = 30;
        const footOffset = Math.abs(this.velocity.x) > 0.1 ? 
            Math.sin(Date.now() * 0.01) * 10 : 0;
        
        ctx.beginPath();
        
        // Head
        ctx.arc(this.x + 25, this.y + 10, 10, 0, Math.PI * 2);
        
        // Body (with slight lean based on movement)
        const leanAngle = (this.velocity.x * 0.05);
        ctx.moveTo(this.x + 25, this.y + 20);
        ctx.lineTo(this.x + 25 + leanAngle * 5, this.y + 60);
        
        // Arms with movement
        if (this.state.isAttacking) {
            // Attack pose
            ctx.moveTo(this.x + 25, this.y + 30);
            ctx.lineTo(this.x + (this.state.facingRight ? 45 : 5), this.y + 40);
        } else {
            // Normal pose with arm swing
            const armSwing = Math.sin(Date.now() * 0.01) * 10;
            ctx.moveTo(this.x + 25, this.y + 30);
            ctx.lineTo(this.x + 45 + armSwing, this.y + 45);
            ctx.moveTo(this.x + 25, this.y + 30);
            ctx.lineTo(this.x + 5 - armSwing, this.y + 45);
        }
        
        // Legs with walking animation
        const leftLegX = this.x + 25 - legSpread + footOffset;
        const rightLegX = this.x + 25 + legSpread - footOffset;
        
        // Left leg
        ctx.moveTo(this.x + 25, this.y + 60);
        ctx.lineTo(leftLegX, this.y + 60 + legLength);
        
        // Right leg
        ctx.moveTo(this.x + 25, this.y + 60);
        ctx.lineTo(rightLegX, this.y + 60 + legLength);
        
        // Feet
        ctx.moveTo(leftLegX - 10, this.y + 60 + legLength);
        ctx.lineTo(leftLegX + 10, this.y + 60 + legLength);
        ctx.moveTo(rightLegX - 10, this.y + 60 + legLength);
        ctx.lineTo(rightLegX + 10, this.y + 60 + legLength);
        
        ctx.stroke();
        ctx.restore();
    }

    checkBounds() {
        // Keep fighter within canvas bounds
        if (this.x < 0) {
            this.x = 0;
            this.velocity.x = 0;
        }
        if (this.x + this.width > 1024) {
            this.x = 1024 - this.width;
            this.velocity.x = 0;
        }
    }
}