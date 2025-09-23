// https://en.wikipedia.org/wiki/Blinn%E2%80%93Phong_reflection_model
uniform int mode;

const vec3 lightPos = vec3(1.0, 5.0, 3.0);
const vec3 lightColor = vec3(1.0, 1.0, 1.0);
const float lightPower = 40.0;
const vec3 ambientLightColor = vec3(0.2, 0.2, 0.2);
const float screenGamma = 2.2;

vec3 lighting(
    vec3 position, vec3 normal, vec3 eye,
    vec3 ambientColor, vec3 diffuseColor, vec3 specularColor, float shininess
)
{
    vec3 n = normalize(normal);
    vec3 lightDir = lightPos - position;
    float distance = dot(lightDir, lightDir);
    lightDir = normalize(lightDir);

    float lambertian = max(dot(lightDir, n), 0.0);
    float specularFactor = 0.0;

    if(lambertian > 0.0) {
        vec3 viewDir = normalize(eye - position);
        vec3 halfDir = normalize(lightDir + viewDir);
        float specAngle = max(dot(halfDir, n), 0.0);
        specularFactor = pow(specAngle, shininess);
    }
    vec3 lightFac = lightColor * lightPower / distance;
    vec3 colorLinear =
        ambientColor * ambientLightColor +
        (diffuseColor * lambertian + specularColor * specularFactor) * lightFac;
    vec3 colorGammaCorrected = pow(colorLinear, vec3(1.0 / screenGamma));
    return colorGammaCorrected;
}
