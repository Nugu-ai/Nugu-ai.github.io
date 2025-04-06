import { resizeAspectRatio } from "../util/util.js";
import { Shader, readShaderFile } from "../util/shader.js";

const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext("webgl2");
let shader;
let axesVAO;
let squareVAO;
let positionBuffer, colorBuffer, indexBuffer;

document.addEventListener("DOMContentLoaded", () => {
    main();
});

function initWebGL() {
    if (!gl) {
        console.error("WebGL 2 is not supported by your browser.");
        return false;
    }

    canvas.width = 700;
    canvas.height = 700;
    resizeAspectRatio(gl, canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.2, 0.3, 0.4, 1.0);
    return true;
}

function setupAxesBuffers(shader) {
    axesVAO = gl.createVertexArray();
    gl.bindVertexArray(axesVAO);

    const axesVertices = new Float32Array([
        -1.0,
        0.0,
        1.0,
        0.0, // x축
        0.0,
        -1.0,
        0.0,
        1.0, // y축
    ]);

    const axesColors = new Float32Array([
        1.0,
        0.3,
        0.0,
        1.0,
        1.0,
        0.3,
        0.0,
        1.0, // x축 색상
        0.0,
        1.0,
        0.5,
        1.0,
        0.0,
        1.0,
        0.5,
        1.0, // y축 색상
    ]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, axesVertices, gl.STATIC_DRAW);
    shader.setAttribPointer("a_position", 2, gl.FLOAT, false, 0, 0);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, axesColors, gl.STATIC_DRAW);
    shader.setAttribPointer("a_color", 4, gl.FLOAT, false, 0, 0);

    gl.bindVertexArray(null);
}

function setupSquareBuffers(shader) {
    const vertices = new Float32Array([
        -0.5,
        0.5, // 좌상
        -0.5,
        -0.5, // 좌하
        0.5,
        -0.5, // 우하
        0.5,
        0.5, // 우상
    ]);

    const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);

    squareVAO = gl.createVertexArray();
    gl.bindVertexArray(squareVAO);

    positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    shader.setAttribPointer("a_position", 2, gl.FLOAT, false, 0, 0);

    colorBuffer = gl.createBuffer(); // 색상은 draw 시점에 매번 업데이트
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(16), gl.DYNAMIC_DRAW);
    shader.setAttribPointer("a_color", 4, gl.FLOAT, false, 0, 0);

    indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    gl.bindVertexArray(null);
}

function updateColorBuffer(color) {
    const colors = new Float32Array([...color, ...color, ...color, ...color]);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, colors);
}

function drawSquare(modelMatrix, color) {
    shader.use();
    shader.setMat4("u_transform", modelMatrix);
    updateColorBuffer(color);
    gl.bindVertexArray(squareVAO);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
}

function getRotationMatrix(angleDeg) {
    const rad = (angleDeg * Math.PI) / 180;
    const R = mat4.create();
    mat4.rotateZ(R, R, rad);
    return R;
}

function drawSun(time) {
    const angle = (45 * time) % 360;
    const model = mat4.create();
    mat4.scale(model, model, [0.2, 0.2, 1]); // edge length 0.2
    mat4.multiply(model, getRotationMatrix(angle), model);
    drawSquare(model, [1.0, 0.0, 0.0, 1.0]); // Red
}

function drawEarth(time) {
    const revolution = (30 * time) % 360;
    const rotation = (180 * time) % 360;

    const model = mat4.create();
    mat4.translate(model, model, [
        0.7 * Math.cos((revolution * Math.PI) / 180),
        0.7 * Math.sin((revolution * Math.PI) / 180),
        0,
    ]);
    mat4.multiply(model, model, getRotationMatrix(rotation));
    mat4.scale(model, model, [0.1, 0.1, 1]); // edge length 0.1
    drawSquare(model, [0.0, 1.0, 1.0, 1.0]); // Cyan
}

function drawMoon(time) {
    const revolution = (360 * time) % 360;
    const rotation = (180 * time) % 360;

    const earthX = 0.7 * Math.cos((30 * time * Math.PI) / 180);
    const earthY = 0.7 * Math.sin((30 * time * Math.PI) / 180);

    const moonX = earthX + 0.2 * Math.cos((revolution * Math.PI) / 180);
    const moonY = earthY + 0.2 * Math.sin((revolution * Math.PI) / 180);

    const model = mat4.create();
    mat4.translate(model, model, [moonX, moonY, 0]);
    mat4.multiply(model, model, getRotationMatrix(rotation));
    mat4.scale(model, model, [0.05, 0.05, 1]); // edge length 0.05
    drawSquare(model, [1.0, 1.0, 0.0, 1.0]); // Yellow
}

function render(time) {
    const t = time / 1000; // ms → sec
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 축 그리기
    shader.setMat4("u_transform", mat4.create());
    gl.bindVertexArray(axesVAO);
    gl.drawArrays(gl.LINES, 0, 4);

    drawSun(t);
    drawEarth(t);
    drawMoon(t);
    requestAnimationFrame(render);
}

async function initShader() {
    const vertexShaderSource = await readShaderFile("shVert.glsl");
    const fragmentShaderSource = await readShaderFile("shFrag.glsl");
    return new Shader(gl, vertexShaderSource, fragmentShaderSource);
}

async function main() {
    try {
        if (!initWebGL()) {
            throw new Error("WebGL 초기화 실패");
        }
        shader = await initShader();
        setupAxesBuffers(shader);
        setupSquareBuffers(shader);
        requestAnimationFrame(render);
        shader.use();
        return true;
    } catch (error) {
        console.error("Failed to initialize program:", error);
        alert("프로그램 초기화에 실패했습니다.");
        return false;
    }
}
