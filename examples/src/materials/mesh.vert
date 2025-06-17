#version 300 es
precision mediump float;

in vec3 a_position;
in vec3 a_normal;
in uint a_material;

uniform mat4 u_model;
uniform mat4 u_viewProjection;

out vec3 v_position;
out vec3 v_normal;
flat out uint v_material;

void main()
{
    vec4 p = u_model * vec4(a_position, 1.0);
    v_position = p.xyz / p.w;
    vec4 n = u_model * vec4(a_normal, 0.0);
    v_normal = n.xyz;
    v_material = a_material;
    gl_Position = u_viewProjection * p;
}
