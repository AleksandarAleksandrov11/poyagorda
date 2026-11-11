/**
 * El interrogatorio. Una terminal con tres caminos según la primera respuesta,
 * que te insulta un poco y acaba pidiéndote el email. Todo el texto está aquí arriba para tocarlo fácil.
 */
import { track } from './consent';

type Option = { label: string; reply: string };
type Question = { key: string; ask: string; options: Option[] };

const INTRO = [
  'Vaya. Otro curioso.',
  'Esto es un acceso restringido. Solo entra gente con huevos. O con ovarios, que aquí no discriminamos.',
  'Rapidito, que no tenemos todo el día.',
];

const QUESTIONS: Question[] = [
  {
    key: 'negocio',
    ask: '¿Tienes un negocio?',
    options: [
      { label: 'Sí, y me da guerra', reply: 'Normal. Seguro que estás tirando dinero en algo. Seguimos.' },
      { label: 'Estoy en ello', reply: 'Llegas a tiempo de no cagarla. Seguimos.' },
      { label: 'No, solo cotilleo', reply: 'Cotilla de mierda. Nos caes bien. Seguimos.' },
    ],
  },
  {
    key: 'gasto',
    ask: '¿Cuánto has tirado en marketing que no ha servido para una puta mierda?',
    options: [
      { label: 'Poco', reply: 'Mentiroso.' },
      { label: 'Una pasta', reply: 'Lo sabemos. Se te nota en la cara.' },
      { label: 'Prefiero no hablarlo', reply: 'Tranquilo, aquí no juzgamos. Bueno, un poco sí.' },
    ],
  },
  {
    key: 'claridad',
    ask: '¿Sabes qué necesita tu negocio de verdad?',
    options: [
      { label: 'Ni puta idea', reply: 'Por fin alguien honesto. Para eso existimos.' },
      { label: 'Más seguidores', reply: 'Error. Eso dice todo el mundo y luego no venden ni un café.' },
      { label: 'Creo que sí', reply: 'Creer es gratis. Saberlo cuesta un poco más.' },
    ],
  },
];

/**
 * Caminos cortos: "Estoy en ello" y "Solo cotilleo". Una frase, una pregunta para que
 * el visitante participe (sin preguntarle por su negocio), su parrafada, el nombre y el email.
 * El índice coincide con la opción de la primera pregunta.
 */
type Path = {
  opener: string;
  question: Question;
  lines: string[];
  nameReply: (name: string) => string;
  cta: string;
  button: string;
  note: string;
};
const PATHS: Record<number, Path> = {
  1: {
    opener: 'Llegas a tiempo de no cagarla.',
    question: {
      key: 'freno',
      ask: '¿Qué te está frenando para empezar?',
      options: [
        { label: 'No tengo ni puta idea de por dónde empezar', reply: 'Normal. Nadie lo sabe. La diferencia es que algunos lo admiten.' },
        { label: 'Tengo la idea, pero me falta dinero', reply: 'El dinero se encuentra. Lo jodido es no tirarlo en lo que no toca.' },
        { label: 'Estoy esperando el momento perfecto', reply: 'Spoiler: no existe. Pero vale, esperamos contigo un rato.' },
      ],
    },
    lines: [
      'Montar un negocio tiene dos partes.',
      'La de tener una idea cojonuda.',
      'Y la de descubrir que tener una idea cojonuda no es suficiente.',
      'De vez en cuando contamos historias que igual te ahorran algún disgusto. O te provocan otro.',
    ],
    nameReply: (name) => `${name}. Apuntado. Ahora a ver si lo montas.`,
    cta: '¿Quieres que te las contemos?',
    button: 'Quiero estar dentro',
    note: 'Historias, ideas y alguna que otra verdad incómoda. Dos o tres correos a la semana. Baja cuando quieras.',
  },
  2: {
    opener: 'Cotilla de mierda. Nos caes bien.',
    question: {
      key: 'motivo',
      ask: '¿Y tú qué cojones haces todavía aquí?',
      options: [
        { label: 'Me puede la curiosidad', reply: 'Dicen que la curiosidad mató al gato. Pero el gato murió sabiendo.' },
        { label: 'Me está haciendo gracia esta mierda', reply: 'Esa es la idea. Aguanta, que lo mejor viene ahora.' },
        { label: 'Quiero saber quién está detrás', reply: 'Todo a su tiempo. Primero queremos saber quién eres tú.' },
      ],
    },
    lines: [
      'No tienes un negocio. No quieres vendernos nada. Y aun así sigues aquí.',
      'Nos gusta la gente que pierde el tiempo con criterio.',
      '',
      'Te vamos a contar algo.',
      'Hay cosas que no vamos a publicar en Instagram.',
      'Historias, ideas y alguna que otra gilipollez que igual termina teniendo sentido.',
    ],
    nameReply: (name) => `${name}. Nombre de cotilla profesional.`,
    cta: '¿Quieres seguir cotilleando?',
    button: 'Soy un cotilla. ¿Y qué?',
    note: 'Dos o tres correos a la semana. Sin spam. Puedes darte de baja cuando quieras.',
  },
};

