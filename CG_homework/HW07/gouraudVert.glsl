#version 300 es
precision highp float;

layout(location = 0) in vec3 aPos;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec4 aColor;
layout(location = 3) in vec2 aTexCoord;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;
uniform vec3 u_viewPos;

struct Material {
    vec3 diffuse;
    vec3 specular;
    float shininess;
};

struct Light {
    vec3 position;
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

uniform Material material;
uniform Light light;

out vec4 VertexColor;

void main() {
    vec3 FragPos = vec3(u_model * vec4(aPos, 1.0));
    vec3 norm    = normalize(mat3(transpose(inverse(u_model))) * aNormal);

    // ambient
    vec3 ambient = light.ambient * material.diffuse;

    // diffuse
    vec3 lightDir = normalize(light.position - FragPos);
    float diff    = max(dot(norm, lightDir), 0.0);
    vec3 diffuse  = light.diffuse * diff * material.diffuse;

    // specular
    vec3 viewDir    = normalize(u_viewPos - FragPos);
    vec3 reflectDir = reflect(-lightDir, norm);
    float spec      = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
    vec3 specular   = light.specular * spec * material.specular;

    vec3 result   = ambient + diffuse + specular;
    VertexColor   = vec4(result, 1.0) * aColor;

    gl_Position = u_projection * u_view * vec4(FragPos, 1.0);
}