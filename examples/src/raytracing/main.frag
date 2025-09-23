precision highp float;

layout(location = 0) out vec4 f_color;

uniform vec3 u_eye;
uniform vec3 u_lowerLeft;
uniform vec3 u_up;
uniform vec3 u_right;

in vec2 v_uv;

void intersectSpheres(vec3 origin, vec3 direction, inout float minDistance, inout int hitIndex, inout int hitType);

vec3 getRayDir()
{
    // todo: account for fragment center position
    vec3 nearPlanePos = u_lowerLeft + v_uv.x * u_right + v_uv.y * u_up;
    vec3 dir = nearPlanePos - u_eye;
    return normalize(dir);
}

vec3 trace(vec3 origin, vec3 direction)
{
    float minDistance = 0.;
    int hitIndex = -1;
    int hitType = -1;

    intersectSpheres(origin, direction, minDistance, hitIndex, hitType);

    return vec3(minDistance);
}

void main(void)
{
    vec3 direction = getRayDir();
    vec3 result = trace(u_eye, direction);
    f_color = vec4(result, 1.0);
}
