<style scoped>
.canvas-editor {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
  height: 100vh;
  box-sizing: border-box;
  background: linear-gradient(to bottom, #f8f9fa, #ffffff);
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
  border: 1px solid #e9ecef;
}

.input-group {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

input[type='text'] {
  padding: 0.75rem 1rem;
  min-width: 300px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

input[type='text']:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.1);
}

select {
  padding: 0.75rem 1rem;
  min-width: 200px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.95rem;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.3s ease;
}

select:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.1);
}

.tool-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

button {
  padding: 0.75rem 1.25rem;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
}

button:hover {
  background: #3aa876;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

button:active {
  transform: translateY(0);
}

button:disabled {
  background: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.highlight-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  margin-top: 1rem;
}

.highlight-controls label {
  font-size: 0.95rem;
  color: #495057;
  font-weight: 500;
}

.highlight-controls input[type='color'] {
  width: 50px;
  height: 40px;
  padding: 0;
  border: 1px solid #e9ecef;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.highlight-controls input[type='color']:hover {
  border-color: #42b983;
}

.highlight-controls input[type='range'] {
  width: 150px;
  appearance: none;
  -webkit-appearance: none;
  background: #e9ecef;
  border-radius: 8px;
  outline: none;
  cursor: pointer;
  padding: 0;
  height: 8px;
}

.highlight-controls input[type='range']::-webkit-slider-thumb {
  appearance: none;
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  background: #42b983;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.highlight-controls input[type='range']::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.canvas-container {
  position: relative;
  flex-grow: 1;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: auto;
  background-color: #ffffff;
  padding: 1rem;
}

#fundus-canvas {
  display: block;
  border-radius: 8px;
}

.measurement-display {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.95);
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.95rem;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.brightness-slider,
.contrast-slider {
  position: absolute;
  top: 50%;
  transform-origin: center;
  transform: translateY(-50%) rotate(270deg);
  width: 200px;
  height: 8px;
  background: #e9ecef;
  border: none;
  border-radius: 8px;
  appearance: none;
  -webkit-appearance: none;
  outline: none;
  cursor: pointer;
  z-index: 20;
  padding: 0;
}

.brightness-slider {
  right: 40px;
}

.contrast-slider {
  left: 20px;
}

.brightness-slider::-webkit-slider-thumb,
.contrast-slider::-webkit-slider-thumb {
  appearance: none;
  -webkit-appearance: none;
  width: 24px;
  height: 24px;
  background: #42b983;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.brightness-slider::-webkit-slider-thumb:hover,
.contrast-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

/* Add smooth scrolling to the canvas container */
.canvas-container {
  scroll-behavior: smooth;
}

/* Add a subtle hover effect to buttons */
button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Add focus styles for better accessibility */
button:focus,
input:focus,
select:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.2);
}

/* Add loading state styles */
button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Add responsive styles */
@media (max-width: 768px) {
  .canvas-editor {
    padding: 1rem;
  }

  .controls {
    padding: 1rem;
  }

  .tool-buttons {
    gap: 0.5rem;
  }

  button {
    padding: 0.5rem 1rem;
    min-width: 100px;
    font-size: 0.9rem;
  }

  input[type='text'],
  select {
    min-width: 100%;
  }
}
</style> 