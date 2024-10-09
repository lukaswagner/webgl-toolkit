import { cartesianToGcs, clampLatitude, clampLongitude, gcsToCartesian } from '../data/management/gcs';
import { Camera } from './camera';
import { vec3 } from 'gl-matrix';

/**
 * Turntable navigation helper.
 */
export class Turntable {
    protected _camera: Camera;
    protected static _scrollBase = 1.15;
    protected static _moveFactor = 0.005;
    protected _dragging = false;
    protected _longitude = 0;
    protected _latitude = 0;

    public constructor(element: HTMLElement, camera: Camera) {
        this._camera = camera;
        this.updateFromCamera();

        element.addEventListener('wheel', (e) => this._scroll(e));
        element.addEventListener('mousemove', (e) => this._move(e));
        element.addEventListener('mousedown', () => this._dragging = true);
        element.addEventListener('mouseup', () => this._dragging = false);
    }

    protected _scroll(event: WheelEvent) {
        const exp = Math.sign(event.deltaY);
        const eye = this._camera.eye;
        vec3.scale(eye, eye, Turntable._scrollBase ** exp);
        this._camera.eye = eye;
    }

    protected _move(event: MouseEvent) {
        if (!this._dragging) return;

        this._longitude = clampLongitude(
            this._longitude - event.movementX * Turntable._moveFactor);
        this._latitude = clampLatitude(
            this._latitude + event.movementY * Turntable._moveFactor);

        const eye = gcsToCartesian(this._longitude, this._latitude);
        const dist = vec3.length(this._camera.eye);
        vec3.scale(eye, eye, dist);
        this._camera.eye = eye;
    }

    public updateFromCamera() {
        const gcs = cartesianToGcs(this._camera.eye);
        this._longitude = gcs.longitude;
        this._latitude = gcs.latitude;
    }
}
