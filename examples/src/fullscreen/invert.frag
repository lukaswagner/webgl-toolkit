#version 300 es
precision mediump float;

#define COLOR_LOCATION 0

layout(location = COLOR_LOCATION) out vec4 f_color;

uniform sampler2D u_input;

in vec2 v_uv;

void main(void)
{
    vec3 texSample = texture(u_input, v_uv).rgb;
    f_color = vec4(1. - texSample, 1.0);
}
