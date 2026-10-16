import { signal, bindHotkeys, writeClipboard } from 'fiboui'

export const menuOpen = signal(false)
export const nyc = signal('')
export const la = signal('')
export const copied = signal(false)
export const chapter = signal<'builders' | 'signals' | 'theme' | 'motion' | 'media'>('builders')
export const openFile = signal(0)

export function setChapter(next: 'builders' | 'signals' | 'theme' | 'motion' | 'media') {
  chapter.value = next
  openFile.value = 0
}

export function setOpenFile(index: number) {
  openFile.value = index
}

export function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

export function closeMenu() {
  menuOpen.value = false
}

bindHotkeys([
  {
    key: 'Escape',
    when: () => menuOpen.value,
    run: closeMenu,
  },
])

let copyTimer = 0

export async function copyInstall() {
  const ok = await writeClipboard('npm install fiboui')
  if (!ok) {
    copied.value = false
    return
  }
  copied.value = true
  clearTimeout(copyTimer)
  copyTimer = setTimeout(() => {
    copied.value = false
  }, 1600) as unknown as number
}

function stamp(timeZone: string, label: string) {
  const time = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone,
  }).format(new Date())
  return `${time.toUpperCase()} ${label}`
}

let clockStarted = false

export function startClock() {
  if (clockStarted) return
  clockStarted = true
  const tick = () => {
    nyc.value = stamp('America/New_York', 'NYC')
    la.value = stamp('America/Los_Angeles', 'LA')
  }
  tick()
  setInterval(tick, 1000)
}
