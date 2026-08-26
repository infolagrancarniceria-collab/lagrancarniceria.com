const PREGUNTAS = [
  {
    pregunta: "¿Cómo hago un pedido?",
    respuesta:
      "Eliges tus productos en el catálogo, armas la cotización con el peso o corte que necesitas, y confirmas por WhatsApp antes de que se prepare tu pedido.",
  },
  {
    pregunta: "¿Hacen despacho a domicilio?",
    respuesta:
      "Sí. Los primeros 5 pedidos antes de las 15:00 se despachan el mismo día; el resto, y los realizados después de las 16:00, al día siguiente. No hacemos despachos los domingos.",
  },
  {
    pregunta: "¿Qué medios de pago aceptan?",
    respuesta: "Efectivo, transferencia bancaria y tarjetas de débito/crédito.",
  },
  {
    pregunta: "¿Por qué la carne envasada al vacío se ve más oscura?",
    respuesta:
      "Al envasar al vacío se retira el oxígeno, por lo que la carne puede verse más oscura de lo habitual. Es normal: recupera su color al exponerse al aire.",
  },
];

export default function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-4xl scroll-mt-24 px-4 py-16">
      <h2 className="font-display text-3xl text-dark sm:text-4xl">Preguntas frecuentes</h2>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {PREGUNTAS.map((f) => (
          <div key={f.pregunta} className="rounded-xl bg-card p-5" style={{ border: "1px solid var(--card-border)" }}>
            <p className="font-display text-lg text-dark">{f.pregunta}</p>
            <p className="mt-2 text-sm text-muted">{f.respuesta}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
