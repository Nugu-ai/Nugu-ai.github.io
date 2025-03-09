// Global constants
const canvas = document.getElementById('glCanvas'); // Get the canvas element 
const gl = canvas.getContext('webgl2'); // Get the WebGL2 context

if (!gl) {
    console.error('WebGL 2 is not supported by your browser.');
}

// Set canvas size: 현재 window 전체를 canvas로 사용
canvas.width = 500;
canvas.height = 500;

// Initialize WebGL settings
gl.viewport(0, 0, canvas.width, canvas.height);

// Start rendering
render();

// Render function
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Enable scissor test
    gl.enable(gl.SCISSOR_TEST);

    // Define the 4 color regions
    drawRegion(0, 0, canvas.width / 2, canvas.height / 2, [0.0, 0.0, 1.0, 1.0]); // Blue (Bottom-left)
    drawRegion(canvas.width / 2, 0, canvas.width / 2, canvas.height / 2, [1.0, 1.0, 0.0, 1.0]); // Yellow (Bottom-right)
    drawRegion(0, canvas.height / 2, canvas.width / 2, canvas.height / 2, [1.0, 0.0, 0.0, 1.0]); // Red (Top-left)
    drawRegion(canvas.width / 2, canvas.height / 2, canvas.width / 2, canvas.height / 2, [0.0, 1.0, 0.0, 1.0]); // Green (Top-right)

    // Disable scissor test
    gl.disable(gl.SCISSOR_TEST);
}

// Function to draw a colored region
function drawRegion(x, y, width, height, color) {
    gl.scissor(x, y, width, height); // Set the scissor box
    gl.clearColor(color[0], color[1], color[2], color[3]); // Set the color
    gl.clear(gl.COLOR_BUFFER_BIT); // Clear only the scissored region
}

// Resize viewport when window size changes
window.addEventListener('resize', () => {
    canvas.width = Math.min(500, window.innerWidth, window.innerHeight);
    canvas.height = Math.min(500, window.innerWidth, window.innerHeight);
    gl.viewport(0, 0, canvas.width, canvas.height);
    render();
});