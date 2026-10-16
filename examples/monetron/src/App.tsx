import { signal, computed, Column, Row, Text, Avatar, Progress, Button, Box, ListTile } from 'fiboui';
import * as I from './icons';

export const started = signal(false);
export const hidden = signal(false);
export const analyze = signal(false);
export const nav = signal(0);

const wallet = computed(() => (hidden.value ? '$ ••••••' : '$ 195,654.80'));

const LINE = '1px solid #3b3b3b';

const T = (s: string | (() => string), size = 11) =>
  Text(s).mono().fontSize(size).letterSpacing('0.06em').lineHeight(1.3);

const Phone = () =>
  Column()
    .crossAxisAlignment('stretch')
    .width(290)
    .height(625)
    .border(LINE)
    .backgroundColor('#000')
    .overflow('hidden')
    .position('relative');

const monoBtn = (label: string | (() => string)) =>
  Button(label).tone('inverse').shape('sharp').size('xs');

function Splash() {
  return Phone()
    .crossAxisAlignment('center')
    .children([
      Box().height(160),
      Box().children(<I.Logo />),
      T('MONETRON', 20).marginTop(50).letterSpacing('0.04em'),
      T('PERSONALIZED FINANCIAL ADVISOR', 10).marginTop(18).letterSpacing('0.1em'),
      Box().flex(1),
      Box()
        .bindSignal(started)
        .children(() =>
          monoBtn(started.value ? 'WELCOME ✓' : 'GET STARTED')
            .variant(started.value ? 'outline' : 'solid')
            .id('get-started')
            .marginBottom(52)
            .onPress(() => {
              started.value = !started.value;
            })
        ),
    ]);
}

const Stat = (label: string, value: string, id?: string) =>
  Column()
    .crossAxisAlignment('start')
    .spacing(8)
    .children([
      T(label, 8).muted(),
      T(() => (hidden.value ? '••••••' : value), 9).id(id ?? `stat-${label.toLowerCase()}`),
    ]);

const Tracker = (label: string, value: string, pct: number | null, i: number) =>
  Column()
    .crossAxisAlignment('stretch')
    .spacing(7)
    .marginBottom(i === 1 ? 14 : 12)
    .children([
      Row()
        .mainAxisAlignment('spaceBetween')
        .children([
          T(label, 8),
          T(() => (hidden.value ? '••••••' : value), 8)
            .muted()
            .id(`track-${label.toLowerCase().replace(' ', '-')}`),
        ]),
      pct === null
        ? null
        : Box()
            .height(3)
            .backgroundColor(i === 0 ? '#3b3b3b' : 'transparent')
            .children(Box().height(3).width(`${pct}%`).backgroundColor('#fff')),
    ]);

const Tool = (label: string, last: boolean) =>
  ListTile()
    .icon(<I.Card />)
    .title(T(label, 8))
    .chevron()
    .divider(!last);

function Dashboard() {
  return Phone().children([
    Row()
      .crossAxisAlignment('center')
      .mainAxisAlignment('spaceBetween')
      .padding('0 12px')
      .height(84)
      .borderBottom(LINE)
      .children([
        Row()
          .hug()
          .crossAxisAlignment('center')
          .spacing(10)
          .children([Avatar().size(24).icon('user'), T('0X80EBCB', 13)]),
        Row()
          .hug()
          .border(LINE)
          .children([
            Box().padding('4px 7px').borderRight(LINE).display('flex').color('#9a9a9a').children(<I.Card />),
            T(() => wallet.value, 8).muted().padding('5px 8px').id('wallet'),
          ]),
      ]),
    Column()
      .crossAxisAlignment('stretch')
      .borderBottom(LINE)
      .padding('20px 12px 18px')
      .children([
        Row()
          .mainAxisAlignment('spaceBetween')
          .children([
            Stat('SAVING', '$44,770.00', 'stat-saving'),
            Stat('INVESTMENT', '$150,550.00', 'stat-investment'),
            Stat('CERTIFICATE', '$8,600.00', 'stat-certificate'),
          ]),
      ]),
    Column()
      .crossAxisAlignment('stretch')
      .borderBottom(LINE)
      .padding('18px 12px')
      .children([
        Row()
          .mainAxisAlignment('spaceBetween')
          .crossAxisAlignment('center')
          .marginBottom(20)
          .children([
            T('MONEY TRACKER', 11).nowrap(),
            Row()
              .hug()
              .spacing(14)
              .color('#9a9a9a')
              .children([
                Box()
                  .id('eye')
                  .bindSignal(hidden)
                  .cursor('pointer')
                  .display('flex')
                  .props({
                    onClick: () => {
                      hidden.value = !hidden.value;
                    },
                    role: 'button',
                  })
                  .children(() => (hidden.value ? <I.EyeOff /> : <I.Eye />)),
                Box().display('flex').children(<I.Gear />),
              ]),
          ]),
        Tracker('MONEY IN', '$814,720.00', 25, 0),
        Tracker('BALANCE', '195,654.80', null, 1),
        Tracker('MONEY OUT', '$401,491.79', 50, 2),
        Tracker('SAVINGS', '$217,573.33', 34, 3),
      ]),
    Column().crossAxisAlignment('stretch').borderBottom(LINE).padding('20px 12px').children([T('SUGGESTIONS', 10)]),
    Column()
      .crossAxisAlignment('stretch')
      .padding('20px 12px 0')
      .flex(1)
      .children([
        T('TOOLS', 11).marginBottom(8),
        Tool('ROBO-ADVISOR SERVICES', false),
        Tool('RISK ASSESSMENT', false),
        Tool('PORTFOLIO ANALYSIS', true),
      ]),
    Box()
      .bindSignal(nav)
      .children(() =>
        Row()
          .crossAxisAlignment('stretch')
          .height(52)
          .marginTop('auto')
          .borderTop(LINE)
          .children(
            [I.Gauge, I.Bars, I.Trend, I.Apps].map((Ic, i) =>
              Box()
                .key(i)
                .id(`nav-${i}`)
                .flex(1)
                .display('flex')
                .alignItems('center')
                .justifyContent('center')
                .color(nav.value === i ? '#fff' : '#aaa')
                .borderRight(i < 3 ? LINE : 'none')
                .cursor('pointer')
                .props({
                  onClick: () => {
                    nav.value = i;
                  },
                  role: 'button',
                })
                .children(<Ic />)
            )
          )
      ),
  ]);
}

