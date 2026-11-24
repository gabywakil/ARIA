// Importación estática de cada imagen: Vite les pone hash y solo empaqueta las usadas.
import atv from '../assets/img/atv.jpg'
import casco from '../assets/img/casco.jpg'
import corolla from '../assets/img/corolla.jpg'
import ducati from '../assets/img/ducati.jpg'
import gen from '../assets/img/gen.jpg'
import genmaq from '../assets/img/genmaq.jpg'
import gsx from '../assets/img/gsx.jpg'
import jacket from '../assets/img/jacket.jpg'
import k3 from '../assets/img/k3.jpg'
import maurer from '../assets/img/maurer.jpg'
import moto from '../assets/img/moto.jpg'
import mt03 from '../assets/img/mt03.jpg'
import solar from '../assets/img/solar.jpg'
import spike from '../assets/img/spike.jpg'
import suv from '../assets/img/suv.jpg'
import tools from '../assets/img/tools.jpg'
import toyama from '../assets/img/toyama.jpg'
import tracker from '../assets/img/tracker.jpg'
import vento from '../assets/img/vento.jpg'
import worker from '../assets/img/worker.jpg'
import z800 from '../assets/img/z800.jpg'

export const img = {
  atv, casco, corolla, ducati, gen, genmaq, gsx, jacket, k3, maurer, moto,
  mt03, solar, spike, suv, tools, toyama, tracker, vento, worker, z800,
} as const

export type ImgKey = keyof typeof img
