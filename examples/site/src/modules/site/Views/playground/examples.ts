export const mapExample = `import L from 'leaflet'

const ember = extendTheme(noirTheme, {
  name: 'ember',
  colors: {
    background: '#1a0b08',
    onBackground: '#fff4ec',
    surface: '#2a1410',
    onSurface: '#fff4ec',
    primary: '#ff6a2a',
    onPrimary: '#1a0b08',
    secondary: '#f0b429',
    onSecondary: '#1a0b08',
  },
})

const tide = extendTheme(webTheme, {
  name: 'tide',
  colors: {
    background: '#e7f4f6',
    onBackground: '#102027',
    surface: '#ffffff',
    onSurface: '#102027',
    primary: '#0b6e99',
    onPrimary: '#ffffff',
    secondary: '#7ec8e3',
    onSecondary: '#102027',
  },
})

const look = signal(ember)
const label = signal('ember')

const chip = (title, theme) => Button(title)
  .height(32)
  .paddingHorizontal(12)
  .rounded(8)
  .bg('#1c1c22')
  .color('#f4f4f6')
  .border('1px solid rgba(255,255,255,0.12)')
  .onPress(() => {
    look.value = theme
    label.value = title
  })

return Column()
  .padding(28)
  .gap(16)
  .bg('#0a0a0a')
  .rounded(20)
  .children([
    Text('Tema novo')
      .fontSize(28)
      .fontWeight(800)
      .letterSpacing('-0.04em')
      .textTransform('uppercase')
      .color('#f4f4f6'),
    Text('extendTheme parte de noir ou web. O mapa lê o mesmo objeto.')
      .fontSize(14)
      .color('#9a9a9a'),
    Row()
      .gap(8)
      .alignItems('center')
      .children([
        chip('Ember', ember),
        chip('Tide', tide),
        Text('ember').bindSignal(label).fontSize(13).color('#d4a017'),
      ]),
    MapView()
      .theme(look)
      .engine(leafletEngine({ leaflet: L }))
      .width(560)
      .height(340)
      .rounded(16)
      .center(40.4, -1.8)
      .span(12)
      .markers([
        { lat: 41.39, lng: 2.17, label: 'Barcelona' },
        { lat: 40.42, lng: -3.7, label: 'Madrid' },
        { lat: 43.26, lng: -2.93, label: 'Bilbao' },
        { lat: 37.39, lng: -5.99, label: 'Sevilla' },
      ]),
  ])`

