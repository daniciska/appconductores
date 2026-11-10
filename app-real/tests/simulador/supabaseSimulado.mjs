// Supabase SIMULADO para las pruebas de la app real (Node y recorridos con Playwright). Imita lo que
// responden Auth (GoTrue) y la API de datos (PostgREST) del proyecto dale-contacto para lo que usa la
// v1, con las reglas de la base (supabase/migrations): la cuenta nace al confirmar el código, cada uno ve
// y escribe solo lo suyo, los permisos por columna (sin `id` en consentimientos y experiencia), las
// llaves únicas, los 18 años, los negocios activos y habilitados por la licencia, y "quitar una clase
// quita los negocios que ya no habilita". No reemplaza a las pruebas SQL (supabase/pruebas): sirve para
// probar la app contra respuestas con la forma real, sin red y sin tocar la base de verdad.
//
// Uso:
//   const sim = crearSupabaseSimulado({ numerosDePrueba: { '56990000001': '123456' } });
//   createClient(url, clave, { global: { fetch: sim.fetch } })      // en Node
//   const r = sim.manejar({ method, url, headers, body })           // en page.route de Playwright
//   sim.pedidos                                                     // todo lo que llegó (para revisar su forma)
//   sim.fallar((p) => p.method === 'PATCH', 'red')                  // la próxima que calce falla
//   sim.fallar((p) => p.method === 'DELETE', 'red-despues')         // llega a la base, pero se pierde la respuesta
//   crearSupabaseSimulado({ creaCuenta: false })                    // el trigger de la cuenta falla
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'base-inicial.json'), 'utf8'));
const DIA_MS = 24 * 60 * 60 * 1000;

const copia = (x) => JSON.parse(JSON.stringify(x));
const b64url = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');

/** Columna dueña de cada tabla de personas (la RLS: cada uno ve y escribe solo lo suyo). */
const DUENO = {
  cuentas: 'id',
  conductores: 'id',
  conductor_licencias: 'conductor_id',
  conductor_negocios: 'conductor_id',
  conductor_opciones: 'conductor_id',
  experiencia_conductor: 'conductor_id',
  consentimientos: 'cuenta_id',
};
/** Llaves únicas (para el 23505 y para on_conflict). */
const LLAVES = {
  conductores: [['id']],
  conductor_licencias: [['conductor_id', 'clase_licencia_id', 'origen']],
  conductor_negocios: [['conductor_id', 'negocio_id']],
  conductor_opciones: [['conductor_id', 'opcion_id']],
  experiencia_conductor: [['conductor_id', 'tamano_vehiculo_id']],
};
const NOMBRE_LLAVE = {
  conductores: 'conductores_pkey',
  conductor_licencias: 'conductor_licencias_pkey',
  conductor_negocios: 'conductor_negocios_pkey',
  conductor_opciones: 'conductor_opciones_pkey',
  experiencia_conductor: 'experiencia_conductor_conductor_id_tamano_vehiculo_id_key',
};
/** Valores por defecto de las columnas (como en la base) al insertar. */
const DEFECTOS = {
  conductores: {
    comuna_id: null,
    tiene_estacionamiento: null,
    direccion: null,
    direccion_detalle: null,
    google_place_id: null,
    disponible: true,
    disponibilidad_confirmada_en: null,
    perfil_completo_en: null,
    tramo_garantia_id: null,
    datos_extra: {},
  },
  consentimientos: { revocado_en: null },
};
/** Tablas sin INSERT de `id` (el permiso de INSERT es por columnas). */
const INSERT_SIN_ID = ['consentimientos', 'experiencia_conductor'];

class ErrorPg extends Error {
  constructor(code, message, status) {
    super(message);
    this.code = code;
    this.status = status ?? (code === '23505' || code === '23503' ? 409 : code === '42501' ? 403 : 400);
  }
}

/** Hoy en Chile (como la base: now() at time zone 'America/Santiago'). */
function hoyEnChile(ms) {
  const f = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago', year: 'numeric', month: '2-digit', day: '2-digit' });
  return f.format(new Date(ms)); // aaaa-mm-dd
}

