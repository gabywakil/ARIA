"""
Arma el catálogo de ARIA a partir del material de la empresa:
- Fotos recortadas sin fondo (scripts/_src/cut/*.png)
- Catálogos PDF de Tolsen y Nexon ya extraídos (scripts/_src/ex/*.json + imágenes)
- Datos de motos, vehículos y energía tomados de los catálogos de cada marca (abajo)

Salida:
- src/data/catalog.json            productos que se muestran con foto
- src/assets/products/*.webp       fotos optimizadas
- public/catalogo/ferreteria.json  todas las referencias de ferretería (buscador)

Uso: python3 scripts/build-catalog.py
"""
import json, os, re, sys, unicodedata
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.environ.get('ARIA_SRC', os.path.join(ROOT, 'scripts', '_src'))
CUT = os.path.join(SRC, 'cut')
EX = os.path.join(SRC, 'ex')
OUT_IMG = os.path.join(ROOT, 'src', 'assets', 'products')
os.makedirs(OUT_IMG, exist_ok=True)
os.makedirs(os.path.join(ROOT, 'public', 'catalogo'), exist_ok=True)


def slug(s):
    s = unicodedata.normalize('NFD', s).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')


sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
try:
    import esrgan  # Real-ESRGAN (tools/esrgan.py): mejora la nitidez de fotos pequeñas
    esrgan.use_fast()
except Exception as e:  # sin el modelo, se guarda la imagen tal cual
    print('sin mejora de calidad:', e, file=sys.stderr)
    esrgan = None
from phash import dh, dist
_hashes = []


class LowQuality(Exception):
    pass


def save_img(src_path, key, max_side=1000, dedupe=False):
    """Recorta el borde transparente, mejora la nitidez si la foto es pequeña,
    evita fotos repetidas y guarda WebP con transparencia."""
    out = os.path.join(OUT_IMG, key + '.webp')
    im = Image.open(src_path).convert('RGBA')
    bb = im.getchannel('A').point(lambda v: 255 if v > 20 else 0).getbbox()
    if bb:
        im = im.crop(bb)
    import numpy as _np
    _a = _np.asarray(im)
    _c = [_a[0, 0], _a[0, -1], _a[-1, 0], _a[-1, -1]]
    if sum(1 for c in _c if c[3] > 200 and int(c[0]) + int(c[1]) + int(c[2]) < 120) >= 3:
        raise LowQuality('fondo negro')
    if min(im.size) < 110 or max(im.size) < 220:
        raise LowQuality(f'muy pequeña {im.size}')
    h = dh(im)
    if dedupe and any(dist(h, o) <= 26 for o in _hashes):
        raise LowQuality('foto repetida')
    _hashes.append(h)
    if os.path.exists(out) and os.path.getmtime(out) > os.path.getmtime(src_path):
        return key  # ya procesada
    if esrgan and max(im.size) < max_side:
        im = esrgan.upscale(im, max_side)
    s = min(1, max_side / max(im.size))
    if s < 1:
        im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    im.save(out, 'WEBP', quality=86, method=6)
    return key


products = []
_id = [100]


def add(category, brand, name, image, highlight, description, specs, sub=None, features=None, price=None, variants=None, featured=False, condition='Nuevo', rent=None):
    _id[0] += 1
    products.append(dict(
        id=_id[0], slug=slug(f'{brand} {name}'), category=category, sub=sub, brand=brand, name=name,
        price=price, rentPerDay=rent, image=image, condition=condition, highlight=highlight,
        description=description, specs=specs, features=features or None, variants=variants or None,
        featured=featured or None, stock=None,
    ))


def cut(key, max_side=1000):
    src = os.path.join(CUT, key + '.png')
    if not os.path.exists(src):  # sin foto de buena calidad: el producto sale sin imagen
        return ''
    return save_img(src, key, max_side)


# ------------------------------------------------------------------ MOTOS
VENTO_POLIZA = 'Todas las motos Vento salen con póliza de seguro.'
add('Cuatrimotos y UTV', 'Vento', 'Reptile Trek 200', cut('vento-reptile'), '200 cc, 12,8 HP',
    'Cuatrimoto Vento de 200 cc para campo y trabajo. ' + VENTO_POLIZA,
    {'Motor': '4 tiempos, enfriado por aire', 'Cilindros': '1', 'Cilindrada': '200 cc', 'Potencia máxima': '12,8 HP', 'Ignición': 'CDI electrónica'}, sub='Cuatrimotos')
