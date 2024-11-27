#version 300 es
precision mediump float;

layout(location = 0) out vec4 f_color;
layout(location = 1) out vec4 f_floodInfo;

in float v_id;
in vec3 v_color;
in vec2 v_uv;

void main(void)
{
    f_color = vec4(v_color, 1.0);
    f_floodInfo = vec4(v_uv, (v_id + 1.) / 255., 1);
}
