precision highp float;

#define MAX_BOUNCE 3

layout(location = 0) out vec4 f_color;

uniform vec3 u_eye;
uniform vec3 u_lowerLeft;
uniform vec3 u_up;
uniform vec3 u_right;
uniform vec3 u_ambient;

in vec2 v_uv;

void intersectSpheres(vec3 origin, vec3 direction, inout float minDistance, inout int hitIndex, inout int hitType);
void bounceSphere(inout vec3 origin, inout vec3 direction, float distance, int hitIndex, out vec3 color, out vec4 emissive);

vec3 getRayDir()
{
    // todo: account for fragment center position
    vec3 nearPlanePos = u_lowerLeft + v_uv.x * u_right + v_uv.y * u_up;
    vec3 dir = nearPlanePos - u_eye;
    return normalize(dir);
}

void intersect(vec3 origin, vec3 direction, out float minDistance, out int hitIndex, out int hitType)
{
    minDistance = 0.;
    hitIndex = -1;
    hitType = -1;

    intersectSpheres(origin, direction, minDistance, hitIndex, hitType);
}

vec3 trace(vec3 origin, vec3 direction)
{
    float minDistance;
    int hitIndex;
    int hitType;

    vec3 light = vec3(0);
    vec3 color = vec3(1);

    for(int bounce = 0; bounce < MAX_BOUNCE; ++bounce)
    {
        intersect(origin, direction, minDistance, hitIndex, hitType);

        if(hitIndex == -1)
        {
            light += u_ambient * color;
            break;
        }

        vec3 hitColor;
        vec4 hitEmissive;

        bounceSphere(origin, direction, minDistance, hitIndex, hitColor, hitEmissive);

        light += hitEmissive.rgb * hitEmissive.w * color;
        color *= hitColor;
    }

    return light;
}

void main(void)
{
    vec3 direction = getRayDir();
    vec3 result = trace(u_eye, direction);
    f_color = vec4(result, 1.0);
}
