<template>
  <div class="canvas-editor">
    <div class="editor-header">
      <div class="header-content">
        <div class="input-group">
          <input
            type="text"
            v-model="imageUrl"
            placeholder="Enter image URL"
            @keyup.enter="loadImage"
          />
          <button @click="loadImage" class="primary-btn">
            <i class="fas fa-image"></i> Load Image
          </button>
          <select v-model="selectedDisease" class="disease-select">
            <option value="" disabled>Select Disease</option>
            <option v-for="disease in diseases" :value="disease" :key="disease">{{ disease }}</option>
          </select>
        </div>
        <div class="action-buttons">
          <button @click="uploadImage" :disabled="isUploading" class="action-btn upload-btn">
            <i class="fas fa-upload"></i>
            {{ isUploading ? 'Uploading...' : 'Upload Image' }}
          </button>
          <button @click="clearCanvas" class="action-btn clear-btn">
            <i class="fas fa-trash-alt"></i> Clear Canvas
          </button>
        </div>
      </div>
    </div>

    <div class="editor-main">
      <div class="controls">
        <div class="tool-sections">
          <!-- Drawing Tools Section -->
          <div class="tool-section">
            <h3 class="section-title">
              <i class="fas fa-pencil-alt"></i> Drawing Tools
            </h3>
            <div class="tool-buttons">
              <button @click="addText" class="tool-btn">
                <i class="fas fa-font"></i> Add Text
              </button>
              <!-- <button @click="addRectangle" class="tool-btn">
                <i class="fas fa-square"></i> Rectangle
              </button> -->
              <button @click="addCircle" class="tool-btn">
                <i class="fas fa-circle"></i> Circle
              </button>
              <button @click="addArrow" class="tool-btn">
                <i class="fas fa-arrow-right"></i> Arrow
              </button>
              <!-- <button @click="startPolygonDrawing" class="tool-btn">
                <i class="fas fa-draw-polygon"></i> Polygon
              </button> -->
              <button @click="toggleFreeDrawing" class="tool-btn">
                <i class="fas fa-pencil-alt"></i> Free Draw
              </button>
              <!-- <button @click="addAsterisk" class="tool-btn">
                <i class="fas fa-asterisk"></i> Asterisk
              </button> -->
            </div>
          </div>

          <!-- Measurement Tools Section -->
          <div class="tool-section">
            <h3 class="section-title">
              <i class="fas fa-ruler-combined"></i> Measurement Tools
            </h3>
            <div class="tool-buttons">
              <button @click="startMeasuring" class="tool-btn">
                <i class="fas fa-ruler"></i> Measure
              </button>
              <button @click="startAngleMeasurement" class="tool-btn">
                <i class="fas fa-angle-right"></i> Measure Angle
              </button>
              <button @click="startHighlighting" class="tool-btn">
                <i class="fas fa-highlighter"></i> Highlight
              </button>
            </div>
          </div>

          <!-- Image Adjustment Tools Section -->
          <div class="tool-section">
            <h3 class="section-title">
              <i class="fas fa-sliders-h"></i> Image Adjustments
            </h3>
            <div class="tool-buttons">
              <button @click="toggleBrightnessSlider" class="tool-btn">
                <i class="fas fa-sun"></i> Brightness
              </button>
              <button @click="toggleContrastSlider" class="tool-btn">
                <i class="fas fa-adjust"></i> Contrast
              </button>
              <!-- <button @click="rotateImage" class="tool-btn">
                <i class="fas fa-redo"></i> Rotate
              </button> -->
              <button @click="sharpenImage" class="tool-btn">
                <i class="fas fa-cut"></i> Sharpen
              </button>
              <!-- <button @click="smoothImage" class="tool-btn">
                <i class="fas fa-blur"></i> Smooth
              </button> -->
              <button @click="applyEdgeDetection" class="tool-btn">
                <i class="fas fa-border-all"></i> Edge Detection
              </button>
            </div>
          </div>

          <!-- View Controls Section -->
          <div class="tool-section">
            <h3 class="section-title">
              <i class="fas fa-search"></i> View Controls
            </h3>
            <div class="tool-buttons">
              <button @click="zoomIn" class="tool-btn">
                <i class="fas fa-search-plus"></i> Zoom In
              </button>
              <button @click="zoomOut" class="tool-btn">
                <i class="fas fa-search-minus"></i> Zoom Out
              </button>
              <button @click="resetZoom" class="tool-btn">
                <i class="fas fa-compress-arrows-alt"></i> Reset Zoom
              </button>
            </div>
          </div>
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
  </div>
</template>

<script>
import * as fabric from 'fabric'
import { onMounted, ref } from 'vue' // Removed 'watch' as it's not used
import FileService from '@/services/file.service' // Adjust path to your FileService
import {useRoute} from "vue-router"
import EditedImageService from '@/services/edited_file.service'; // Adjusted path to your service

function convolutionFilter(fabricImageObject, kernel, divisor = 1) {
  const canvasEl = document.createElement('canvas');
  const ctx = canvasEl.getContext('2d');
  // Use unscaled dimensions for the filter canvas
  canvasEl.width = fabricImageObject.width;
  canvasEl.height = fabricImageObject.height;

  // Draw the original image element (could be an <img> or another <canvas>)
  ctx.drawImage(fabricImageObject.getElement(), 0, 0, fabricImageObject.width, fabricImageObject.height);
  const imageData = ctx.getImageData(0, 0, fabricImageObject.width, fabricImageObject.height);
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const tempData = new Uint8ClampedArray(data.length); // Use Uint8ClampedArray for image data

  for (let y = 1; y < height - 1; y++) { // Iterate within bounds to avoid edge issues with kernel
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      let r = 0, g = 0, b = 0;
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
      tempData[idx + 3] = data[idx + 3]; // Preserve alpha
    }
  }
  // Copy edge pixels without filtering or handle them separately if needed
  // For simplicity, this version leaves a 1px unfiltered border.
  // To copy full image, iterate 0 to height and 0 to width, and handle boundary conditions for kernel.
  // Or, copy original data for border pixels.
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
        if (y === 0 || y === height - 1 || x === 0 || x === width - 1) {
            const idx = (y * width + x) * 4;
            tempData[idx] = data[idx];
            tempData[idx+1] = data[idx+1];
            tempData[idx+2] = data[idx+2];
            tempData[idx+3] = data[idx+3];
        }
    }
  }


  const newImageData = new ImageData(tempData, width, height);
  ctx.putImageData(newImageData, 0, 0);
  return canvasEl; // Return the canvas element with the filtered image
}

