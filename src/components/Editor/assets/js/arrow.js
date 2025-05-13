import * as fabric from 'fabric';
import CanvasHistory from './canvasHistory';

// Define LineArrow as a standalone class
class LineArrow extends fabric.Line {
    static type = 'lineArrow';

    constructor(points, options) {
        super(points, options);
        this.heads = options.heads || [0, 0];
        this.arrowSize = options.arrowSize || options.strokeWidth * 2;
        this.initialize(points, options);
    }

    initialize(points, options) {
        super.initialize(points, options);
        this.setControlsVisibility({
            mt: false,
            mb: false,
            ml: false,
            mr: false,
            tl: false,
            tr: false,
            bl: false,
            br: false,
            mtr: false
        });
    }

    _render(ctx) {
        super._render(ctx);
        const p = this.calcLinePoints();
        const xDiff = this.x2 - this.x1;
        const yDiff = this.y2 - this.y1;
        const angle = Math.atan2(yDiff, xDiff);

        // Draw arrowheads
        this.drawArrow(ctx, angle, p.x2, p.y2, this.heads[0]);
        ctx.save();
        const xDiff2 = -this.x2 + this.x1;
        const yDiff2 = -this.y2 + this.y1;
        const angle2 = Math.atan2(yDiff2, xDiff2);
        this.drawArrow(ctx, angle2, p.x1, p.y1, this.heads[1]);
        ctx.restore();
    }

    drawArrow(ctx, angle, xPos, yPos, head) {
        if (!head) return;

        ctx.save();
        ctx.translate(xPos, yPos);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(10, 0);
        const width = this.arrowSize < 2 ? this.arrowSize * 6 : this.arrowSize;
        ctx.lineTo(-(width - 2), width);
        ctx.lineTo(-(width - 2), -width);
        ctx.closePath();
        ctx.fillStyle = this.stroke;
        ctx.fill();
        ctx.restore();
    }

    toObject() {
        return Object.assign(super.toObject(), {
            heads: this.heads,
            arrowSize: this.arrowSize
        });
    }

    static fromObject(object, callback) {
        callback && callback(new LineArrow([object.x1, object.y1, object.x2, object.y2], object));
    }
}

LineArrow.async = true;

// Register LineArrow with Fabric.js safely
try {
    fabric.LineArrow = LineArrow;
} catch (e) {
    console.warn('Could not assign fabric.LineArrow, using standalone LineArrow:', e);
}

// Export Arrow class
export default class Arrow {
    constructor(canvas, isActive = false, params = {}) {
        this.canvas = canvas;
        this.isActive = isActive;
        this.params = params;
        this.line = null;
        this.isDrawing = false;

        if (this.isActive) {
            this.init();
        }
    }

    init() {
        const {
            stroke = '#000000',
            strokeWidth = 7,
            fill = 'transparent',
            strokeDashArray = null,
            id = 'arrow'
        } = this.params;

        this.canvas.selection = false;
        this.canvas.defaultCursor = 'crosshair';
        this.bindEvents();
    }

    bindEvents() {
        document.onkeydown = (e) => {
            if (e.which === 46) {
                this.canvas.getActiveObjects().forEach((obj) => {
                    this.canvas.remove(obj);
                });
                this.canvas.renderAll();
            }
        };

        this.canvas.off('mouse:down');
        this.canvas.on('mouse:down', (o) => this.onMouseDown(o));
        this.canvas.on('mouse:move', (o) => this.onMouseMove(o));
        this.canvas.on('mouse:up', () => this.onMouseUp());
        this.canvas.on('object:moving', () => this.disable());
    }

    onMouseDown(o) {
        if (!this.isActive) {
            if (this.canvas.getActiveObject()) {
                this.canvas.getActiveObject().set({
                    hasControls: true,
                    hasBorders: true,
                    lockMovementX: false,
                    lockMovementY: false,
                    lockUniScaling: false
                });
                this.canvas.renderAll();
            }
            this.disable();
            return;
        }

        this.enable();
        if (this.canvas.getActiveObject()) {
            this.canvas.getActiveObject().set({
                hasControls: false,
                hasBorders: false,
                lockMovementX: true,
                lockMovementY: true,
                lockUniScaling: true
            });
            this.canvas.renderAll();
        }

        const pointer = this.canvas.getPointer(o.e);
        const points = [pointer.x, pointer.y, pointer.x, pointer.y];

        this.line = new LineArrow(points, {
            strokeWidth: this.params.strokeWidth,
            strokeDashArray: this.params.strokeDashArray,
            fill: this.params.stroke,
            stroke: this.params.stroke,
            originX: 'center',
            originY: 'center',
            hasBorders: false,
            hasControls: false,
            objectCaching: false,
            perPixelTargetFind: true,
            heads: [1, 0],
            id: this.params.id || 'arrow'
        });

        this.canvas.add(this.line).setActiveObject(this.line);
    }

    onMouseMove(o) {
        if (!this.isActive || !this.line) return;

        this.canvas.selection = false;
        const pointer = this.canvas.getPointer(o.e);
        this.line.set({
            x2: pointer.x,
            y2: pointer.y
        });
        this.line.setCoords();
        this.canvas.renderAll();
    }

    onMouseUp() {
        if (!this.isActive || !this.line) return;

        this.line.set({
            dirty: true,
            objectCaching: true,
            hasControls: false,
            hasBorders: false,
            lockMovementX: true,
            lockMovementY: true,
            lockUniScaling: true
        });

        this.canvas.renderAll();
        const canvasProperties = { width: this.canvas.width, height: this.canvas.height };
        const currentCanvas = { json: this.canvas.toJSON(), canvas: canvasProperties };
        new CanvasHistory(this.canvas, currentCanvas);

        this.disable();
    }

    isEnable() {
        return this.isDrawing;
    }

    enable() {
        this.isDrawing = true;
    }

    disable() {
        this.isDrawing = false;
        this.canvas.selection = true;
        this.canvas.defaultCursor = 'default';
        this.canvas.off('mouse:down');
        this.canvas.off('mouse:move');
        this.canvas.off('mouse:up');
    }
}