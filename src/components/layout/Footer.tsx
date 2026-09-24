import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-neutral-950 px-4 pb-24 pt-12 text-sm text-neutral-400 md:px-8">
      <div className="mx-auto mb-12 grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-1">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="NaughtyXXXCams"
                width={110}
                height={30}
                className="h-7 w-auto object-contain"
              />
            </Link>
            <span className="rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
              18+
            </span>
          </div>
          <p className="text-xs leading-relaxed text-neutral-400">
            NaughtyXXXCams es la plataforma líder para transmisiones webcam en
            vivo en HD. Disfruta de miles de modelos verificadas las 24 horas
            del día con experiencia fluida para móvil y soporte para Telegram
            Mini App. Todas las modelos son adultas verificadas mayores de 18
            años.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
            Categorías en Vivo
          </h3>
          <ul className="space-y-2 text-xs">
            <li>
              <Link
                href="/explore?cat=latinas"
                className="transition hover:text-white"
              >
                Modelos Latinas
              </Link>
            </li>
            <li>
              <Link
                href="/explore?cat=verified"
                className="transition hover:text-white"
              >
                Chicas 18+ Verificadas
              </Link>
            </li>
            <li>
              <Link
                href="/explore?cat=milf"
                className="transition hover:text-white"
              >
                Cams MILF & Maduras
              </Link>
            </li>
            <li>
              <Link
                href="/explore?cat=petite"
                className="transition hover:text-white"
              >
                Modelos Petite & E-girls
              </Link>
            </li>
            <li>
              <Link
                href="/explore?cat=cosplay"
                className="transition hover:text-white"
              >
                Streamers Cosplay
              </Link>
            </li>
            <li>
              <Link
                href="/explore?cat=couples"
                className="transition hover:text-white"
              >
                Cams en Pareja
              </Link>
            </li>
            <li>
              <Link
                href="/explore?cat=trans"
                className="transition hover:text-white"
              >
                Modelos Trans
              </Link>
            </li>
            <li>
              <Link
                href="/explore?cat=alt"
                className="transition hover:text-white"
              >
                Modelos Alt & Goth
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
            Tipos de Show
          </h3>
          <ul className="space-y-2 text-xs">
            <li>
              <Link
                href="/explore?show=private"
                className="transition hover:text-white"
              >
                Shows Privados 1 a 1
              </Link>
            </li>
            <li>
              <Link
                href="/explore?show=lovense"
                className="transition hover:text-white"
              >
                Juguetes Interactivos Lovense
              </Link>
            </li>
            <li>
              <Link
                href="/explore?show=vip"
                className="transition hover:text-white"
              >
                Salas VIP & Lencería
              </Link>
            </li>
            <li>
              <Link
                href="/explore?show=asmr"
                className="transition hover:text-white"
              >
                Audio ASMR en Vivo
              </Link>
            </li>
            <li>
              <Link
                href="/explore?show=gaming"
                className="transition hover:text-white"
              >
                Transmisiones Gaming HD
              </Link>
            </li>
            <li>
              <Link
                href="/explore?show=debut"
                className="transition hover:text-white"
              >
                Nuevas Modelos Debutantes
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
            Explorar
          </h3>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/" className="transition hover:text-white">
                Directorio Principal
              </Link>
            </li>
            <li>
              <Link href="/explore" className="transition hover:text-white">
                Modelos en Tendencia
              </Link>
            </li>
            <li>
              <Link
                href="/explore?filter=free"
                className="transition hover:text-white"
              >
                Cams Gratuitas
              </Link>
            </li>
            <li>
              <Link href="/telegram" className="transition hover:text-white">
                Abrir en Telegram Mini App
              </Link>
            </li>
            <li>
              <Link href="/guides" className="transition hover:text-white">
                Guías y Consejos
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
            Legal & Soporte
          </h3>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/terms" className="transition hover:text-white">
                Términos de Servicio
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="transition hover:text-white">
                Política de Privacidad
              </Link>
            </li>
            <li>
              <Link href="/dmca" className="transition hover:text-white">
                Aviso DMCA
              </Link>
            </li>
            <li>
              <Link href="/usc-2257" className="transition hover:text-white">
                Declaración 18 U.S.C. 2257
              </Link>
            </li>
            <li>
              <Link href="/report" className="transition hover:text-white">
                Reportar Contenido
              </Link>
            </li>
            <li>
              <Link href="/contact" className="transition hover:text-white">
                Contacto
              </Link>
            </li>
            <li>
              <Link href="/affiliates" className="transition hover:text-white">
                Divulgación de Afiliados
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-7xl border-t border-white/10 pt-6 text-center text-xs leading-relaxed text-neutral-500 md:text-left">
        <p>
          © 2026 NaughtyXXXCams. Todos los derechos reservados. Todas las
          modelos que aparecen en este sitio tenían 18 años de edad o más al
          momento de la transmisión. Las marcas registradas pertenecen a sus
          respectivos dueños. Este sitio contiene enlaces de afiliados (
          <Link href="/affiliates" className="underline hover:text-neutral-400">
            saber más
          </Link>
          ); podemos recibir una comisión sin costo adicional para el usuario.
        </p>
      </div>
    </footer>
  );
}
