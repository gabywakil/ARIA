// Textos legales base. ARIA debe revisarlos con su asesor legal antes de publicar la web.
export type LegalDoc = { slug: string; title: string; lead: string; sections: { h: string; p: string[] }[] }

export const LEGAL: LegalDoc[] = [
  {
    slug: 'terminos',
    title: 'Términos de compra',
    lead: 'Las condiciones que aplican cuando compras o pides una cotización en la web de ARIA Inventory & Mobility.',
    sections: [
      { h: 'Quiénes somos', p: ['ARIA Inventory & Mobility es una tienda ubicada en Lechería, estado Anzoátegui, Venezuela, que vende motos, cuatrimotos, vehículos, plantas eléctricas, equipos de energía solar y ferretería.'] },
      { h: 'Precios', p: ['Los precios se muestran en dólares estadounidenses y no incluyen IVA, que se suma en el carrito. Los precios de ferretería son de referencia a la tasa BCV del día.', 'Los productos marcados “precio a consultar” se cotizan aparte. Una cotización es válida por 7 días.'] },
      { h: 'Pedidos', p: ['Al confirmar un pedido recibes un número y las instrucciones de pago. El pedido queda reservado por 48 horas; si no recibimos el pago en ese plazo, se libera.', 'Un asesor confirma la disponibilidad antes de procesar el pago. Si un producto no está disponible, te ofrecemos una alternativa o te devolvemos lo pagado.'] },
      { h: 'Pagos', p: ['No cobramos en la web. Los pagos se hacen por Zelle, pago móvil, transferencia o efectivo en tienda, siguiendo las instrucciones de tu recibo. Nunca te pediremos datos de tarjetas ni contraseñas.'] },
      { h: 'Entregas', p: ['Puedes retirar en tienda, pedir entrega local o envío nacional. Los costos de envío se confirman antes de despachar. Las motos, vehículos y plantas se entregan de forma coordinada con un asesor.'] },
      { h: 'Garantía', p: ['Todos los productos tienen la garantía de fábrica que ofrece cada marca. Las condiciones específicas se indican en la ficha del producto o te las confirma tu asesor.'] },
      { h: 'Contacto', p: ['Para cualquier duda sobre estos términos, escríbenos por WhatsApp o al correo de la tienda.'] },
    ],
  },
  {
    slug: 'privacidad',
    title: 'Política de privacidad',
    lead: 'Qué datos guardamos cuando compras o nos escribes, y para qué los usamos.',
    sections: [
      { h: 'Datos que recogemos', p: ['Nombre o razón social, cédula o RIF, teléfono, correo y, si pides envío, la dirección de entrega. Los recogemos solo cuando haces un pedido, una cotización o llenas un formulario.'] },
      { h: 'Para qué los usamos', p: ['Para procesar y entregar tu pedido, emitir tu factura o cotización, avisarte del estado del pedido y responder tus solicitudes. No vendemos ni compartimos tus datos con terceros, salvo la agencia de envío que lleva tu pedido.'] },
      { h: 'Datos en tu equipo', p: ['Si marcas “Recordar mis datos”, tu navegador los guarda para la próxima compra. Puedes borrarlos desmarcando la opción en tu siguiente compra o limpiando los datos del navegador.'] },
      { h: 'Tus derechos', p: ['Puedes pedirnos ver, corregir o borrar tus datos en cualquier momento escribiéndonos por WhatsApp o por correo.'] },
    ],
  },
  {
    slug: 'envios',
    title: 'Envíos, garantía y devoluciones',
    lead: 'Cómo llega tu pedido y qué hacer si algo no está bien.',
    sections: [
      { h: 'Retiro en tienda', p: ['Gratis. Te avisamos por WhatsApp cuando tu pedido esté listo y agendas el retiro en nuestra sede de Lechería.'] },
      { h: 'Entrega local', p: ['En Lechería, Barcelona, Puerto La Cruz y Guanta. El costo depende de la dirección y te lo confirmamos antes de despachar.'] },
      { h: 'Envío nacional', p: ['A cualquier estado por la agencia de encomiendas que prefieras, con cobro en destino. Te enviamos el número de guía para que sigas el paquete.'] },
      { h: 'Motos, vehículos y plantas', p: ['La entrega, el traslado y los papeles se coordinan con un asesor. Puedes revisar el equipo en persona antes de llevártelo.'] },
      { h: 'Garantía', p: ['Todos los productos tienen garantía de fábrica según la marca. Guarda tu factura: la necesitas para cualquier reclamo.'] },
      { h: 'Si algo llega mal', p: ['Si un producto llega dañado o no corresponde con tu pedido, escríbenos por WhatsApp con tu número de pedido y fotos lo antes posible. Revisamos el caso y te damos una solución: cambio, reparación por garantía o devolución del pago.'] },
    ],
  },
]