add('Motos', 'Vento', 'Dakar 300', cut('vento-dakar'), '300 cc, 25 HP, doble propósito',
    'Doble propósito con baúl, protector de motor y parabrisas, lista para carretera y tierra. ' + VENTO_POLIZA,
    {'Motor': '4 tiempos, enfriado por aceite', 'Cilindros': '1', 'Cilindrada': '300 cc', 'Potencia máxima': '25 HP a 8.500 RPM', 'Torque': '22 Nm a 6.500 RPM', 'Ignición': 'CDI electrónica'}, sub='Doble propósito', featured=True)
add('Motos', 'Vento', 'GTS 300', cut('vento-gts'), '272,9 cc, 25 HP, radiador de aceite',
    'Doble propósito con motor enfriado por radiador de aceite. ' + VENTO_POLIZA,
    {'Motor': '4 tiempos, radiador de aceite', 'Cilindros': '1', 'Cilindrada': '272,9 cc', 'Potencia máxima': '25 HP', 'Ignición': 'CDI electrónica'}, sub='Doble propósito')
add('Motos', 'Vento', 'Nitrox 300 T3', cut('vento-nitrox'), '300 cc, 25 HP, naked',
    'Naked deportiva de 300 cc con rines rojos y faro LED. ' + VENTO_POLIZA,
    {'Motor': '4 tiempos, enfriado por aceite', 'Cilindros': '1', 'Cilindrada': '300 cc', 'Potencia máxima': '25 HP', 'Ignición': 'CDI electrónica'}, sub='Naked y deportivas', featured=True)
add('Motos', 'Vento', 'Thunderstar 300 XL', cut('vento-thunderstar'), '300 cc, 24 HP, custom',
    'Custom de 300 cc con respaldo para pasajero y posición relajada. ' + VENTO_POLIZA,
    {'Motor': '4 tiempos, enfriado por aceite', 'Cilindros': '1', 'Cilindrada': '300 cc', 'Potencia máxima': '24 HP', 'Ignición': 'CDI electrónica'}, sub='Custom')
add('Motos', 'Vento', 'Cyclone 200', cut('vento-cyclone'), '200 cc, 16 HP',
    'Urbana deportiva de 200 cc, económica y ágil. ' + VENTO_POLIZA,
    {'Motor': '4 tiempos, enfriado por aire', 'Cilindros': '1', 'Cilindrada': '200 cc', 'Potencia máxima': '16 HP', 'Ignición': 'CDI electrónica'}, sub='Naked y deportivas')

add('Motos', 'Forza', 'SF501 250', cut('forza-sf501'), '250 cc, 125 km/h',
    'Naked de estilo café racer con motor monocilíndrico apoyado por radiador de aceite.',
    {'Motor': 'Monocilíndrico 4 tiempos, aire con radiador de aceite', 'Cilindrada': '250 cc', 'Velocidad máxima': '125 km/h'}, sub='Naked y deportivas')
add('Motos', 'Forza', 'Batllos 250', cut('forza-batllos'), '250 cc, 110 km/h',
    'Naked de 250 cc con eje balanceador para menos vibración.',
    {'Motor': 'Monocilíndrico 4 tiempos, aire, árbol de levas en cabeza, eje balanceador', 'Cilindrada': '250 cc', 'Velocidad máxima': '110 km/h'}, sub='Naked y deportivas')
add('Motos', 'Forza', 'Scrambler 300', cut('forza-scrambler'), '300 cc, 142 km/h, refrigerada por agua',
    'Scrambler de 300 cc con cuatro válvulas y refrigeración líquida.',
    {'Motor': '4 tiempos, refrigerado por agua, 4 válvulas', 'Cilindrada': '300 cc', 'Velocidad máxima': '142 km/h'}, sub='Custom', featured=True)
add('Motos', 'Forza', 'Evo 450', cut('forza-evo'), '450 cc, 152 km/h, inyección',
    'La más potente de Forza: 450 cc, refrigeración líquida e inyección electrónica.',
    {'Motor': '4 tiempos, 4 válvulas, refrigerado por líquido', 'Alimentación': 'Inyección electrónica', 'Cilindrada': '450 cc', 'Velocidad máxima': '152 km/h'}, sub='Naked y deportivas', featured=True)
