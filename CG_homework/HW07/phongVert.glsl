#version 300 es
precision highp float;

layout(location = 0) in vec3 aPos;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec4 aColor;
layout(location = 3) in vec2 aTexCoord;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

out vec3 FragPos;
out vec3 Normal;
out vec4 VertexColor;
out vec2 TexCoord;

void main() {
    FragPos     = vec3(u_model * vec4(aPos, 1.0));
    Normal      = mat3(transpose(inverse(u_model))) * aNormal;
    VertexColor = aColor;
    TexCoord    = aTexCoord;
    gl_Position = u_projection * u_view * vec4(FragPos, 1.0);
}