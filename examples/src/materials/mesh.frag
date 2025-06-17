#version 300 es
precision mediump float;

layout(location = 0) out vec4 f_color;

uniform vec3 u_eye;

#define MATERIAL_COUNT 1
uniform Materials {
    vec3 ambient[MATERIAL_COUNT];
    vec3 diffuse[MATERIAL_COUNT];
    vec4 specularShininess[MATERIAL_COUNT];
} u_materials;

in vec3 v_position;
in vec3 v_normal;
flat in uint v_material;

vec3 lighting(
    vec3 position, vec3 normal, vec3 eye,
    vec3 ambientColor, vec3 diffuseColor, vec3 specularColor, float shininess
);

void main(void)
{
    vec3 ambient = u_materials.ambient[v_material];
    vec3 diffuse = u_materials.diffuse[v_material];
    vec4 specularShininess = u_materials.specularShininess[v_material];
    vec3 shaded = lighting(
        v_position, v_normal, u_eye,
        ambient, diffuse, specularShininess.rgb, specularShininess.a);
    f_color = vec4(shaded, 1);
}
