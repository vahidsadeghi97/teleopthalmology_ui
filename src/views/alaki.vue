<template>
  <div class="canvas-editor">
    <div class="controls">
      <div class="input-group">
        <input
          type="text"
          v-model="imageUrl"
          placeholder="Enter image URL"
          @keyup.enter="loadImage"
        />
        <button @click="loadImage">Load Image</button>
        <select v-model="selectedDisease">
          <option value="" disabled>Select Disease</option>
          <option v-for="disease in diseases" :value="disease" :key="disease">{{ disease }}</option>
        </select>
      </div>

      <div class="tool-buttons">
        <button @click="addText">Add Text</button>
        <button @click="addRectangle">Add Rectangle</button>
        <button @click="addCircle">Add Circle</button>
        <button @click="addArrow">Add Arrow</button>
        <button @click="startPolygonDrawing">Add Polygon</button>
        <button @click="toggleFreeDrawing">Free Draw</button>
        <button @click="startMeasuring">Measure</button>
        <button @click="startAngleMeasurement">Measure Angle</button>
        <button @click="startHighlighting">Highlight</button>
        <button @click="addAsterisk">Asterisk</button>
        <button @click="toggleBrightnessSlider">Change Brightness</button>
        <button @click="toggleContrastSlider">Change Contrast</button>
        <button @click="zoomIn">Zoom In (+)</button>
        <button @click="zoomOut">Zoom Out (-)</button>
        <button @click="resetZoom">Reset Zoom</button>
        <button @click="rotateImage">Rotate</button>
        <button @click="sharpenImage">Sharpen</button>
        <button @click="smoothImage">Smooth</button>
        <button @click="applyEdgeDetection">Edge Detection</button>
        <button @click="saveImage">Save Image</button>
        <button @click="uploadImage" :disabled="isUploading">
          {{ isUploading ? 'Uploading...' : 'Upload Image' }}
        </button>
        <button @click="clearCanvas">Clear Canvas</button>
      </div>

      <div v-if="showHighlightControls" class="highlight-controls">
        <label>Highlight Color:</label>
        <input type="color" v-model="highlightColor" @input="updateHighlightBrush" />
        <label>Highlight Thickness:</label>
        <input
          type="range"
          v-model.number="highlightThickness"
          min="1"
          max="50"
          step="1"
          @input="updateHighlightBrush"
        />
        <span>{{ highlightThickness }} px</span>
      </div>
    </div>

    <div class="canvas-container" ref="canvasContainer">
      <canvas id="fundus-canvas"></canvas>
      <div v-if="measurementText" class="measurement-display">
        {{ measurementText }}
      </div>
      <input
        v-if="showBrightnessSlider"
        type="range"
        v-model.number="brightnessLevel"
        min="-0.5"
        max="0.5"
        step="0.01"
        class="brightness-slider"
        @input="updateFilters"
      />
      <input
        v-if="showContrastSlider"
        type="range"
        v-model.number="contrastLevel"
        min="-0.5"
        max="0.5"
        step="0.01"
        class="contrast-slider"
        @input="updateFilters"
      />
    </div>
  </div>
</template>

<script>
import * as fabric from 'fabric';
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import EditedImageService from '@/services/edited_file.service'; // Adjusted path to your service

function convolutionFilter(image, kernel, divisor = 1) {
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.width = image.width;
canvas.height = image.height;

ctx.drawImage(image.getElement(), 0, 0, image.width, image.height);
const imageData = ctx.getImageData(0, 0, image.width, image.height);
const data = imageData.data;
const width = imageData.width;
const height = imageData.height;
const tempData = new Uint8ClampedArray(data.length);

for (let y = 1; y < height - 1; y++) {
  for (let x = 1; x < width - 1; x++) {
    const idx = (y * width + x) * 4;
    let r = 0,
      g = 0,
      b = 0;
    for (let ky = -1; ky <= 1; ky++) {
      for (let kx = -1; kx <= 1; kx++) {
        const pixelIdx = ((y + ky) * width + (x + kx)) * 4;
        const weight = kernel[(ky + 1) * 3 + (kx + 1)];
        r += data[pixelIdx] * weight;
        g += data[pixelIdx + 1] * weight;
        b += data[pixelIdx + 2] * weight;
      }
    }
    tempData[idx] = Math.min(Math.max(r / divisor, 0), 255);
    tempData[idx + 1] = Math.min(Math.max(g / divisor, 0), 255);
    tempData[idx + 2] = Math.min(Math.max(b / divisor, 0), 255);
    tempData[idx + 3] = data[idx + 3];
  }
}

const newImageData = new ImageData(tempData, width, height);
ctx.putImageData(newImageData, 0, 0);
return canvas;
}

function applySobelFilter(image) {
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.width = image.width;
canvas.height = image.height;

ctx.drawImage(image.getElement(), 0, 0, image.width, image.height);
const imageData = ctx.getImageData(0, 0, image.width, image.height);
const data = imageData.data;
const width = imageData.width;
const height = imageData.height;
const tempData = new Uint8ClampedArray(data.length);

const kernelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
const kernelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

for (let y = 1; y < height - 1; y++) {
  for (let x = 1; x < width - 1; x++) {
    const idx = (y * width + x) * 4;
    let gx = 0,
      gy = 0;
    for (let ky = -1; ky <= 1; ky++) {
      for (let kx = -1; kx <= 1; kx++) {
        const pixelIdx = ((y + ky) * width + (x + kx)) * 4;
        const gray = (data[pixelIdx] + data[pixelIdx + 1] + data[pixelIdx + 2]) / 3;
        gx += gray * kernelX[(ky + 1) * 3 + (kx + 1)];
        gy += gray * kernelY[(ky + 1) * 3 + (kx + 1)];
      }
    }
    const magnitude = Math.sqrt(gx * gx + gy * gy);
    tempData[idx] = tempData[idx + 1] = tempData[idx + 2] = Math.min(magnitude, 255);
    tempData[idx + 3] = data[idx + 3];
  }
}

const newImageData = new ImageData(tempData, width, height);
ctx.putImageData(newImageData, 0, 0);
return canvas;
}

