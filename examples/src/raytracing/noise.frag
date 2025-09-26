uniform int u_noiseResolution;
uniform sampler2D u_randomNoise;
uniform sampler2D u_normalNoise;

int noiseSeed;
int noiseCount;
int noiseIndex = 0;

int posMod(int a, int b)
{
    return (a % b + b) % b;
}

void seedNoise(vec2 seed)
{
    noiseSeed = int(seed.x * 34032409. - seed.y * 84943.);
    noiseCount = u_noiseResolution * u_noiseResolution;
}

void nextNoise()
{
    noiseIndex = posMod(noiseIndex + noiseSeed, noiseCount);
}

ivec2 noisePos()
{
    return ivec2(noiseIndex % u_noiseResolution, noiseIndex / u_noiseResolution);
}

float randomNoise()
{
    nextNoise();
    return texelFetch(u_randomNoise, noisePos(), 0).r;
}

float normalNoise()
{
    nextNoise();
    return texelFetch(u_normalNoise, noisePos(), 0).r;
}

// three normal distributed coords give a uniform distribution on a sphere
vec3 randomDir()
{
    return normalize(vec3(normalNoise(), normalNoise(), normalNoise()));
}

// distributes normals according to lambert's cosine law
// https://www.iue.tuwien.ac.at/phd/ertl/node100.html
vec3 cosineDistributedNormal(vec3 normal)
{
    return clamp(normalize(normal + randomDir()), -1., 1.);
}
