// Fotos de estudio sin fondo (WebP transparente). Se usan con una sombra de contacto,
// para que todos los productos se vean fotografiados en la misma sala.
import corolla from '../assets/cut/corolla.webp'
import ducati from '../assets/cut/ducati.webp'
import genmaq from '../assets/cut/genmaq.webp'
import gsx from '../assets/cut/gsx.webp'
import k3 from '../assets/cut/k3.webp'
import mt03 from '../assets/cut/mt03.webp'
import toyama from '../assets/cut/toyama.webp'
import tracker from '../assets/cut/tracker.webp'
import z800 from '../assets/cut/z800.webp'

export const cut = { corolla, ducati, genmaq, gsx, k3, mt03, toyama, tracker, z800 } as const
export type CutKey = keyof typeof cut