add('Cuatrimotos y UTV', 'Forza', 'Savage 125', cut('forza-savage'), '125 cc, automática',
    'Cuatrimoto automática de 125 cc para jóvenes y paseos.',
    {'Transmisión': 'Automática', 'Cilindrada': '125 cc', 'Velocidad máxima': '50 km/h', 'Carga máxima': '80 kg'}, sub='Cuatrimotos')
add('Motos', 'Forza', 'Nova 150', cut('forza-nova'), '150 cc, arranque eléctrico',
    'Mini moto de 150 cc con arranque eléctrico, ideal para ciudad.',
    {'Motor': 'Monocilíndrico 4 tiempos, aire', 'Arranque': 'Eléctrico', 'Cilindrada': '150 cc', 'Carga máxima': '150 kg'}, sub='Urbanas y de trabajo')

SPIKE = {'Luces': 'Halógenas', 'Tacómetro': 'Análogo', 'Rendimiento': '35 km por litro', 'Garantía': '2 años o 20.000 km'}
add('Motos', 'Aichi', 'Spike con freno de disco', cut('spike-disco'), 'Freno de disco delantero, 35 km/L',
    'La Spike en edición con freno de disco delantero. Económica, resistente y con garantía de 2 años.', {**SPIKE, 'Freno delantero': 'Disco'}, sub='Urbanas y de trabajo', featured=True)
add('Motos', 'Aichi', 'Spike doble banda', cut('spike-banda'), 'Freno doble banda, 35 km/L',
    'La moto de trabajo de Aichi con sistema de freno doble banda.', {**SPIKE, 'Freno': 'Doble banda'}, sub='Urbanas y de trabajo')

add('Motos', 'HJM', 'HM150 Street JB 2027', cut('hjm-hm150'), 'Street de 150 cc',
    'Moto urbana de 150 cc, modelo 2027, con rines de aleación y portaequipaje.', {'Cilindrada': '150 cc', 'Año': '2027', 'Tipo': 'Street'}, sub='Urbanas y de trabajo')
add('Motos', 'HJM', 'HJ Electric Udine', cut('hjm-udine'), 'Scooter eléctrico clásico',
    'Scooter eléctrico de estilo clásico italiano, silencioso y sin gasolina.', {'Motor': 'Eléctrico', 'Estilo': 'Clásico'}, sub='Scooters eléctricos')
add('Motos', 'HJM', 'HJ Electric Roma', cut('hjm-roma'), 'Scooter eléctrico urbano',
    'Scooter eléctrico negro para moverte por la ciudad sin gasolina.', {'Motor': 'Eléctrico'}, sub='Scooters eléctricos')
add('Motos', 'HJM', 'HJ Electric Gran Sabana', cut('hjm-gransabana'), 'Scooter eléctrico con baúl',
    'Scooter eléctrico con baúl trasero incluido, ideal para delivery.', {'Motor': 'Eléctrico', 'Incluye': 'Baúl trasero'}, sub='Scooters eléctricos')
add('Motos', 'HJM', 'HJ250 Ambulancia con aire acondicionado', cut('hjm-amb1'), 'Equipada con aire, silla de ruedas y oxígeno',
    'Motocarro ambulancia HJ250 equipado con aire acondicionado, silla de ruedas y bombona de oxígeno.', {'Base': 'HJ250', 'Equipo': 'Aire acondicionado, silla de ruedas, bombona de oxígeno'}, sub='Utilitarios')
add('Motos', 'HJM', 'HJ250 Ambulancia con ventilador', cut('hjm-amb2'), 'Equipada con ventilador, silla de ruedas y oxígeno',
    'Motocarro ambulancia HJ250 equipado con ventilador, silla de ruedas y bombona de oxígeno.', {'Base': 'HJ250', 'Equipo': 'Ventilador, silla de ruedas, bombona de oxígeno'}, sub='Utilitarios')

add('Motos', 'Loncin', '250NK 2026', cut('loncin-250nk'), 'Naked de 250 cc, modelo 2026',
    'Naked agresiva de Loncin con gráficos rojos y faro LED.', {'Cilindrada': '250 cc', 'Año': '2026'}, sub='Naked y deportivas', featured=True)
add('Motos', 'Loncin', '150HM 2027', cut('loncin-150hm'), 'Urbana de 150 cc, modelo 2027',
    'Moto urbana roja de 150 cc con portaequipaje, modelo 2027.', {'Cilindrada': '150 cc', 'Año': '2027'}, sub='Urbanas y de trabajo')