export const kitExample = `import L from 'leaflet'

const ink = '#000000'
const chalk = '#ffffff'
const muted = '#9a9a9a'
const pink = '#ff2d8a'
const lime = '#c8ff00'
const line = '1px solid rgba(255,255,255,0.16)'

const note = signal('Touch a piece')
const say = (text) => {
  note.value = text
}

const cell = (index, title, node) => Column()
  .gap(20)
  .padding('32px 20px')
  .width('100%')
  .minWidth(0)
  .flexShrink(0)
  .crossAxisAlignment('stretch')
  .bg(ink)
  .borderTop(line)
  .children([
    Text(index + '  ·  ' + title)
      .fontSize(9)
      .fontWeight(800)
      .letterSpacing('0.16em')
      .textTransform('uppercase')
      .color(lime),
    node,
  ])

const span = (node) => Box().width('100%').css({ gridColumn: '1 / -1' }).children([node])

return Column()
  .width('100%')
  .flexShrink(0)
  .crossAxisAlignment('stretch')
  .bg(ink)
  .children([
    Column()
      .width('100%')
      .flexShrink(0)
      .crossAxisAlignment('stretch')
      .gap(18)
      .padding('28px 18px 22px')
      .borderBottom(line)
      .children([
        Row()
          .width('100%')
          .mainAxisAlignment('spaceBetween')
          .crossAxisAlignment('center')
          .children([
            Text('06 · Kit')
              .fontSize(9)
              .lineHeight(1)
              .whiteSpace('nowrap')
              .flexShrink(0)
              .fontWeight(800)
              .letterSpacing('0.16em')
              .textTransform('uppercase')
              .color(lime),
            Row().hug().gap(12).crossAxisAlignment('center').children([
              Shortcuts().combo('Meta+k').label(' ').onFire(() => say('Shortcut')),
              Text()
                .bindSignal(note, (value) => value)
                .fontSize(9)
                .lineHeight(1)
                .whiteSpace('nowrap')
                .fontWeight(800)
                .letterSpacing('0.12em')
                .textTransform('uppercase')
                .color(muted),
            ]),
          ]),
        Text('One return. The whole kit.')
          .fontSize('clamp(2rem, 5vw, 3.4rem)')
          .fontWeight(800)
          .lineHeight(0.92)
          .letterSpacing('-0.045em')
          .textTransform('uppercase')
          .color(chalk)
          .maxWidth(720),
        Text('Charts, map, type, and gestures. Ink, pink, and lime — the same screen as the site.')
          .fontSize(14)
          .lineHeight(1.45)
          .color(muted)
          .maxWidth(480),
        Row().width('100%').height(72).children([
          Box().flex('1').height(72).bg(pink),
          Box().flex('1.4').height(72).overflow('hidden').children([
            MeshGradient()
              .colors([pink, '#7a1048', lime, chalk])
              .width('100%')
              .height(72),
          ]),
          Box()
            .width(148)
            .height(72)
            .bg(lime)
            .display('flex')
            .alignItems('center')
            .justifyContent('center')
            .children([
              NumericText()
                .value(1280)
                .format((n) => n.toLocaleString('es-ES') + ' €')
                .fontSize(22)
                .fontWeight(800)
                .letterSpacing('-0.04em')
                .color(ink),
            ]),
        ]),
      ]),
    Column()
      .width('100%')
      .children([
        span(cell('01', 'Map', MapView()
          .engine(leafletEngine({ leaflet: L }))
          .width(720)
          .height(280)
          .rounded(0)
          .center(40.4, -3.7)
          .span(10)
          .markers([
            { lat: 41.39, lng: 2.17, label: 'Barcelona', color: pink },
            { lat: 40.42, lng: -3.7, label: 'Madrid', color: pink },
            { lat: 43.26, lng: -2.93, label: 'Bilbao', color: lime },
          ])
          .onSelect((pin) => say(pin.label || 'Marker')))),
        cell('02', 'Charts', Row().width('100%').mainAxisAlignment('spaceBetween').crossAxisAlignment('end').children([
          Chart().type('donut').renderer('css').width(148).height(148).series([{ data: [8, 3, 2], colors: [pink, lime, chalk] }]),
          Chart().type('bar').renderer('css').width(220).height(148).labels(['Seg', 'Ter', 'Qua', 'Qui']).series([{ data: [4, 9, 6, 8], colors: [pink, lime, chalk, muted] }]),
        ])),
        cell('03', 'Calendar', Calendar()
          .month('2026-10')
          .events([{ date: '2026-10-17', title: 'Ship' }])
          .onSelect((date) => say(date))),
        cell('04', 'Cities', Column().gap(16).children([
          Searchable().placeholder('Search a city').items(['Barcelona', 'Madrid', 'Bilbao', 'Sevilla']),
          Table()
            .sortable(true)
            .columns([
              { header: 'City', accessor: 'city' },
              { header: '°C', accessor: 'temp' },
            ])
            .data([
              { city: 'Barcelona', temp: 22 },
              { city: 'Madrid', temp: 18 },
              { city: 'Bilbao', temp: 16 },
            ]),
        ])),
        cell('05', 'Notes', Column().gap(16).children([
          Markdown().text('# Notes\\n\\n**Bold**, *italic*, and \`code\`.'),
          RichEditor().value('<p>Write here</p>').onChange(() => say('Editor')),
        ])),
        cell('06', 'Time', Column().gap(14).children([
          DateRangePicker()
            .start('2026-10-01')
            .end('2026-10-17')
            .onChange((start, end) => say(start + ' → ' + end)),
          WheelPicker()
            .items(['Morning', 'Afternoon', 'Night'])
            .value('Afternoon')
            .height(128)
            .onChange((value) => say(value)),
        ])),
        cell('07', 'Steps', Column().gap(28).width('100%').crossAxisAlignment('stretch').children([
          Carousel().width('100%').children([
            Text('One').fontSize(40).fontWeight(800).lineHeight(0.9).letterSpacing('-0.04em').textTransform('uppercase').color(chalk).padding('18px 16px'),
            Text('Two').fontSize(40).fontWeight(800).lineHeight(0.9).letterSpacing('-0.04em').textTransform('uppercase').color(chalk).padding('18px 16px'),
            Text('Three').fontSize(40).fontWeight(800).lineHeight(0.9).letterSpacing('-0.04em').textTransform('uppercase').color(chalk).padding('18px 16px'),
          ]),
          Wizard()
            .width('100%')
            .index(0)
            .onChange((step) => say('Step ' + (step + 1)))
            .steps([
              { title: 'Account', child: Text('Name and email').color(muted) },
              { title: 'Plan', child: Text('Pick a plan').color(muted) },
            ]),
        ])),
        cell('08', 'Input', Column().gap(14).children([
          OtpField().length(6).onChange((code) => say(code)),
          Row().gap(8).flexWrap('wrap').children([
            PhotosPicker().label('Photos').onChange((files) => say(files.length + ' photos')),
            FilePicker().label('PDF').accept('application/pdf').onChange((files) => say(files.length + ' files')),
            ShareLink().url('https://fiboui.vercel.app').title('FiboUI').label('Share'),
            CodeScanner().label('Scan').onScan((value) => say(value)),
          ]),
          Row().gap(8).flexWrap('wrap').children([
            SensoryFeedback().kind('success').label('Ok').onTrigger(() => say('Success')),
            SensoryFeedback().kind('warning').label('Warn').onTrigger(() => say('Warning')),
            SensoryFeedback().kind('error').label('Error').onTrigger(() => say('Error')),
          ]),
        ])),
        cell('09', 'Gestures', Column().gap(0).children([
          Shake().onShake(() => say('Shook')).child(
            Text('Shake the phone').color(chalk).fontSize(13).fontWeight(700).letterSpacing('0.06em').textTransform('uppercase').padding('12px 0'),
          ),
          RefreshIndicator().onRefresh(() => say('Refreshed')).child(
            Text('Pull to refresh').color(chalk).fontSize(13).fontWeight(700).letterSpacing('0.06em').textTransform('uppercase').padding('12px 0'),
          ),
          SwipeRow()
            .child(Text('Swipe left').color(chalk).fontSize(13).fontWeight(700).letterSpacing('0.06em').textTransform('uppercase').padding('12px 0'))
            .actions([{ label: 'Archive', onPress: () => say('Archived') }]),
          Dismissible().onDismiss(() => say('Dismissed')).child(
            Text('Drag to dismiss').color(chalk).fontSize(13).fontWeight(700).letterSpacing('0.06em').textTransform('uppercase').padding('12px 0'),
          ),
          ReorderableList()
            .items([
              { id: 'a', label: 'Alpha' },
              { id: 'b', label: 'Beta' },
              { id: 'c', label: 'Gamma' },
            ])
            .onReorder(() => say('Reordered')),
          Hero().tag('kit-title').onFlight(() => say('Flight')).child(
            Text('Tap to fly').color(pink).fontSize(13).fontWeight(800).letterSpacing('0.12em').textTransform('uppercase').padding('12px 0'),
          ),
        ])),
        span(cell('10', 'Image', AsyncImage('https://picsum.photos/id/1015/1400/520')
          .alt('Lake')
          .cache(true)
          .width('100%')
          .height(240)
          .borderRadius('0')
          .placeholder(Text('Loading').fontSize(9).letterSpacing('0.16em').textTransform('uppercase').color(muted)))),
        cell('11', 'Web', WebView().src('https://example.com').title('Example').width('100%').height(200).borderRadius('0')),
        cell('12', 'PDF', PdfView()
          .src('https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf')
          .title('TraceMonkey')
          .width('100%')
          .height(220)
          .borderRadius('0')),
        cell('13', 'Empty', ContentUnavailable()
          .title('No mail')
          .message('You are caught up.')
          .action('Reload', () => say('Reloaded'))),
        cell('14', 'Inspector', Inspector()
          .open(true)
          .width('100%')
          .title(Text('Meta').color(lime).fontSize(9).letterSpacing('0.16em').textTransform('uppercase'))
          .child(Text('The panel stays beside the work.').color(muted).fontSize(16).lineHeight(1.45))
          .panel(Text('Detail, without leaving the page.').color(chalk).fontSize(22).fontWeight(800).letterSpacing('-0.03em').lineHeight(1.1))),
      ]),
  ])`