export default {
name: 'CanvasEditor',
setup() {
  const route = useRoute();
  const imageUrl = ref('');
  const canvas = ref(null);
  const canvasContainer = ref(null);
  const selectedDisease = ref('');
  const measurementText = ref('');
  const isMeasuring = ref(false);
  const isPanning = ref(false);
  const startPoint = ref(null);
  const currentMeasurement = ref(null);
  const scaleFactor = ref(1);
  const brightnessLevel = ref(0);
  const showBrightnessSlider = ref(false);
  const contrastLevel = ref(0);
  const showContrastSlider = ref(false);
  const lastClickPos = ref({ x: null, y: null });
  const isDragging = ref(false);
  const lastDragPos = ref({ x: 0, y: 0 });
  const isDrawingPolygon = ref(false);
  const polygonPoints = ref([]);
  const tempLines = ref([]);
  const tempPoints = ref([]);
  const isMeasuringAngle = ref(false);
  const anglePoints = ref([]);
  const angleLines = ref([]);
  const edgeImage = ref(null);
  const rotationAngle = ref(0);
  const isHighlighting = ref(false);
  const showHighlightControls = ref(false);
  const highlightColor = ref('#ffff00');
  const highlightThickness = ref(10);
  const isAddingAsterisk = ref(false);
  const originalCanvasHeight = 800;
  const isUploading = ref(false);
  const uploadError = ref('');

  const diseases = [
    'Diabetic Retinopathy (DR)',
    'Age-Related Macular Degeneration (AMD)',
    'Glaucoma',
    'Retinal Vein Occlusion (RVO)',
    'Retinal Artery Occlusion (RAO)',
    'Retinal Detachment (RD)',
    'Hypertensive Retinopathy',
    'High Myopia',
    'Macular Diseases',
  ];

  const diseaseToTypeMap = {
    'Diabetic Retinopathy (DR)': 'DIABETES',
    'Age-Related Macular Degeneration (AMD)': 'OTHER',
    'Glaucoma': 'OTHER',
    'Retinal Vein Occlusion (RVO)': 'OTHER',
    'Retinal Artery Occlusion (RAO)': 'OTHER',
    'Retinal Detachment (RD)': 'OTHER',
    'Hypertensive Retinopathy': 'OTHER',
    'High Myopia': 'OTHER',
    'Macular Diseases': 'OTHER',
  };

  onMounted(async () => {
    try {
      const response = await EditedImageService.getEditedImage(route.params.id);
      let file = response.data;
      imageUrl.value = file.edited_image_url;
      loadImage();
    } catch (err) {
      console.error('Failed to load image:', err);
    }

    canvas.value = new fabric.Canvas('fundus-canvas', {
      backgroundColor: '#f0f0f0',
      width: 800,
      height: originalCanvasHeight,
      preserveObjectStacking: true,
      selection: true,
    });

    canvas.value.on('mouse:down', handleMouseDown);
    canvas.value.on('mouse:move', handleMouseMove);
    canvas.value.on('mouse:up', handleMouseUp);
    canvas.value.on('mouse:dblclick', handleDoubleClick);
    canvas.value.on('mouse:down', (options) => {
      const pointer = canvas.value.getPointer(options.e, true);
      lastClickPos.value = { x: pointer.x, y: pointer.y };
    });
    canvas.value.on('mouse:over', (options) => {
      if (options.target && options.target.type === 'image' && canvas.value.getZoom() !== 1) {
        canvas.value.defaultCursor = 'move';
      }
    });
    canvas.value.on('mouse:out', () => {
      if (
        !isMeasuring.value &&
        !canvas.value.isDrawingMode &&
        !isDrawingPolygon.value &&
        !isMeasuringAngle.value &&
        !isHighlighting.value &&
        !isAddingAsterisk.value
      ) {
        canvas.value.defaultCursor = 'default';
      }
    });
  });

  const loadImage = () => {
    if (!imageUrl.value) {
      alert('Please enter an image URL');
      return;
    }

    const imgElement = new Image();
    imgElement.crossOrigin = 'Anonymous';

    imgElement.onload = () => {
      const fabricImg = new fabric.Image(imgElement);
      const scale = Math.min(
        (canvas.value.width / fabricImg.width) * 0.95,
        (originalCanvasHeight / 2 / fabricImg.height) * 0.95
      );

      fabricImg.set({
        scaleX: scale,
        scaleY: scale,
        left: canvas.value.width / 2,
        top: originalCanvasHeight / 4,
        originX: 'center',
        originY: 'center',
        selectable: false,
        angle: 0,
      });

      canvas.value.clear();
      canvas.value.setDimensions({ width: 800, height: originalCanvasHeight });
      canvas.value.add(fabricImg);
      edgeImage.value = null;
      rotationAngle.value = 0;
      canvas.value.renderAll();
    };

    imgElement.onerror = () => {
      alert('Failed to load image. Please check the URL and try again.');
    };

    imgElement.src = imageUrl.value;
  };

  const sharpenImage = () => {
    const originalImage = canvas.value.getObjects('image').find((img) => img.selectable === false);
    if (!originalImage) {
      alert('Please load an image first');
      return;
    }

    const sharpenKernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];
    const filteredCanvas = convolutionFilter(originalImage, sharpenKernel, 1);
    const newImage = new fabric.Image(filteredCanvas, {
      scaleX: originalImage.scaleX,
      scaleY: originalImage.scaleY,
      left: originalImage.left,
      top: originalImage.top,
      originX: 'center',
      originY: 'center',
      selectable: false,
      angle: rotationAngle.value,
    });

    canvas.value.remove(originalImage);
    canvas.value.add(newImage);

    if (edgeImage.value) {
      canvas.value.remove(edgeImage.value);
      const edgeCanvas = applySobelFilter(newImage);
      const newEdgeImg = new fabric.Image(edgeCanvas, {
        left: newImage.left,
        top: newImage.top + newImage.height * newImage.scaleY + 20,
        scaleX: newImage.scaleX,
        scaleY: newImage.scaleY,
        originX: 'center',
        originY: 'center',
        selectable: false,
        angle: rotationAngle.value,
      });
      canvas.value.add(newEdgeImg);
      edgeImage.value = newEdgeImg;
      adjustCanvasHeight(newImage, newEdgeImg);
    }

    canvas.value.renderAll();
  };

  const smoothImage = () => {
    const originalImage = canvas.value.getObjects('image').find((img) => img.selectable === false);
    if (!originalImage) {
      alert('Please load an image first');
      return;
    }

    const smoothKernel = [1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9];
    const filteredCanvas = convolutionFilter(originalImage, smoothKernel, 1);
    const newImage = new fabric.Image(filteredCanvas, {
      scaleX: originalImage.scaleX,
      scaleY: originalImage.scaleY,
      left: originalImage.left,
      top: originalImage.top,
      originX: 'center',
      originY: 'center',
      selectable: false,
      angle: rotationAngle.value,
    });

    canvas.value.remove(originalImage);
    canvas.value.add(newImage);

    if (edgeImage.value) {
      canvas.value.remove(edgeImage.value);
      const edgeCanvas = applySobelFilter(newImage);
      const newEdgeImg = new fabric.Image(edgeCanvas, {
        left: newImage.left,
        top: newImage.top + newImage.height * newImage.scaleY + 20,
        scaleX: newImage.scaleX,
        scaleY: newImage.scaleY,
        originX: 'center',
        originY: 'center',
        selectable: false,
        angle: rotationAngle.value,
      });
      canvas.value.add(newEdgeImg);
      edgeImage.value = newEdgeImg;
      adjustCanvasHeight(newImage, newEdgeImg);
    }

    canvas.value.renderAll();
  };

  const rotateImage = () => {
    const originalImage = canvas.value.getObjects('image').find((img) => img.selectable === false);
    if (!originalImage) {
      alert('Please load an image first');
      return;
    }

    rotationAngle.value = (rotationAngle.value + 90) % 360;
    originalImage.set({ angle: rotationAngle.value });

    if (edgeImage.value) {
      edgeImage.value.set({
        angle: rotationAngle.value,
        left: originalImage.left,
        top: originalImage.top + originalImage.height * originalImage.scaleY + 20,
      });
      adjustCanvasHeight(originalImage, edgeImage.value);
    }

    const is90or270 = rotationAngle.value === 90 || rotationAngle.value === 270;
    const canvasWidth = is90or270 ? 800 : 800;
    let canvasHeight = originalCanvasHeight;
    if (edgeImage.value) {
      canvasHeight = Math.max(
        originalCanvasHeight,
        originalImage.top +
          originalImage.height * originalImage.scaleY + 20 +
          edgeImage.value.height * edgeImage.value.scaleY + 20
      );
    }
    canvas.value.setDimensions({ width: canvasWidth, height: canvasHeight });

    canvas.value.renderAll();
  };

  const adjustCanvasHeight = (originalImage, edgeImg) => {
    const requiredHeight =
      originalImage.top +
      originalImage.height * originalImage.scaleY +
      20 +
      edgeImg.height * edgeImg.scaleY +
      20;
    const newHeight = Math.max(originalCanvasHeight, requiredHeight);
    canvas.value.setDimensions({ width: 800, height: newHeight });
  };

  const applyEdgeDetection = () => {
    const originalImage = canvas.value.getObjects('image').find((img) => img.selectable === false);
    if (!originalImage) {
      alert('Please load an image first');
      return;
    }

    if (edgeImage.value) {
      canvas.value.remove(edgeImage.value);
      edgeImage.value = null;
      canvas.value.setDimensions({ width: 800, height: originalCanvasHeight });
    } else {
      const edgeCanvas = applySobelFilter(originalImage);
      const edgeImg = new fabric.Image(edgeCanvas, {
        left: originalImage.left,
        top: originalImage.top + originalImage.height * originalImage.scaleY + 20,
        scaleX: originalImage.scaleX,
        scaleY: originalImage.scaleY,
        originX: 'center',
        originY: 'center',
        selectable: false,
        angle: rotationAngle.value,
      });

      canvas.value.add(edgeImg);
      edgeImage.value = edgeImg;
      adjustCanvasHeight(originalImage, edgeImg);
    }

    canvas.value.renderAll();
  };

  const addText = () => {
    const textContent = selectedDisease.value || 'Double-click to edit';
    const text = new fabric.IText(textContent, {
      left: 100,
      top: 100,
      fontFamily: 'Arial',
      fontSize: 16,
      fill: '#ff0000',
      backgroundColor: 'rgba(255,255,255,0.7)',
      padding: 5,
      hasControls: true,
    });
    canvas.value.add(text);
    canvas.value.setActiveObject(text);
    text.enterEditing();
    selectedDisease.value = '';
    isAddingAsterisk.value = false;
    canvas.value.isDrawingMode = false;
    canvas.value.defaultCursor = canvas.value.getZoom() !== 1 ? 'move' : 'default';
    measurementText.value = '';
    canvas.value.renderAll();
  };

  const addRectangle = () => {
    const rect = new fabric.Rect({
      left: 150,
      top: 150,
      width: 100,
      height: 60,
      fill: 'rgba(255,0,0,0.2)',
      stroke: '#ff0000',
      strokeWidth: 2,
      hasControls: true,
    });
    canvas.value.add(rect);
    isAddingAsterisk.value = false;
    canvas.value.isDrawingMode = false;
    canvas.value.defaultCursor = canvas.value.getZoom() !== 1 ? 'move' : 'default';
    measurementText.value = '';
    canvas.value.renderAll();
  };

  const addCircle = () => {
    const circle = new fabric.Circle({
      left: 150,
      top: 150,
      radius: 50,
      fill: 'rgba(0,0,255,0.2)',
      stroke: '#0000ff',
      strokeWidth: 2,
      hasControls: true,
    });
    canvas.value.add(circle);
    isAddingAsterisk.value = false;
    canvas.value.isDrawingMode = false;
    canvas.value.defaultCursor = canvas.value.getZoom() !== 1 ? 'move' : 'default';
    measurementText.value = '';
    canvas.value.renderAll();
  };

  const addArrow = () => {
    const arrow = new fabric.Line([50, 50, 150, 150], {
      stroke: '#00ff00',
      strokeWidth: 3,
      fill: '#00ff00',
      strokeDashArray: [0, 0],
      pointer: true,
      hasControls: true,
      hasBorders: true,
      lockScalingX: true,
      lockScalingY: true,
      lockRotation: true,
    });
    canvas.value.add(arrow);
    isAddingAsterisk.value = false;
    canvas.value.isDrawingMode = false;
    canvas.value.defaultCursor = canvas.value.getZoom() !== 1 ? 'move' : 'default';
    measurementText.value = '';
    canvas.value.renderAll();
  };

  const addAsterisk = () => {
    if (!canvas.value.getObjects('image')[0]) {
      alert('Please load an image first');
      return;
    }
    isAddingAsterisk.value = true;
    canvas.value.isDrawingMode = false;
    showHighlightControls.value = false;
    isHighlighting.value = false;
    isDrawingPolygon.value = false;
    polygonPoints.value = [];
    tempLines.value.forEach((line) => canvas.value.remove(line));
    tempPoints.value.forEach((point) => canvas.value.remove(point));
    tempLines.value = [];
    tempPoints.value = [];
    isMeasuringAngle.value = false;
    anglePoints.value = [];
    angleLines.value.forEach((line) => canvas.value.remove(line));
    angleLines.value = [];
    isMeasuring.value = false;
    canvas.value.defaultCursor = 'crosshair';
    measurementText.value = 'Click to place asterisk';
    canvas.value.renderAll();
  };

  const createAsterisk = (x, y) => {
    const size = 10;
    const lines = [
      new fabric.Line([x - size, y, x + size, y], {
        stroke: '#ff0000',
        strokeWidth: 2,
        selectable: false,
      }),
      new fabric.Line([x, y - size, x, y + size], {
        stroke: '#ff0000',
        strokeWidth: 2,
        selectable: false,
      }),
      new fabric.Line([x - size * 0.707, y - size * 0.707, x + size * 0.707, y + size * 0.707], {
        stroke: '#ff0000',
        strokeWidth: 2,
        selectable: false,
      }),
      new fabric.Line([x - size * 0.707, y + size * 0.707, x + size * 0.707, y - size * 0.707], {
        stroke: '#ff0000',
        strokeWidth: 2,
        selectable: false,
      }),
    ];
    const asterisk = new fabric.Group(lines, {
      left: x,
      top: y,
      originX: 'center',
      originY: 'center',
      hasControls: true,
      selectable: true,
    });
    canvas.value.add(asterisk);
    canvas.value.renderAll();
  };

  const toggleFreeDrawing = () => {
    canvas.value.isDrawingMode = !canvas.value.isDrawingMode;
    if (canvas.value.isDrawingMode) {
      if (!canvas.value.freeDrawingBrush) {
        canvas.value.freeDrawingBrush = new fabric.PencilBrush(canvas.value);
      }
      canvas.value.freeDrawingBrush.color = '#ff0000';
      canvas.value.freeDrawingBrush.width = 3;
      isAddingAsterisk.value = false;
      isDrawingPolygon.value = false;
      polygonPoints.value = [];
      tempLines.value.forEach((line) => canvas.value.remove(line));
      tempPoints.value.forEach((point) => canvas.value.remove(point));
      tempLines.value = [];
      tempPoints.value = [];
      isMeasuringAngle.value = false;
      anglePoints.value = [];
      angleLines.value.forEach((line) => canvas.value.remove(line));
      angleLines.value = [];
      isMeasuring.value = false;
      showHighlightControls.value = false;
      isHighlighting.value = false;
      canvas.value.defaultCursor = 'crosshair';
      measurementText.value = 'Click and drag to draw';
    } else {
      showHighlightControls.value = false;
      canvas.value.defaultCursor = canvas.value.getZoom() !== 1 ? 'move' : 'default';
      measurementText.value = '';
    }
    canvas.value.renderAll();
  };

  const startPolygonDrawing = () => {
    if (!canvas.value.getObjects('image')[0]) {
      alert('Please load an image first');
      return;
    }
    isDrawingPolygon.value = true;
    polygonPoints.value = [];
    tempLines.value = [];
    tempPoints.value = [];
    isAddingAsterisk.value = false;
    canvas.value.isDrawingMode = false;
    showHighlightControls.value = false;
    isHighlighting.value = false;
    isMeasuringAngle.value = false;
    anglePoints.value = [];
    angleLines.value.forEach((line) => canvas.value.remove(line));
    angleLines.value = [];
    isMeasuring.value = false;
    canvas.value.defaultCursor = 'crosshair';
    measurementText.value = 'Click to add first vertex';
    canvas.value.renderAll();
  };

  const completePolygon = () => {
    if (polygonPoints.value.length < 3) {
      alert('A polygon requires at least 3 points');
      return;
    }

    tempLines.value.forEach((line) => canvas.value.remove(line));
    tempPoints.value.forEach((point) => canvas.value.remove(point));
    tempLines.value = [];
    tempPoints.value = [];

    const polygon = new fabric.Polygon(polygonPoints.value, {
      fill: 'rgba(255,165,0,0.2)',
      stroke: '#ffa500',
      strokeWidth: 2,
      hasControls: true,
      selectable: true,
    });
    canvas.value.add(polygon);

    isDrawingPolygon.value = false;
    polygonPoints.value = [];
    measurementText.value = '';
    canvas.value.defaultCursor = canvas.value.getZoom() !== 1 ? 'move' : 'default';
    canvas.value.renderAll();
  };

  const startAngleMeasurement = () => {
    if (!canvas.value.getObjects('image')[0]) {
      alert('Please load an image first');
      return;
    }
    isMeasuringAngle.value = true;
    anglePoints.value = [];
    angleLines.value.forEach((line) => canvas.value.remove(line));
    angleLines.value = [];
    isAddingAsterisk.value = false;
    canvas.value.isDrawingMode = false;
    showHighlightControls.value = false;
    isHighlighting.value = false;
    isDrawingPolygon.value = false;
    polygonPoints.value = [];
    tempLines.value.forEach((line) => canvas.value.remove(line));
    tempPoints.value.forEach((point) => canvas.value.remove(point));
    tempLines.value = [];
    tempPoints.value = [];
    isMeasuring.value = false;
    canvas.value.defaultCursor = 'crosshair';
    measurementText.value = 'Click to select first point';
    canvas.value.renderAll();
  };

  const calculateAngle = (p1, p2, p3) => {
    const vector1 = { x: p2.x - p1.x, y: p2.y - p1.y };
    const vector2 = { x: p3.x - p2.x, y: p3.y - p2.y };
    const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y;
    const mag1 = Math.sqrt(vector1.x * vector1.x + vector1.y * vector1.y);
    const mag2 = Math.sqrt(vector2.x * vector2.x + vector2.y * vector2.y);
    const cosTheta = dotProduct / (mag1 * mag2);
    const angleRad = Math.acos(Math.max(-1, Math.min(1, cosTheta)));
    const angleDeg = (angleRad * 180) / Math.PI;
    return angleDeg.toFixed(2);
  };

  const completeAngleMeasurement = () => {
    if (anglePoints.value.length === 3) {
      const angle = calculateAngle(
        anglePoints.value[0],
        anglePoints.value[1],
        anglePoints.value[2]
      );
      measurementText.value = `Angle: ${angle}°`;
      angleLines.value.forEach((line) => line.set({ selectable: false }));
    }

    isMeasuringAngle.value = false;
    anglePoints.value = [];
    canvas.value.defaultCursor = canvas.value.getZoom() !== 1 ? 'move' : 'default';
    canvas.value.renderAll();
  };

  const startHighlighting = () => {
    if (!canvas.value.getObjects('image')[0]) {
      alert('Please load an image first');
      return;
    }
    isHighlighting.value = true;
    showHighlightControls.value = true;
    canvas.value.isDrawingMode = true;
    if (!canvas.value.freeDrawingBrush) {
      canvas.value.freeDrawingBrush = new fabric.PencilBrush(canvas.value);
    }
    canvas.value.freeDrawingBrush.color = hexToRgba(highlightColor.value, 0.3);
    canvas.value.freeDrawingBrush.width = highlightThickness.value;
    isAddingAsterisk.value = false;
    isDrawingPolygon.value = false;
    polygonPoints.value = [];
    tempLines.value.forEach((line) => canvas.value.remove(line));
    tempPoints.value.forEach((point) => canvas.value.remove(point));
    tempLines.value = [];
    tempPoints.value = [];
    isMeasuringAngle.value = false;
    anglePoints.value = [];
    angleLines.value.forEach((line) => canvas.value.remove(line));
    angleLines.value = [];
    isMeasuring.value = false;
    canvas.value.defaultCursor = 'crosshair';
    measurementText.value = 'Click and drag to highlight';
    canvas.value.renderAll();
  };

  const updateHighlightBrush = () => {
    if (isHighlighting.value && canvas.value.freeDrawingBrush) {
      canvas.value.freeDrawingBrush.color = hexToRgba(highlightColor.value, 0.3);
      canvas.value.freeDrawingBrush.width = highlightThickness.value;
    }
  };

  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const toggleBrightnessSlider = () => {
    if (!canvas.value.getObjects('image')[0]) {
      alert('Please load an image first');
      return;
    }
    showBrightnessSlider.value = !showBrightnessSlider.value;
    if (showBrightnessSlider.value) showContrastSlider.value = false;
    isAddingAsterisk.value = false;
    canvas.value.isDrawingMode = false;
    showHighlightControls.value = false;
    isHighlighting.value = false;
    isDrawingPolygon.value = false;
    polygonPoints.value = [];
    tempLines.value.forEach((line) => canvas.value.remove(line));
    tempPoints.value.forEach((point) => canvas.value.remove(point));
    tempLines.value = [];
    tempPoints.value = [];
    isMeasuringAngle.value = false;
    anglePoints.value = [];
    angleLines.value.forEach((line) => canvas.value.remove(line));
    angleLines.value = [];
    isMeasuring.value = false;
    canvas.value.defaultCursor = canvas.value.getZoom() !== 1 ? 'move' : 'default';
    measurementText.value = '';
    updateFilters();
    canvas.value.renderAll();
  };

  const toggleContrastSlider = () => {
    if (!canvas.value.getObjects('image')[0]) {
      alert('Please load an image first');
      return;
    }
    showContrastSlider.value = !showContrastSlider.value;
    if (showContrastSlider.value) showBrightnessSlider.value = false;
    isAddingAsterisk.value = false;
    canvas.value.isDrawingMode = false;
    showHighlightControls.value = false;
    isHighlighting.value = false;
    isDrawingPolygon.value = false;
    polygonPoints.value = [];
    tempLines.value.forEach((line) => canvas.value.remove(line));
    tempPoints.value.forEach((point) => canvas.value.remove(point));
    tempLines.value = [];
    tempPoints.value = [];
    isMeasuringAngle.value = false;
    anglePoints.value = [];
    angleLines.value = [];
    isMeasuring.value = false;
    canvas.value.defaultCursor = canvas.value.getZoom() !== 1 ? 'move' : 'default';
    measurementText.value = '';
    updateFilters();
    canvas.value.renderAll();
  };

  const updateFilters = () => {
    const brightness = `brightness(${1 + brightnessLevel.value})`;
    const contrast = `contrast(${1 + contrastLevel.value})`;
    canvasContainer.value.style.filter = `${brightness} ${contrast}`;
  };

  const startMeasuring = () => {
    if (!canvas.value.getObjects('image')[0]) {
      alert('Please load an image first');
      return;
    }
    isMeasuring.value = true;
    isAddingAsterisk.value = false;
    canvas.value.isDrawingMode = false;
    showHighlightControls.value = false;
    isHighlighting.value = false;
    isDrawingPolygon.value = false;
    polygonPoints.value = [];
    tempLines.value.forEach((line) => canvas.value.remove(line));
    tempPoints.value.forEach((point) => canvas.value.remove(point));
    tempLines.value = [];
    tempPoints.value = [];
    isMeasuringAngle.value = false;
    anglePoints.value = [];
    angleLines.value.forEach((line) => canvas.value.remove(line));
    angleLines.value = [];
    measurementText.value = 'Click and drag to measure';
    canvas.value.defaultCursor = 'crosshair';
    canvas.value.renderAll();
  };

  const endMeasuring = () => {
    isMeasuring.value = false;
    measurementText.value = '';
    canvas.value.defaultCursor = canvas.value.getZoom() !== 1 ? 'move' : 'default';
  };

  const calculateDistance = (p1, p2) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const pixels = Math.sqrt(dx * dx + dy * dy);
    const mm = (pixels / scaleFactor.value).toFixed(2);
    return { pixels, mm };
  };

  const zoomIn = () => {
    const zoomPoint =
      lastClickPos.value.x !== null && lastClickPos.value.y !== null
        ? lastClickPos.value
        : { x: canvas.value.width / 2, y: canvas.value.height / 2 };
    const currentZoom = canvas.value.getZoom();
    const newZoom = currentZoom * 1.2;
    adjustZoom(newZoom, zoomPoint);
  };

  const zoomOut = () => {
    const zoomPoint =
      lastClickPos.value.x !== null && lastClickPos.value.y !== null
        ? lastClickPos.value
        : { x: canvas.value.width / 2, y: canvas.value.height / 2 };
    const currentZoom = canvas.value.getZoom();
    const newZoom = currentZoom * 0.8;
    adjustZoom(newZoom, zoomPoint);
  };

  const adjustZoom = (newZoom, zoomPoint) => {
    const minZoom = 0.1;
    const maxZoom = 10;
    newZoom = Math.max(minZoom, Math.min(maxZoom, newZoom));
    const vpt = canvas.value.viewportTransform.slice();
    const currentZoom = canvas.value.getZoom();
    const scale = newZoom / currentZoom;
    vpt[4] += zoomPoint.x * (1 - scale);
    vpt[5] += zoomPoint.y * (1 - scale);
    vpt[0] = newZoom;
    vpt[3] = newZoom;
    canvas.value.setViewportTransform(vpt);
    canvas.value.setZoom(newZoom);
    canvas.value.defaultCursor = newZoom !== 1 ? 'move' : 'default';
    canvas.value.renderAll();
  };

  const resetZoom = () => {
    canvas.value.setZoom(1);
    canvas.value.setViewportTransform([1, 0, 0, 1, 0, 0]);
    isAddingAsterisk.value = false;
    canvas.value.isDrawingMode = false;
    showHighlightControls.value = false;
    isHighlighting.value = false;
    isDrawingPolygon.value = false;
    polygonPoints.value = [];
    tempLines.value.forEach((line) => canvas.value.remove(line));
    tempPoints.value.forEach((point) => canvas.value.remove(line));
    tempLines.value = [];
    tempPoints.value = [];
    isMeasuringAngle.value = false;
    anglePoints.value = [];
    angleLines.value.forEach((line) => canvas.value.remove(line));
    angleLines.value = [];
    isMeasuring.value = false;
    canvas.value.defaultCursor = 'default';
    measurementText.value = '';
    canvas.value.renderAll();
  };

  const handleMouseDown = (options) => {
    if (isAddingAsterisk.value) {
      const pointer = canvas.value.getPointer(options.e);
      createAsterisk(pointer.x, pointer.y);
      isAddingAsterisk.value = false;
      measurementText.value = '';
      canvas.value.defaultCursor = canvas.value.getZoom() !== 1 ? 'move' : 'default';
      canvas.value.renderAll();
      return;
    }

    if (isDrawingPolygon.value) {
      const pointer = canvas.value.getPointer(options.e);
      polygonPoints.value.push({ x: pointer.x, y: pointer.y });

      const point = new fabric.Circle({
        left: pointer.x,
        top: pointer.y,
        radius: 3,
        fill: '#ffa500',
        stroke: '#000000',
        strokeWidth: 1,
        originX: 'center',
        originY: 'center',
        selectable: false,
      });
      canvas.value.add(point);
      tempPoints.value.push(point);

      if (polygonPoints.value.length > 1) {
        const prevPoint = polygonPoints.value[polygonPoints.value.length - 2];
        const line = new fabric.Line([prevPoint.x, prevPoint.y, pointer.x, pointer.y], {
          stroke: '#ffa500',
          strokeWidth: 2,
          selectable: false,
        });
        canvas.value.add(line);
        tempLines.value.push(line);
      }

      measurementText.value =
        polygonPoints.value.length === 1
          ? 'Click to add second vertex'
          : 'Click to add next vertex, double-click to finish';

      canvas.value.renderAll();
      return;
    }

    if (isMeasuringAngle.value) {
      const pointer = canvas.value.getPointer(options.e);
      anglePoints.value.push({ x: pointer.x, y: pointer.y });

      if (anglePoints.value.length === 1) {
        measurementText.value = 'Click to select second point';
      } else if (anglePoints.value.length === 2) {
        const line = new fabric.Line(
          [
            anglePoints.value[0].x,
            anglePoints.value[0].y,
            anglePoints.value[1].x,
            anglePoints.value[1].y,
          ],
          {
            stroke: '#ff00ff',
            strokeWidth: 2,
            selectable: false,
          }
        );
        canvas.value.add(line);
        angleLines.value.push(line);
        measurementText.value = 'Click to select third point';
      } else if (anglePoints.value.length === 3) {
        const line = new fabric.Line(
          [
            anglePoints.value[1].x,
            anglePoints.value[1].y,
            anglePoints.value[2].x,
            anglePoints.value[2].y,
          ],
          {
            stroke: '#ff00ff',
            strokeWidth: 2,
            selectable: false,
          }
        );
        canvas.value.add(line);
        angleLines.value.push(line);
        completeAngleMeasurement();
      }
      canvas.value.renderAll();
      return;
    }

    if (isMeasuring.value) {
      const pointer = canvas.value.getPointer(options.e);
      startPoint.value = pointer;
      currentMeasurement.value = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
        stroke: '#ff00ff',
        strokeWidth: 2,
        selectable: false,
      });
      canvas.value.add(currentMeasurement.value);
      canvas.value.renderAll();
      return;
    }

    if (canvas.value.getZoom() !== 1 && !canvas.value.isDrawingMode) {
      isDragging.value = true;
      const pointer = canvas.value.getPointer(options.e, true);
      lastDragPos.value = { x: pointer.x, y: pointer.y };
    }
  };

  const handleMouseMove = (options) => {
    if (isDrawingPolygon.value && polygonPoints.value.length > 0) {
      const pointer = canvas.value.getPointer(options.e);
      if (tempLines.value.length > 0) {
        const lastLine = tempLines.value[tempLines.value.length - 1];
        lastLine.set({ x2: pointer.x, y2: pointer.y });
        canvas.value.renderAll();
      } else if (polygonPoints.value.length === 1) {
        if (tempLines.value.length > 0) {
          canvas.value.remove(tempLines.value[0]);
          tempLines.value = [];
        }
        const firstPoint = polygonPoints.value[0];
        const line = new fabric.Line([firstPoint.x, firstPoint.y, pointer.x, pointer.y], {
          stroke: '#ffa500',
          strokeWidth: 2,
          selectable: false,
        });
        canvas.value.add(line);
        tempLines.value.push(line);
        canvas.value.renderAll();
      }
    }

    if (isMeasuring.value && currentMeasurement.value && startPoint.value) {
      const pointer = canvas.value.getPointer(options.e);
      currentMeasurement.value.set({ x2: pointer.x, y2: pointer.y });
      const distance = calculateDistance(startPoint.value, pointer);
      measurementText.value = `${distance.mm} mm (${distance.pixels.toFixed(0)} px)`;
      canvas.value.renderAll();
    }

    if (isDragging.value) {
      const pointer = canvas.value.getPointer(options.e, true);
      const deltaX = pointer.x - lastDragPos.value.x;
      const deltaY = pointer.y - lastDragPos.value.y;
      const vpt = canvas.value.viewportTransform;
      vpt[4] += deltaX;
      vpt[5] += deltaY;
      canvas.value.setViewportTransform(vpt);
      lastDragPos.value = { x: pointer.x, y: pointer.y };
      canvas.value.renderAll();
    }
  };

  const handleMouseUp = () => {
    if (isHighlighting.value) {
      canvas.value.isDrawingMode = false;
      isHighlighting.value = false;
      showHighlightControls.value = false;
      measurementText.value = '';
      canvas.value.defaultCursor = canvas.value.getZoom() !== 1 ? 'move' : 'default';
      canvas.value.renderAll();
    }

    if (isMeasuring.value && currentMeasurement.value) {
      currentMeasurement.value.set({ selectable: false });
      currentMeasurement.value = null;
      startPoint.value = null;
      endMeasuring();
    }

    if (isDragging.value) {
      isDragging.value = false;
      canvas.value.defaultCursor = canvas.value.getZoom() !== 1 ? 'move' : 'default';
    }
  };

  const handleDoubleClick = () => {
    if (isDrawingPolygon.value) {
      completePolygon();
    }
  };

  const saveImage = () => {
    if (!canvas.value || canvas.value.isEmpty()) {
      alert('Canvas is empty');
      return;
    }

    const link = document.createElement('a');
    link.download = 'fundus-annotation-' + new Date().toISOString().slice(0, 10) + '.png';
    link.href = canvas.value.toDataURL({
      format: 'png',
      quality: 1,
    });
    link.click();
  };

  const uploadImage = async () => {
    if (!canvas.value || canvas.value.isEmpty()) {
      alert('Canvas is empty');
      return;
    }

    if (!selectedDisease.value) {
      alert('Please select a disease type');
      return;
    }

    isUploading.value = true;
    uploadError.value = '';

    try {
      const dataUrl = canvas.value.toDataURL({
        format: 'png',
        quality: 1,
      });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `edited-image-${new Date().toISOString()}.png`, {
        type: 'image/png',
      });
      const diseaseType = diseaseToTypeMap[selectedDisease.value] || 'OTHER';
      const response = await EditedImageService.uploadEditedImage(file, diseaseType);
      measurementText.value = 'Image uploaded successfully!';
      selectedDisease.value = ''; // Reset dropdown
    } catch (err) {
      uploadError.value = err.response?.data?.detail || 'Failed to upload image';
      measurementText.value = uploadError.value;
    } finally {
      isUploading.value = false;
    }
  };

  const clearCanvas = () => {
    if (confirm('Are you sure you want to clear the canvas?')) {
      canvas.value.clear();
      brightnessLevel.value = 0;
      contrastLevel.value = 0;
      canvasContainer.value.style.filter = 'brightness(1) contrast(1)';
      showBrightnessSlider.value = false;
      showContrastSlider.value = false;
      isDrawingPolygon.value = false;
      polygonPoints.value = [];
      tempLines.value = [];
      tempPoints.value = [];
      isMeasuringAngle.value = false;
      anglePoints.value = [];
      angleLines.value = [];
      isHighlighting.value = false;
      showHighlightControls.value = false;
      highlightColor.value = '#ffff00';
      highlightThickness.value = 10;
      isAddingAsterisk.value = false;
      canvas.value.isDrawingMode = false;
      edgeImage.value = null;
      rotationAngle.value = 0;
      measurementText.value = '';
      selectedDisease.value = '';
      canvas.value.setDimensions({ width: 800, height: originalCanvasHeight });
      canvas.value.defaultCursor = 'default';
      canvas.value.renderAll();
    }
  };

  return {
    imageUrl,
    canvasContainer,
    selectedDisease,
    diseases,
    measurementText,
    loadImage,
    addText,
    addRectangle,
    addCircle,
    addArrow,
    addAsterisk,
    toggleFreeDrawing,
    startPolygonDrawing,
    startAngleMeasurement,
    startHighlighting,
    showHighlightControls,
    highlightColor,
    highlightThickness,
    updateHighlightBrush,
    toggleBrightnessSlider,
    toggleContrastSlider,
    updateFilters,
    brightnessLevel,
    showBrightnessSlider,
    contrastLevel,
    showContrastSlider,
    startMeasuring,
    endMeasuring,
    zoomIn,
    zoomOut,
    resetZoom,
    rotateImage,
    sharpenImage,
    smoothImage,
    applyEdgeDetection,
    saveImage,
    uploadImage,
    clearCanvas,
    isUploading,
    uploadError,
  };
},
};
</script>