function applySobelFilter(fabricImageObject) {
  const canvasEl = document.createElement('canvas');
  const ctx = canvasEl.getContext('2d');
  canvasEl.width = fabricImageObject.width;
  canvasEl.height = fabricImageObject.height;

  ctx.drawImage(fabricImageObject.getElement(), 0, 0, fabricImageObject.width, fabricImageObject.height);
  const imageData = ctx.getImageData(0, 0, fabricImageObject.width, fabricImageObject.height);
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const tempData = new Uint8ClampedArray(data.length);

  const kernelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const kernelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      let gx = 0, gy = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const pixelIdx = ((y + ky) * width + (x + kx)) * 4;
          // Convert to grayscale for Sobel
          const gray = (data[pixelIdx] * 0.299 + data[pixelIdx + 1] * 0.587 + data[pixelIdx + 2] * 0.114);
          gx += gray * kernelX[(ky + 1) * 3 + (kx + 1)];
          gy += gray * kernelY[(ky + 1) * 3 + (kx + 1)];
        }
      }
      const magnitude = Math.sqrt(gx * gx + gy * gy);
      tempData[idx] = tempData[idx + 1] = tempData[idx + 2] = Math.min(magnitude, 255);
      tempData[idx + 3] = data[idx + 3]; // Preserve alpha
    }
  }
   for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
        if (y === 0 || y === height - 1 || x === 0 || x === width - 1) {
            const idx = (y * width + x) * 4;
            tempData[idx] = data[idx];
            tempData[idx+1] = data[idx+1];
            tempData[idx+2] = data[idx+2];
            tempData[idx+3] = data[idx+3];
        }
    }
  }

  const newImageData = new ImageData(tempData, width, height);
  ctx.putImageData(newImageData, 0, 0);
  return canvasEl;
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
// const isPanning = ref(false); // Not used
const startPoint = ref(null);
const currentMeasurement = ref(null);
const scaleFactor = ref(1); // Intended for mm calculation, e.g., pixels per mm
const brightnessLevel = ref(0);
const showBrightnessSlider = ref(false);
const contrastLevel = ref(0);
const showContrastSlider = ref(false);
const lastClickPos = ref({ x: null, y: null });
const isDragging = ref(false); // Used for panning
const lastDragPos = ref({ x: 0, y: 0 });
const isDrawingPolygon = ref(false);
const polygonPoints = ref([]);
const tempLines = ref([]);
const tempPoints = ref([]);
const isMeasuringAngle = ref(false);
const anglePoints = ref([]);
const angleLines = ref([]);
const edgeImage = ref(null); // Stores the fabric.Image object for the edge detection result
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
  'Diabetic Retinopathy (DR)': 'Diabetic_Retinopathy',
  'Age-Related Macular Degeneration (AMD)': 'Age_Related_Macular_Degeneration',
  'Glaucoma': 'Glaucoma',
  'Retinal Vein Occlusion (RVO)': 'Retinal_Vein_Occlusion',
  'Retinal Artery Occlusion (RAO)': 'Retinal_Artery_Occlusion',
  'Retinal Detachment (RD)': 'Retinal_Detachment',
  'Hypertensive Retinopathy': 'Hypertensive_Retinopathy',
  'High Myopia': 'High_Myopia',
  'Macular Diseases': 'Macular_Diseases',
};

