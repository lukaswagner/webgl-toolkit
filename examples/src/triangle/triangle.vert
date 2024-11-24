#version 300 es
precision mediump float;

in vec3 a_basePosition;

uniform mat4 u_model;
uniform mat4 u_viewProjection;

out vec3 v_color;

void main()
{
    v_color = a_basePosition;
    gl_Position = u_viewProjection * u_model * vec4(a_basePosition, 1.0);
}