add('Cuatrimotos y UTV', 'Loncin', 'XWOLF 300', cut('loncin-xwolf300'), 'Cuatrimoto de 300 cc',
    'Cuatrimoto XWOLF para trabajo y paseo, en verde militar.', {'Modelo': 'XWOLF 300'}, sub='Cuatrimotos')
add('Cuatrimotos y UTV', 'Loncin', 'XWOLF 700L', cut('loncin-xwolf700'), 'Cuatrimoto de 700 cc, dos puestos',
    'Cuatrimoto larga de dos puestos con respaldo para pasajero.', {'Modelo': 'XWOLF 700L', 'Puestos': '2'}, sub='Cuatrimotos', featured=True)
add('Cuatrimotos y UTV', 'Loncin', 'XWOLF 1000', cut('loncin-xwolf1000'), 'La más potente de Loncin',
    'Cuatrimoto tope de gama de Loncin, dos puestos, para terreno exigente.', {'Modelo': 'XWOLF 1000', 'Puestos': '2'}, sub='Cuatrimotos', featured=True)

add('Motos', 'Lifan', 'KPV 300 2025', cut('hisun-kpv300'), 'Maxi scooter de 300 cc',
    'Maxi scooter de aventura de 300 cc, modelo 2025.', {'Cilindrada': '300 cc', 'Año': '2025'}, sub='Scooters')
add('Cuatrimotos y UTV', 'Hisun', 'UXV700', cut('hisun-uxv700'), 'UTV de 700 cc con techo',
    'Vehículo utilitario todo terreno con techo y jaula de protección.', {'Modelo': 'UXV700'}, sub='UTV')
add('Cuatrimotos y UTV', 'Hisun', 'UTV HS1000 Crew', cut('hisun-utv1000'), 'UTV de 1000 cc, cabina doble',
    'UTV de cabina doble para cinco personas, ideal para fincas y trabajo pesado.', {'Modelo': 'HS1000 Crew', 'Cabina': 'Doble'}, sub='UTV', featured=True)

# ------------------------------------------------------------------ VEHÍCULOS
ZX = '3 años o 100.000 km'
add('Vehículos', 'ZX Auto', 'Terralord', cut('terralord', 1100), 'Pickup 4x2 y 4x4, gasolina o diésel',
    'Pickup doble cabina disponible en versiones sincrónicas y automáticas, gasolina y diésel, 4x2 y 4x4.',
    {'Versiones': 'AT gasolina 4x2, gasolina 4x4, gasolina 4x2, diésel 4x2, sincrónica 4x2 y 4x4', 'Cabina': 'Doble', 'Garantía': ZX}, sub='Pickups', featured=True)
add('Vehículos', 'ZX Auto', 'Grandlion', cut('grandlion', 1100), 'Pickup automática 4x2 y 4x4',
    'La pickup más equipada de ZX Auto, con luces auxiliares y caja automática.',
    {'Versiones': 'Automática 4x2 y 4x4', 'Cabina': 'Doble', 'Garantía': ZX}, sub='Pickups', featured=True)
add('Vehículos', 'Toyota', 'Corolla Cross', cut('corolla-par', 1100), 'SUV compacta, disponible en gris y blanco',
    'Toyota Corolla Cross disponible en gris y en blanco perla, lista para entrega.', {'Colores': 'Gris y blanco perla'}, sub='SUV', featured=True)
add('Vehículos', 'Nissan', 'Sentra', cut('sentra-blanco', 1100), 'Sedán automático, blanco y gris',
    'Nissan Sentra con caja automática, disponible en blanco y en gris, en exhibición.', {'Transmisión': 'Automática', 'Colores': 'Blanco y gris'}, sub='Sedanes')
add('Vehículos', 'GAC', 'GS3 Emzoom', cut('gac', 1100), 'SUV turbo, color azul celeste',
    'SUV compacta de diseño moderno con parrilla de líneas verticales.', {'Color': 'Azul celeste'}, sub='SUV')