onMounted(async () => {
      try {
          const response = await FileService.getFile(route.params.id)
          let file = response.data
          imageUrl.value = file.file
          loadImage()
      } catch (err) {
      console.error("Failed to load initial image:", err)
      }
    })

    onMounted(() => {
      canvas.value = new fabric.Canvas('fundus-canvas', {
        backgroundColor: '#f0f0f0',
        width: 800,
        height: originalCanvasHeight,
        preserveObjectStacking: true,
        selection: true, // Allows selecting objects (like text, shapes)
      });

  canvas.value.on('mouse:down', handleMouseDown);
  canvas.value.on('mouse:move', handleMouseMove);
  canvas.value.on('mouse:up', handleMouseUp);
  canvas.value.on('mouse:dblclick', handleDoubleClick);

    // Separate listener for lastClickPos to ensure it uses ignoreZoom=true for consistent zoom point
    canvas.value.on('mouse:down', (options) => {
    const pointer = canvas.value.getPointer(options.e, true); // ignoreZoom = true
    lastClickPos.value = { x: pointer.x, y: pointer.y };
  });

    canvas.value.on('mouse:over', (options) => {
      if (options.target && options.target.type === 'image' && options.target.selectable === false && canvas.value.getZoom() !== 1 && !isDragging.value) {
        canvas.value.defaultCursor = 'move';
      }
  });
    canvas.value.on('mouse:out', (options) => {
      if (!isDragging.value && (
            !isMeasuring.value &&
            !canvas.value.isDrawingMode &&
            !isDrawingPolygon.value &&
            !isMeasuringAngle.value &&
            !isAddingAsterisk.value
        )) {
            if (!options.target || (options.target.type === 'image' && options.target.selectable === false)) {
                 canvas.value.defaultCursor = canvas.value.getZoom() === 1 ? 'default' : 'move';
            } else {
                canvas.value.defaultCursor = 'default'; // Cursor for selectable objects
            }
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
          (originalCanvasHeight / 2 / fabricImg.height) * 0.95 // Position in upper half
        );
        fabricImg.set({
          scaleX: scale,
          scaleY: scale,
          left: canvas.value.width / 2,
          top: originalCanvasHeight / 4, // Center in the top half of the initial canvas
          originX: 'center',
          originY: 'center',
          selectable: false, // This is the main, non-interactive background image
          evented: true, // Allow it to be a target for mouse events (for panning)
          angle: 0,
        });
        canvas.value.clear(); // Clear previous content
        canvas.value.setDimensions({ width: 800, height: originalCanvasHeight }); // Reset canvas size
        canvas.value.add(fabricImg);
        edgeImage.value = null; // Reset edge image
        rotationAngle.value = 0;
        resetZoom(); // Also reset zoom/pan state
        canvas.value.renderAll();
      };
      imgElement.onerror = () => {
        alert('Failed to load image. Please check the URL and try again.');
      };
      imgElement.src = imageUrl.value;
};

  const sharpenImage = () => {
    const mainImageObject = canvas.value.getObjects('image').find((img) => img.selectable === false && img !== edgeImage.value);
    if (!mainImageObject) {
      alert('Please load an image first');
      return;
    }

    const sharpenKernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];
    const filteredCanvasElement = convolutionFilter(mainImageObject, sharpenKernel, 1);
    
    mainImageObject.setElement(filteredCanvasElement, { crossOrigin: 'Anonymous' });
    mainImageObject.setCoords();

    if (edgeImage.value) {
      const currentEdgeImageObject = edgeImage.value;
      // Re-filter the *updated* main image for the edge detection
      const newEdgeCanvasElement = applySobelFilter(mainImageObject);
      currentEdgeImageObject.setElement(newEdgeCanvasElement, { crossOrigin: 'Anonymous' });
      currentEdgeImageObject.setCoords();
      // adjustCanvasHeight might be needed if content bounds change, though filters shouldn't change size
    }
    canvas.value.renderAll();
  };

  const smoothImage = () => {
    const mainImageObject = canvas.value.getObjects('image').find((img) => img.selectable === false && img !== edgeImage.value);
    if (!mainImageObject) {
      alert('Please load an image first');
      return;
    }

    const smoothKernel = [1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9];
    const filteredCanvasElement = convolutionFilter(mainImageObject, smoothKernel, 1);

    mainImageObject.setElement(filteredCanvasElement, { crossOrigin: 'Anonymous' });
    mainImageObject.setCoords();
    
    if (edgeImage.value) {
      const currentEdgeImageObject = edgeImage.value;
      const newEdgeCanvasElement = applySobelFilter(mainImageObject); // Use updated main image
      currentEdgeImageObject.setElement(newEdgeCanvasElement, { crossOrigin: 'Anonymous' });
      currentEdgeImageObject.setCoords();
    }
    canvas.value.renderAll();
  };

  const rotateImage = () => {
  const originalImage = canvas.value.getObjects('image').find((img) => img.selectable === false && img !== edgeImage.value);
    if (!originalImage) {
    alert('Please load an image first');
    return;
    }

  rotationAngle.value = (rotationAngle.value + 90) % 360;
  originalImage.set({ angle: rotationAngle.value }).setCoords();

    if (edgeImage.value) {
      edgeImage.value.set({ angle: rotationAngle.value }).setCoords();
      // Adjust position of edgeImage relative to rotated originalImage
      edgeImage.value.set({
        left: originalImage.left, 
        top: originalImage.top + originalImage.getScaledHeight()/2 + edgeImage.value.getScaledHeight()/2 + 20,
      }).setCoords();
    }
  
  // Adjust canvas size based on the new bounding box of rotated images
  adjustCanvasHeight(originalImage, edgeImage.value); 
  // Recenter content if canvas size changed significantly, or let user pan
  // originalImage.center();
  // if(edgeImage.value) edgeImage.value.center(); // Or position relative to originalImage

  canvas.value.renderAll();
};

  const adjustCanvasHeight = (mainImg, edgeImgObj) => {
    let requiredHeight = originalCanvasHeight;
    if (mainImg) {
        const mainBounds = mainImg.getBoundingRect();
        requiredHeight = Math.max(requiredHeight, mainBounds.top + mainBounds.height + 20);
        if (edgeImgObj) {
            // Ensure edgeImgObj is positioned relative to mainImg before getting its bounds for this calculation
            edgeImgObj.set({
                left: mainImg.left,
                top: mainImg.top + mainImg.getScaledHeight()/2 + edgeImgObj.getScaledHeight()/2 + 20,
            }).setCoords();
            const edgeBounds = edgeImgObj.getBoundingRect();
            requiredHeight = Math.max(requiredHeight, edgeBounds.top + edgeBounds.height + 20);
        }
    }
    canvas.value.setDimensions({ width: canvas.value.width, height: Math.max(originalCanvasHeight, requiredHeight) });
};

  const applyEdgeDetection = () => {
  const mainImageObject = canvas.value.getObjects('image').find((img) => img.selectable === false && img !== edgeImage.value);
    if (!mainImageObject) {
    alert('Please load an image first');
    return;
    }

    if (edgeImage.value) { // If edge image exists, remove it
    canvas.value.remove(edgeImage.value);
    edgeImage.value = null;
    adjustCanvasHeight(mainImageObject, null); 
    } else { // If no edge image, create and add it
    const edgeCanvasElement = applySobelFilter(mainImageObject);
      const newEdgeImg = new fabric.Image(edgeCanvasElement, {
        scaleX: mainImageObject.scaleX,
        scaleY: mainImageObject.scaleY,
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: true, // Allow panning on it
        angle: rotationAngle.value, // Match main image's rotation
    });
    canvas.value.add(newEdgeImg);
    edgeImage.value = newEdgeImg; // Store ref to the fabric.Image object
    // Position newEdgeImg below mainImageObject
    adjustCanvasHeight(mainImageObject, newEdgeImg); // This will also position newEdgeImg
    }
  canvas.value.renderAll();
};

    const addText = () => {
  const textContent = selectedDisease.value || 'Double-click to edit';
      const text = new fabric.IText(textContent, {
        left: canvas.value.viewportTransform[4] + 100 / canvas.value.getZoom(), // Adjust for pan/zoom
        top: canvas.value.viewportTransform[5] + 100 / canvas.value.getZoom(),
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
  // Reset other tool states
  Object.assign(isAddingAsterisk, {value: false}); // and other flags...
  canvas.value.isDrawingMode = false;
  canvas.value.defaultCursor = canvas.value.getZoom() !== 1 ? 'move' : 'default'; // Or 'default' if an object is active
  measurementText.value = '';
  canvas.value.renderAll();
};

    const addRectangle = () => {
      const rect = new fabric.Rect({
        left: canvas.value.viewportTransform[4] + 150 / canvas.value.getZoom(),
        top: canvas.value.viewportTransform[5] + 150 / canvas.value.getZoom(),
        width: 100,
        height: 60,
        fill: 'rgba(255,0,0,0.2)',
        stroke: '#ff0000',
        strokeWidth: 2,
        hasControls: true,
  });
  canvas.value.add(rect);
  // Reset other tool states
  canvas.value.isDrawingMode = false; // etc.
  canvas.value.defaultCursor = 'default'; // Or 'move' if zoomed
  measurementText.value = '';
  canvas.value.renderAll();
};

    const addCircle = () => {
      const circle = new fabric.Circle({
        left: canvas.value.viewportTransform[4] + 150 / canvas.value.getZoom(),
        top: canvas.value.viewportTransform[5] + 150 / canvas.value.getZoom(),
        radius: 50,
        fill: 'rgba(0,0,255,0.2)',
        stroke: '#0000ff',
        strokeWidth: 2,
        hasControls: true,
  });
  canvas.value.add(circle);
  // Reset other tool states
  canvas.value.defaultCursor = 'default';
  measurementText.value = '';
  canvas.value.renderAll();
};

    const addArrow = () => {
      const line = new fabric.Line([0,0, 50,0], { stroke: '#00ff00', strokeWidth: 3 });
      const head = new fabric.Triangle({ 
        width: 10, height: 15, fill: '#00ff00', angle: 90, 
        left: 50, top: 0, originX: 'center', originY: 'center' 
      });
      const arrow = new fabric.Group([line, head], {
        left: canvas.value.viewportTransform[4] + 75 / canvas.value.getZoom(),
        top: canvas.value.viewportTransform[5] + 75 / canvas.value.getZoom(),
        hasControls: true,
        // Lock scaling X/Y, rotation if needed, or add custom controls
      });
  canvas.value.add(arrow);
  // Reset tool states
  canvas.value.defaultCursor = 'default';
  measurementText.value = '';
  canvas.value.renderAll();
};

  const addAsterisk = () => {
    if (!canvas.value.getObjects('image').find(img => img.selectable === false && img !== edgeImage.value)) {
      alert('Please load an image first');
      return;
    }
    // Deactivate other tools
    isDrawingPolygon.value = false; canvas.value.isDrawingMode = false; isMeasuring.value = false; isMeasuringAngle.value = false; isHighlighting.value = false;
    
    isAddingAsterisk.value = true;
    canvas.value.defaultCursor = 'crosshair';
    measurementText.value = 'Click to place asterisk';
    // canvas.value.renderAll(); // Not strictly needed if only cursor changes
  };

  const createAsterisk = (x, y) => { // x, y are canvas coordinates from getPointer
    const size = 10 / canvas.value.getZoom(); // Make asterisk appear same visual size regardless of zoom
    const lines = [
      new fabric.Line([-size, 0, size, 0], { stroke: '#ff0000', strokeWidth: 2 }),
      new fabric.Line([0, -size, 0, size], { stroke: '#ff0000', strokeWidth: 2 }),
      new fabric.Line([-size * 0.707, -size * 0.707, size * 0.707, size * 0.707], { stroke: '#ff0000', strokeWidth: 2 }),
      new fabric.Line([-size * 0.707, size * 0.707, size * 0.707, -size * 0.707], { stroke: '#ff0000', strokeWidth: 2 }),
    ];
    lines.forEach(line => line.set({ selectable: false, evented: false }));

    const asteriskGroup = new fabric.Group(lines, {
      left: x, top: y, originX: 'center', originY: 'center',
      hasControls: true, selectable: true,
    });
    canvas.value.add(asteriskGroup);
    isAddingAsterisk.value = false; // Reset tool
    measurementText.value = '';
    canvas.value.defaultCursor = canvas.value.getZoom() !== 1 ? 'move' : 'default';
    canvas.value.renderAll();
  };

    const toggleFreeDrawing = () => {
      // Deactivate other tools
      isDrawingPolygon.value = false; isAddingAsterisk.value = false; isMeasuring.value = false; isMeasuringAngle.value = false;
      
      canvas.value.isDrawingMode = !canvas.value.isDrawingMode;
      if (canvas.value.isDrawingMode) {
        isHighlighting.value = false; // Ensure highlight is off if pencil is on
        showHighlightControls.value = false;
        if (!canvas.value.freeDrawingBrush) {
          canvas.value.freeDrawingBrush = new fabric.PencilBrush(canvas.value);
        }
        canvas.value.freeDrawingBrush.color = '#ff0000'; // Pencil color
        canvas.value.freeDrawingBrush.width = 3;       // Pencil width
        canvas.value.defaultCursor = 'crosshair';
        measurementText.value = 'Click and drag to draw';
      } else {
        canvas.value.defaultCursor = canvas.value.getZoom() !== 1 ? 'move' : 'default';
        measurementText.value = '';
      }
    };

  const startPolygonDrawing = () => {
    if (!canvas.value.getObjects('image').find(img => img.selectable === false && img !== edgeImage.value)) {
      alert('Please load an image first'); return;
    }
    // Deactivate other tools
    canvas.value.isDrawingMode = false; isAddingAsterisk.value = false; isMeasuring.value = false; isMeasuringAngle.value = false; isHighlighting.value = false;
    
    isDrawingPolygon.value = true;
    polygonPoints.value = [];
    tempLines.value.forEach(line => canvas.value.remove(line));
    tempPoints.value.forEach(point => canvas.value.remove(point));
    tempLines.value = []; tempPoints.value = [];
    canvas.value.defaultCursor = 'crosshair';
    measurementText.value = 'Click to add first vertex';
  };

  const completePolygon = () => {
    if (polygonPoints.value.length < 3) {
      alert('A polygon requires at least 3 points'); return;
    }
    if (tempLines.value.length > 0 && tempLines.value[tempLines.value.length -1].temporary) {
        canvas.value.remove(tempLines.value.pop()); // Remove final rubber-band line
    }
    tempPoints.value.forEach(point => canvas.value.remove(point)); tempPoints.value = [];
    // Solid lines added during clicks are part of the polygon, don't remove them from tempLines if they are final segments
    // It's better if tempLines only stores the rubber-band line.
    
    const finalPolygon = new fabric.Polygon(polygonPoints.value, {
      fill: 'rgba(255,165,0,0.2)', stroke: '#ffa500', strokeWidth: 2,
      hasControls: true, selectable: true,
    });
    canvas.value.add(finalPolygon);

    isDrawingPolygon.value = false;
    polygonPoints.value = []; 
    tempLines.value.forEach(line => canvas.value.remove(line)); // Clear any remaining temp lines (e.g. segments if they were stored here)
    tempLines.value = [];
    measurementText.value = '';
    canvas.value.defaultCursor = canvas.value.getZoom() !== 1 ? 'move' : 'default';
    canvas.value.renderAll();
  };

  const startAngleMeasurement = () => {
    if (!canvas.value.getObjects('image').find(img => img.selectable === false && img !== edgeImage.value)) {
      alert('Please load an image first'); return;
    }
    // Deactivate other tools
    canvas.value.isDrawingMode = false; isDrawingPolygon.value = false; isAddingAsterisk.value = false; isMeasuring.value = false; isHighlighting.value = false;

    isMeasuringAngle.value = true;
    anglePoints.value = [];
    angleLines.value.forEach(line => canvas.value.remove(line)); angleLines.value = [];
    canvas.value.defaultCursor = 'crosshair';
    measurementText.value = 'Click to select first point';
  };

  const calculateAngle = (p1, p2, p3) => {
    const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
    const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };
    const dot = v1.x * v2.x + v1.y * v2.y;
    const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
    const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
    if (mag1 === 0 || mag2 === 0) return "0.00";
    let cosTheta = dot / (mag1 * mag2);
    cosTheta = Math.max(-1, Math.min(1, cosTheta));
    return ((Math.acos(cosTheta) * 180) / Math.PI).toFixed(2);
  };

  const completeAngleMeasurement = () => { // Called after 3rd point
    if (anglePoints.value.length === 3) {
      const angleVal = calculateAngle(anglePoints.value[0], anglePoints.value[1], anglePoints.value[2]);
      measurementText.value = `Angle: ${angleVal}°`;
      // Make lines non-selectable or group them with text
      // angleLines.value.forEach(line => line.set({selectable: false, evented: false}));
    }
    isMeasuringAngle.value = false; // Reset tool state
    // anglePoints & angleLines are kept for visual display, cleared on tool re-activation.
    canvas.value.defaultCursor = canvas.value.getZoom() !== 1 ? 'move' : 'default';
    canvas.value.renderAll();
  };

  const startHighlighting = () => {
    if (!canvas.value.getObjects('image').find(img => img.selectable === false && img !== edgeImage.value)) {
      alert('Please load an image first'); return;
    }
    // Deactivate other tools
    isDrawingPolygon.value = false; isAddingAsterisk.value = false; isMeasuring.value = false; isMeasuringAngle.value = false;
    
    isHighlighting.value = true;
    showHighlightControls.value = true;
    canvas.value.isDrawingMode = true;
    if (!canvas.value.freeDrawingBrush) {
      canvas.value.freeDrawingBrush = new fabric.PencilBrush(canvas.value);
    }
    updateHighlightBrush(); // Set color and width
    canvas.value.defaultCursor = 'crosshair';
    measurementText.value = 'Click and drag to highlight';
  };

  const updateHighlightBrush = () => {
    if (canvas.value && canvas.value.freeDrawingBrush) {
      // Only apply if highlighting is active and in drawing mode
      if (isHighlighting.value && canvas.value.isDrawingMode) {
        canvas.value.freeDrawingBrush.color = hexToRgba(highlightColor.value, 0.3);
        canvas.value.freeDrawingBrush.width = highlightThickness.value;
      }
    }
  };

  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const resetAllTools = () => {
    isMeasuring.value = false;
    canvas.value.isDrawingMode = false;
    isDrawingPolygon.value = false;
    isMeasuringAngle.value = false;
    isHighlighting.value = false;
    isAddingAsterisk.value = false;
    
    showHighlightControls.value = false;
    // Clear temporary drawing aids
    tempLines.value.forEach(line => canvas.value.remove(line));
    tempPoints.value.forEach(point => canvas.value.remove(point));
    tempLines.value = [];
    tempPoints.value = [];
    // Angle lines might be considered persistent annotations until cleared or tool reactivated
    // angleLines.value.forEach(line => canvas.value.remove(line));
    // angleLines.value = [];
    // anglePoints.value = [];

    measurementText.value = '';
    canvas.value.defaultCursor = canvas.value.getZoom() !== 1 ? 'move' : 'default';
  };


  const toggleBrightnessSlider = () => {
    if (!canvas.value.getObjects('image').find(img => img.selectable === false && img !== edgeImage.value)) {
      alert('Please load an image first'); return;
    }
    resetAllTools();
    showBrightnessSlider.value = !showBrightnessSlider.value;
    if (showBrightnessSlider.value) showContrastSlider.value = false;
    updateFilters();
  };

  const toggleContrastSlider = () => {
     if (!canvas.value.getObjects('image').find(img => img.selectable === false && img !== edgeImage.value)) {
      alert('Please load an image first'); return;
    }
    resetAllTools();
    showContrastSlider.value = !showContrastSlider.value;
    if (showContrastSlider.value) showBrightnessSlider.value = false;
    updateFilters();
  };

  const updateFilters = () => {
    if (!canvasContainer.value) return;
    const brightness = `brightness(${1 + brightnessLevel.value})`;
    const contrast = `contrast(${1 + contrastLevel.value})`;
    canvasContainer.value.style.filter = `${brightness} ${contrast}`;
  };

    const startMeasuring = () => {
    if (!canvas.value.getObjects('image').find(img => img.selectable === false && img !== edgeImage.value)) {
      alert('Please load an image first'); return;
    }
    // Deactivate other tools
    canvas.value.isDrawingMode = false; isDrawingPolygon.value = false; isAddingAsterisk.value = false; isMeasuringAngle.value = false; isHighlighting.value = false;

    isMeasuring.value = true;
    measurementText.value = 'Click and drag to measure';
    canvas.value.defaultCursor = 'crosshair';
  };

    const endMeasuring = () => { // Called on mouseup when isMeasuring is true
      isMeasuring.value = false;
      // measurementText is kept from last mousemove
      canvas.value.defaultCursor = canvas.value.getZoom() !== 1 ? 'move' : 'default';
      if (currentMeasurement.value) {
        currentMeasurement.value.set({ evented: false }); // Make the line non-interactive
        // currentMeasurement.value = null; // Keep the ref if you want to delete it later, or clear it
      }
      // startPoint.value = null; // Clear start point
    };

    const calculateDistance = (p1, p2) => {
      const dx = p2.x - p1.x; // These are canvas coordinates
      const dy = p2.y - p1.y;
      const pixels = Math.sqrt(dx * dx + dy * dy);
      // scaleFactor needs calibration by user or based on image metadata (e.g. DPI)
      // Example: 1mm = scaleFactor.value pixels
      const mm = (pixels / (scaleFactor.value || 100)).toFixed(2); // Default: 100 pixels = 1mm
      return { pixels, mm };
    };

    const zoomIn = () => {
      const newZoom = canvas.value.getZoom() * 1.2;
      const point = new fabric.Point(lastClickPos.value.x, lastClickPos.value.y);
      canvas.value.zoomToPoint(point, Math.min(10, newZoom));
      canvas.value.defaultCursor = 'move'; // When zoomed, default to move
    };

    const zoomOut = () => {
      const newZoom = canvas.value.getZoom() * 0.8;
      const point = new fabric.Point(lastClickPos.value.x, lastClickPos.value.y);
      canvas.value.zoomToPoint(point, Math.max(0.1, newZoom));
      canvas.value.defaultCursor = canvas.value.getZoom() !== 1 ? 'move' : 'default';
    };

    // adjustZoom is not directly used, zoomIn/Out use zoomToPoint

    const resetZoom = () => {
      canvas.value.setViewportTransform([1, 0, 0, 1, 0, 0]);
      canvas.value.setZoom(1);
      resetAllTools(); // Also resets cursors and tool states
      canvas.value.renderAll();
    };

  const handleMouseDown = (options) => {
    const pointer = canvas.value.getPointer(options.e); // Coordinates relative to canvas, subject to zoom/pan
    // Note: lastClickPos is set by a separate 'mouse:down' listener with ignoreZoom=true, for zoom centering.
    // For drawing operations, 'pointer' (affected by zoom) is generally what's needed.

    if (isAddingAsterisk.value) {
      createAsterisk(pointer.x, pointer.y); // createAsterisk will reset its state
      return; // Prevent other actions
    }

    if (isDrawingPolygon.value) {
      polygonPoints.value.push({ x: pointer.x, y: pointer.y });
      const circle = new fabric.Circle({
          left: pointer.x, top: pointer.y, radius: 3 / canvas.value.getZoom(), fill: '#ffa500',
          stroke: '#000', strokeWidth: 1 / canvas.value.getZoom(), originX: 'center', originY: 'center',
          selectable: false, evented: false
      });
      canvas.value.add(circle);
      tempPoints.value.push(circle);

      if (polygonPoints.value.length > 1) {
          const prevPoint = polygonPoints.value[polygonPoints.value.length - 2];
          // Remove previous rubber-band line
          if (tempLines.value.length > 0 && tempLines.value[tempLines.value.length - 1].temporary) {
              canvas.value.remove(tempLines.value.pop());
          }
          // Add segment line (this is permanent part of polygon being drawn)
          const segmentLine = new fabric.Line([prevPoint.x, prevPoint.y, pointer.x, pointer.y], {
              stroke: '#ffa500', strokeWidth: 2 / canvas.value.getZoom(), selectable: false, evented: false
          });
          canvas.value.add(segmentLine);
          tempLines.value.push(segmentLine); // Storing drawn segments, might want to differentiate from rubber-band
      }
      measurementText.value = polygonPoints.value.length === 1 ? 'Click to add 2nd vertex' : 'Click for next, Dbl-click to finish';
      canvas.value.renderAll();
      return;
    }

    if (isMeasuringAngle.value) {
      anglePoints.value.push({ x: pointer.x, y: pointer.y });
      if (anglePoints.value.length === 1) {
          measurementText.value = 'Click for 2nd point (vertex)';
      } else if (anglePoints.value.length === 2) {
          const line1 = new fabric.Line([anglePoints.value[0].x, anglePoints.value[0].y, anglePoints.value[1].x, anglePoints.value[1].y], 
              { stroke: '#ff00ff', strokeWidth: 2 / canvas.value.getZoom(), selectable: false, evented: false });
          canvas.value.add(line1);
          angleLines.value.push(line1);
          measurementText.value = 'Click for 3rd point';
      } else if (anglePoints.value.length === 3) {
          const line2 = new fabric.Line([anglePoints.value[1].x, anglePoints.value[1].y, anglePoints.value[2].x, anglePoints.value[2].y], 
              { stroke: '#ff00ff', strokeWidth: 2 / canvas.value.getZoom(), selectable: false, evented: false });
          canvas.value.add(line2);
          angleLines.value.push(line2);
          completeAngleMeasurement(); // Will reset isMeasuringAngle
      }
      canvas.value.renderAll();
      return;
    }

    if (isMeasuring.value) {
      startPoint.value = pointer;
      currentMeasurement.value = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
          stroke: '#ff00ff', strokeWidth: 2 / canvas.value.getZoom(), selectable: false, evented: false
      });
      canvas.value.add(currentMeasurement.value);
      canvas.value.renderAll();
      return;
    }

    // Panning logic (if no tool is active and zoomed in)
    if (canvas.value.getZoom() !== 1 && !canvas.value.isDrawingMode && !isDrawingPolygon.value && !isMeasuring.value && !isMeasuringAngle.value && !isAddingAsterisk.value) {
        if (!options.target || (options.target.type === 'image' && options.target.selectable === false)) {
            isDragging.value = true;
            lastDragPos.value = { x: options.e.clientX, y: options.e.clientY };
            canvas.value.defaultCursor = 'grabbing';
            if (options.e.preventDefault) options.e.preventDefault();
        }
    }
  };

    const handleMouseMove = (options) => {
    const pointer = canvas.value.getPointer(options.e);

    if (isDrawingPolygon.value && polygonPoints.value.length > 0) {
        // Remove previous rubber-band line if it exists
        if (tempLines.value.length > 0 && tempLines.value[tempLines.value.length - 1].temporary) {
            canvas.value.remove(tempLines.value.pop());
        }
        // Add new rubber-band line
        const lastPolyPoint = polygonPoints.value[polygonPoints.value.length - 1];
        const rubberBandLine = new fabric.Line([lastPolyPoint.x, lastPolyPoint.y, pointer.x, pointer.y], {
            stroke: '#ffa500', strokeDashArray: [5, 5], strokeWidth: 2 / canvas.value.getZoom(),
            selectable: false, evented: false, temporary: true, // Custom flag
        });
        canvas.value.add(rubberBandLine);
        tempLines.value.push(rubberBandLine);
        canvas.value.renderAll();
    }

    if (isMeasuring.value && currentMeasurement.value && startPoint.value) {
      currentMeasurement.value.set({ x2: pointer.x, y2: pointer.y });
      const { pixels, mm } = calculateDistance(startPoint.value, pointer);
      measurementText.value = `${mm} mm (${pixels.toFixed(0)} px)`;
      canvas.value.renderAll();
    }

    if (isDragging.value) { // Panning
      const deltaX = options.e.clientX - lastDragPos.value.x;
      const deltaY = options.e.clientY - lastDragPos.value.y;
      canvas.value.relativePan(new fabric.Point(deltaX, deltaY));
      lastDragPos.value = { x: options.e.clientX, y: options.e.clientY };
      // relativePan renders, so no explicit renderAll here
    }
  };

    const handleMouseUp = (options) => {
    // Finalize drawing/highlighting (objects are added by Fabric automatically)
    if (canvas.value.isDrawingMode && (isHighlighting.value || (!isHighlighting.value && !isAddingAsterisk.value /* means free draw pencil */) ) ) {
        canvas.value.isDrawingMode = false;
        isHighlighting.value = false;
        showHighlightControls.value = false;
        measurementText.value = '';
        canvas.value.defaultCursor = canvas.value.getZoom() !== 1 ? 'move' : 'default';
    }

    if (isMeasuring.value && currentMeasurement.value) {
      endMeasuring(); // Finalizes the measurement line and resets state
      // currentMeasurement.value is not set to null in endMeasuring to keep the line visible
      // No renderAll needed here if endMeasuring handles it or if mousemove was last render
    }

    if (isDragging.value) { // Panning ended
      isDragging.value = false;
      canvas.value.defaultCursor = canvas.value.getZoom() !== 1 ? 'move' : 'default';
    }
    // For polygon and angle, completion is handled by dblclick or 3rd click respectively.
  };

  const handleDoubleClick = (options) => {
    if (isDrawingPolygon.value) {
      completePolygon(); // Finishes polygon and resets state
    }
  };

    const uploadImage = async () => {
      if (!canvas.value || canvas.value.isEmpty()) {
        alert('Canvas is empty'); return;
      }
      if (!selectedDisease.value) {
        alert('Please select a disease type'); return;
      }
      isUploading.value = true;
      uploadError.value = '';
      try {
        const currentZoom = canvas.value.getZoom();
        const vpt = canvas.value.viewportTransform.slice();
        canvas.value.setViewportTransform([1,0,0,1,0,0]);
        canvas.value.setZoom(1);
        canvas.value.renderAll();

        const dataUrl = canvas.value.toDataURL({ format: 'png', quality: 1.0 });
        
        canvas.value.setViewportTransform(vpt);
        canvas.value.setZoom(currentZoom);
        canvas.value.renderAll();

        const base64Data = dataUrl.split(',')[1];
        const binaryStr = atob(base64Data);
        const len = binaryStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) { bytes[i] = binaryStr.charCodeAt(i); }
        const blob = new Blob([bytes], { type: 'image/png' });
        const file = new File([blob], `edited-image-${new Date().toISOString().split('T')[0]}.png`, { type: 'image/png' });
        const diseaseType = diseaseToTypeMap[selectedDisease.value] || 'OTHER';
        
        await EditedImageService.uploadFile(file, diseaseType);
        measurementText.value = 'Image uploaded successfully!';
        selectedDisease.value = ''; 
      } catch (err) {
        uploadError.value = err.response?.data?.detail || 'Failed to upload image';
        measurementText.value = uploadError.value;
        console.error("Upload error:", err);
      } finally {
        isUploading.value = false;
      }
    };

    const clearCanvas = () => {
      if (confirm('Are you sure you want to clear the canvas?')) {
        canvas.value.clear(); // Removes all objects
        canvas.value.setBackgroundColor('#f0f0f0', canvas.value.renderAll.bind(canvas.value));
        
        if (imageUrl.value) { // Reload the base image if one was set
            loadImage(); // This will also call resetZoom and renderAll
        } else {
            resetZoom(); // If no base image, just reset zoom and tools
        }

        // Reset states that loadImage or resetZoom might not cover fully if no image loaded
        brightnessLevel.value = 0;
        contrastLevel.value = 0;
        if(canvasContainer.value) canvasContainer.value.style.filter = 'brightness(1) contrast(1)';
        showBrightnessSlider.value = false;
        showContrastSlider.value = false;
        edgeImage.value = null;
        rotationAngle.value = 0;
        selectedDisease.value = ''; // Also clear selected disease
        // Most other tool-specific states are reset by resetAllTools called from resetZoom
        canvas.value.setDimensions({ width: 800, height: originalCanvasHeight }); // Ensure original dimensions
      }
    };

    return {
      imageUrl, canvasContainer, selectedDisease, diseases, measurementText,
      loadImage, addText, addRectangle, addCircle, addArrow, addAsterisk,
      toggleFreeDrawing, startPolygonDrawing, startAngleMeasurement, startHighlighting,
      showHighlightControls, highlightColor, highlightThickness, updateHighlightBrush,
      toggleBrightnessSlider, toggleContrastSlider, updateFilters,
      brightnessLevel, showBrightnessSlider, contrastLevel, showContrastSlider,
      startMeasuring, endMeasuring, // endMeasuring implicitly used by mouseup
      zoomIn, zoomOut, resetZoom,
      rotateImage, sharpenImage, smoothImage, applyEdgeDetection,
      uploadImage, clearCanvas,
      isUploading, uploadError,
    };
  },
};
</script>

