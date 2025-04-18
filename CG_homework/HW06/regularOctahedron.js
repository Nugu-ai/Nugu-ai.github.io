/*---------------------------------------------------------------------------
class regularOctahedron

1) Vertex positions
    A regularOctahedron has 8 faces and each face has 3 vertices
    The total number of vertices is 24 (8 faces * 3 verts)
    So, vertices need 72 floats (24 * 3 (x, y, z)) in the vertices array

2) Vertex indices
    Vertex indices of the unit square pyramid is as follows:
        v0|
    | |/   / | |
    | v4----/-v3
    |/      //
    v1------v2
    \       /
     \    /
        v5
    The order of faces and their vertex indices is as follows:
        front-up (0,1,2), right-up (0,2,3), back-up (0,3,4),
        left-up (0,4,1), front-down (1,5,2), right-down (2,5,3),
        back-down (3,5,4), left-down (4,5,1)
    Note that each face has two triangles, 
    And, we need to maintain the order of vertices for each triangle as 
    counterclockwise (when we see the face from the outside of the cube):
        bottom [(2,1,4), (2,4,3)]

3) Vertex normals
    Each vertex in the same face has the same normal vector (flat shading)
    The normal vector is the same as the face normal vector
    front face: (0,0,1), right face: (1,0,0), top face: (0,1,0), 
    left face: (-1,0,0), bottom face: (0,-1,0), back face: (0,0,-1) 

4) Vertex colors
    Each vertex in the same face has the same color (flat shading)
    The color is the same as the face color
    front face: red (1,0,0,1), right face: yellow (1,1,0,1), top face: green (0,1,0,1), 
    left face: cyan (0,1,1,1), bottom face: blue (0,0,1,1), back face: magenta (1,0,1,1) 

5) Vertex texture coordinates
    Each vertex in the same face has the same texture coordinates (flat shading)
    The texture coordinates are the same as the face texture coordinates
    front face: v0(1,1), v1(0,1), v2(0,0), v3(1,0)
    right face: v0(0,1), v3(0,0), v4(1,0), v5(1,1)
    top face: v0(1,0), v5(0,0), v6(0,1), v1(1,1)
    left face: v1(1,0), v6(0,0), v7(0,1), v2(1,1)
    bottom face: v7(0,0), v4(0,1), v3(1,1), v2(1,0)
    back face: v4(0,0), v7(0,1), v6(1,1), v5(1,0)

6) Parameters:
    1] gl: WebGLRenderingContext
    2] options:
        1> color: array of 4 floats (default: [0.8, 0.8, 0.8, 1.0 ])
           in this case, all vertices have the same given color

7) Vertex shader: the location (0: position attrib (vec3), 1: normal attrib (vec3),
                            2: color attrib (vec4), and 3: texture coordinate attrib (vec2))
8) Fragment shader: should catch the vertex color from the vertex shader
-----------------------------------------------------------------------------*/

