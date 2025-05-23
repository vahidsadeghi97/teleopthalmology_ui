
<template>
  <div>
    <h2>DICOM Image Viewer</h2>
    <input type="file" accept=".dcm" @change="handleFileUpload" />
    <div
      id="dicomImage"
      style="width: 512px; height: 512px; position: relative; border: 1px solid black; background: black;"
    ></div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { Enums, init as csInit, RenderingEngine, registerImageLoader } from '@cornerstonejs/core';
import dicomParser from 'dicom-parser';
import '@cornerstonejs/dicom-image-loader'; // Import for potential utilities
import { addTool, PanTool, ZoomTool, ToolGroupManager, Enums as csToolsEnums } from '@cornerstonejs/tools';

// Reference to the DICOM canvas element
const dicomElement = ref(null);
let renderingEngine = null;
let viewport = null;

// Custom WADO image loader for wadouri scheme
const wadoImageLoader = (imageId) => {
  let xhr = null;
  const promise = new Promise((resolve, reject) => {
    const uri = imageId.replace('wadouri:', '');
    xhr = new XMLHttpRequest();
    xhr.open('GET', uri, true);
    xhr.responseType = 'arraybuffer';

    xhr.onload = () => {
      if (xhr.status !== 200) {
        reject(new Error(`Failed to fetch DICOM file: ${xhr.statusText}`));
        return;
      }

      try {
        // Parse the DICOM file
        const arrayBuffer = xhr.response;
        const byteArray = new Uint8Array(arrayBuffer);
        const dataSet = dicomParser.parseDicom(byteArray);

        // Extract pixel data
        const pixelDataElement = dataSet.elements.x7fe00010;
        if (!pixelDataElement) {
          throw new Error('No pixel data found in DICOM file');
        }
        const bitsAllocated = dataSet.uint16('x00280100') || 16;
        const pixelRepresentation = dataSet.uint16('x00280103') || 0; // 0 = unsigned, 1 = signed
        const pixelData = bitsAllocated === 16
          ? (pixelRepresentation === 0
              ? new Uint16Array(byteArray.buffer, pixelDataElement.dataOffset, pixelDataElement.length / 2)
              : new Int16Array(byteArray.buffer, pixelDataElement.dataOffset, pixelDataElement.length / 2))
          : new Uint8Array(byteArray.buffer, pixelDataElement.dataOffset, pixelDataElement.length);

        // Apply modality LUT (slope and intercept)
        const slope = dataSet.floatString('x00281053') || 1;
        const intercept = dataSet.floatString('x00281052') || 0;
        const transformedPixelData = new Float32Array(pixelData.length);
        for (let i = 0; i < pixelData.length; i++) {
          transformedPixelData[i] = pixelData[i] * slope + intercept;
        }

        // Compute min and max pixel values efficiently
        let minPixelValue = transformedPixelData[0];
        let maxPixelValue = transformedPixelData[0];
        for (let i = 1; i < transformedPixelData.length; i++) {
          const value = transformedPixelData[i];
          if (value < minPixelValue) minPixelValue = value;
          if (value > maxPixelValue) maxPixelValue = value;
        }

        // Extract window/level
        const windowCenter = dataSet.floatString('x00281050') || (maxPixelValue + minPixelValue) / 2;
        const windowWidth = dataSet.floatString('x00281051') || (maxPixelValue - minPixelValue + 1);

        // Debug logs
        console.log('Pixel Data Length:', pixelData.length);
        console.log('Min Pixel Value:', minPixelValue, 'Max Pixel Value:', maxPixelValue);
        console.log('Window Center:', windowCenter, 'Window Width:', windowWidth);
        console.log('Slope:', slope, 'Intercept:', intercept);

        // Create image object
        const image = {
          imageId,
          rows: dataSet.uint16('x00280010'),
          columns: dataSet.uint16('x00280011'),
          pixelData: transformedPixelData,
          width: dataSet.uint16('x00280011'),
          height: dataSet.uint16('x00280010'),
          color: dataSet.string('x00280004') !== 'MONOCHROME2' && dataSet.string('x00280004') !== 'MONOCHROME1',
          columnPixelSpacing: dataSet.floatString('x00280030', 1) || 1,
          rowPixelSpacing: dataSet.floatString('x00280030', 0) || 1,
          sizeInBytes: transformedPixelData.length * 4, // Float32Array uses 4 bytes per element
          minPixelValue,
          maxPixelValue,
          windowCenter,
          windowWidth,
          intercept,
          slope,
          bitsAllocated,
          pixelRepresentation,
          getPixelData: () => transformedPixelData,
        };

        resolve(image);
      } catch (error) {
        reject(new Error(`Failed to parse DICOM image: ${error.message}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error while fetching DICOM file'));
    };

    xhr.send();
  });

  const cancelFn = () => {
    if (xhr) {
      xhr.abort();
    }
  };

  return {
    promise,
    cancelFn,
  };
};

// Initialize Cornerstone and tools on mount
onMounted(async () => {
  try {
    // Initialize Cornerstone
    await csInit();

    // Register the custom WADO image loader
    registerImageLoader('wadouri', wadoImageLoader);

    // Set up rendering engine
    renderingEngine = new RenderingEngine('dicomRenderingEngine');
    
    // Enable the DICOM element
    const element = document.getElementById('dicomImage');
    if (!element) throw new Error('DICOM element not found');

    dicomElement.value = element;
    renderingEngine.enableElement({
      viewportId: 'dicomViewport',
      type: Enums.ViewportType.STACK,
      element,
      defaultOptions: {
        orientation: Enums.OrientationAxis.AXIAL,
      },
    });

    // Create viewport
    viewport = renderingEngine.getViewport('dicomViewport');
    if (!viewport) throw new Error('Viewport not initialized');

    // Initialize tools
    addTool(PanTool);
    addTool(ZoomTool);

    const toolGroup = ToolGroupManager.createToolGroup('dicomToolGroup');
    toolGroup.addTool(PanTool.toolName);
    toolGroup.addTool(ZoomTool.toolName);
    toolGroup.setToolActive(ZoomTool.toolName, {
      bindings: [{ mouseButton: csToolsEnums.MouseBindings.Primary }],
    });
    toolGroup.setToolActive(PanTool.toolName, {
      bindings: [{ mouseButton: csToolsEnums.MouseBindings.Auxiliary }],
    });
    toolGroup.addViewport(viewport.id, renderingEngine.id);
  } catch (error) {
    console.error('Error initializing Cornerstone:', error);
    alert('Failed to initialize DICOM viewer. Check console for details.');
  }
});

// Handle file upload
const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    // Create an imageId for the uploaded DICOM file
    const imageId = `wadouri:${URL.createObjectURL(file)}`;

    // Set the image to the viewport
    await viewport.setStack([imageId]);

    // Set VOI range to ensure proper display
    const { windowCenter, windowWidth } = viewport.getProperties();
    viewport.setProperties({
      voiRange: {
        lower: windowCenter - windowWidth / 2,
        upper: windowCenter + windowWidth / 2,
      },
    });

    renderingEngine.render();
  } catch (error) {
    console.error('Error loading DICOM image:', error);
    alert('Failed to load DICOM image. Check console for details.');
  }
};
</script>

<style scoped>
#dicomImage {
  background: black;
}
</style>