const Legend = (label: string, color: string) =>
  Row()
    .hug()
    .crossAxisAlignment('center')
    .spacing(6)
    .children([Box().width(6).height(6).backgroundColor(color), T(label, 8)]);

const Holding = (label: string, value: string, delta: string) =>
  Column()
    .crossAxisAlignment('stretch')
    .spacing(8)
    .children([
      T(label, 8).muted(),
      Row()
        .mainAxisAlignment('spaceBetween')
        .children([
          T(() => (hidden.value ? '••••••' : value), 9).id(`hold-${label.toLowerCase()}`),
          T(delta, 8).muted(),
        ]),
    ]);

function Investment() {
  return Phone().children([
    Column()
      .crossAxisAlignment('start')
      .height(106)
      .flexShrink(0)
      .padding('40px 12px 0')
      .borderBottom(LINE)
      .children([Box().color('#9a9a9a').display('flex').children(<I.Back />), T('INVESTMENT', 13).marginTop(12)]),
    Column()
      .crossAxisAlignment('center')
      .padding('26px 12px 0')
      .borderBottom(LINE)
      .children([
        Box()
          .bindSignal(analyze)
          .children(() =>
            Progress()
              .variant('ring')
              .size(190)
              .strokeWidth(2.4)
              .segments([
                { value: 50, color: '#fff', strokeWidth: analyze.value ? 5 : 2.4 },
                { value: 25, color: analyze.value ? '#bbb' : '#888' },
                { value: 12, color: '#555' },
                { value: 11, color: '#2a2a2a' },
              ])
              .children([
                Column()
                  .hug()
                  .crossAxisAlignment('center')
                  .spacing(6)
                  .children([
                    T('TOTAL', 9).muted(),
                    T(() => (hidden.value ? '••••' : '$650.5K'), 19).id('total'),
                    T(() => (analyze.value ? 'vs 30D: -8.37%' : '-8.37%'), 9).id('delta'),
                  ]),
              ])
          ),
        T('COMBINED VALUE AS OF TODAY AT 3:42 PM', 6.5).muted().marginTop(18),
        Row()
          .hug()
          .spacing(22)
          .marginTop(24)
          .children([
            Legend('STOCKS', '#fff'),
            Legend('BONDS', '#888'),
            Legend('FUNDS', '#555'),
            Legend('ETFS', '#2a2a2a'),
          ]),
        Box()
          .bindSignal(analyze)
          .width('100%')
          .children(() =>
            Row()
              .spacing(12)
              .width('100%')
              .margin('30px 0 30px')
              .children([
                monoBtn('SET GOALS').variant('outline').expand().id('set-goals'),
                monoBtn(analyze.value ? 'ANALYZING…' : 'ANALYZE')
                  .variant(analyze.value ? 'outline' : 'solid')
                  .expand()
                  .id('analyze')
                  .onPress(() => {
                    analyze.value = !analyze.value;
                  }),
              ])
          ),
      ]),
    Column()
      .crossAxisAlignment('stretch')
      .padding('18px 12px')
      .spacing(18)
      .children([
        T('MY PORTFOLIO', 11),
        Box()
          .display('grid')
          .gridTemplateColumns('1fr 1fr')
          .columnGap(22)
          .rowGap(22)
          .children([
            Holding('STOCKS', '$325,250.00', '+47.1%'),
            Holding('BONDS', '$162,625.00', '+19.8%'),
            Holding('FUNDS', '$97,125.00', '-2.4%'),
            Holding('ETFS', '$65,500.00', '-8.4%'),
          ]),
      ]),
  ]);
}

export function App() {
  return Row()
    .id('stage')
    .mainAxisAlignment('center')
    .spacing(34)
    .padding('71px 0 0')
    .width(1024)
    .height(768)
    .backgroundColor('#000')
    .children([Splash(), Dashboard(), Investment()]);
}
