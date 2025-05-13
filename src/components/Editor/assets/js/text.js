import * as fabric from 'fabric';
     import CanvasHistory from './canvasHistory';

     export default class Text {
         constructor(canvas, isActive = false, params = {}) {
             this.canvas = canvas;
             this.isActive = isActive;
             this.params = params;
             this.isDrawing = false;
             this.textObj = null;

             if (this.isActive) {
                 this.init();
             }
         }

         init() {
             const {
                 fill = '#000000',
                 fontFamily = 'Arial',
                 fontSize = 32,
                 fontStyle = 'normal',
                 fontWeight = 'normal',
                 placeholder = 'Add Text',
                 id = '',
                 editable = true
             } = this.params;

             const pointer = this.canvas.getPointer({ e: { clientX: 100, clientY: 100 } });
             this.textObj = new fabric.Textbox(placeholder, {
                 left: pointer.x || 50,
                 top: pointer.y || 50,
                 fill,
                 fontFamily,
                 fontSize,
                 fontStyle,
                 fontWeight,
                 id,
                 editable,
                 width: 200,
                 cursorColor: '#000',
                 cursorWidth: 2,
                 borderColor: 'blue',
                 cornerColor: 'blue',
                 cornerSize: 6,
                 transparentCorners: false,
                 hasBorders: false,
                 hasControls: false
             });

             this.canvas.add(this.textObj);
             this.canvas.setActiveObject(this.textObj);
             this.textObj.enterEditing();
             this.textObj.selectAll();

             if (this.params.onTextChanged) {
                 this.textObj.on('changed', () => {
                     this.params.onTextChanged();
                 });
             }

             this.canvas.renderAll();
             const canvasProperties = { width: this.canvas.width, height: this.canvas.height };
             new CanvasHistory(this.canvas, { json: this.canvas.toJSON(), canvas: canvasProperties });
         }

         bindEvents() {
             this.canvas.on('mouse:down', (o) => this.onMouseDown(o));
             this.canvas.on('mouse:move', () => this.onMouseMove());
             this.canvas.on('mouse:up', () => this.onMouseUp());
         }

         onMouseDown(o) {
             if (!this.isActive) return;

             this.enable();
             const pointer = this.canvas.getPointer(o.e);
             if (!this.canvas.getActiveObject() || !this.canvas.getActiveObject().text) {
                 this.init();
             }
         }

         onMouseMove() {
             if (!this.isEnable()) return;
             this.canvas.renderAll();
         }

         onMouseUp() {
             // No-op, handled by double-click in Editor.vue
         }

         isEnable() {
             return this.isDrawing;
         }

         enable() {
             this.isDrawing = true;
         }

         disable() {
             this.isDrawing = false;
         }

         destroy() {
             if (this.textObj) {
                 this.canvas.remove(this.textObj);
                 this.textObj = null;
                 this.canvas.renderAll();
             }
             this.canvas.off('mouse:down');
             this.canvas.off('mouse:move');
             this.canvas.off('mouse:up');
         }
     }