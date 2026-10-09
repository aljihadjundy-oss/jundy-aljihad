import s01 from './s01_intro.js';
import s02a from './s02a_konteks.js';
import s02b from './s02b_kancah.js';
import s03 from './s03_kenalan.js';
import s04 from './s04_peta.js';
import s05 from './s05_zona.js';
import { s06, s07, s08, s09, s10 } from './features.js';
import s11 from './s11_evaluasi.js';
import s12 from './s12_masukan.js';
import { s13a, s13b } from './s13_roadmap.js';
import s14 from './s14_outro.js';

// order follows data.json → scene_order_reference (01_intro … 14_outro)
export const SCENES = [s01, s02a, s02b, s03, s04, s05, s06, s07, s08, s09, s10, s11, s12, s13a, s13b, s14];
