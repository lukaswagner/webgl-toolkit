#version 300 es
precision mediump float;

layout(location = 0) out vec4 f_color;

in vec3 v_color;

void main(void)
{
    f_color = vec4(v_color, 1.0);
}
