import Hero from "@/components/Hero";
import CalculadoraAsados from "@/components/CalculadoraAsados";
import Catalogo from "@/components/Catalogo";
import Historia from "@/components/Historia";
import Despacho from "@/components/Despacho";
import Faq from "@/components/Faq";
import Contacto from "@/components/Contacto";
import Resenas from "@/components/Resenas";

export default function Home() {
  return (
    <>
      <Hero />
      <CalculadoraAsados />
      <Catalogo />
      <Historia />
      <Despacho />
      <Faq />
      <Contacto />
      <Resenas />
    </>
  );
}
