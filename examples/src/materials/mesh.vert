#version 300 es
precision mediump float;

in vec3 a_position;
in vec3 a_normal;
in uint a_material;

uniform mat4 u_model;
uniform mat4 u_viewProjection;

#define MATERIAL_COUNT 2

uniform Materials {
    vec3 ambient[MATERIAL_COUNT];
    vec3 diffuse[MATERIAL_COUNT];
    vec4 specularShininess[MATERIAL_COUNT];
};

out vec3 v_color;

void main()
{
    v_color = diffuse[a_material].rgb;
    gl_Position = u_viewProjection * u_model * vec4(a_position, 1.0);
}