const MAIN_BUTTON = 'Meterme dentro';
const MAIN_NOTE = 'Dos o tres correos a la semana. Sin spam. Baja cuando quieras.';

const PRE_NAME = [
  'Vale. Has aguantado más que la mayoría.',
  'Estamos preparando algo gordo. Muy gordo. Y solo se lo vamos a contar a los que estén dentro.',
];

const ASK_NAME = '¿Cómo te llamas? Si eres de los misteriosos, déjalo en blanco y dale a Enter.';
const ASK_EMAIL = 'Ahora tu email. El de verdad, no el que usas para el spam.';
const ASK_CONSENT = 'Última cosa. La parte legal, que si no nos crujen. Marca la casilla y para dentro.';

const BAD_EMAIL = [
  'Eso no es un email ni de coña. Otra vez.',
  '¿Te tiembla el dedo? Revisa eso.',
  'Venga, que tú puedes. Con su arroba y todo.',
  'Tercera vez. Empezamos a preocuparnos por ti.',
];

const INSULTS = [
  'gilipollas', 'idiota', 'imbecil', 'tonto', 'tonta', 'capullo', 'capulla', 'cabron', 'cabrona',
  'subnormal', 'mierda', 'puta', 'puto', 'polla', 'pollas', 'coño', 'cono', 'joder', 'hostia',
  'pringao', 'pringado', 'payaso', 'mamon', 'gilipolla', 'zorra', 'culo', 'caca', 'pedo',
];

const TYPO_DOMAINS: Record<string, string> = {
  'gmial.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmal.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gmail.co': 'gmail.com',
  'gmail.con': 'gmail.com',
  'gmail.es': 'gmail.com',
  'hotmial.com': 'hotmail.com',
  'hotmal.com': 'hotmail.com',
  'hotmail.con': 'hotmail.com',
  'hotmail.co': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'outlook.con': 'outlook.com',
  'yaho.com': 'yahoo.com',
  'yahoo.con': 'yahoo.com',
  'icloud.con': 'icloud.com',
};

const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[a-z]{2,}$/i;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const normalize = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