export const helloExample = `return Column()
  .padding(28)
  .gap(12)
  .bg('#0a0a0a')
  .children([
    Text('Play')
      .fontSize(48)
      .fontWeight(800)
      .letterSpacing('-0.04em')
      .textTransform('uppercase')
      .color('#ffffff'),
    Text('Edit the code. The preview follows.')
      .fontSize(14)
      .color('#9a9a9a'),
  ])`

export const buttonExample = `return Column()
  .padding(28)
  .gap(16)
  .bg('#0a0a0a')
  .children([
    Text('Button')
      .fontSize(32)
      .fontWeight(800)
      .textTransform('uppercase')
      .color('#ffffff'),
    Button('Press')
      .height(44)
      .paddingHorizontal(18)
      .bg('#ff2d8a')
      .color('#ffffff')
      .fontWeight(800)
      .letterSpacing('0.12em')
      .textTransform('uppercase')
      .onPress(() => {
        console.log('pressed')
      }),
  ])`

export const formExample = `const notes = listSignal([])

return Form()
  .padding(28)
  .gap(12)
  .bg('#0a0a0a')
  .validation({
    note: [required('Write a note'), minLength(2, 'At least 2 characters')],
  })
  .onSubmit((values) => {
    notes.add({ text: String(values.note) })
  })
  .afterSubmit((_values, form) => {
    form.reset('note')
  })
  .children([
    Text('Notes ' + notes.$length)
      .fontSize(28)
      .fontWeight(800)
      .textTransform('uppercase')
      .color('#ffffff'),
    TextField()
      .name('note')
      .placeholder('A note')
      .height(44)
      .color('#ffffff')
      .bg('transparent')
      .border('1px solid rgba(255,255,255,0.16)'),
    Button('Add')
      .type('submit')
      .height(44)
      .bg('#c8ff00')
      .color('#000000')
      .fontWeight(800)
      .textTransform('uppercase'),
    List()
      .items(notes)
      .renderItem((item) => Text(item.text).color('#ffffff').padding('8px 0')),
  ])`
