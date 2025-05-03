/*-----------------------------------------------------------------------------------
13_Texture.js

- Viewing a 3D unit octachedron at origin with perspective projection
- Rotating the cube by ArcBall interface (by left mouse button dragging)
- Applying image texture (../images/textures/sunrise.jpg) to each face of the cube
-----------------------------------------------------------------------------------*/

import { resizeAspectRatio, Axes } from "../util/util.js";
import { Shader, readShaderFile } from "../util/shader.js";
import { regularOctahedron } from "./regularOctahedron.js"; // 변경
import { Arcball } from "../util/arcball.js";
import { loadTexture } from "../util/texture.js";

const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext("webgl2");
let shader;

let isInitialized = false;

let viewMatrix = mat4.create();
let projMatrix = mat4.create();
let modelMatrix = mat4.create();

// 축 그리기 객체
const axes = new Axes(gl, 1.5);

// 텍스처 로드
const texture = loadTexture(gl, true, "../images/textures/sunrise.jpg");

// 정팔면체 인스턴스 생성 (Cube → regularOctahedron)
const octahedron = new regularOctahedron(gl);

// Arcball 설정
const arcball = new Arcball(canvas, 5.0, { rotation: 2.0, zoom: 0.0005 });

document.addEventListener("DOMContentLoaded", () => {
    if (isInitialized) return;

    main()
        .then((ok) => {
            if (!ok) console.log("program terminated");
            else isInitialized = true;
        })
        .catch((err) => {
            console.error("program terminated with error:", err);
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
    const vsSrc = await readShaderFile("shVert.glsl");
    const fsSrc = await readShaderFile("shFrag.glsl");
    return new Shader(gl, vsSrc, fsSrc);
}

function render() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    const view = arcball.getViewMatrix();

    shader.use();
    shader.setMat4("u_model", modelMatrix);
    shader.setMat4("u_view", view);
    shader.setMat4("u_projection", projMatrix);

    // 정팔면체 렌더링
    octahedron.draw(shader);

    // 좌표축 렌더링
    axes.draw(view, projMatrix);

    requestAnimationFrame(render);
}

async function main() {
    try {
        if (!initWebGL()) throw new Error("WebGL 초기화 실패");

        shader = await initShader();

        // 카메라 초기 위치
        mat4.translate(viewMatrix, viewMatrix, vec3.fromValues(0, 0, -3));
        mat4.perspective(
            projMatrix,
            glMatrix.toRadian(60),
            canvas.width / canvas.height,
            0.1,
            100.0
        );

        // 텍스처 바인딩 & wrapping 설정
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        shader.setInt("u_texture", 0);

        requestAnimationFrame(render);
        return true;
    } catch (error) {
        console.error("Failed to initialize program:", error);
        alert("Failed to initialize program");
        return false;
    }
}
