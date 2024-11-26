#version 300 es
precision mediump float;

#define RADIUS 0

layout(location = 0) out vec4 f_color;

uniform sampler2D u_input;

in vec2 v_uv;

void main(void)
{
    vec3 sum = vec3(0);
    int count = 0;
    ivec2 size = textureSize(u_input, 0);
    ivec2 center = ivec2(v_uv * vec2(size));
    for(int x = -RADIUS; x < RADIUS; x++) {
        for(int y = -RADIUS; y < RADIUS; y++) {
            ivec2 pos = center + ivec2(x, y);
            if(any(lessThan(pos, ivec2(0))) || any(greaterThan(pos, size)))
                continue;
            vec3 texSample = texelFetch(u_input, pos, 0).rgb;
            sum += texSample;
            count++;
        }
    }
    f_color = vec4(sum / float(count), 1.0);
}
