import { signal, computed } from 'fiboui/core';
import { Column, Row } from 'fiboui/layout';
import { Text, Avatar } from 'fiboui/content';
import { Button } from 'fiboui/interactive';
import { Box } from 'fiboui/structure';
import * as I from './icons';

export const started = signal(false);
export const hidden = signal(false);
export const analyze = signal(false);
export const nav = signal(0);

const wallet = computed(() => (hidden.value ? '$ ••••••' : '$ 195,654.80'));

const LINE = '1px solid #3b3b3b';
const MUTED = '#9a9a9a';

const T = (s: string | (() => string), size = 11, color = '#fff') =>
  Text(s)
    .fontSize(size)
    .color(color)
    .letterSpacing('0.06em')
    .margin(0)
    .lineHeight(1.3)
    .fontFamily("'Space Mono', monospace");

const Phone = () =>
  Column()
    .crossAxisAlignment('stretch')
    .width(290)
    .height(625)
    .border(LINE)
    .backgroundColor('#000')
    .overflow('hidden')
    .position('relative');

const ghost = {
  borderRadius: 2,
  padding: '9px 0',
  fontSize: 9,
  letterSpacing: '0.1em',
  fontFamily: 'inherit',
  boxShadow: 'none',
  flex: 1,
  cursor: 'pointer',
  fontWeight: 400,
  height: 'auto',
} as const;

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
          Button(started.value ? 'WELCOME ✓' : 'GET STARTED')
            .variant('raw')
            .id('get-started')
            .onPress(() => {
              started.value = !started.value;
            })
            .style({
              background: started.value ? '#000' : '#f2f2f2',
              color: started.value ? '#fff' : '#000',
              border: '1px solid #f2f2f2',
              borderRadius: 8,
              padding: '9px 26px',
              fontSize: 10,
              letterSpacing: '0.12em',
              fontFamily: 'inherit',
              marginBottom: 52,
              boxShadow: 'none',
              cursor: 'pointer',
              fontWeight: 400,
              height: 'auto',
            })
        ),
    ]);
}

const Stat = (label: string, value: string, id?: string) =>
  Column().spacing(8).children([
    T(label, 8, MUTED),
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
          T(() => (hidden.value ? '••••••' : value), 8, MUTED).id(`track-${label.toLowerCase().replace(' ', '-')}`),
        ]),
      pct === null
        ? null
        : Box()
            .height(3)
            .backgroundColor(i === 0 ? '#3b3b3b' : 'transparent')
            .children(Box().height(3).width(`${pct}%`).backgroundColor('#fff')),
    ]);

const Tool = (label: string, last: boolean) =>
  Row()
    .crossAxisAlignment('center')
    .spacing(12)
    .padding('14px 0')
    .borderBottom(last ? 'none' : LINE)
    .children([
      Box().color(MUTED).display('flex').children(<I.Wallet />),
      T(label, 8).flex(1),
      Box().color(MUTED).display('flex').children(<I.Chevron />),
    ]);

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
          .crossAxisAlignment('center')
          .spacing(10)
          .children([
            Avatar().size(24).shape('circle').image(I.AVATAR_URI),
            T('0X80EBCB', 13),
          ]),
        Row()
          .border(LINE)
          .children([
            Box().padding('4px 7px').borderRight(LINE).display('flex').color(MUTED).children(<I.Wallet />),
            T(() => wallet.value, 8, MUTED).padding('5px 8px').id('wallet'),
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
            T('MONEY TRACKER', 11),
            Row()
              .spacing(14)
              .color(MUTED)
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
    .crossAxisAlignment('center')
    .spacing(6)
    .children([Box().width(6).height(6).backgroundColor(color), T(label, 8)]);

const Holding = (label: string, value: string, delta: string) =>
  Column()
    .crossAxisAlignment('stretch')
    .spacing(8)
    .children([
      T(label, 8, MUTED),
      Row()
        .mainAxisAlignment('spaceBetween')
        .children([
          T(() => (hidden.value ? '••••••' : value), 9).id(`hold-${label.toLowerCase()}`),
          T(delta, 8, MUTED),
        ]),
    ]);

function Investment() {
  return Phone().children([
    Column()
      .height(106)
      .flexShrink(0)
      .padding('40px 12px 0')
      .borderBottom(LINE)
      .children([Box().color(MUTED).display('flex').children(<I.Back />), T('INVESTMENT', 13).marginTop(12)]),
    Column()
      .crossAxisAlignment('center')
      .padding('26px 12px 0')
      .borderBottom(LINE)
      .children([
        Box()
          .position('relative')
          .width(190)
          .height(190)
          .bindSignal(analyze)
          .children(() => [
            <I.Ring key="r" analyze={analyze.value} />,
            Column()
              .key('c')
              .position('absolute')
              .inset(0)
              .alignItems('center')
              .justifyContent('center')
              .spacing(6)
              .children([
                T('TOTAL', 9, MUTED),
                T(() => (hidden.value ? '••••' : '$650.5K'), 19).fontWeight(700).id('total'),
                T(() => (analyze.value ? 'vs 30D: -8.37%' : '-8.37%'), 9).id('delta'),
              ]),
          ]),
        T('COMBINED VALUE AS OF TODAY AT 3:42 PM', 6.5, MUTED).marginTop(18),
        Row()
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
                Button('SET GOALS')
                  .variant('raw')
                  .id('set-goals')
                  .style({ ...ghost, background: '#000', color: '#fff', border: LINE }),
                Button(analyze.value ? 'ANALYZING…' : 'ANALYZE')
                  .variant('raw')
                  .id('analyze')
                  .onPress(() => {
                    analyze.value = !analyze.value;
                  })
                  .style({
                    ...ghost,
                    background: analyze.value ? '#000' : '#f2f2f2',
                    color: analyze.value ? '#fff' : '#000',
                    border: '1px solid #f2f2f2',
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
    .children([Splash(), Dashboard(), Investment()])
    .build();
}
