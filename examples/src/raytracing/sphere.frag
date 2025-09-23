#define TYPE_SPHERE 1
#define SPHERE_COUNT 1

uniform Spheres {
    vec4 centerRadius[SPHERE_COUNT];
    vec4 colorRoughness[SPHERE_COUNT];
    vec4 emissive[SPHERE_COUNT];
} u_spheres;

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