export function initGate() {
  const term = document.querySelector<HTMLElement>('[data-term]');
  if (!term) return;

  const log = term.querySelector<HTMLElement>('[data-log]')!;
  const sr = term.querySelector<HTMLElement>('[data-sr]')!;
  const controls = term.querySelector<HTMLElement>('[data-controls]')!;
  const boot = term.querySelector<HTMLButtonElement>('[data-boot]');
  const resetBtn = term.querySelector<HTMLButtonElement>('[data-reset]')!;
  const consentTpl = document.querySelector<HTMLTemplateElement>('template[data-tpl="consent"]')!;
  const inside = document.querySelector<HTMLElement>('[data-inside]')!;
  const insideMsg = inside.querySelector<HTMLElement>('[data-inside-msg]')!;
  const insideTitle = inside.querySelector<HTMLElement>('[data-inside-title]')!;
  const insideClose = inside.querySelector<HTMLButtonElement>('[data-inside-close]')!;
  const consentVersion = term.dataset.consentVersion || '';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  let started = false;
  let fast = false;
  let run = 0; // invalida secuencias antiguas al reiniciar
  let badEmails = 0;
  let startedAt = 0;
  const state: { answers: Record<string, string>; name: string; email: string } = {
    answers: {},
    name: '',
    email: '',
  };

  /* ---------- salida ---------- */

  const scrollLog = () => {
    log.scrollTop = log.scrollHeight;
  };
  // Cuando cambian los controles (opciones, formulario...) el log encoge: mantenlo pegado abajo.
  if ('ResizeObserver' in window) new ResizeObserver(scrollLog).observe(log);

  const announce = (text: string) => {
    const p = document.createElement('p');
    p.textContent = text;
    sr.appendChild(p);
  };

  async function print(text: string, kind: 'say' | 'sys' | 'you' | 'err' | 'ask' | 'cta' = 'say', myRun = run) {
    if (myRun !== run) return;
    if (!text) {
      const gap = document.createElement('div');
      gap.className = 't-gap';
      log.appendChild(gap);
      await sleep(fast || reduceMotion ? 40 : 260);
      return;
    }
    const line = document.createElement('p');
    line.className = `t-line t-${kind === 'ask' ? 'say t-ask' : kind === 'cta' ? 'say t-ask t-cta' : kind}`;
    log.appendChild(line);
    announce(kind === 'you' ? `Tú: ${text}` : text);

    if (reduceMotion || kind === 'you' || fast) {
      line.textContent = text;
      scrollLog();
      await sleep(fast || reduceMotion ? 40 : 120);
      return;
    }

    line.classList.add('is-typing');
    for (let i = 1; i <= text.length; i++) {
      if (myRun !== run) return;
      if (fast) {
        line.textContent = text;
        break;
      }
      line.textContent = text.slice(0, i);
      scrollLog();
      const ch = text[i - 1];
      await sleep(/[.?!]/.test(ch) && i < text.length ? 160 : /,/.test(ch) ? 70 : 16 + Math.random() * 14);
    }
    line.classList.remove('is-typing');
    scrollLog();
    await sleep(fast ? 40 : 280);
  }

  async function printAll(lines: string[], kind: 'say' | 'sys' = 'say') {
    const myRun = run;
    for (const l of lines) {
      if (myRun !== run) return;
      await print(l, kind, myRun);
    }
  }

  const clearControls = () => {
    controls.replaceChildren();
  };

  /* ---------- entradas ---------- */

  function choose(options: string[]): Promise<number> {
    return new Promise((resolve) => {
      clearControls();
      const wrap = document.createElement('div');
      wrap.className = 't-options';
      wrap.setAttribute('role', 'group');
      wrap.setAttribute('aria-label', 'Elige una respuesta');
      const finish = (i: number) => {
        document.removeEventListener('keydown', onKey);
        clearControls();
        resolve(i);
      };
      options.forEach((label, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 't-opt';
        b.innerHTML = `<kbd aria-hidden="true">${i + 1}</kbd><span></span>`;
        b.querySelector('span')!.textContent = label;
        b.addEventListener('click', () => finish(i));
        wrap.appendChild(b);
      });
      const onKey = (e: KeyboardEvent) => {
        const el = e.target as HTMLElement;
        if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) return;
        const n = Number(e.key);
        if (n >= 1 && n <= options.length) {
          e.preventDefault();
          finish(n - 1);
        }
      };
      document.addEventListener('keydown', onKey);
      controls.appendChild(wrap);
      fast = false;
    });
  }

  function ask(opts: {
    label: string;
    type: 'text' | 'email';
    placeholder: string;
    autocomplete: string;
    maxLength: number;
  }): Promise<string> {
    return new Promise((resolve) => {
      clearControls();
      const form = document.createElement('form');
      form.className = 't-form';
      form.noValidate = true;
      const id = `t-in-${opts.type}`;
      form.innerHTML = `
        <label class="t-form__prompt" for="${id}"><span aria-hidden="true">&gt;</span><span class="sr-only"></span></label>
        <input id="${id}" />
        <button type="submit" class="t-form__send">Enviar</button>`;
      form.querySelector('.sr-only')!.textContent = opts.label;
      const input = form.querySelector('input')!;
      input.type = opts.type;
      input.name = opts.type === 'email' ? 'email' : 'name';
      input.placeholder = opts.placeholder;
      input.autocomplete = opts.autocomplete as AutoFill;
      input.maxLength = opts.maxLength;
      input.spellcheck = false;
      input.setAttribute('autocapitalize', opts.type === 'email' ? 'off' : 'words');
      input.setAttribute('enterkeyhint', 'send');
      if (opts.type === 'email') input.inputMode = 'email';
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        resolve(input.value.trim());
      });
      controls.appendChild(form);
      fast = false;
      if (finePointer) input.focus({ preventScroll: true });
    });
  }

  let consentResolve: ((v: { website: string; origin: DOMRect }) => void) | null = null;

  type ConsentOpts = { withEmail?: boolean; button: string; note: string };

  /** Validación del email con sus insultos. Devuelve el email bueno o null. */
  async function checkEmail(raw: string, input?: HTMLInputElement): Promise<string | null> {
    const email = raw.trim().toLowerCase();
    if (!EMAIL_RE.test(email) || email.length > 254) {
      await print(BAD_EMAIL[Math.min(badEmails++, BAD_EMAIL.length - 1)], 'err');
      input?.focus();
      return null;
    }
    const [user, domain] = email.split('@');
    const fix = TYPO_DOMAINS[domain];
    if (fix && input) {
      // En el formulario corto lo corregimos en el campo y que vuelva a pulsar.
      input.value = `${user}@${fix}`;
      await print(`¿${domain}? Querrás decir ${fix}, figura. Te lo he corregido. Dale otra vez.`, 'err');
      input.focus();
      return null;
    }
    return email;
  }

  function consent(opts: ConsentOpts): Promise<{ website: string; origin: DOMRect }> {
    return new Promise((resolve) => {
      consentResolve = resolve;
      // Si el formulario ya está (reintento tras error), se reutiliza tal cual.
      const existing = controls.querySelector<HTMLButtonElement>('.term__consent [data-submit]');
      if (existing) {
        existing.disabled = false;
        existing.textContent = opts.button;
        return;
      }
      clearControls();
      const frag = consentTpl.content.cloneNode(true) as DocumentFragment;
      const form = frag.querySelector('form')!;
      const box = form.querySelector<HTMLInputElement>('[data-consent]')!;
      const label = box.closest('label')!;
      const submit = form.querySelector<HTMLButtonElement>('[data-submit]')!;
      const emailRow = form.querySelector<HTMLElement>('[data-email-row]')!;
      const emailInput = form.querySelector<HTMLInputElement>('input[name="email"]')!;
      const note = form.querySelector<HTMLElement>('[data-note]')!;
      submit.textContent = opts.button;
      note.textContent = opts.note;
      emailRow.hidden = !opts.withEmail;
      emailInput.disabled = !opts.withEmail;
      box.addEventListener('change', () => label.classList.remove('is-wrong'));
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!consentResolve || submit.disabled) return;
        if (opts.withEmail) {
          const ok = await checkEmail(emailInput.value, emailInput);
          if (!ok) return;
          state.email = ok;
        }
        if (!box.checked) {
          label.classList.remove('is-wrong');
          void label.offsetWidth;
          label.classList.add('is-wrong');
          await print('Sin marcar la casilla no hay fiesta. Es la ley, no nos mires así.', 'err');
          box.focus();
          return;
        }
        if (!consentResolve) return;
        const website = (form.querySelector<HTMLInputElement>('input[name="website"]')?.value || '').trim();
        const done = consentResolve;
        consentResolve = null;
        done({ website, origin: submit.getBoundingClientRect() });
      });
      controls.appendChild(frag);
      fast = false;
      if (opts.withEmail && finePointer) emailInput.focus({ preventScroll: true });
    });
  }

  /* ---------- envío ---------- */

  async function send(website: string): Promise<{ ok: boolean; status?: string; code?: number }> {
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: state.email,
          name: state.name,
          answers: state.answers,
          consent: true,
          consentVersion,
          website,
          elapsed: Math.round(performance.now() - startedAt),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; status?: string };
      return { ok: res.ok && Boolean(data.ok), status: data.status, code: res.status };
    } catch {
      return { ok: false, code: 0 };
    }
  }

  function openInside(origin: DOMRect, status: string) {
    const titles: Record<string, string> = {
      pending: 'Casi dentro.',
      subscribed: 'Estás dentro.',
      exists: 'Ya estabas dentro.',
    };
    const msgs: Record<string, string> = {
      pending:
        'Te acabamos de mandar un correo. Ábrelo y confirma, o no existes. Mira en spam, que nos conocemos.',
      subscribed: 'Ya eres de los nuestros. Cuando haya algo gordo que contar, serás de los primeros. Ni una palabra a nadie.',
      exists: 'Este email ya estaba en la lista, pesado. Si no te llega nada, mira en spam o confirma el correo que te mandamos.',
    };
    insideTitle.textContent = titles[status] || titles.subscribed;
    insideMsg.textContent = msgs[status] || msgs.subscribed;
    inside.style.setProperty('--ox', `${origin.left + origin.width / 2}px`);
    inside.style.setProperty('--oy', `${origin.top + origin.height / 2}px`);
    inside.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    requestAnimationFrame(() => requestAnimationFrame(() => inside.classList.add('is-open')));
    setTimeout(() => insideClose.focus({ preventScroll: true }), reduceMotion ? 0 : 700);
  }

  function closeInside() {
    if (inside.hidden) return;
    inside.classList.remove('is-open');
    document.documentElement.style.overflow = '';
    setTimeout(() => {
      inside.hidden = true;
      resetBtn.focus({ preventScroll: true });
    }, reduceMotion ? 0 : 900);
  }

  insideClose.addEventListener('click', closeInside);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeInside();
  });
  inside.addEventListener('keydown', (e) => {
    // trampa de foco mínima: solo hay un botón
    if (e.key === 'Tab') {
      e.preventDefault();
      insideClose.focus();
    }
  });

  /* ---------- guion ---------- */

  /** Pregunta con tres respuestas y su contestación. Guarda la elegida. */
  async function askQuestion(q: Question) {
    const myRun = run;
    await print(q.ask, 'ask');
    if (myRun !== run) return;
    const i = await choose(q.options.map((o) => o.label));
    if (myRun !== run) return;
    state.answers[q.key] = q.options[i].label;
    await print(q.options[i].label, 'you');
    await print(q.options[i].reply);
  }

  /** Nombre opcional, con sus bromas. La contestación final cambia según el camino. */
  async function askName(reply: (name: string) => string) {
    const myRun = run;
    await print(ASK_NAME, 'ask');
    const rawName = (
      await ask({ label: 'Tu nombre (opcional)', type: 'text', placeholder: 'tu nombre, o nada', autocomplete: 'given-name', maxLength: 40 })
    ).replace(/\s+/g, ' ');
    if (myRun !== run) return;
    await print(rawName || '(silencio incómodo)', 'you');
    const n = normalize(rawName);
    const words = n.split(/[^a-zñ]+/);
    if (!rawName) {
      state.name = '';
      await print('Anónimo. Misterioso. Nos gusta.');
    } else if (n.includes('poyagorda') || n.includes('pollagorda')) {
      state.name = '';
      await print('Ese nombre ya está pillado, listillo. Te llamaremos Anónimo.');
    } else if (words.some((w) => INSULTS.includes(w))) {
      state.name = '';
      await print('Qué original. Te vamos a llamar Anónimo, que es más elegante.');
    } else {
      state.name = rawName.replace(/(^|\s)\p{L}/gu, (m) => m.toUpperCase());
      await print(reply(state.name));
    }
  }

  async function script() {
    const myRun = run;
    const alive = () => myRun === run;
    startedAt = performance.now();
    track('gate_start');

    await print('conectando con el sótano...', 'sys');
    await printAll(INTRO);
    if (!alive()) return;

    // Primera pregunta: decide el camino.
    const first = QUESTIONS[0];
    await print(first.ask, 'ask');
    if (!alive()) return;
    const pick = await choose(first.options.map((o) => o.label));
    if (!alive()) return;
    state.answers[first.key] = first.options[pick].label;
    await print(first.options[pick].label, 'you');
    track('gate_path', { path: pick });

    const path = PATHS[pick];
    if (path) {
      // Camino corto: frase, una pregunta, su parrafada, nombre y email.
      await print(path.opener);
      if (!alive()) return;
      await askQuestion(path.question);
      if (!alive()) return;
      await printAll(path.lines);
      if (!alive()) return;
      await askName(path.nameReply);
      if (!alive()) return;
      await print(path.cta, 'cta');
      if (!alive()) return;
      await submitLoop({ withEmail: true, button: path.button, note: path.note });
      return;
    }

    // Camino completo ("Sí, y me da guerra").
    await print(first.options[pick].reply);
    for (const q of QUESTIONS.slice(1)) {
      await askQuestion(q);
      if (!alive()) return;
    }

    await printAll(PRE_NAME);
    if (!alive()) return;

    // Nombre
    await askName((name) => `${name}. Nombre de alguien que está a punto de dejar de tirar el dinero.`);
    if (!alive()) return;

    // Email
    await print(ASK_EMAIL, 'ask');
    for (;;) {
      const email = (
        await ask({ label: 'Tu email', type: 'email', placeholder: 'tu@correo.com', autocomplete: 'email', maxLength: 254 })
      ).toLowerCase();
      if (!alive()) return;
      await print(email || '(nada)', 'you');
      if (!EMAIL_RE.test(email) || email.length > 254) {
        await print(BAD_EMAIL[Math.min(badEmails++, BAD_EMAIL.length - 1)], 'err');
        continue;
      }
      const domain = email.split('@')[1];
      const fix = TYPO_DOMAINS[domain];
      if (fix) {
        await print(`¿${domain}? Querrás decir ${fix}, figura.`, 'err');
        const i = await choose([`Sí, ${email.split('@')[0]}@${fix}`, `No, ${domain} está bien`]);
        if (!alive()) return;
        if (i === 0) {
          state.email = `${email.split('@')[0]}@${fix}`;
          await print('Arreglado. De nada.', 'say');
        } else {
          state.email = email;
          await print('Tú sabrás.', 'say');
        }
      } else {
        state.email = email;
      }
      break;
    }
    await print(`Apuntado: ${state.email}`, 'sys');

    await print(ASK_CONSENT, 'ask');
    await submitLoop({ button: MAIN_BUTTON, note: MAIN_NOTE });
  }

  /** Muestra la casilla legal (y el email si toca), envía y gestiona errores hasta que salga bien. */
  async function submitLoop(opts: ConsentOpts) {
    const myRun = run;
    const alive = () => myRun === run;
    for (;;) {
      const { website, origin } = await consent(opts);
      if (!alive()) return;
      const submit = controls.querySelector<HTMLButtonElement>('[data-submit]');
      if (submit) {
        submit.disabled = true;
        submit.textContent = 'Abriendo la puerta...';
      }
      const res = await send(website);
      if (!alive()) return;
      if (res.ok) {
        const status = res.status || 'subscribed';
        clearControls();
        track('subscribe', { status });
        if (opts.withEmail) await print(`Apuntado: ${state.email}`, 'sys');
        await print('Hecho.', 'say');
        await print(
          status === 'pending'
            ? 'Te hemos mandado un correo. Si no lo confirmas, no existes.'
            : status === 'exists'
              ? 'Ya estabas en la lista, pesado.'
              : 'Ya estás dentro. Ni una palabra a nadie.',
        );
        openInside(origin, status);
        resetBtn.hidden = false;
        await print('Sesión cerrada. Puedes irte. O quedarte mirando, tú mismo.', 'sys');
        return;
      }
      track('subscribe_error', { code: res.code ?? 0 });
      if (res.code === 429) {
        await print('Para el carro. Demasiados intentos. Vuelve en un rato.', 'err');
      } else if (res.code === 400) {
        await print('Algo de lo que has puesto no cuadra. Revisa el email y vuelve a intentarlo.', 'err');
      } else {
        await print('Se nos ha roto algo. No es culpa tuya (esta vez). Dale otra vez.', 'err');
      }
    }
  }

  function start() {
    if (started) return;
    started = true;
    clearControls();
    resetBtn.hidden = false;
    void script();
  }

  function reset() {
    run++;
    fast = false;
    consentResolve = null;
    badEmails = 0;
    state.answers = {};
    state.name = '';
    state.email = '';
    log.replaceChildren();
    sr.replaceChildren();
    clearControls();
    started = false;
    start();
  }

  boot?.addEventListener('click', start);
  resetBtn.addEventListener('click', reset);

  // Acelerar el texto: clic en la pantalla de la terminal o espacio/enter.
  log.addEventListener('click', () => {
    if (started) fast = true;
  });
  document.addEventListener('keydown', (e) => {
    if (!started) return;
    const el = e.target as HTMLElement;
    if (el && ['INPUT', 'TEXTAREA', 'BUTTON', 'A', 'SELECT'].includes(el.tagName)) return;
    if ((e.key === ' ' || e.key === 'Enter') && !controls.children.length) {
      const rect = term.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        e.preventDefault();
        fast = true;
      }
    }
  });

  // Arranca solo cuando la terminal está a la vista.
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          io.disconnect();
          setTimeout(start, 350);
        }
      },
      { threshold: 0.25 },
    );
    io.observe(term);
  }

  // Los botones "Entrar" llevan aquí y arrancan.
  document.querySelectorAll('[data-enter]').forEach((a) =>
    a.addEventListener('click', () => {
      setTimeout(start, 600);
    }),
  );
}
