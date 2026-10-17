
<script setup>
import { Box } from '../../src/structure/Box'
import { Banner } from '../../src/structure/Banner'
import { Card } from '../../src/structure/Card'
import { Collapse } from '../../src/structure/Collapse'
import { Grid } from '../../src/structure/Grid'
import { List } from '../../src/structure/List'
import { Table } from '../../src/structure/Table'
import { Tags } from '../../src/structure/Tags'
import { Text } from '../../src/content/Text'

const renderBanner = () =>
  Banner('Info Banner').status('info').subtitle('A prominent message.')

const renderCard = () =>
  Card().text('REVENUE').number('$12,345').subtitle('+12% from last month')

const renderCollapse = () =>
  Collapse().title('Click to expand').isOpen(true).children('Hidden until toggled.')

const renderGrid = () =>
  Grid().columns(3).gap(4).children([
    Box().bg('#fecaca').height(48).children('1'),
    Box().bg('#bbf7d0').height(48).children('2'),
    Box().bg('#bfdbfe').height(48).children('3'),
  ])

const renderList = () =>
  List()
    .items(['Item 1', 'Item 2', 'Item 3'])
    .variant('card')
    .renderItem((item) => Text(item).variant('body'))

const renderTable = () =>
  Table()
    .data([{ name: 'Ada', role: 'Admin' }])
    .columns([
      { header: 'Name', accessor: 'name' },
      { header: 'Role', accessor: 'role' },
    ])

const renderTags = () =>
  Tags().items([
     { title: 'Primary' },
     { title: 'Success' },
     { title: 'Warning' }
  ])
</script>

# Structure Components

## Banner

Displays a prominent message or call to action.

<ReactWrapper :component="renderBanner" />

## Card

The standard container element.

<ReactWrapper :component="renderCard" />

## Collapse

Expandable content container.

<ReactWrapper :component="renderCollapse" />

## Grid

CSS Grid container.

<ReactWrapper :component="renderGrid" />

## List

A vertical list of items.

<ReactWrapper :component="renderList" />

## Table

A data table.

<ReactWrapper :component="renderTable" />

## Tags

Small status indicators.

<ReactWrapper :component="renderTags" />
