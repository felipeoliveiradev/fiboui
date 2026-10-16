/** Replace a range and keep the browser undo stack when the browser allows it. */
export function editText(
  el: HTMLTextAreaElement,
  start: number,
  end: number,
  text: string,
  selStart: number,
  selEnd: number,
) {
  el.focus()
  el.setSelectionRange(start, end)
  const wrote = document.execCommand('insertText', false, text)
  if (!wrote) el.setRangeText(text, start, end, 'end')
  el.setSelectionRange(selStart, selEnd)
}
