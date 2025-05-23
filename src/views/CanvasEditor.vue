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
          <button @click="addRectangle" class="tool-btn">
            <i class="fas fa-square"></i> Rectangle
          </button>
          <button @click="addCircle" class="tool-btn">
            <i class="fas fa-circle"></i> Circle
          </button>
          <button @click="addArrow" class="tool-btn">
            <i class="fas fa-arrow-right"></i> Arrow
          </button>
          <button @click="startPolygonDrawing" class="tool-btn">
            <i class="fas fa-draw-polygon"></i> Polygon
          </button>
          <button @click="toggleFreeDrawing" class="tool-btn">
            <i class="fas fa-pencil-alt"></i> Free Draw
          </button>
          <button @click="addAsterisk" class="tool-btn">
            <i class="fas fa-asterisk"></i> Asterisk
          </button>
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
    </div>
  </div>

  <!-- Highlight Tools Section -->
  <div class="tool-section">
    <h3 class="section-title">
      <i class="fas fa-highlighter"></i> Highlight Tools
    </h3>
    <div class="tool-buttons">
      <button @click="startHighlighting" class="tool-btn">
        <i class="fas fa-highlighter"></i> Highlight
      </button>
    </div>
    <div v-if="showHighlightControls" class="highlight-controls">
      <div>
        <label for="highlightColorPicker">Color:</label>
        <input id="highlightColorPicker" type="color" v-model="highlightColor" @input="updateHighlightBrush" />
      </div>
      <div>
        <label for="highlightThicknessRange">Thickness:</label>
        <input
          id="highlightThicknessRange"
          type="range"
          v-model.number="highlightThickness"
          min="1"
          max="50"
          step="1"
          @input="updateHighlightBrush"
        />
        <span>{{ highlightThickness }}px</span>
      </div>
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
      <button @click="sharpenImage" class="tool-btn">
        <i class="fas fa-cut"></i> Sharpen
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
import { onMounted, ref, onUnmounted } from 'vue'
import FileService from '@/services/file.service'
import {useRoute} from "vue-router"
import EditedImageService from '@/services/edited_file.service';

