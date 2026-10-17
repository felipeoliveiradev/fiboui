const { suggestIndent } = require('./suggestIndent');

const unit = '  ';
let failed = 0;

function assertEq(name, actual, expected) {
  if (actual !== expected) {
    console.error(`FAIL ${name}: got ${JSON.stringify(actual)} expected ${JSON.stringify(expected)}`);
    failed++;
  } else {
    console.log(`ok ${name}`);
  }
}

// After .children([ → +1 indent
assertEq(
  'children open',
  suggestIndent('  .children([', '', '  ', 2, unit),
  '    '
);

assertEq(
  'items open',
  suggestIndent('    .items([', '', '    ', 2, unit),
  '      '
);

// After factory → continuation indent when next is empty / `.`
assertEq(
  'factory then empty',
  suggestIndent('Column()', '', '', 2, unit),
  '  '
);

assertEq(
  'return factory then dot',
  suggestIndent("  return Form()", '  .gap(12)', '  ', 2, unit),
  '    '
);

assertEq(
  'factory then non-chain leaves alone',
  suggestIndent('Column()', 'foo()', '', 2, unit),
  null
);

// Chain continuation keeps same indent
assertEq(
  'chain continues',
  suggestIndent('  .gap(12)', '', '  ', 2, unit),
  '  '
);

assertEq(
  'chain continues with next .method',
  suggestIndent('  .gap(12)', '  .padding(8)', '  ', 2, unit),
  '  '
);

// itemStyle / itemHover callbacks
assertEq(
  'itemStyle callback',
  suggestIndent('  .itemStyle((s) =>', '', '  ', 2, unit),
  '    '
);

assertEq(
  'itemHover callback',
  suggestIndent('    .itemHover((h) =>', '', '    ', 2, unit),
  '      '
);

assertEq(
  'itemStyle block',
  suggestIndent('  .itemStyle((s) => {', '', '  ', 2, unit),
  '    '
);

// Unclosed .method(
assertEq(
  'open method call',
  suggestIndent('  .variant(', '', '  ', 2, unit),
  '    '
);

// Nested example sequence (mental model of Enter presses)
{
  let indent = '';
  indent = suggestIndent('Column()', '', indent, 2, unit);
  assertEq('seq1 factory', indent, '  ');

  indent = suggestIndent('  .gap(12)', '', indent, 2, unit);
  assertEq('seq2 gap', indent, '  ');

  indent = suggestIndent('  .children([', '', indent, 2, unit);
  assertEq('seq3 children', indent, '    ');

  indent = suggestIndent('    Form()', '', indent, 2, unit);
  assertEq('seq4 nested factory', indent, '      ');

  indent = suggestIndent('      .gap(12)', '', indent, 2, unit);
  assertEq('seq5 nested gap', indent, '      ');

  indent = suggestIndent('      .children([', '', indent, 2, unit);
  assertEq('seq6 nested children', indent, '        ');
}

// Tabs
assertEq(
  'tabs children',
  suggestIndent('\t.children([', '', '\t', 2, '\t'),
  '\t\t'
);

// Playground parity (cases vscode used to miss)
assertEq(
  'factory already chained on the same line',
  suggestIndent('Column().gap(12)', '', '', 2, unit),
  '  '
);

assertEq(
  'comment that looks like children open',
  suggestIndent('  // .children([', '', '  ', 2, unit),
  null
);

assertEq(
  'chain plus comment that looks like children open',
  suggestIndent('  .gap(12) // .children([', '', '  ', 2, unit),
  '  '
);

assertEq(
  'onPress callback brace',
  suggestIndent('  .onPress(() => {', '', '  ', 2, unit),
  '    '
);

assertEq(
  'typed itemStyle callback',
  suggestIndent('  .itemStyle((s: Style) =>', '', '  ', 2, unit),
  '    '
);

assertEq(
  'renderItem factory owns the next chain',
  suggestIndent('      .renderItem((item) => Row()', '.children([', '      ', 2, unit),
  '        '
);

if (failed) {
  console.error(`${failed} failed`);
  process.exit(1);
}
console.log('all ok');
