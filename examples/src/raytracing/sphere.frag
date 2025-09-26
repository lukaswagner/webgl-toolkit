#define TYPE_SPHERE 1
#define SPHERE_COUNT 1

uniform Spheres {
    vec4 centerRadius[SPHERE_COUNT];
    vec4 colorRoughness[SPHERE_COUNT];
    vec4 emissive[SPHERE_COUNT];
} u_spheres;

vec3 roughReflect(vec3 dir, vec3 normal, float roughness);

bool intersectSphere(vec3 origin, vec3 direction, vec4 sphere, out float t)
{
    vec3 offsetRay = origin - sphere.xyz;
    float a = dot(direction, direction);
    float b = 2. * dot(offsetRay, direction);
    float c = dot(offsetRay, offsetRay) - sphere.w * sphere.w;
    float discriminant = b * b - 4. * a * c;
    if(discriminant < 0.) return false;
    t = -(b + sqrt(discriminant)) / (2. * a);
    return t >= 0.;
}

void intersectSpheres(vec3 origin, vec3 direction, inout float minDistance, inout int hitIndex, inout int hitType)
{
    for(int i = 0; i < SPHERE_COUNT; i++)
    {
        vec4 sphere = u_spheres.centerRadius[i];
        float distance;
        bool hit = intersectSphere(origin, direction, sphere, distance);
        if(hit && (hitIndex == -1 || distance < minDistance))
        {
            minDistance = distance;
            hitIndex = i;
            hitType = TYPE_SPHERE;
        }
    }
}

void bounceSphere
(
    inout vec3 origin, inout vec3 direction,
    float distance, int hitIndex,
    out vec3 color, out vec4 emissive
)
{
    vec4 colorRoughness = u_spheres.colorRoughness[hitIndex];
    color = colorRoughness.rgb;
    emissive = u_spheres.emissive[hitIndex];

    vec3 center = u_spheres.centerRadius[hitIndex].xyz;
    vec3 hitPos = origin + direction * distance;
    vec3 normal = normalize(hitPos - center);
    direction = roughReflect(direction, normal, colorRoughness.w);
    origin = hitPos;
}
