#version 300 es
precision mediump float;

layout(location = 0) out vec4 f_color;

in vec2 v_uv;

void main(void)
{
    f_color = vec4(v_uv, 0, 1);
}
