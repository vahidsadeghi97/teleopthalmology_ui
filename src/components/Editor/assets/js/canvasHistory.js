import * as fabric from 'fabric';

     export default class CanvasHistory {
         constructor(canvas, state) {
             this.canvas = canvas;
             this.history = [];
             this.redoStack = [];
             this.currentState = null;

             if (state) {
                 this.saveState(state);
             }
         }

         saveState(state) {
             this.currentState = state;
             this.history.push(state);
             this.redoStack = []; // Clear redo stack on new action
         }

         undo() {
             if (this.history.length > 1) {
                 const currentState = this.history.pop();
                 this.redoStack.push(currentState);
                 const previousState = this.history[this.history.length - 1];
                 this.loadState(previousState);
             }
         }

         redo() {
             if (this.redoStack.length > 0) {
                 const nextState = this.redoStack.pop();
                 this.history.push(nextState);
                 this.loadState(nextState);
             }
         }

         loadState(state) {
             this.canvas.clear();
             this.canvas.loadFromJSON(state.json, () => {
                 this.canvas.setWidth(state.canvas.width);
                 this.canvas.setHeight(state.canvas.height);
                 if (state.croppedImage) {
                     fabric.Image.fromURL(state.croppedImage, (img) => {
                         img.set(state.imagePosition);
                         this.canvas.setBackgroundImage(img, this.canvas.renderAll.bind(this.canvas));
                     });
                 }
                 this.canvas.renderAll();
             });
         }
     }