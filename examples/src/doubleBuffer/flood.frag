#version 300 es
precision mediump float;

layout(location = 1) out vec4 f_floodInfo;

const float diag = 0.707; // sin/cos 45°
vec2 directions[] = vec2[](
    vec2(1, 0),
    vec2(diag, diag),
    vec2(0, 1),
    vec2(-diag, diag),
    vec2(-1, 0),
    vec2(-diag, -diag),
    vec2(0, -1),
    vec2(diag, -diag)
);

uniform vec2 u_resStep;
uniform sampler2D u_input;
uniform int u_step;

in vec2 v_uv;

void main(void)
{
    ivec2 res = textureSize(u_input, 0);
    vec2 fres = vec2(res);
    ivec2 centerPos = ivec2(v_uv * vec2(res));
    vec2 fCenterPos = vec2(centerPos);

    vec4 result = texelFetch(u_input, centerPos, 0);
    float minDist = distance(result.xy * fres, fCenterPos);

    for(int i = 0; i < 8; i++)
    {
        ivec2 tapPos = centerPos + ivec2(float(u_step) * directions[i]);
        if(tapPos.x < 0 || tapPos.x > res.x || tapPos.y < 0 || tapPos.y > res.y) continue;

        vec4 tap = texelFetch(u_input, tapPos, 0);
        if(tap.w == 0.) continue;

        float dist = distance(tap.xy * fres, fCenterPos);
        if(result.w == 0. || dist < minDist)
        {
            result = tap;
            minDist = dist;
        }
    }

    f_floodInfo = result;
}
