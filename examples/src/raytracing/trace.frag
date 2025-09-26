#define MAX_BOUNCE 5

uniform vec3 u_ambient;

void intersectSpheres(vec3 origin, vec3 direction, inout float minDistance, inout int hitIndex, inout int hitType);
void bounceSphere(inout vec3 origin, inout vec3 direction, float distance, int hitIndex, out vec3 color, out vec4 emissive);
vec3 cosineDistributedNormal(vec3 normal);

void intersect(vec3 origin, vec3 direction, out float minDistance, out int hitIndex, out int hitType)
{
    minDistance = 0.;
    hitIndex = -1;
    hitType = -1;

    intersectSpheres(origin, direction, minDistance, hitIndex, hitType);
}

vec3 roughReflect(vec3 dir, vec3 normal, float roughness)
{
    vec3 specular = reflect(dir, normal);
    vec3 random = cosineDistributedNormal(normal);
    return mix(specular, random, roughness);
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
