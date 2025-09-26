precision highp float;

#define RAYS_PER_FRAME 10

layout(location = 0) out vec4 f_color;

uniform vec3 u_eye;
uniform vec3 u_lowerLeft;
uniform vec3 u_up;
uniform vec3 u_right;

in vec2 v_uv;

void seedNoise(vec2 seed);
vec3 trace(vec3 origin, vec3 direction);
float randomNoise();

vec3 getRayDir()
{
    // todo: account for fragment center position
    vec3 nearPlanePos = u_lowerLeft + v_uv.x * u_right + v_uv.y * u_up;
    vec3 dir = nearPlanePos - u_eye;
    return normalize(dir);
}

void main(void)
{
    seedNoise(v_uv);
    vec3 direction = getRayDir();
    vec3 result = vec3(0);

    for(int i = 0; i < RAYS_PER_FRAME; ++i)
    {
        result += trace(u_eye, direction);
    }
    result /= float(RAYS_PER_FRAME);

    f_color = vec4(result, 1.0);
}
