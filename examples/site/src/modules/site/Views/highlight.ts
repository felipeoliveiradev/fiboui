import { Column, Row, Text } from 'fiboui'

const mono = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
const keyword =
  /^(import|from|export|function|return|const|let|as|if|new|typeof|type)$/

type Token = { text: string; color: string }

function tokenize(line: string): Token[] {
  const out: Token[] = []
  const re = /\/\/.*$|'(?:\\.|[^'])*'|"(?:\\.|[^"])*"|`(?:\\.|[^`])*`|\b\d+(?:\.\d+)?\b|[A-Za-z_][A-Za-z0-9_]*|./g
  let match: RegExpExecArray | null
  while ((match = re.exec(line))) {
    const text = match[0]
    let color = '#f3f3f3'
    if (text.startsWith('//')) color = '#9a9a9a'
    else if (text.startsWith("'") || text.startsWith('"') || text.startsWith('`')) color = '#ffe7b0'
    else if (/^\d/.test(text)) color = '#ffe7b0'
    else if (keyword.test(text)) color = '#ff3b30'
    else if (/^[A-Z]/.test(text)) color = '#c5d4e8'
    out.push({ text, color })
  }
  if (out.length === 0) out.push({ text: ' ', color: '#f3f3f3' })
  return out
}

export function codeBlock(source: string) {
  const lines = source.replace(/\n$/, '').split('\n')
  return Column()
    .width('100%')
    .bg('#000000')
    .padding('16px 0')
    .crossAxisAlignment('stretch')
    .maxHeight(480)
    .overflow('auto')
    .children(
      lines.map((line, index) =>
        Row()
          .key(`line-${index}`)
          .hug()
          .minHeight(22)
          .crossAxisAlignment('center')
          .children([
            Text(String(index + 1))
              .width(44)
              .flexShrink('0')
              .textAlign('right')
              .fontFamily(mono)
              .fontSize(11)
              .lineHeight(1.6)
              .color('#5c5c5c'),
            Row()
              .hug()
              .padding('0 16px')
              .crossAxisAlignment('center')
              .children(
                tokenize(line).map((token, tokenIndex) =>
                  Text(token.text)
                    .key(`${index}-${tokenIndex}`)
                    .fontFamily(mono)
                    .fontSize(12)
                    .lineHeight(1.6)
                    .whiteSpace('pre')
                    .color(token.color),
                ),
              ),
          ]),
      ),
    )
}
