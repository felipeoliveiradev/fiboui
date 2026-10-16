const { computeLabels } = require('./computeLabels');

function assertIncludes(names, need, context) {
  for (const n of need) {
    if (!names.includes(n)) {
      console.error(`FAIL (${context}): expected`, n, 'got', names);
      process.exit(1);
    }
  }
}

// --- existing Column / Row / Box nesting ---
const nested = `
function Splash() {
  return Column()
    .crossAxisAlignment('center')
    .children([
      Box().height(160),
      Row()
        .mainAxisAlignment('spaceBetween')
        .children([
          Text('A'),
          Text('B'),
        ]),
      Box()
        .padding(8)
        .children([
          Text('nested'),
        ]),
    ]);
}
`;

{
  const labels = computeLabels(nested, 1);
  console.log('nested:', JSON.stringify(labels, null, 2));
  assertIncludes(
    labels.map((l) => l.label),
    ['Column', 'Row', 'Box'],
    'nested'
  );
  console.log('ok nested', labels.length, 'labels');
}

// --- Form children + List fluent chain (no multi-line List paren) ---
const formList = `
Column().gap(12).padding(24).children([
  Form().gap(12).validation({...}).onSubmit(...).afterSubmit(...).children([
    TextField().name('title').placeholder('New todo'),
    Button('Ship it').submit(),
  ]),
  List()
    .variant('card')
    .items(todos)
    .renderItem((todo) => ListTile().title(todo.title).chevron(true))
    .itemStyle((s) =>
      s.padding(0).bg('#f7f7f7').rounded(0).paddingHorizontal(12)
    )
    .itemHover((h) => h.bg('#f3f4f6')),
  Text(\`Total todos: \${todos.$length}\`).fontSize(14).muted(),
])
`;

{
  const labels = computeLabels(formList, 1);
  console.log('formList:', JSON.stringify(labels, null, 2));
  const names = labels.map((l) => l.label);
  assertIncludes(names, ['Form', 'List', 'Column'], 'formList');

  // List label must sit after itemHover's close (chain end), not on children/items
  const list = labels.find((l) => l.label === 'List');
  const near = formList.slice(Math.max(0, list.offset - 80), list.offset);
  if (!near.includes('itemHover')) {
    console.error('FAIL (formList): List label offset not near itemHover close', near);
    process.exit(1);
  }

  // Optional: multi-line itemStyle callback close
  if (!names.includes('itemStyle')) {
    console.error('FAIL (formList): expected optional itemStyle label, got', names);
    process.exit(1);
  }

  console.log('ok formList', labels.length, 'labels');
}

console.log('all ok');