# ------------------------------------------------------------------ PLANTAS ELÉCTRICAS
GD = {'Régimen': '1.800 RPM', 'Frecuencia': '60 Hz', 'Cabina': 'Insonorizada estándar', 'Combustible': 'Diésel'}
gd = [('gd-25m', '25 kVA monofásico', 'Monofásico', '25 kVA / 25 kW', '220/120 V'),
      ('gd-30m', '30 kVA monofásico', 'Monofásico', '30 kVA / 30 kW', '220/120 V'),
      ('gd-30t', '30 kVA trifásico', 'Trifásico', '30 kVA / 30 kW', '220/120 V'),
      ('gd-33t', '33 kVA trifásico', 'Trifásico', '33 kVA / 33 kW', '220/120 V'),
      ('gd-50', '50 kVA', 'Trifásico y monofásico', '50 kVA / 50 kW', '220/120 V'),
      ('gd-75', '75 kVA', 'Trifásico y monofásico', '75 kVA', '220/120 V'),
      ('gd-100', '100 kVA', 'Trifásico y monofásico', '100 kVA', '220/120 V'),
      ('gd-1000', '1000 kVA', 'Trifásico', '1000 kVA', '220/480 V')]
for key, name, fase, pot, volt in gd:
    add('Plantas eléctricas', 'Hyundai GD Power', f'Generador {name}', cut(key), f'{pot}, {fase.lower()}',
        f'Planta eléctrica GD Power Solutions con motor diésel y cabina insonorizada. {fase}.',
        {'Potencia': pot, 'Fase': fase, 'Tensión': volt, **GD}, sub='Industriales y comerciales', featured=key in ('gd-50', 'gd-100'))
add('Plantas eléctricas', 'Cummins', 'Generador residencial con transferencia automática', cut('cummins'), 'Arranque automático en cada corte',
    'Planta residencial Cummins a gas, silenciosa, con tablero de transferencia automática incluido.',
    {'Uso': 'Residencial', 'Transferencia': 'Automática, incluida', 'Instalación': 'Exterior'}, sub='Residenciales', featured=True)

# ------------------------------------------------------------------ ENERGÍA SOLAR
add('Energía solar', 'Greenenergy', 'Inversor de almacenamiento VS', cut('green-inv'), 'De 3.000 a 12.500 VA',
    'Inversor híbrido para casa, comercio, campo y telecomunicaciones. Funciona con baterías de plomo ácido o de litio.',
    {'Potencia': '3.000 a 12.500 VA', 'Medidas': '465 × 310 mm', 'Salida': 'Onda sinusoidal pura', 'Eficiencia MPPT': 'Hasta 98 %', 'Baterías': 'Plomo ácido o litio con BMS'},
    features=['Salida de onda sinusoidal pura', 'Admite WiFi y GPRS', 'Controlador MPPT/PWM 30 a 60 A opcional', 'Arranque CC y autodiagnóstico', 'Envía señal para encender el generador', 'Salida de 110 o 120 V'], featured=True)
add('Energía solar', 'Greenenergy', 'Panel solar M10 Hi-Eff Twin Mono 550 W', cut('panel550'), '550 W, 25 años de garantía de energía',
    'Panel monocristalino de 550 W con marco plateado, para instalaciones residenciales y comerciales.',
    {'Potencia': '550 W', 'Eficiencia': 'Hasta 21,86 %', 'Garantía de calidad': '12 años', 'Garantía de energía': '25 años (84,8 % de salida)', 'Carga de nieve y viento': '5.400 Pa y 2.400 Pa', 'Tolerancia': '0 a +5 W'},
    features=['Marco plateado, negro o negro completo', 'Versión bifacial disponible', 'Excelente rendimiento con poca luz'])

# ------------------------------------------------------------------ PINTURA CONSTRUY (precios del catálogo, IVA incluido)
cy = [('construy-cunete-nacional', 'Cuñete Caucho Clase A nacional', 130.00, '150 a 160 m² por cuñete', '3 colores', 'Producto estrella. Pintura de caucho lavable hecha en Venezuela, para interiores y exteriores.'),
      ('construy-cunete-importado', 'Cuñete Caucho Clase A importado', 69.60, '160 a 210 m² por cuñete', '7 colores', 'Pintura de caucho lavable importada para interiores y exteriores, en siete colores listos para usar.'),
      ('construy-galon-caucho', 'Galón Caucho Clase A', 36.25, '30 a 36 m² por galón', '15 colores', 'Pintura de caucho lavable en galón, la gama más amplia de colores de la línea.'),
      ('construy-galon-esmalte', 'Galón Esmalte Clase A', 40.60, '30 a 36 m² por galón', '8 colores', 'Esmalte semi-industrial de acabado brillante para metal y madera.')]
for key, name, iva_price, rinde, colores, desc in cy:
    p = os.path.join(CUT, key + '.png')
    add('Ferretería', 'ConstruY', name, save_img(p, key) if os.path.exists(p) else '', f'Rinde {rinde}',
        desc + f' Precio al detal US$ {iva_price:.2f} con IVA.', {'Rendimiento': rinde, 'Colores': colores, 'Clase': 'A'}, sub='Pintura', price=round(iva_price / 1.16, 2), featured=True)

