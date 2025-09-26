// random noise values
export function randomNoise(count: number) {
    const data = new Float32Array(count);

    for (let i = 0; i < count; i++) {
        data[i] = Math.random();
    }

    return data;
}

// normal distributed noise values
export function normalNoise(count: number) {
    const data = new Float32Array(count);

    for (let i = 0; i < count; i++) {
        data[i] = randomNormal();
    }

    return data;
}

// https://en.wikipedia.org/wiki/Box%E2%80%93Muller_transform
function randomNormal() {
    const theta = 2 * Math.PI * Math.random();
    const R = Math.sqrt(-2 * Math.log(Math.random()));
    return R * Math.cos(theta);
}
