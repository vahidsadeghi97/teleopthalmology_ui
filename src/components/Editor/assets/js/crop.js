import * as fabric from 'fabric';
     import CanvasHistory from './canvasHistory';

     export default class CropImage {
         constructor(canvas, isActive = false, apply = false, cancel = false, params = {}) {
             this.canvas = canvas;
             this.isActive = isActive;
             this.applyCrop = apply;
             this.cancelCrop = cancel;
             this.params = params;
             this.cropRect = null;
             this.clipOverlay = null;
             this.clip = null;
             this.src = null;

             if (this.cancelCrop) {
                 this.cancel();
             } else if (this.isActive) {
                 this.init();
             } else if (this.applyCrop) {
                 this.apply();
             }
         }

         init() {
             const {
                 width = 200,
                 height = 200,
                 overlayColor = '#000',
                 overlayOpacity = 0.7,
                 cornerSize = 10,
                 hasControls = true,
                 borderColor = '#000',
                 cornerColor = '#000',
                 cornerStyle = 'circle',
                 transparentCorners = false,
                 hasRotatingPoint = false,
                 lockUniScaling = true,
                 noScaleCache = false,
                 strokeUniform = true,
                 strokeColor = '#000'
             } = this.params;

             this.canvas.backgroundColor = '#fff';
             this.canvas.selectable = false;
             this.canvas.uniScaleTransform = true;

             const cropperWidth = this.canvas.width <= width ? this.canvas.width - 50 : width;
             const cropperHeight = this.canvas.height <= height ? this.canvas.height - 50 : height;

             this.src = this.canvas.toDataURL('image/jpeg', 1);
             fabric.Image.fromURL(this.src, (oImg) => {
                 this.cropRect = new fabric.Rect({
                     left: (oImg.width - cropperWidth) / 2,
                     top: (oImg.height - cropperHeight) / 2,
                     width: cropperWidth,
                     height: cropperHeight,
                     fill: '',
                     imageWidth: oImg.width,
                     imageHeight: oImg.height,
                     cornerSize,
                     hasControls,
                     borderColor,
                     cornerColor,
                     cornerStyle,
                     transparentCorners,
                     hasRotatingPoint,
                     lockUniScaling,
                     noScaleCache,
                     strokeUniform,
                     clipTo: (context) => {
                         context.translate(-this.cropRect.width / 2, -this.cropRect.height / 2);
                         for (let x = 0; x <= this.cropRect.width; x += this.cropRect.width / 3) {
                             context.moveTo(x, 0);
                             context.lineTo(x, this.cropRect.height);
                         }
                         for (let y = 0; y <= this.cropRect.height; y += this.cropRect.height / 3) {
                             context.moveTo(0, y);
                             context.lineTo(this.cropRect.width, y);
                         }
                         context.strokeStyle = strokeColor;
                         context.stroke();
                     }
                 });

                 this.cropRect.setControlsVisibility({
                     tl: true,
                     mt: false,
                     tr: true,
                     ml: false,
                     mr: false,
                     bl: true,
                     mb: false,
                     br: true
                 });

                 this.canvas.add(this.cropRect);
                 this.canvas.bringToFront(this.cropRect);
                 this.canvas.setActiveObject(this.cropRect);

                 this.clip = {
                     left: this.cropRect.left,
                     top: this.cropRect.top,
                     right: this.cropRect.width + this.cropRect.left,
                     bottom: this.cropRect.height + this.cropRect.top
                 };

                 this.clipOverlay = new fabric.Path(
                     `M 0 0 H ${this.canvas.width} V ${this.clip.top} H ${this.clip.left} V ${this.clip.bottom} H ${this.clip.right} V ${this.clip.top} H ${this.canvas.width} V ${this.canvas.height} H 0 Z`,
                     {
                         left: 0,
                         top: 0,
                         fill: overlayColor,
                         opacity: overlayOpacity,
                         selectable: false
                     }
                 );

                 this.canvas.add(this.clipOverlay);
                 this.canvas.renderAll();
             });

             this.bindEvents();
         }

         bindEvents() {
             this.canvas.on('mouse:down', (o) => this.onMouseDown(o));
             this.canvas.on('object:scaling', (e) => this.onObjectScaling(e));
             this.canvas.on('object:moving', (e) => this.onObjectMoving(e));
         }

         onMouseDown() {
             if (!this.isActive || !this.cropRect) return;
             this.canvas.setActiveObject(this.cropRect);
         }

         onObjectScaling(e) {
             const target = e.target;
             const newClip = {
                 left: target.left,
                 top: target.top,
                 right: this.canvas.width - target.left + (target.left - this.clip.left) * 2 + (target.width * target.scaleX) - target.width,
                 bottom: this.canvas.height - target.top + (target.top - this.clip.top) * 2 + (target.height * target.scaleY) - target.height
             };

             const updatedPath = new fabric.Path(
                 `M 0 0 H ${this.canvas.width} V ${newClip.top} H ${newClip.left} V ${newClip.bottom} H ${newClip.right} V ${newClip.top} H ${this.canvas.width} V ${this.canvas.height} H 0 Z`
             );

             this.clipOverlay.set({ path: updatedPath.path });
             this.clipOverlay.setCoords();
             this.canvas.renderAll();
         }

         onObjectMoving(e) {
             const target = e.target;
             const newClip = {
                 left: target.left,
                 top: target.top,
                 right: this.canvas.width - target.left + (target.left - this.clip.left) * 2 + (target.width * target.scaleX) - target.width,
                 bottom: this.canvas.height - target.top + (target.top - this.clip.top) * 2 + (target.height * target.scaleY) - target.height
             };

             const updatedPath = new fabric.Path(
                 `M 0 0 H ${this.canvas.width} V ${newClip.top} H ${newClip.left} V ${newClip.bottom} H ${this.clip.right} V ${newClip.top} H ${this.canvas.width} V ${this.canvas.height} H 0 Z`
             );

             this.clipOverlay.set({ path: updatedPath.path });
             this.clipOverlay.setCoords();
             this.canvas.renderAll();
         }

         apply() {
             this.canvas.clear();
             return new Promise((resolve) => {
                 fabric.util.loadImage(this.src, (img) => {
                     const image = new fabric.Image(img);
                     image.set({
                         top: (this.cropRect.height / 2 - this.cropRect.top + this.clip.top),
                         left: (this.cropRect.width / 2 - this.cropRect.left + this.clip.left),
                         originX: 'center',
                         originY: 'center'
                     });
                     this.canvas.setBackgroundImage(image, this.canvas.renderAll.bind(this.canvas));
                     this.canvas.setHeight(this.cropRect.height * this.cropRect.scaleY);
                     this.canvas.setWidth(this.cropRect.width * this.cropRect.scaleX);
                     this.canvas.calcOffset();
                     const bgImage = this.canvas.toDataURL('image/jpeg', 1);
                     const canvasProperties = { width: this.cropRect.width * this.cropRect.scaleX, height: this.cropRect.height * this.cropRect.scaleY };
                     const croppedImage = {
                         json: this.canvas.toJSON(),
                         canvas: canvasProperties,
                         croppedImage: bgImage,
                         imagePosition: { top: 0, left: 0 }
                     };
                     new CanvasHistory(this.canvas, croppedImage);
                     resolve();
                 });
             });
         }

         cancel() {
             if (this.clipOverlay) this.canvas.remove(this.clipOverlay);
             if (this.cropRect) this.canvas.remove(this.cropRect);
             this.canvas.getObjects().forEach((object) => {
                 if (object.id === 'clonedCanvasImage') {
                     this.canvas.remove(object);
                 }
             });
             this.canvas.renderAll();
         }
     }