export class regularOctahedron {
    constructor(gl, options = {}) {
        this.gl = gl;

        this.vao = gl.createVertexArray();
        this.vbo = gl.createBuffer();
        this.ebo = gl.createBuffer();

        // 정점 좌표 (총 24개: 8 faces * 3)
        this.vertices = new Float32Array([
            0.0,
            1 / Math.sqrt(2),
            0.0, // apex
            -0.5,
            0.0,
            0.5,
            0.5,
            0.0,
            0.5,
            0.0,
            1 / Math.sqrt(2),
            0.0,
            0.5,
            0.0,
            0.5,
            0.5,
            0.0,
            -0.5,
            0.0,
            1 / Math.sqrt(2),
            0.0,
            0.5,
            0.0,
            -0.5,
            -0.5,
            0.0,
            -0.5,
            0.0,
            1 / Math.sqrt(2),
            0.0,
            -0.5,
            0.0,
            -0.5,
            -0.5,
            0.0,
            0.5,
            -0.5,
            0.0,
            0.5,
            0.0,
            -1 / Math.sqrt(2),
            0.0, // apex
            0.5,
            0.0,
            0.5,
            0.5,
            0.0,
            0.5,
            0.0,
            -1 / Math.sqrt(2),
            0.0,
            0.5,
            0.0,
            -0.5,
            0.5,
            0.0,
            -0.5,
            0.0,
            -1 / Math.sqrt(2),
            0.0,
            -0.5,
            0.0,
            -0.5,
            -0.5,
            0.0,
            -0.5,
            0.0,
            -1 / Math.sqrt(2),
            0.0,
            -0.5,
            0.0,
            0.5,
        ]);

        // 면별 법선 벡터 (flat shading)
        this.normals = new Float32Array([
            // front-up face
            0, 1, 1, 0, 1, 1, 0, 1, 1,
            // right-up face
            1, 1, 0, 1, 1, 0, 1, 1, 0,
            // back-up face
            0, 1, -1, 0, 1, -1, 0, 1, -1,
            // left-up face
            -1, 1, 0, -1, 1, 0, -1, 1, 0,
            // front-down face
            0, -1, 1, 0, -1, 1, 0, -1, 1,
            // right-down face
            1, -1, 0, 1, -1, 0, 1, -1, 0,
            // back-up face
            0, -1, -1, 0, -1, -1, 0, -1, -1,
            // left-up face
            -1, -1, 0, -1, -1, 0, -1, -1, 0,
        ]);

        // 색상 설정
        const defaultColor = [0.8, 0.8, 0.8, 1.0];
        this.colors = new Float32Array(16 * 4);
        if (options.color) {
            for (let i = 0; i < 16; i++) this.colors.set(options.color, i * 4);
        } else {
            const faceColors = [
                [0, 0, 1, 1], // bottom - blue
                [1, 0, 0, 1], // front - red
                [1, 1, 0, 1], // right - yellow
                [1, 0, 1, 1], // back - magenta
                [0, 1, 1, 1], // left - cyan
            ];
            let vertexIdx = 0;
            for (let f = 0; f < 5; f++) {
                const color = faceColors[f];
                const count = f === 0 ? 4 : 3;
                for (let i = 0; i < count; i++) {
                    this.colors.set(color, vertexIdx * 4);
                    vertexIdx++;
                }
            }
        }

        this.texCoords = new Float32Array([
            0.5,
            1.0, // 위쪽 정점
            0.0,
            0.5, // 왼쪽 하단
            0.25,
            0.5, // 오른쪽 하단 - front-up
            0.5,
            1.0,
            0.25,
            0.5,
            0.5,
            0.5, // - right-up
            0.5,
            1.0,
            0.5,
            0.5,
            0.75,
            0.5, // - back-up
            0.5,
            1.0,
            0.75,
            0.5,
            1.0,
            0.5, // - left-up
            0.0,
            0.5,
            0.5,
            0.0,
            0.25,
            0.5, // - front-down
            0.25,
            0.5,
            0.5,
            0.0,
            0.5,
            0.5, // - right-down
            0.5,
            0.5,
            0.5,
            0.0,
            0.75,
            0.5, // - back-down
            0.75,
            0.5,
            0.5,
            0.0,
            1.0,
            0.5, // - left-down
        ]);


        this.indices = new Uint16Array([
            // top pyramid (4 faces)
            0,
            1,
            2, // front-up
            3,
            4,
            5, // right-up
            6,
            7,
            8, // back-up
            9,
            10,
            11, // left-up

            // bottom pyramid (4 faces)
            12,
            13,
            14, // front-down
            15,
            16,
            17, // right-down
            18,
            19,
            20, // back-down
            21,
            22,
            23, // left-down
        ]);

        // 동일 정점 그룹 (법선 평균용)
        this.sameVertices = new Uint16Array([
            4,
            7,
            10,
            13, // apex shared
            5,
            15,
            3, // bottom-left corner
            6,
            8,
            2, // bottom-right front
            9,
            11,
            1, // bottom-right back
            12,
            14,
            0, // bottom-left back
        ]);

        // faceNormals 복사
        this.faceNormals = new Float32Array(this.normals);

        // vertexNormals 계산
        this.vertexNormals = new Float32Array(this.normals.length);
        for (let i = 0; i < this.sameVertices.length; i += 4) {
            const group = this.sameVertices.subarray(i, i + 4);
            let nx = 0,
                ny = 0,
                nz = 0;
            for (const idx of group) {
                nx += this.normals[idx * 3];
                ny += this.normals[idx * 3 + 1];
                nz += this.normals[idx * 3 + 2];
            }
            nx /= group.length;
            ny /= group.length;
            nz /= group.length;
            for (const idx of group) {
                this.vertexNormals[idx * 3] = nx;
                this.vertexNormals[idx * 3 + 1] = ny;
                this.vertexNormals[idx * 3 + 2] = nz;
            }
        }

        this.initBuffers();
    }

    copyVertexNormalsToNormals() {
        this.normals.set(this.vertexNormals);
    }

    copyFaceNormalsToNormals() {
        this.normals.set(this.faceNormals);
    }

    initBuffers() {
        const gl = this.gl;
        const vSize = this.vertices.byteLength;
        const nSize = this.normals.byteLength;
        const cSize = this.colors.byteLength;
        const tSize = this.texCoords.byteLength;
        const totalSize = vSize + nSize + cSize + tSize;

        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, totalSize, gl.STATIC_DRAW);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices);
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize, this.normals);
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize + nSize, this.colors);
        gl.bufferSubData(
            gl.ARRAY_BUFFER,
            vSize + nSize + cSize,
            this.texCoords
        );

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, vSize);
        gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, vSize + nSize);
        gl.vertexAttribPointer(3, 2, gl.FLOAT, false, 0, vSize + nSize + cSize);

        gl.enableVertexAttribArray(0);
        gl.enableVertexAttribArray(1);
        gl.enableVertexAttribArray(2);
        gl.enableVertexAttribArray(3);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
    }

    updateNormals() {
        const gl = this.gl;
        const vSize = this.vertices.byteLength;
        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize, this.normals);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
    }

    draw(shader) {
        const gl = this.gl;
        shader.use();
        gl.bindVertexArray(this.vao);
        gl.drawElements(
            gl.TRIANGLES,
            this.indices.length,
            gl.UNSIGNED_SHORT,
            0
        );
        gl.bindVertexArray(null);
    }

    delete() {
        const gl = this.gl;
        gl.deleteBuffer(this.vbo);
        gl.deleteBuffer(this.ebo);
        gl.deleteVertexArray(this.vao);
    }
}
