
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
  Box().bg('gray-100').p(4).children([
    Container().bg('white').p(4).children('Centered Container Content').build()
  ]).build()

const renderRowCol = () => 
  Box().flex().col().gap(4).children([
    Row().bg('blue-50').p(2).gap(4).children([
        Box().bg('blue-200').p(2).children('Row Item 1').build(),
        Box().bg('blue-200').p(2).children('Row Item 2').build()
    ]).build(),
    
    Column().bg('green-50').p(2).gap(4).children([
        Box().bg('green-200').p(2).children('Col Item 1').build(),
        Box().bg('green-200').p(2).children('Col Item 2').build()
    ]).build()
  ]).build()

const renderLayout = () => 
  Box().h(300).border().relative().children([
    Header().children(Text('Header').build()).borderBottom().h(50).build(),
    Box().flex().h('full').children([
        Sidebar().w(60).borderRight().children([Text('Sidebar').p(2).build()]).build(),
        Box().flex1().p(4).children('Main Content Area').build()
    ]).build()
  ]).build()
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
