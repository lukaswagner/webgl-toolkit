import { Dirty, DirtyInit } from '../data';
import { GL } from '../gl';

export abstract class RenderPass<T extends DirtyInit> {
    protected _gl: GL;
    protected _dirty: Dirty<T>;
    protected _name: string;

    public constructor(gl: GL, trackedMembers: T, name?: string) {
        this._gl = gl;
        this._dirty = new Dirty(trackedMembers);
        this._name = name;
    }

    public get name() {
        return this._name;
    }

    public get dirty(): boolean {
        return this._dirty.any();
    }

    public abstract initialize(options?: {}): void;

    protected _preDraw?(): void;
    public set preDraw(v: () => void) {
        this._preDraw = v;
    }

    protected abstract _setup?(): void;
    protected abstract _draw(): void;
    protected abstract _tearDown?(): void;

    protected _postDraw?(): void;
    public set postDraw(v: () => void) {
        this._postDraw = v;
    }

    public draw(): void {
        this._preDraw?.();
        this._setup?.();
        this._draw();
        this._tearDown?.();
        this._postDraw?.();
    }
}
