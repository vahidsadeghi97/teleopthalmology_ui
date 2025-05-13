import * as fabric from 'fabric';
import CanvasHistory from './canvasHistory';

export default class Shape {
    constructor(canvas, isActive = false, type = '', params = {}) {
        this.canvas = canvas;
        this.isActive = isActive;
        this.type = type;
        this.params = params;
        this.isDrawing = false;
        this.origX = 0;
        this.origY = 0;
        this.shape = null;

        if (this.isActive) {
            this.init();
        }
    }

    init() {
        this.bindEvents();
        this.canvas.selection = false;
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
                    hasControls: this.type === 'line' ? false : true,
                    hasBorders: this.type === 'line' ? false : true,
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
        this.origX = pointer.x;
        this.origY = pointer.y;

        const {
            fill = 'transparent',
            stroke = '#000000',
            strokeWidth = 7,
            angle = 0,
            strokeDashArray = null,
            borderRadius = 0,
            id = ''
        } = this.params;

        if (this.type === 'rect') {
            this.shape = new fabric.Rect({
                left: this.origX,
                top: this.origY,
                originX: 'left',
                originY: 'top',
                width: 0,
                height: 0,
                angle,
                fill,
                transparentCorners: false,
                stroke,
                strokeWidth,
                strokeDashArray,
                rx: borderRadius,
                ry: borderRadius,
                id
            });
        } else if (this.type === 'comment') {
            this.shape = new fabric.Path(
                'M44 48L34 58V48H12C5.373 48 0 42.627 0 36V12C0 5.373 5.373 0 12 0h40c6.627 0 12 5.373 12 12v24c0 6.627-5.373 12-12 12h-8z',
                {
                    left: this.origX,
                    top: this.origY,
                    originX: 'left',
                    originY: 'top',
                    scaleX: 0,
                    scaleY: 0,
                    angle,
                    fill,
                    transparentCorners: false,
                    stroke,
                    strokeWidth,
                    strokeDashArray,
                    rx: borderRadius,
                    ry: borderRadius,
                    id
                }
            );
        } else if (this.type === 'circle') {
            this.shape = new fabric.Ellipse({
                top: this.origY,
                left: this.origX,
                rx: 0,
                ry: 0,
                transparentCorners: false,
                hasBorders: true,
                hasControls: true,
                fill,
                stroke,
                strokeWidth,
                strokeDashArray,
                id
            });
        } else if (this.type === 'line') {
            const points = [pointer.x, pointer.y, pointer.x, pointer.y];
            this.shape = new fabric.Line(points, {
                strokeDashArray,
                stroke: fill,
                originX: 'center',
                originY: 'center',
                angle,
                transparentCorners: false,
                hasBorders: false,
                hasControls: false,
                id
            });
        }

        if (this.shape) {
            this.canvas.add(this.shape).setActiveObject(this.shape);
        }
    }

    onMouseMove(o) {
        if (!this.isEnable() || !this.shape) return;

        this.canvas.selection = false;
        const pointer = this.canvas.getPointer(o.e);
        const activeObj = this.canvas.getActiveObject();

        activeObj.set({
            stroke: this.params.stroke,
            strokeWidth: this.params.strokeWidth,
            id: this.params.id,
            fill: this.params.fill,
            noScaleCache: false,
            strokeUniform: true
        });

        if (this.type !== 'comment') {
            if (this.origX > pointer.x) {
                activeObj.set({ left: Math.abs(pointer.x) });
            }
            if (this.origY > pointer.y) {
                activeObj.set({ top: Math.abs(pointer.y) });
            }
        }

        if (this.type === 'rect') {
            activeObj.set({
                width: Math.abs(this.origX - pointer.x),
                height: Math.abs(this.origY - pointer.y)
            });
        } else if (this.type === 'comment') {
            activeObj.set({
                scaleX: Math.abs(this.origY - pointer.y) / 65,
                scaleY: Math.abs(this.origY - pointer.y) / 65
            });
        } else if (this.type === 'line') {
            activeObj.set({ x2: pointer.x, y2: pointer.y });
        } else if (this.type === 'circle') {
            activeObj.set({
                rx: Math.abs(this.origX - pointer.x) / 2,
                ry: Math.abs(this.origY - pointer.y) / 2
            });
        }

        activeObj.setCoords();
        this.canvas.renderAll();
    }

    onMouseUp() {
        if (!this.isEnable()) return;

        const activeObj = this.canvas.getActiveObject();
        if (activeObj) {
            activeObj.set({
                hasControls: false,
                hasBorders: false,
                lockMovementX: true,
                lockMovementY: true,
                lockUniScaling: true
            });
        }

        this.canvas.renderAll();
        const canvasProperties = { width: this.canvas.width, height: this.canvas.height };
        new CanvasHistory(this.canvas, { json: this.canvas.toJSON(), canvas: canvasProperties });

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
        this.canvas.off('mouse:down');
        this.canvas.off('mouse:move');
        this.canvas.off('mouse:up');
    }
}