function convolutionFilter(fabricImageObject, kernel, divisor = 1) {
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

  for (let y = 1; y < height - 1; y++) {
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
      tempData[idx + 3] = data[idx + 3];
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
    const startPoint = ref(null);
    const currentMeasurement = ref(null);
    const scaleFactor = ref(100);
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
    const rotationAngle = ref(0);
    const isHighlighting = ref(false);
    const showHighlightControls = ref(false);
    const highlightColor = ref('#ffff00');
    const highlightThickness = ref(10);
    const isAddingAsterisk = ref(false);
    const originalCanvasHeight = 800;
    const isUploading = ref(false);
    const uploadError = ref('');
    const padding = 20;

    const isDrawingCircle = ref(false);
    const currentCircle = ref(null);

    const isDrawingTextRect = ref(false);
    const textRectStartPoint = ref(null);
    const currentTextRect = ref(null);
    const isDrawingArrow = ref(false);
    const arrowStartPoint = ref(null);
    const currentArrow = ref(null);

    const isDrawingRectangle = ref(false);
    const rectStartPoint = ref(null);
    const currentRectangle = ref(null);


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

const handleDeleteKeyPress = (event) => {
  if (!canvas.value) return;
  const activeObject = canvas.value.getActiveObject();

  if (activeObject) {
    if (activeObject.isEditing) {
      return;
    }
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      if (activeObject.type === 'activeSelection') {
        activeObject.forEachObject(obj => canvas.value.remove(obj));
      } else {
        canvas.value.remove(activeObject);
      }
      canvas.value.discardActiveObject();
      canvas.value.requestRenderAll();
    }
  }
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
      if (options.target && options.target.type === 'image' && options.target.selectable === false && canvas.value.getZoom() !== 1 && !isDragging.value) {
        canvas.value.defaultCursor = 'move';
      }
  });
    canvas.value.on('mouse:out', (options) => {
      const noActiveTool = !isMeasuring.value && !canvas.value.isDrawingMode && !isDrawingPolygon.value &&
                           !isMeasuringAngle.value && !isAddingAsterisk.value && !isDrawingCircle.value &&
                           !isDrawingTextRect.value && !isDrawingArrow.value && !isDrawingRectangle.value;

      if (!isDragging.value && noActiveTool) {
            if (!options.target || (options.target.type === 'image' && options.target.selectable === false)) {
                 canvas.value.defaultCursor = canvas.value.getZoom() === 1 ? 'default' : 'move';
            } else {
                canvas.value.defaultCursor = 'default';
            }
      }
  });
  window.addEventListener('keydown', handleDeleteKeyPress);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleDeleteKeyPress);
  if (canvas.value) {
    canvas.value.dispose();
  }
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
          evented: true,
          angle: 0,
        });
        canvas.value.clear();
        canvas.value.setDimensions({ width: 800, height: originalCanvasHeight });
        canvas.value.add(fabricImg);
        fabricImg.setCoords();
        const imgBounds = fabricImg.getBoundingRect();
        let newCanvasHeight = imgBounds.top + imgBounds.height + padding;
        newCanvasHeight = Math.max(newCanvasHeight, fabricImg.getScaledHeight() + 2 * padding);
        newCanvasHeight = Math.max(newCanvasHeight, 200);

        canvas.value.setHeight(newCanvasHeight);

        rotationAngle.value = 0;
        resetZoom();
      };
      imgElement.onerror = () => {
        alert('Failed to load image. Please check the URL and try again.');
      };
      imgElement.src = imageUrl.value;
};

  const sharpenImage = () => {
    const mainImageObject = canvas.value.getObjects('image').find((img) => img.selectable === false);
    if (!mainImageObject) {
      alert('Please load an image first');
      return;
    }
    const sharpenKernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];
    const filteredCanvasElement = convolutionFilter(mainImageObject, sharpenKernel, 1);
    mainImageObject.setElement(filteredCanvasElement, { crossOrigin: 'Anonymous' });
    mainImageObject.setCoords();
    canvas.value.renderAll();
  };

  const smoothImage = () => {
    const mainImageObject = canvas.value.getObjects('image').find((img) => img.selectable === false);
    if (!mainImageObject) {
      alert('Please load an image first');
      return;
    }
    const smoothKernel = [1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9];
    const filteredCanvasElement = convolutionFilter(mainImageObject, smoothKernel, 1);
    mainImageObject.setElement(filteredCanvasElement, { crossOrigin: 'Anonymous' });
    mainImageObject.setCoords();
    canvas.value.renderAll();
  };

  const rotateImage = () => {
  const originalImage = canvas.value.getObjects('image').find((img) => img.selectable === false);
    if (!originalImage) {
    alert('Please load an image first');
    return;
    }
  rotationAngle.value = (rotationAngle.value + 90) % 360;
  originalImage.set({ angle: rotationAngle.value }).setCoords();
  adjustCanvasHeight(originalImage);
  canvas.value.renderAll();
};

  const adjustCanvasHeight = (mainImg) => {
    let requiredHeight = originalCanvasHeight;
    if (mainImg) {
        const mainBounds = mainImg.getBoundingRect();
        requiredHeight = Math.max(requiredHeight, mainBounds.top + mainBounds.height + 20);
    }
    canvas.value.setDimensions({ width: canvas.value.width, height: Math.max(originalCanvasHeight, requiredHeight) });
};

    const addText = () => {
      if (!canvas.value.getObjects('image').find(img => img.selectable === false)) {
        alert('Please load an image first');
        return;
      }
      resetAllTools();
      isDrawingTextRect.value = true;
      textRectStartPoint.value = null;
      currentTextRect.value = null;
      canvas.value.defaultCursor = 'crosshair';
      measurementText.value = 'Click and drag to define text area';
    };

    const addRectangle = () => {
      if (!canvas.value.getObjects('image').find(img => img.selectable === false)) {
        alert('Please load an image first');
        return;
      }
      resetAllTools();
      isDrawingRectangle.value = true;
      rectStartPoint.value = null;
      currentRectangle.value = null;
      canvas.value.defaultCursor = 'crosshair';
      measurementText.value = 'Click to set rectangle start, drag to define size.';
    };


    const addCircle = () => {
      if (!canvas.value.getObjects('image').find(img => img.selectable === false)) {
        alert('Please load an image first');
        return;
      }
      resetAllTools();
      isDrawingCircle.value = true;
      startPoint.value = null;
      currentCircle.value = null;
      canvas.value.defaultCursor = 'crosshair';
      measurementText.value = 'Click to set circle center, drag for radius';
    };

    const addArrow = () => {
      if (!canvas.value.getObjects('image').find(img => img.selectable === false)) {
        alert('Please load an image first');
        return;
      }
      resetAllTools();
      isDrawingArrow.value = true;
      arrowStartPoint.value = null;
      currentArrow.value = null;
      canvas.value.defaultCursor = 'crosshair';
      measurementText.value = 'Click to set arrow tail, drag for head';
    };

  const addAsterisk = () => {
    if (!canvas.value.getObjects('image').find(img => img.selectable === false)) {
      alert('Please load an image first');
      return;
    }
    resetAllTools();
    isAddingAsterisk.value = true;
    canvas.value.defaultCursor = 'crosshair';
    measurementText.value = 'Click to place asterisk';
  };

  const createAsterisk = (x, y) => {
    const size = 10 / canvas.value.getZoom();
    const strokeWidth = 2 / canvas.value.getZoom(); // Scale stroke width with zoom

    const lines = [
      new fabric.Line([-size, 0, size, 0], { stroke: '#ff0000', strokeWidth: strokeWidth }),
      new fabric.Line([0, -size, 0, size], { stroke: '#ff0000', strokeWidth: strokeWidth }),
      new fabric.Line([-size * 0.707, -size * 0.707, size * 0.707, size * 0.707], { stroke: '#ff0000', strokeWidth: strokeWidth }),
      new fabric.Line([-size * 0.707, size * 0.707, size * 0.707, -size * 0.707], { stroke: '#ff0000', strokeWidth: strokeWidth }),
    ];
    lines.forEach(line => line.set({ selectable: false, evented: false }));

    const asteriskGroup = new fabric.Group(lines, {
      left: x, top: y, originX: 'center', originY: 'center',
      hasControls: true, selectable: true,
    });
    canvas.value.add(asteriskGroup);
    canvas.value.setActiveObject(asteriskGroup); // Make it active
    isAddingAsterisk.value = false;
    measurementText.value = 'Asterisk added. Click Asterisk to add another.';
    canvas.value.defaultCursor = canvas.value.getZoom() !== 1 ? 'move' : 'default';
    canvas.value.renderAll();
  };

    const toggleFreeDrawing = () => {
      if (canvas.value.isDrawingMode && !isHighlighting.value) {
        resetAllTools();
      } else {
        resetAllTools();
        canvas.value.isDrawingMode = true;
        if (!canvas.value.freeDrawingBrush) {
          canvas.value.freeDrawingBrush = new fabric.PencilBrush(canvas.value);
        }
        canvas.value.freeDrawingBrush.color = '#ff0000';
        canvas.value.freeDrawingBrush.width = 3;
        canvas.value.defaultCursor = 'crosshair';
        measurementText.value = 'Free drawing. Click button again to turn off.';
      }
    };

  const startPolygonDrawing = () => {
    if (!canvas.value.getObjects('image').find(img => img.selectable === false)) {
      alert('Please load an image first'); return;
    }
    resetAllTools();
    isDrawingPolygon.value = true;
    polygonPoints.value = [];
    tempLines.value.forEach(line => canvas.value.remove(line));
    tempPoints.value.forEach(point => canvas.value.remove(point));
    tempLines.value = []; tempPoints.value = [];
    canvas.value.defaultCursor = 'crosshair';
    measurementText.value = 'Polygon: Click for first vertex. Dbl-click to finish.';
  };

  const calculatePolygonArea = (vertices) => {
    let area = 0;
    const n = vertices.length;
    if (n < 3) return 0;

    for (let i = 0; i < n; i++) {
      const p1 = vertices[i];
      const p2 = vertices[(i + 1) % n];
      area += (p1.x * p2.y - p2.x * p1.y);
    }
    return Math.abs(area / 2.0);
  };


  const completePolygon = () => {
    if (polygonPoints.value.length < 3) {
      alert('A polygon requires at least 3 points.'); return;
    }
    if (tempLines.value.length > 0 && tempLines.value[tempLines.value.length -1].temporary) {
        canvas.value.remove(tempLines.value.pop());
    }
    tempPoints.value.forEach(point => canvas.value.remove(point)); tempPoints.value = [];

    const finalPolygon = new fabric.Polygon(polygonPoints.value, {
      fill: 'rgba(255,165,0,0.2)', stroke: '#ffa500', strokeWidth: 2 / canvas.value.getZoom(),
      hasControls: true, selectable: true,
    });
    canvas.value.add(finalPolygon);
    canvas.value.setActiveObject(finalPolygon);

    const areaPx = calculatePolygonArea(polygonPoints.value);
    const pixelsPerMm = scaleFactor.value || 100;
    const areaMmSq = (areaPx / Math.pow(pixelsPerMm, 2)).toFixed(2);
    measurementText.value = `Polygon Area: ${areaMmSq} mm² (${areaPx.toFixed(0)} px²)`;

    isDrawingPolygon.value = false;
    polygonPoints.value = [];
    tempLines.value = [];
    canvas.value.defaultCursor = canvas.value.getZoom() !== 1 ? 'move' : 'default';
    canvas.value.renderAll();
  };

  const startAngleMeasurement = () => {
    if (!canvas.value.getObjects('image').find(img => img.selectable === false)) {
      alert('Please load an image first'); return;
    }
    resetAllTools();
    isMeasuringAngle.value = true;
    anglePoints.value = [];
    angleLines.value.forEach(line => canvas.value.remove(line)); angleLines.value = [];
    canvas.value.defaultCursor = 'crosshair';
    measurementText.value = 'Angle: Click for first point.';
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

  const completeAngleMeasurement = () => {
    if (anglePoints.value.length === 3) {
      const angleVal = calculateAngle(anglePoints.value[0], anglePoints.value[1], anglePoints.value[2]);
      measurementText.value = `Angle: ${angleVal}°`;
    }
    isMeasuringAngle.value = false;
    canvas.value.defaultCursor = canvas.value.getZoom() !== 1 ? 'move' : 'default';
    canvas.value.renderAll();
  };

  const startHighlighting = () => {
    if (!canvas.value.getObjects('image').find(img => img.selectable === false)) {
      alert('Please load an image first'); return;
    }
    if (isHighlighting.value) {
      resetAllTools();
    } else {
      resetAllTools();
      isHighlighting.value = true;
      showHighlightControls.value = true;
      canvas.value.isDrawingMode = true;
      if (!canvas.value.freeDrawingBrush) {
        canvas.value.freeDrawingBrush = new fabric.PencilBrush(canvas.value);
      }
      updateHighlightBrush();
      canvas.value.defaultCursor = 'crosshair';
      measurementText.value = 'Highlighting. Click button again to turn off.';
    }
  };

  const updateHighlightBrush = () => {
    if (canvas.value && canvas.value.freeDrawingBrush) {
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
    showHighlightControls.value = false;
    isAddingAsterisk.value = false;
    isDrawingCircle.value = false;
    isDrawingTextRect.value = false;
    isDrawingArrow.value = false;
    isDrawingRectangle.value = false;

    if (currentCircle.value && !currentCircle.value.hasControls) {
        canvas.value.remove(currentCircle.value);
    }
    currentCircle.value = null;

    if (currentTextRect.value) {
        canvas.value.remove(currentTextRect.value);
    }
    currentTextRect.value = null;
    textRectStartPoint.value = null;

    if (currentArrow.value && !currentArrow.value.hasControls) {
        canvas.value.remove(currentArrow.value);
    }
    currentArrow.value = null;
    arrowStartPoint.value = null;

    if (currentRectangle.value && !currentRectangle.value.hasControls) {
        canvas.value.remove(currentRectangle.value);
    }
    currentRectangle.value = null;
    rectStartPoint.value = null;

    startPoint.value = null;

    tempLines.value.forEach(line => canvas.value.remove(line)); tempLines.value = [];
    tempPoints.value.forEach(point => canvas.value.remove(point)); tempPoints.value = [];
    polygonPoints.value = [];
    anglePoints.value = [];

    measurementText.value = '';
    canvas.value.defaultCursor = canvas.value.getZoom() !== 1 ? 'move' : 'default';
  };


  const toggleBrightnessSlider = () => {
    if (!canvas.value.getObjects('image').find(img => img.selectable === false)) {
      alert('Please load an image first'); return;
    }
    resetAllTools();
    showBrightnessSlider.value = !showBrightnessSlider.value;
    if (showBrightnessSlider.value) showContrastSlider.value = false;
    updateFilters();
  };

  const toggleContrastSlider = () => {
     if (!canvas.value.getObjects('image').find(img => img.selectable === false)) {
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
    if (!canvas.value.getObjects('image').find(img => img.selectable === false)) {
      alert('Please load an image first'); return;
    }
    resetAllTools();
    startPoint.value = null;
    if (currentMeasurement.value) canvas.value.remove(currentMeasurement.value);
    currentMeasurement.value = null;
    isMeasuring.value = true;
    measurementText.value = 'Measure: Click for first point.';
    canvas.value.defaultCursor = 'crosshair';
  };

  const endMeasuring = () => {
    if (currentMeasurement.value) {
      currentMeasurement.value.set({ evented: false });
    }
    isMeasuring.value = false;
    startPoint.value = null;
    canvas.value.defaultCursor = canvas.value.getZoom() !== 1 ? 'move' : 'default';
  };

    const calculateDistance = (p1, p2) => {
      const dx_canvas = p2.x - p1.x;
      const dy_canvas = p2.y - p1.y;
      const pixels_canvas = Math.sqrt(dx_canvas * dx_canvas + dy_canvas * dy_canvas);
      const pixelsPerMm = scaleFactor.value || 100;
      const mm = (pixels_canvas / pixelsPerMm).toFixed(2);
      return { pixels: pixels_canvas, mm };
    };

    const zoomIn = () => {
      const zoom = canvas.value.getZoom();
      const newZoom = zoom * 1.2;
      const point = new fabric.Point(lastClickPos.value.x, lastClickPos.value.y);
      canvas.value.zoomToPoint(point, Math.min(10, newZoom));
      canvas.value.defaultCursor = 'move';
    };

    const zoomOut = () => {
      const zoom = canvas.value.getZoom();
      const newZoom = zoom * 0.8;
      const point = new fabric.Point(lastClickPos.value.x, lastClickPos.value.y);
      canvas.value.zoomToPoint(point, Math.max(0.1, newZoom));
      canvas.value.defaultCursor = canvas.value.getZoom() !== 1 ? 'move' : 'default';
    };


    const resetZoom = () => {
      canvas.value.setViewportTransform([1, 0, 0, 1, 0, 0]);
      canvas.value.setZoom(1);
      canvas.value.defaultCursor = 'default';
      canvas.value.renderAll();
    };

    const createArrowGroup = (fromX, fromY, toX, toY, isFinal = false) => {
        const angleRad = Math.atan2(toY - fromY, toX - fromX);
        const totalLength = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));

        if (totalLength < 1 / canvas.value.getZoom()) {
            return null;
        }

        const headWidth = 10 / canvas.value.getZoom();
        const headLength = 15 / canvas.value.getZoom();
        const linePartLength = Math.max(0, totalLength - headLength); // Ensure line part is not negative

        const line = new fabric.Line([0, 0, linePartLength, 0], {
            stroke: '#00ff00',
            strokeWidth: 3 / canvas.value.getZoom(),
            originX: 'left',
            originY: 'center',
            selectable: false, // Individual parts not selectable
            evented: false,
        });

        const head = new fabric.Triangle({
            width: headWidth,
            height: headLength,
            fill: '#00ff00',
            angle: 90, // Triangle is typically drawn pointing up, rotate 90 to point right
            originX: 'center', // Set origin to center for easier positioning relative to its own geometry
            originY: 'center',
            left: linePartLength + headLength / 2, // Position center of triangle so its tip aligns with totalLength
            top: 0, // Align with line's y-axis
            selectable: false,
            evented: false,
        });

        const arrowGroup = new fabric.Group([line, head], {
            left: fromX,
            top: fromY,
            angle: fabric.util.radiansToDegrees(angleRad),
            hasControls: isFinal,
            selectable: isFinal,
            evented: isFinal,
            originX: 'left', // Group's origin is at the tail of the arrow
            originY: 'center',
        });
        return arrowGroup;
    };


  const handleMouseDown = (options) => {
    const pointer = canvas.value.getPointer(options.e);

    if (isDrawingRectangle.value) {
      if (!rectStartPoint.value) {
        rectStartPoint.value = pointer;
        currentRectangle.value = new fabric.Rect({
          left: pointer.x, top: pointer.y,
          width: 1 / canvas.value.getZoom(), height: 1 / canvas.value.getZoom(),
          fill: 'rgba(255,0,0,0.1)', stroke: '#ff0000',
          strokeDashArray: [5 / canvas.value.getZoom(), 5 / canvas.value.getZoom()],
          strokeWidth: 1 / canvas.value.getZoom(),
          selectable: false, evented: false,
        });
        canvas.value.add(currentRectangle.value);
        measurementText.value = 'Rectangle: Drag to define size, release to draw.';
      }
      canvas.value.renderAll();
      return;
    }


    if (isDrawingTextRect.value) {
      if (!textRectStartPoint.value) {
        textRectStartPoint.value = pointer;
        currentTextRect.value = new fabric.Rect({
          left: pointer.x, top: pointer.y,
          width: 1 / canvas.value.getZoom(), height: 1 / canvas.value.getZoom(),
          fill: 'rgba(255,0,0,0.1)', stroke: '#ff0000', strokeDashArray: [5,5],
          strokeWidth: 1 / canvas.value.getZoom(),
          selectable: false, evented: false,
        });
        canvas.value.add(currentTextRect.value);
        measurementText.value = 'Text: Drag to define area, release to add text.';
      }
      canvas.value.renderAll();
      return;
    }

    if (isDrawingArrow.value) {
        if (!arrowStartPoint.value) {
            arrowStartPoint.value = pointer;
            measurementText.value = 'Arrow: Drag to set head, release to draw.';
        }
        return;
    }

    if (isDrawingCircle.value) {
      if (!startPoint.value) {
        startPoint.value = pointer;
        currentCircle.value = new fabric.Circle({
          left: pointer.x, top: pointer.y,
          radius: 1 / canvas.value.getZoom(),
          fill: 'rgba(0,0,255,0.2)', stroke: '#0000ff',
          strokeWidth: 2 / canvas.value.getZoom(),
          originX: 'center', originY: 'center',
          selectable: false, evented: false, hasControls: false,
        });
        canvas.value.add(currentCircle.value);
        measurementText.value = 'Circle: Drag to set radius, release to draw.';
      }
      canvas.value.renderAll();
      return;
    }

    if (isAddingAsterisk.value) {
      createAsterisk(pointer.x, pointer.y);
      return;
    }

    if (isDrawingPolygon.value) {
      polygonPoints.value.push({ x: pointer.x, y: pointer.y });
      const vertexMarker = new fabric.Circle({
          left: pointer.x, top: pointer.y, radius: 3 / canvas.value.getZoom(), fill: '#ffa500',
          stroke: '#000', strokeWidth: 1 / canvas.value.getZoom(),
          originX: 'center', originY: 'center',
          selectable: false, evented: false
      });
      canvas.value.add(vertexMarker);
      tempPoints.value.push(vertexMarker);

      if (polygonPoints.value.length > 1) {
          const prevPoint = polygonPoints.value[polygonPoints.value.length - 2];
          if (tempLines.value.length > 0 && tempLines.value[tempLines.value.length - 1].temporary) {
              canvas.value.remove(tempLines.value.pop());
          }
          const segmentLine = new fabric.Line([prevPoint.x, prevPoint.y, pointer.x, pointer.y], {
              stroke: '#ffa500', strokeWidth: 2 / canvas.value.getZoom(),
              selectable: false, evented: false
          });
          canvas.value.add(segmentLine);
          tempLines.value.push(segmentLine);
      }
      measurementText.value = `Polygon: Vertex ${polygonPoints.value.length}. Click for next, Dbl-click to finish.`;
      canvas.value.renderAll();
      return;
    }

    if (isMeasuringAngle.value) {
      anglePoints.value.push({ x: pointer.x, y: pointer.y });
      if (anglePoints.value.length === 1) {
          measurementText.value = 'Angle: Click for 2nd point (vertex).';
      } else if (anglePoints.value.length === 2) {
          const line1 = new fabric.Line(
              [anglePoints.value[0].x, anglePoints.value[0].y, anglePoints.value[1].x, anglePoints.value[1].y],
              { stroke: '#ff00ff', strokeWidth: 2 / canvas.value.getZoom(), selectable: false, evented: false }
          );
          canvas.value.add(line1);
          angleLines.value.push(line1);
          measurementText.value = 'Angle: Click for 3rd point to form angle.';
      } else if (anglePoints.value.length === 3) {
          const line2 = new fabric.Line(
              [anglePoints.value[1].x, anglePoints.value[1].y, anglePoints.value[2].x, anglePoints.value[2].y],
              { stroke: '#ff00ff', strokeWidth: 2 / canvas.value.getZoom(), selectable: false, evented: false }
          );
          canvas.value.add(line2);
          angleLines.value.push(line2);
          completeAngleMeasurement();
      }
      canvas.value.renderAll();
      return;
    }

    if (isMeasuring.value) {
      if (!startPoint.value) {
        startPoint.value = pointer;
        currentMeasurement.value = new fabric.Line(
          [pointer.x, pointer.y, pointer.x, pointer.y],
          { stroke: '#ff00ff', strokeWidth: 2 / canvas.value.getZoom(), selectable: false, evented: false }
        );
        canvas.value.add(currentMeasurement.value);
        measurementText.value = 'Measure: Click to select second point.';
      } else {
        currentMeasurement.value.set({ x2: pointer.x, y2: pointer.y });
        currentMeasurement.value.setCoords();
        const { pixels, mm } = calculateDistance(startPoint.value, pointer);
        measurementText.value = `Measured: ${mm} mm (${pixels.toFixed(0)} px)`;
        endMeasuring();
      }
      canvas.value.renderAll();
      return;
    }

    const noActiveTool = !canvas.value.isDrawingMode && !isDrawingPolygon.value && !isMeasuring.value &&
                         !isMeasuringAngle.value && !isAddingAsterisk.value && !isDrawingCircle.value &&
                         !isDrawingTextRect.value && !isDrawingArrow.value && !isDrawingRectangle.value;

    if (canvas.value.getZoom() !== 1 && noActiveTool) {
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

    if (isDrawingRectangle.value && rectStartPoint.value && currentRectangle.value) {
        const x1 = rectStartPoint.value.x;
        const y1 = rectStartPoint.value.y;
        const x2 = pointer.x;
        const y2 = pointer.y;

        currentRectangle.value.set({
            left: Math.min(x1, x2),
            top: Math.min(y1, y2),
            width: Math.abs(x1 - x2),
            height: Math.abs(y1 - y2),
        });
        canvas.value.renderAll();
    }


    if (isDrawingTextRect.value && textRectStartPoint.value && currentTextRect.value) {
        const x1 = textRectStartPoint.value.x;
        const y1 = textRectStartPoint.value.y;
        const x2 = pointer.x;
        const y2 = pointer.y;
        currentTextRect.value.set({
            left: Math.min(x1, x2), top: Math.min(y1, y2),
            width: Math.abs(x1 - x2), height: Math.abs(y1 - y2),
        });
        canvas.value.renderAll();
    }

    if (isDrawingArrow.value && arrowStartPoint.value) {
        if (currentArrow.value) {
            canvas.value.remove(currentArrow.value);
        }
        currentArrow.value = createArrowGroup(arrowStartPoint.value.x, arrowStartPoint.value.y, pointer.x, pointer.y, false);
        if (currentArrow.value) {
             canvas.value.add(currentArrow.value);
        }
        canvas.value.renderAll();
    }

    if (isDrawingCircle.value && currentCircle.value && startPoint.value) {
      const radius = Math.sqrt(
        Math.pow(pointer.x - startPoint.value.x, 2) +
        Math.pow(pointer.y - startPoint.value.y, 2)
      );
      currentCircle.value.set('radius', Math.max(radius, 1 / canvas.value.getZoom()));
      const { pixels, mm } = calculateDistance({x:0, y:0}, {x:radius, y:0});
      const areaPx = Math.PI * Math.pow(pixels, 2);
      const areaMmSq = (areaPx / Math.pow(scaleFactor.value || 100, 2)).toFixed(2);
      measurementText.value = `Circle Radius: ${mm} mm, Area: ${areaMmSq} mm² (${areaPx.toFixed(0)} px²)`;
      canvas.value.renderAll();
    }

    if (isDrawingPolygon.value && polygonPoints.value.length > 0) {
        if (tempLines.value.length > 0 && tempLines.value[tempLines.value.length - 1].temporary) {
            canvas.value.remove(tempLines.value.pop());
        }
        const lastPolyPoint = polygonPoints.value[polygonPoints.value.length - 1];
        const rubberBandLine = new fabric.Line([lastPolyPoint.x, lastPolyPoint.y, pointer.x, pointer.y], {
            stroke: '#ffa500', strokeDashArray: [5, 5 / canvas.value.getZoom()],
            strokeWidth: 2 / canvas.value.getZoom(),
            selectable: false, evented: false, temporary: true,
        });
        canvas.value.add(rubberBandLine);
        tempLines.value.push(rubberBandLine);
        canvas.value.renderAll();
    }

    if (isMeasuring.value && startPoint.value && currentMeasurement.value) {
      currentMeasurement.value.set({ x2: pointer.x, y2: pointer.y });
      const { pixels, mm } = calculateDistance(startPoint.value, pointer);
      if (!measurementText.value.startsWith("Angle:")) {
          measurementText.value = `Measuring: ${mm} mm (${pixels.toFixed(0)} px) - Click to finalize`;
      }
      canvas.value.renderAll();
    }

    if (isDragging.value) {
      const deltaX = options.e.clientX - lastDragPos.value.x;
      const deltaY = options.e.clientY - lastDragPos.value.y;
      canvas.value.relativePan(new fabric.Point(deltaX, deltaY));
      lastDragPos.value = { x: options.e.clientX, y: options.e.clientY };
    }
  };

    const handleMouseUp = (options) => {
    const pointer = canvas.value.getPointer(options.e);
    const pixelsPerMm = scaleFactor.value || 100;

    if (isDrawingRectangle.value && rectStartPoint.value && currentRectangle.value) {
        const rectWidthPx = currentRectangle.value.width;
        const rectHeightPx = currentRectangle.value.height;

        if (rectWidthPx > 2 / canvas.value.getZoom() && rectHeightPx > 2 / canvas.value.getZoom()) {
            currentRectangle.value.set({
                strokeDashArray: null,
                selectable: true, evented: true, hasControls: true
            });
            canvas.value.setActiveObject(currentRectangle.value);

            const areaPx = rectWidthPx * rectHeightPx;
            const widthMm = (rectWidthPx / pixelsPerMm).toFixed(2);
            const heightMm = (rectHeightPx / pixelsPerMm).toFixed(2);
            const areaMmSq = (areaPx / Math.pow(pixelsPerMm, 2)).toFixed(2);
            measurementText.value = `Rectangle: ${widthMm}x${heightMm} mm, Area ${areaMmSq} mm² (${areaPx.toFixed(0)} px²)`;
        } else {
            canvas.value.remove(currentRectangle.value);
            measurementText.value = 'Rectangle too small, removed.';
        }
        isDrawingRectangle.value = false;
        currentRectangle.value = null;
        rectStartPoint.value = null;
        canvas.value.defaultCursor = canvas.value.getZoom() !== 1 ? 'move' : 'default';
        canvas.value.renderAll();
        return;
    }


    if (isDrawingTextRect.value && textRectStartPoint.value && currentTextRect.value) {
        canvas.value.remove(currentTextRect.value);
        const rectWidth = Math.abs(textRectStartPoint.value.x - pointer.x);
        const rectHeight = Math.abs(textRectStartPoint.value.y - pointer.y);

        if (rectWidth > 5 / canvas.value.getZoom() && rectHeight > 5 / canvas.value.getZoom()) {
            const textContent = selectedDisease.value || 'Double-click to edit';
            const iText = new fabric.IText(textContent, {
                left: Math.min(textRectStartPoint.value.x, pointer.x),
                top: Math.min(textRectStartPoint.value.y, pointer.y),
                width: rectWidth,
                fontSize: Math.max(8 / canvas.value.getZoom(), Math.min(16 / canvas.value.getZoom(), rectHeight * 0.6)),
                fill: '#ff0000', backgroundColor: 'rgba(255,255,255,0.7)',
                padding: 2 / canvas.value.getZoom(),
                hasControls: true, selectable: true,
            });
            canvas.value.add(iText);
            canvas.value.setActiveObject(iText);
            iText.enterEditing();
            selectedDisease.value = '';
        }
        isDrawingTextRect.value = false;
        currentTextRect.value = null;
        textRectStartPoint.value = null;
        measurementText.value = 'Text tool. Click Add Text to draw another.';
        canvas.value.defaultCursor = canvas.value.getZoom() !== 1 ? 'move' : 'default';
        canvas.value.renderAll();
        return;
    }

    if (isDrawingArrow.value && arrowStartPoint.value) {
        if (currentArrow.value) {
            canvas.value.remove(currentArrow.value);
        }
        const finalArrow = createArrowGroup(arrowStartPoint.value.x, arrowStartPoint.value.y, pointer.x, pointer.y, true);
        if (finalArrow) {
             canvas.value.add(finalArrow);
             canvas.value.setActiveObject(finalArrow);
        }
        isDrawingArrow.value = false;
        currentArrow.value = null;
        arrowStartPoint.value = null;
        measurementText.value = 'Arrow tool. Click Add Arrow to draw another.';
        canvas.value.defaultCursor = canvas.value.getZoom() !== 1 ? 'move' : 'default';
        canvas.value.renderAll();
        return;
    }

    if (isDrawingCircle.value && currentCircle.value) {
      const radiusPx = currentCircle.value.radius;
      if (radiusPx > (2 / canvas.value.getZoom())) {
          currentCircle.value.set({ selectable: true, evented: true, hasControls: true });
          canvas.value.setActiveObject(currentCircle.value);

          const areaPx = Math.PI * Math.pow(radiusPx, 2);
          const radiusMm = (radiusPx / pixelsPerMm).toFixed(2);
          const areaMmSq = (areaPx / Math.pow(pixelsPerMm, 2)).toFixed(2);
          measurementText.value = `Circle: Radius ${radiusMm} mm, Area ${areaMmSq} mm² (${areaPx.toFixed(0)} px²)`;
      } else {
          canvas.value.remove(currentCircle.value);
          measurementText.value = 'Circle too small, removed.';
      }
      isDrawingCircle.value = false;
      // currentCircle.value = null; // Keep ref for active object
      startPoint.value = null;
      canvas.value.defaultCursor = canvas.value.getZoom() !== 1 ? 'move' : 'default';
      canvas.value.renderAll();
      return;
    }

    if (isDragging.value) {
      isDragging.value = false;
      canvas.value.defaultCursor = canvas.value.getZoom() !== 1 ? 'move' : 'default';
    }
  };

  const handleDoubleClick = (options) => {
    if (isDrawingPolygon.value) {
      completePolygon();
    }
    const target = options.target;
    if (target && target.type === 'i-text' && !target.isEditing) {
        target.enterEditing();
        canvas.value.setActiveObject(target);
    }
  };

    const uploadImage = async () => {
      if (!canvas.value || canvas.value.isEmpty()) {
        alert('Canvas is empty. Add an image and annotations first.'); return;
      }
      if (!selectedDisease.value) {
        alert('Please select a disease type before uploading.'); return;
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
        uploadError.value = err.response?.data?.detail || 'Failed to upload image. Please try again.';
        measurementText.value = `Error: ${uploadError.value}`;
        console.error("Upload error:", err);
      } finally {
        isUploading.value = false;
      }
    };

    const clearCanvas = () => {
      if (confirm('Are you sure you want to clear all annotations and the current image?')) {
        resetAllTools();
        canvas.value.clear();
        canvas.value.setBackgroundColor('#f0f0f0', canvas.value.renderAll.bind(canvas.value));

        if (imageUrl.value) {
            loadImage();
        } else {
            resetZoom();
            canvas.value.setDimensions({ width: 800, height: originalCanvasHeight });
        }

        brightnessLevel.value = 0;
        contrastLevel.value = 0;
        if(canvasContainer.value) canvasContainer.value.style.filter = 'brightness(1) contrast(1)';
        showBrightnessSlider.value = false;
        showContrastSlider.value = false;
        rotationAngle.value = 0;
        selectedDisease.value = '';
      }
    };

    return {
      imageUrl, canvasContainer, selectedDisease, diseases, measurementText,
      loadImage, addText, addRectangle, addCircle, addArrow, addAsterisk,
      toggleFreeDrawing, startPolygonDrawing, startAngleMeasurement, startHighlighting,
      showHighlightControls, highlightColor, highlightThickness, updateHighlightBrush,
      toggleBrightnessSlider, toggleContrastSlider, updateFilters,
      brightnessLevel, showBrightnessSlider, contrastLevel, showContrastSlider,
      startMeasuring,
      zoomIn, zoomOut, resetZoom,
      rotateImage, sharpenImage, smoothImage,
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

button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.2);
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.highlight-controls {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.75rem;
  margin-top: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background-color: #f9f9f9;
}

.highlight-controls div {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.highlight-controls label {
  font-size: 0.9rem;
  min-width: 70px;
}

.highlight-controls input[type='color'] {
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.highlight-controls input[type='range'] {
  flex-grow: 1;
  max-width: 120px;
}

.highlight-controls span {
  font-size: 0.85rem;
  min-width: 30px;
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
  background-color: rgba(44, 62, 80, 0.05);
  color: #2c3e50;
  border: 1px solid #e9ecef;
  margin-top: 0.5rem;
  text-align: center;
}


.brightness-slider,
.contrast-slider {
  width: 160px;
  display: block;
  margin: 0.5rem auto;
}

.brightness-slider::-webkit-slider-thumb,
.contrast-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: #42b983;
  cursor: pointer;
  border-radius: 50%;
}

.brightness-slider::-moz-range-thumb,
.contrast-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #42b983;
  cursor: pointer;
  border-radius: 50%;
  border: none;
}


@media (max-width: 1024px) {
  .editor-main {
    flex-direction: column;
  }

  .controls {
    width: 100%;
    max-height: none;
    overflow-y: visible;
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
