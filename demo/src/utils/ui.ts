// utils/ui.ts
type PopupType = 'loading' | 'success' | 'error' | 'info';

export interface PopupOptions {
  message: string;
  type?: PopupType;
  duration?: number | null; 
  dismissible?: boolean;    
  id?: string;              
}

export interface PopupHandle {
  update: (opts: Partial<PopupOptions>) => void;
  close: () => void;
  el: HTMLDivElement;
}

function ensureContainer(): HTMLDivElement {
  let c = document.querySelector<HTMLDivElement>('#__popup_container');
  if (!c) {
    c = document.createElement('div');
    c.id = '__popup_container';
    c.setAttribute('role', 'region');
    c.setAttribute('aria-live', 'polite');
    document.body.appendChild(c);
  }
  return c;
}

function iconFor(type: PopupType) {
  const map: Record<PopupType, string> = {
    loading: `<span class="pp-spinner" aria-hidden="true"></span>`,
    success: `<svg class="pp-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>`,
    error:   `<svg class="pp-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 1 21h22L12 2zm1 14h-2v2h2v-2zm0-8h-2v6h2V8z"/></svg>`,
    info:    `<svg class="pp-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M11 9h2V7h-2v2zm0 8h2v-6h-2v6zm1-14C6.48 3 3 6.48 3 11s3.48 8 8 8 8-3.48 8-8-3.48-8-8-8z"/></svg>`
  };
  return map[type] ?? map.info;
}

export function showPopup({
  message,
  type = 'info',
  duration = type === 'loading' ? null : 3000,
  dismissible = true,
  id,
}: PopupOptions): PopupHandle {
  const container = ensureContainer();

  // Evitar duplicados pelo mesmo id
  if (id) {
    const existing = container.querySelector<HTMLDivElement>(`.pp-toast[data-id="${id}"]`);
    if (existing) {
      existing.querySelector('.pp-msg')!.textContent = message;
      existing.setAttribute('data-type', type);
      return buildHandle(existing);
    }
  }

  const el = document.createElement('div');
  el.className = 'pp-toast';
  el.setAttribute('data-type', type);
  if (id) el.dataset.id = id;

  el.innerHTML = `
    <div class="pp-left">${iconFor(type)}</div>
    <div class="pp-content">
      <div class="pp-msg">${message}</div>
    </div>
    ${dismissible ? `<button class="pp-close" aria-label="Fechar">&times;</button>` : ``}
  `;

  el.querySelector('.pp-close')?.addEventListener('click', () => close());

  container.appendChild(el);

  requestAnimationFrame(() => el.classList.add('pp-in'));

  let timer: number | null = null;
  if (duration && duration > 0) {
    timer = window.setTimeout(() => close(), duration);
  }

  function close() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    el.classList.remove('pp-in');
    el.classList.add('pp-out');
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }

    function update(opts: Partial<PopupOptions>) {
        applyPopupUpdates(el, opts);
        if (opts.duration !== undefined) {
            if (timer) clearTimeout(timer);
            if (opts.duration && opts.duration > 0) {
                timer = window.setTimeout(() => close(), opts.duration);
            } else {
                timer = null;
            }
        }
    }

    return {update, close, el};
}


function applyPopupUpdates(el: HTMLDivElement, opts: Partial<PopupOptions>) {
  if (opts.message !== undefined) {
    el.querySelector('.pp-msg')!.textContent = opts.message;
  }
  if (opts.type) {
    el.setAttribute('data-type', opts.type);
    el.querySelector('.pp-left')!.innerHTML = iconFor(opts.type);
  }
}

function buildHandle(el: HTMLDivElement): PopupHandle {
  return {
    el,
    update: (opts) => {
      applyPopupUpdates(el, opts);
    },
    close: () => {
      el.classList.remove('pp-in');
      el.classList.add('pp-out');
      el.addEventListener('animationend', () => el.remove(), { once: true });
    }
  };
}