# ------------------------------------------------------------------ FERRETERÍA TOLSEN Y NEXON
refs = []
SMALL = {'De', 'Y', 'Para', 'En', 'Con', 'Del', 'La', 'El'}
def SECTION_CLEAN(s):
    s = re.sub(r'\s+', ' ', s.replace('Tolsen', '').strip()).title()
    s = re.sub(r'^Mundo ', '', s)
    s = re.sub(r'^Herramientas Eléctricas (?=Herramientas|Equipos|Otras|Accesorios)', '', s)
    s = s.replace('Herramientas Eléctricas De 120 V', 'Herramientas eléctricas 120 V')
    s = s.replace('Herramientas Inalámbricas', 'Inalámbricas').replace('Mp20V', 'MP20V')
    words = s.split(' ')
    s = ' '.join([words[0]] + [w.lower() if w in SMALL or (w[:1].isupper() and w[1:].islower()) else w for w in words[1:]])
    return s or 'Ferretería'

def NEXON_SEC(t):
    t = t.lower()
    if 'malla' in t or 'alambre' in t: return 'Mallas y alambres'
    if any(k in t for k in ('manilla', 'cerradura', 'candado', 'bisagra', 'cerrojo', 'pomo')): return 'Cerrajería'
    return 'Electricidad e iluminación'

def NEXON_TITLE(t):
    parts = t.split(' ', 1)
    if len(parts) == 2 and re.search(r'\d', parts[0]) and re.search(r'[A-Za-z]', parts[0]):
        t = parts[1]
    return t[:1].upper() + t[1:]
per_section = {}
for brand in ('tolsen', 'nexon'):
    path = os.path.join(EX, brand + '.json')
    if not os.path.exists(path):
        print('falta', path, file=sys.stderr)
        continue
    items = json.load(open(path))
    for it in items:
        title = it['title'].strip().title()
        if brand == 'nexon':
            title = NEXON_TITLE(title)
        sec = SECTION_CLEAN(it['section']) if brand == 'tolsen' else NEXON_SEC(title)
        for r in it['rows']:
            refs.append(dict(b=it['brand'], s=sec, t=title, c=r['code'], z=r['size'], p=r['price'] or None))
        # Con foto: hasta 6 productos por sección (Tolsen) y todos los de Nexon con imagen
        if not it.get('image'):
            continue
        limit = 6 if brand == 'tolsen' else 14
        n = per_section.get((brand, sec), 0)
        if n >= limit:
            continue
        per_section[(brand, sec)] = n + 1
        key = f"{brand}-{slug(title)}-{it['rows'][0]['code'].lower()}"[:80]
        try:
            save_img(os.path.join(EX, it['image']), slug(key), 1000, dedupe=True)
        except Exception as e:
            print('omitida', key, e, file=sys.stderr)
            continue
        variants = [dict(code=r['code'], size=r['size'], price=r['price'] or None) for r in it['rows']]
        add('Ferretería', it['brand'], title, slug(key), f"{len(variants)} {'medidas' if len(variants) > 1 else 'medida'}, código {variants[0]['code']}" if len(variants) > 1 else f"Código {variants[0]['code']}",
            ', '.join(it['features'][:2]) + '.' if it['features'] else f'{title} {it["brand"]}.',
            {'Sección': sec}, sub=sec, features=it['features'], variants=variants,
            price=variants[0]['price'] if len(variants) == 1 else None)

# slugs únicos
seen = {}
for p in products:
    s = p['slug']
    if s in seen:
        seen[s] += 1
        p['slug'] = f"{s}-{seen[s]}"
    else:
        seen[s] = 1

clean = [{k: v for k, v in p.items() if v is not None} for p in products]
json.dump(clean, open(os.path.join(ROOT, 'src', 'data', 'catalog.json'), 'w'), ensure_ascii=False, indent=0)
json.dump(refs, open(os.path.join(ROOT, 'public', 'catalogo', 'ferreteria.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
json.dump({'count': len(refs)}, open(os.path.join(ROOT, 'src', 'data', 'refs-count.json'), 'w'))
from collections import Counter
print('productos con foto:', len(clean), Counter(p['category'] for p in clean))
print('referencias de ferretería:', len(refs))
