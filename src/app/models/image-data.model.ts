import { Hotspot } from './hotspot.model';

export interface ImageData {
    id?: number;
    file: File;
    src: string | ArrayBuffer | null;
    hotspots?: Hotspot[];
}