<style scoped>
.canvas-editor {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(to bottom, #f8f9fa, #ffffff);
}

.editor-header {
  background: #ffffff;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e9ecef;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  max-width: 1400px;
  margin: 0 auto;
}

.input-group {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
  background: #f8f9fa;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  flex: 1;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

input[type='text'] {
  padding: 0.5rem 0.75rem;
  min-width: 200px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  background: #ffffff;
}

select {
  padding: 0.5rem 0.75rem;
  min-width: 180px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-size: 0.9rem;
  background: #ffffff;
  cursor: pointer;
}

.primary-btn {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

.editor-main {
  display: flex;
  flex: 1;
  gap: 1rem;
  padding: 1rem;
  overflow: hidden;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
  border: 1px solid #e9ecef;
  width: 280px;
  overflow-y: auto;
}

.tool-sections {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tool-section {
  background: #ffffff;
  border-radius: 8px;
  padding: 0.75rem;
  border: 1px solid #e9ecef;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #42b983;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tool-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.tool-btn {
  padding: 0.5rem 0.75rem;
  background: #ffffff;
  color: #2c3e50;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 100px;
}

.tool-btn:hover {
  background: #42b983;
  color: white;
  border-color: #42b983;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-btn {
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 120px;
}

.upload-btn {
  background: #42b983;
  color: white;
  border: none;
}

.upload-btn:hover {
  background: #3aa876;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.clear-btn {
  background: #dc3545;
  color: white;
  border: none;
}

.clear-btn:hover {
  background: #c82333;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.primary-btn {
  background: #42b983;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  font-weight: 600;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.primary-btn:hover {
  background: #3aa876;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Add focus styles for better accessibility */
button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.2);
}

/* Add loading state styles */
button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.highlight-controls {
  padding: 0.75rem;
  gap: 0.75rem;
  border-radius: 6px;
}

.highlight-controls label {
  font-size: 0.9rem;
}

.highlight-controls input[type='color'] {
  width: 40px;
  height: 32px;
}

.highlight-controls input[type='range'] {
  width: 120px;
}

.canvas-container {
  position: relative;
  flex-grow: 1;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: auto;
  background-color: #ffffff;
  padding: 0.75rem;
}

#fundus-canvas {
  display: block;
  border-radius: 8px;
}

.measurement-display {
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  border-radius: 6px;
}

.brightness-slider,
.contrast-slider {
  width: 160px;
}

.brightness-slider::-webkit-slider-thumb,
.contrast-slider::-webkit-slider-thumb {
  width: 20px;
  height: 20px;
}

@media (max-width: 1024px) {
  .editor-main {
    flex-direction: column;
  }

  .controls {
    width: 100%;
    max-height: none;
  }

  .canvas-container {
    min-height: 400px;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .action-buttons {
    width: 100%;
    justify-content: stretch;
  }

  .action-btn {
    flex: 1;
  }
}

@media (max-width: 768px) {
  .editor-header {
    padding: 0.75rem;
  }

  .editor-main {
    padding: 0.75rem;
  }

  .header-content {
    gap: 0.75rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }

  .input-group {
    flex-direction: column;
    align-items: stretch;
  }

  input[type='text'],
  .disease-select {
    width: 100%;
    min-width: 100%;
  }

  .primary-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>