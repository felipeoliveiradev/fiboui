
<script setup>
import { Box } from '../../src/structure/Box'
import { Container } from '../../src/layout/Container'
import { Row } from '../../src/layout/Row'
import { Column } from '../../src/layout/Column'
import { Header } from '../../src/layout/Header'
import { Sidebar } from '../../src/layout/Sidebar'
import { Spacer } from '../../src/layout/Spacer'
import { DashboardLayout } from '../../src/layout/DashboardLayout'
import { Text } from '../../src/content/Text'

const renderContainer = () =>
  Box().bg('#F3F4F6').p(4).children([
    Container().bg('#FFFFFF').p(4).children('Centered Container Content')
  ])

const renderRowCol = () =>
  Box().flex().flexDirection('column').gap(4).children([
    Row().bg('#EFF6FF').p(2).gap(4).children([
        Box().bg('#BFDBFE').p(2).children('Row Item 1'),
        Box().bg('#BFDBFE').p(2).children('Row Item 2')
    ]),

    Column().bg('#F0FDF4').p(2).gap(4).children([
        Box().bg('#BBF7D0').p(2).children('Col Item 1'),
        Box().bg('#BBF7D0').p(2).children('Col Item 2')
    ])
  ])

const renderLayout = () =>
  Box().height(300).border('1px solid #e5e7eb').position('relative').children([
    Header().height(50).borderBottom('1px solid #e5e7eb').children(Text('Header')),
    Box().flex().height('full').children([
        Sidebar().width(260).borderRight('1px solid #e5e7eb').children([Text('Sidebar').p(2)]),
        Box().flex(1).p(4).children('Main Content Area')
    ])
  ])
</script>

# Layout Components

## Container

Centers content with max-width.

<ReactWrapper :component="renderContainer" />

## Row & Column

Flexbox wrappers.

<ReactWrapper :component="renderRowCol" />

## Header & Sidebar

Structural components, typically used within `DashboardLayout` but can be standalone.

<ReactWrapper :component="renderLayout" />
