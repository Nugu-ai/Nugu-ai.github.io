/*-------------------------------------------------------------------------
10_CameraCircle.js

- Viewing a 3D square pyramid at origin with perspective projection
- The camera is rotating around the origin through a circular path of radius 3
- The height (y position) of the camera follows a sine wave from 0 to 10
- The pyramid is fixed and does not rotate
---------------------------------------------------------------------------*/

import {
    resizeAspectRatio,
    setupText,
    updateText,
    Axes,
} from "../util/util.js";
import { Shader, readShaderFile } from "../util/shader.js";
import { squarePyramid } from "./squarePyramid.js";

const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext("webgl2");
let shader;
let startTime;
let lastFrameTime;

let isInitialized = false;

let viewMatrix = mat4.create();
let projMatrix = mat4.create();
let modelMatrix = mat4.create();
const cameraCircleRadius = 3.0;
const cameraVerticalSpeed = 45.0; // deg/sec
const cameraHeightAmplitude = 5.0;
const cameraHeightOffset = 5.0;
const cube = new squarePyramid(gl);
const axes = new Axes(gl, 1.8);

document.addEventListener("DOMContentLoaded", () => {
    if (isInitialized) {
        console.log("Already initialized");
        return;
    }

    main()
        .then((success) => {
            if (!success) {
                console.log("program terminated");
                return;
            }
            isInitialized = true;
        })
        .catch((error) => {
            console.error("program terminated with error:", error);
        });
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
    gl.clearColor(0.7, 0.8, 0.9, 1.0);

    return true;
}

async function initShader() {
    const vertexShaderSource = await readShaderFile("shVert.glsl");
    const fragmentShaderSource = await readShaderFile("shFrag.glsl");
    return new Shader(gl, vertexShaderSource, fragmentShaderSource);
}

function render() {
    const currentTime = Date.now();
    const deltaTime = (currentTime - lastFrameTime) / 1000.0;
    const elapsedTime = (currentTime - startTime) / 1000.0;
    lastFrameTime = currentTime;

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    mat4.identity(modelMatrix); // pyramid does not rotate

    const angle = glMatrix.toRadian(90.0 * elapsedTime);
    const camX = cameraCircleRadius * Math.sin(angle);
    const camZ = cameraCircleRadius * Math.cos(angle);
    const camY =
        cameraHeightAmplitude *
            Math.sin(glMatrix.toRadian(cameraVerticalSpeed * elapsedTime)) +
        cameraHeightOffset;

    mat4.lookAt(
        viewMatrix,
        vec3.fromValues(camX, camY, camZ),
        vec3.fromValues(0, 0.5, 0),
        vec3.fromValues(0, 1, 0)
    );

    shader.use();
    shader.setMat4("u_model", modelMatrix);
    shader.setMat4("u_view", viewMatrix);
    shader.setMat4("u_projection", projMatrix);
    cube.draw(shader);

    axes.draw(viewMatrix, projMatrix);
    requestAnimationFrame(render);
}

async function main() {
    try {
        if (!initWebGL()) {
            throw new Error("WebGL initialization failed");
        }

        shader = await initShader();

        mat4.perspective(
            projMatrix,
            glMatrix.toRadian(60),
            canvas.width / canvas.height,
            0.1,
            100.0
        );

        startTime = lastFrameTime = Date.now();
        requestAnimationFrame(render);

        return true;
    } catch (error) {
        console.error("Failed to initialize program:", error);
        alert("Failed to initialize program");
        return false;
    }
}