export function crearSupabaseSimulado(opciones = {}) {
  const numerosDePrueba = opciones.numerosDePrueba ?? { '56990000001': '123456' };
  /** false: el trigger que crea la cuenta falla (por ejemplo, un número que ya tiene otra cuenta). */
  const creaCuenta = opciones.creaCuenta ?? true;
  const ahora = opciones.ahora ?? (() => Date.now());
  const cat = copia(BASE);
  const ajustes = cat.ajustes;
  const datos = {
    cuentas: [],
    conductores: [],
    conductor_licencias: [],
    conductor_negocios: [],
    conductor_opciones: [],
    experiencia_conductor: [],
    consentimientos: [],
  };
  const usuarios = []; // { id, phone, phone_confirmed_at, created_at }
  const codigosPedidos = {}; // phone → ms del último pedido
  const tokens = {}; // access_token → uid
  const refrescos = {}; // refresh_token → uid
  const pedidos = [];
  const fallas = [];
  let secuencia = 0;
  let sinConexion = false;

  const iso = () => new Date(ahora()).toISOString();
  const nuevoId = () => {
    secuencia += 1;
    return `00000000-0000-4000-8000-${String(secuencia).padStart(12, '0')}`;
  };

  // --------------------------------------------------------------------- Auth
  function sesionPara(usuario) {
    const exp = Math.floor(ahora() / 1000) + 3600;
    const access = `${b64url({ alg: 'HS256', typ: 'JWT' })}.${b64url({ sub: usuario.id, role: 'authenticated', aud: 'authenticated', exp, phone: usuario.phone })}.${'firma' + nuevoId().slice(-6)}`;
    const refresh = `r-${nuevoId()}`;
    tokens[access] = usuario.id;
    refrescos[refresh] = usuario.id;
    return {
      access_token: access,
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: exp,
      refresh_token: refresh,
      user: {
        id: usuario.id,
        aud: 'authenticated',
        role: 'authenticated',
        phone: usuario.phone,
        phone_confirmed_at: usuario.phone_confirmed_at,
        confirmed_at: usuario.phone_confirmed_at,
        app_metadata: { provider: 'phone', providers: ['phone'] },
        user_metadata: {},
        identities: [],
        created_at: usuario.created_at,
        updated_at: iso(),
        is_anonymous: false,
      },
    };
  }

  const errorAuth = (status, code, message) => ({
    status,
    headers: { 'content-type': 'application/json', 'x-supabase-api-version': '2024-01-01' },
    body: JSON.stringify({ code, message }),
  });
  const jsonOk = (obj, status = 200) => ({ status, headers: { 'content-type': 'application/json' }, body: JSON.stringify(obj) });

  /** Lo que hace el trigger dale_contacto_sincronizar_cuenta al confirmarse el código. */
  function crearCuenta(u) {
    if (datos.cuentas.some((c) => c.id === u.id)) return;
    datos.cuentas.push({
      id: u.id,
      celular: '+' + u.phone,
      celular_verificado_en: u.phone_confirmed_at,
      creado_en: iso(),
      email: null,
      email_confirmado_en: null,
      nombres: null,
      primer_apellido: null,
      segundo_apellido: null,
      estado: 'activa',
      tokens_avisos: null,
    });
  }

  function auth(p, ruta, query, cuerpo) {
    if (p.method === 'POST' && ruta === 'otp') {
      const phone = String(cuerpo.phone ?? '').replace(/\D/g, '');
      if (!/^569\d{8}$/.test(phone)) return errorAuth(400, 'validation_failed', 'Invalid phone number format (E.164 required)');
      const ultimo = codigosPedidos[phone];
      if (ultimo !== undefined && ahora() - ultimo < 60_000) {
        const faltan = Math.ceil((60_000 - (ahora() - ultimo)) / 1000);
        return errorAuth(429, 'over_sms_send_rate_limit', `For security purposes, you can only request this after ${faltan} seconds.`);
      }
      codigosPedidos[phone] = ahora();
      if (!usuarios.some((u) => u.phone === phone)) usuarios.push({ id: nuevoId(), phone, phone_confirmed_at: null, created_at: iso() });
      // Proveedor de relleno: a un número que no está en la lista de prueba no se le puede enviar nada.
      if (!(phone in numerosDePrueba)) return errorAuth(422, 'sms_send_failed', 'Error sending sms OTP: Authenticate');
      return jsonOk({});
    }
    if (p.method === 'POST' && ruta === 'verify') {
      const phone = String(cuerpo.phone ?? '').replace(/\D/g, '');
      const u = usuarios.find((x) => x.phone === phone);
      if (!u || numerosDePrueba[phone] !== String(cuerpo.token ?? '')) return errorAuth(403, 'otp_expired', 'Token has expired or is invalid');
      if (!u.phone_confirmed_at) u.phone_confirmed_at = iso();
      if (creaCuenta) crearCuenta(u);
      return jsonOk(sesionPara(u));
    }
    if (p.method === 'POST' && ruta === 'token' && query.get('grant_type') === 'refresh_token') {
      const uid = refrescos[cuerpo.refresh_token];
      if (!uid) return errorAuth(400, 'refresh_token_not_found', 'Invalid Refresh Token: Refresh Token Not Found');
      delete refrescos[cuerpo.refresh_token];
      return jsonOk(sesionPara(usuarios.find((u) => u.id === uid)));
    }
    if (p.method === 'POST' && ruta === 'logout') {
      const t = (p.headers.authorization ?? '').replace(/^Bearer\s+/i, '');
      delete tokens[t];
      return { status: 204, headers: {}, body: '' };
    }
    if (p.method === 'GET' && ruta === 'user') {
      const uid = tokens[(p.headers.authorization ?? '').replace(/^Bearer\s+/i, '')];
      const u = usuarios.find((x) => x.id === uid);
      return u ? jsonOk(sesionPara(u).user) : errorAuth(401, 'bad_jwt', 'invalid JWT');
    }
    return errorAuth(404, 'not_found', `Ruta de Auth no simulada: ${p.method} ${ruta}`);
  }

  // --------------------------------------------------------------------- PostgREST
  function tablaDeCatalogo(nombre) {
    if (nombre === 'negocio_clases_licencia') return cat.negocios.flatMap((n) => n.negocio_clases_licencia);
    if (nombre === 'negocio_tamanos') return cat.negocios.flatMap((n) => n.negocio_tamanos);
    if (nombre === 'opciones') return cat.listas.flatMap((l) => l.opciones);
    return cat[nombre];
  }

  /** Divide la lista de select en el primer nivel ("a,b,rel(c,d)" → ["a","b","rel(c,d)"]). */
  function partesSelect(sel) {
    const partes = [];
    let nivel = 0;
    let actual = '';
    for (const ch of sel) {
      if (ch === '(') nivel++;
      if (ch === ')') nivel--;
      if (ch === ',' && nivel === 0) {
        partes.push(actual);
        actual = '';
      } else actual += ch;
    }
    if (actual) partes.push(actual);
    return partes.map((x) => x.trim()).filter(Boolean);
  }

  function proyectar(fila, sel) {
    if (!sel || sel === '*') return { ...fila };
    const salida = {};
    for (const parte of partesSelect(sel)) {
      const m = /^([a-z_]+)\((.*)\)$/s.exec(parte);
      if (m) {
        const hijos = Array.isArray(fila[m[1]]) ? fila[m[1]] : [];
        salida[m[1]] = hijos.map((h) => proyectar(h, m[2]));
      } else {
        if (!(parte in fila)) throw new ErrorPg('42703', `column ${parte} does not exist`, 400);
        salida[parte] = fila[parte];
      }
    }
    return salida;
  }

  /** Filtros de la URL (eq, neq, in, is). */
  function filtros(query) {
    const lista = [];
    for (const [col, val] of query.entries()) {
      if (['select', 'order', 'on_conflict', 'columns', 'limit', 'offset'].includes(col)) continue;
      const m = /^(eq|neq|in|is)\.(.*)$/s.exec(val);
      if (!m) throw new ErrorPg('PGRST100', `filtro no simulado: ${col}=${val}`, 400);
      lista.push({ col, op: m[1], valor: m[2] });
    }
    return (fila) =>
      lista.every(({ col, op, valor }) => {
        const v = fila[col];
        if (op === 'eq') return String(v) === valor;
        if (op === 'neq') return String(v) !== valor;
        if (op === 'is') return valor === 'null' ? v === null || v === undefined : String(v) === valor;
        const valores = valor
          .replace(/^\(|\)$/g, '')
          .split(',')
          .map((x) => x.replace(/^"|"$/g, ''));
        return valores.includes(String(v));
      });
  }

  function ordenar(filas, order) {
    if (!order) return filas;
    const [col, dir] = order.split('.');
    return [...filas].sort((a, b) => (a[col] < b[col] ? -1 : a[col] > b[col] ? 1 : 0) * (dir === 'desc' ? -1 : 1));
  }

  // --- Reglas de la base (triggers) ---
  function clasesHabilitan(negocio) {
    const codigos = negocio.negocio_clases_licencia.map((x) => cat.clases_licencia.find((c) => c.id === x.clase_licencia_id).codigo);
    const extra = codigos.includes('B') ? cat.clases_licencia.filter((c) => c.habilita_clase_b).map((c) => c.codigo) : [];
    return new Set([...codigos, ...extra]);
  }
  function licenciaHabilita(uid, negocioId) {
    const negocio = cat.negocios.find((n) => n.id === negocioId);
    if (!negocio) return false;
    const habilitan = clasesHabilitan(negocio);
    return datos.conductor_licencias
      .filter((l) => l.conductor_id === uid && l.origen === 'declarada')
      .some((l) => habilitan.has(cat.clases_licencia.find((c) => c.id === l.clase_licencia_id)?.codigo));
  }
  function validarFecha(fecha) {
    const hoy = hoyEnChile(ahora());
    if (fecha > hoy) throw new ErrorPg('23514', 'La fecha de nacimiento no puede ser futura.');
    const [a, m, d] = hoy.split('-');
    if (fecha > `${Number(a) - 18}-${m}-${d}`) throw new ErrorPg('23514', 'Tienes que tener 18 años o más.');
  }
  function antesDeGuardar(tabla, fila, uid, previa) {
    if (tabla === 'conductores') {
      if (!previa) {
        if (!datos.cuentas.some((c) => c.id === fila.id)) throw new ErrorPg('23503', 'insert or update on table "conductores" violates foreign key constraint "conductores_id_fkey"');
        fila.estado_perfil = 'incompleto';
        fila.estado_verificacion = 'sin_documentos';
        fila.perfil_completo_en = null;
        fila.creado_en = iso();
        fila.actualizado_en = iso();
        if (fila.disponibilidad_confirmada_en != null) fila.disponibilidad_confirmada_en = iso();
      } else {
        const cambiadas = ['id', 'estado_perfil', 'perfil_completo_en', 'estado_verificacion', 'creado_en'].filter((c) => c in fila && fila[c] !== previa[c]);
        if (cambiadas.length) throw new ErrorPg('42501', `No puedes cambiar: ${cambiadas.join(', ')}`);
        if ('disponibilidad_confirmada_en' in fila && fila.disponibilidad_confirmada_en !== previa.disponibilidad_confirmada_en) fila.disponibilidad_confirmada_en = iso();
        fila.actualizado_en = iso();
      }
      if ('fecha_nacimiento' in fila && (!previa || fila.fecha_nacimiento !== previa.fecha_nacimiento)) validarFecha(fila.fecha_nacimiento);
      if (fila.comuna_id != null && !cat.comunas.some((c) => c.id === Number(fila.comuna_id)))
        throw new ErrorPg('23503', 'insert or update on table "conductores" violates foreign key constraint "conductores_comuna_id_fkey"');
    }
    if (tabla === 'cuentas' && previa) {
      const cambiadas = ['id', 'celular', 'celular_verificado_en', 'creado_en', 'email_confirmado_en', 'estado', 'tokens_avisos'].filter(
        (c) => c in fila && fila[c] !== previa[c],
      );
      if (cambiadas.length) throw new ErrorPg('42501', `No puedes cambiar: ${cambiadas.join(', ')}`);
    }
    if (['conductor_licencias', 'conductor_negocios', 'conductor_opciones', 'experiencia_conductor'].includes(tabla)) {
      if (!datos.conductores.some((c) => c.id === fila.conductor_id))
        throw new ErrorPg('23503', `insert or update on table "${tabla}" violates foreign key constraint "${tabla}_conductor_id_fkey"`);
    }
    if (tabla === 'conductor_licencias') {
      if (fila.origen !== 'declarada') throw new ErrorPg('42501', `new row violates row-level security policy for table "${tabla}"`);
      if (!cat.clases_licencia.some((c) => c.id === Number(fila.clase_licencia_id))) throw new ErrorPg('23503', 'violates foreign key constraint "conductor_licencias_clase_licencia_id_fkey"');
    }
    if (tabla === 'conductor_negocios') {
      const n = cat.negocios.find((x) => x.id === Number(fila.negocio_id));
      const i = n && cat.industrias.find((x) => x.id === n.industria_id);
      if (!n || !n.activo || !i?.activo) throw new ErrorPg('23514', 'Ese negocio no está disponible.');
      if (!licenciaHabilita(uid, n.id)) throw new ErrorPg('23514', 'Tu licencia no habilita para ese negocio.');
    }
    if (tabla === 'conductor_opciones') {
      const o = cat.listas.flatMap((l) => l.opciones.map((x) => ({ ...x, lista: l.clave }))).find((x) => x.id === Number(fila.opcion_id));
      if (!o || !o.activa || !['turno', 'dia_semana', 'idioma'].includes(o.lista)) throw new ErrorPg('23514', 'Esa opción no se puede elegir.');
    }
    if (tabla === 'experiencia_conductor') {
      if (!cat.tamanos_vehiculo.some((t) => t.id === Number(fila.tamano_vehiculo_id))) throw new ErrorPg('23503', 'violates foreign key constraint "experiencia_conductor_tamano_vehiculo_id_fkey"');
      if (!(Number(fila.anos) >= 0 && Number(fila.anos) <= 70)) throw new ErrorPg('23514', 'new row violates check constraint "experiencia_conductor_anos_check"');
      fila.actualizado_en = iso();
    }
    if (tabla === 'consentimientos' && !previa) {
      const t = cat.textos_autorizacion.find((x) => x.id === Number(fila.texto_autorizacion_id));
      if (!t || !t.vigente) throw new ErrorPg('42501', 'new row violates row-level security policy for table "consentimientos"');
      if (datos.consentimientos.some((c) => c.cuenta_id === fila.cuenta_id && c.texto_autorizacion_id === Number(fila.texto_autorizacion_id) && !c.revocado_en))
        throw new ErrorPg('23505', 'duplicate key value violates unique constraint "consentimientos_una_activa"');
      fila.aceptado_en = iso();
      fila.revocado_en = null;
      fila.id = datos.consentimientos.length + 1;
    }
  }

  /** Al quitar una clase declarada se quitan los negocios que ya no habilita ninguna (trigger 6.13). */
  function despuesDeQuitarClase(uid) {
    datos.conductor_negocios = datos.conductor_negocios.filter((n) => n.conductor_id !== uid || licenciaHabilita(uid, n.negocio_id));
  }

  function choca(tabla, a, b) {
    return (LLAVES[tabla] ?? []).some((llave) => llave.every((c) => String(a[c]) === String(b[c])));
  }

  function rest(p, tabla, query, cuerpo, uid) {
    const prefer = p.headers.prefer ?? '';
    const representar = /return=representation/.test(prefer);
    const sel = query.get('select');
    const esPersona = tabla in DUENO;
    if (!esPersona && !tablaDeCatalogo(tabla)) throw new ErrorPg('42P01', `relation "public.${tabla}" does not exist`, 404);

    if (p.method === 'GET') {
      let filas;
      if (esPersona) {
        if (!uid) throw new ErrorPg('42501', `permission denied for table ${tabla}`, 401);
        filas = datos[tabla].filter((f) => f[DUENO[tabla]] === uid);
      } else if (tabla === 'textos_autorizacion') {
        filas = cat.textos_autorizacion.filter((t) => t.vigente);
      } else if (tabla === 'ajustes') {
        filas = ajustes.filter((a) => a.publico);
      } else {
        filas = tablaDeCatalogo(tabla);
      }
      const resultado = ordenar(filas.filter(filtros(query)), query.get('order')).map((f) => proyectar(f, sel));
      return jsonOk(resultado);
    }

    if (!esPersona) throw new ErrorPg('42501', `permission denied for table ${tabla}`, uid ? 403 : 401);
    if (!uid) throw new ErrorPg('42501', `permission denied for table ${tabla}`, 401);
    if (tabla === 'cuentas' && p.method !== 'PATCH' && p.method !== 'GET') throw new ErrorPg('42501', 'permission denied for table cuentas');

    if (p.method === 'PATCH') {
      const coincide = filtros(query);
      const cambiadas = [];
      // Todo o nada: se prueba sobre copias y recién después se guarda.
      const nuevas = datos[tabla].map((f) => {
        if (f[DUENO[tabla]] !== uid || !coincide(f)) return f;
        const fila = { ...f, ...cuerpo };
        antesDeGuardar(tabla, fila, uid, f);
        cambiadas.push(fila);
        return fila;
      });
      datos[tabla] = nuevas;
      if (representar) return jsonOk(cambiadas.map((f) => proyectar(f, sel)));
      return { status: 204, headers: {}, body: '' };
    }

    if (p.method === 'POST') {
      const filas = (Array.isArray(cuerpo) ? cuerpo : [cuerpo]).map((f) => ({ ...f }));
      if (INSERT_SIN_ID.includes(tabla) && filas.some((f) => 'id' in f)) throw new ErrorPg('42501', `permission denied for table ${tabla}`);
      const conflicto = query.get('on_conflict');
      const ignorar = /resolution=ignore-duplicates/.test(prefer);
      const mezclar = /resolution=merge-duplicates/.test(prefer);
      const copiaTabla = datos[tabla].map((f) => ({ ...f }));
      const devueltas = [];
      for (const f of filas) {
        if (f[DUENO[tabla]] !== uid) throw new ErrorPg('42501', `new row violates row-level security policy for table "${tabla}"`);
        const previa = copiaTabla.find((x) => choca(tabla, x, f));
        if (previa) {
          if (conflicto && ignorar) continue;
          if (conflicto && mezclar) {
            const fila = { ...previa, ...f };
            antesDeGuardar(tabla, fila, uid, previa);
            Object.assign(previa, fila);
            devueltas.push(previa);
            continue;
          }
          throw new ErrorPg('23505', `duplicate key value violates unique constraint "${NOMBRE_LLAVE[tabla]}"`);
        }
        const nueva = { ...(DEFECTOS[tabla] ?? {}), ...f };
        if (tabla === 'experiencia_conductor') nueva.id = copiaTabla.length + 1;
        antesDeGuardar(tabla, nueva, uid, null);
        copiaTabla.push(nueva);
        devueltas.push(nueva);
      }
      datos[tabla] = copiaTabla;
      if (representar) return jsonOk(devueltas.map((f) => proyectar(f, sel)), 201);
      return { status: 201, headers: {}, body: '' };
    }

    if (p.method === 'DELETE') {
      if (tabla === 'cuentas' || tabla === 'conductores' || tabla === 'consentimientos') throw new ErrorPg('42501', `permission denied for table ${tabla}`);
      const coincide = filtros(query);
      const antes = datos[tabla].length;
      datos[tabla] = datos[tabla].filter((f) => !(f[DUENO[tabla]] === uid && coincide(f)) || (tabla === 'conductor_licencias' && f.origen !== 'declarada'));
      if (tabla === 'conductor_licencias' && datos[tabla].length !== antes) despuesDeQuitarClase(uid);
      return { status: 204, headers: {}, body: '' };
    }
    throw new ErrorPg('PGRST000', `método no simulado: ${p.method}`, 405);
  }

  // --------------------------------------------------------------------- Entrada
  /**
   * Atiende un pedido. Devuelve { status, headers, body } o { red: true } (falla de red simulada).
   * p = { method, url, headers (con nombres en minúsculas), body (texto o null) }.
   */
  function manejar(p) {
    const url = new URL(p.url);
    const cuerpo = p.body ? JSON.parse(p.body) : {};
    const registro = { method: p.method, ruta: url.pathname, query: Object.fromEntries(url.searchParams), prefer: p.headers.prefer ?? null, body: p.body ? JSON.parse(p.body) : null };
    pedidos.push(registro);
    const falla = fallas.findIndex((f) => f.cuando(registro));
    if (falla >= 0) {
      const [f] = fallas.splice(falla, 1);
      if (f.respuesta === 'red') return { red: true };
      if (f.respuesta === 'red-despues') {
        // La base hace el cambio, pero la respuesta no llega (se cortó la red o venció el tiempo).
        responder(p, url, cuerpo);
        return { red: true };
      }
      return f.respuesta;
    }
    if (sinConexion) return { red: true };
    return responder(p, url, cuerpo);
  }

  function responder(p, url, cuerpo) {
    const mAuth = /^\/auth\/v1\/([a-z]+)$/.exec(url.pathname);
    if (mAuth) return auth(p, mAuth[1], url.searchParams, cuerpo);
    const mRest = /^\/rest\/v1\/([a-z_]+)$/.exec(url.pathname);
    if (mRest) {
      const portador = (p.headers.authorization ?? '').replace(/^Bearer\s+/i, '');
      const uid = tokens[portador] ?? null;
      // Un token de sesión que el servidor ya no reconoce (venció): PostgREST responde PGRST301.
      const rolDelToken = (() => {
        try {
          return JSON.parse(Buffer.from(portador.split('.')[1], 'base64url').toString('utf8')).role;
        } catch {
          return null;
        }
      })();
      if (!uid && portador.split('.').length === 3 && rolDelToken === 'authenticated') {
        return { status: 401, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ code: 'PGRST301', details: null, hint: null, message: 'JWT expired' }) };
      }
      try {
        return rest(p, mRest[1], url.searchParams, p.body ? JSON.parse(p.body) : null, uid);
      } catch (e) {
        if (!(e instanceof ErrorPg)) throw e;
        return { status: e.status, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ code: e.code, details: null, hint: null, message: e.message }) };
      }
    }
    return { status: 404, headers: {}, body: '' };
  }

  /** fetch para supabase-js en Node. */
  async function fetchSimulado(entrada, init = {}) {
    const url = typeof entrada === 'string' ? entrada : entrada.url;
    const headers = {};
    new Headers(init.headers ?? {}).forEach((v, k) => (headers[k.toLowerCase()] = v));
    if (init.signal?.aborted) throw new DOMException('This operation was aborted', 'AbortError');
    const r = manejar({ method: (init.method ?? 'GET').toUpperCase(), url, headers, body: typeof init.body === 'string' ? init.body : null });
    if (r.red) throw new TypeError('fetch failed');
    return new Response(r.status === 204 ? null : r.body, { status: r.status, headers: r.headers });
  }

  return {
    manejar,
    fetch: fetchSimulado,
    datos,
    usuarios,
    pedidos,
    catalogos: cat,
    /**
     * La próxima petición que cumpla `cuando` responde `respuesta`: 'red' (no llega), 'red-despues' (la
     * base la procesa, pero la respuesta se pierde) o { status, headers, body }.
     */
    fallar(cuando, respuesta = 'red') {
      fallas.push({ cuando, respuesta });
    },
    /** Sin conexión: todo falla hasta volver a llamarla con false. */
    sinConexion(v) {
      sinConexion = v;
    },
    /** Olvida la espera de 60 s entre códigos (para no esperar en las pruebas). */
    olvidarEsperas() {
      for (const k of Object.keys(codigosPedidos)) delete codigosPedidos[k];
    },
    /** Hace que el token actual venza (la próxima lectura con él da PGRST301). */
    vencerTokens() {
      for (const k of Object.keys(tokens)) delete tokens[k];
    },
    /** Además, los refresh tokens dejan de servir (la sesión ya no se puede renovar: hay que volver a entrar). */
    anularSesiones() {
      for (const k of Object.keys(tokens)) delete tokens[k];
      for (const k of Object.keys(refrescos)) delete refrescos[k];
    },
  };
}

export const DIA = DIA_MS;