<style scoped>
.canvas-editor {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  height: 100vh;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 4px;
}

.input-group {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

input[type='text'] {
  padding: 0.5rem;
  min-width: 300px;
}

select {
  padding: 0.5rem;
  min-width: 150px;
}

.tool-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

button {
  padding: 0.5rem 1rem;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
}

button:hover {
  background: #45a049;
}

button:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.highlight-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  padding: 0.5rem;
  background: #e0e0e0;
  border-radius: 4px;
}

.highlight-controls label {
  font-size: 0.9rem;
  color: #333;
}

.highlight-controls input[type='color'] {
  width: 40px;
  height: 30px;
  padding: 0;
  border: none;
  cursor: pointer;
}

.highlight-controls input[type='range'] {
  width: 100px;
  height: 20px;
  appearance: none;
  background: #ddd;
  border-radius: 4px;
  outline: none;
  cursor: pointer;
}

.highlight-controls input[type='range']::-webkit-slider-thumb {
  appearance: none;
  width: 15px;
  height: 15px;
  background: #4caf50;
  border-radius: 50%;
  cursor: pointer;
}

.highlight-controls input[type='range']::-moz-range-thumb {
  width: 15px;
  height: 15px;
  background: #4caf50;
  border-radius: 50%;
  cursor: pointer;
}

.canvas-container {
  position: relative;
  flex-grow: 1;
  border: 1px solid #ddd;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  overflow: auto;
}

#fundus-canvas {
  display: block;
}

.measurement-display {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(255, 255, 255, 0.8);
  padding: 5px 10px;
  border-radius: 4px;
  font-family: monospace;
}

.brightness-slider {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%) rotate(270deg);
  width: 150px;
  height: 20px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  appearance: none;
  outline: none;
  cursor: pointer;
}

.brightness-slider::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  background: #4caf50;
  border-radius: 50%;
  cursor: pointer;
}

.brightness-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #4caf50;
  border-radius: 50%;
  cursor: pointer;
}

.contrast-slider {
  position: absolute;
  top: 50%;
  left: 10px;
  transform: translateY(-50%) rotate(270deg);
  width: 150px;
  height: 20px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  appearance: none;
  outline: none;
  cursor: pointer;
}

.contrast-slider::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  background: #4caf50;
  border-radius: 50%;
  cursor: pointer;
}

.contrast-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #4caf50;
  border-radius: 50%;
  cursor: pointer;
}
</style>
