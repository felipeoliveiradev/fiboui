<script setup>
import { Banner } from '../../src/structure/Banner'
import { Card } from '../../src/structure/Card'
import { Collapse } from '../../src/structure/Collapse'
import { Grid } from '../../src/structure/Grid'
import { List } from '../../src/structure/List'
import { Table } from '../../src/structure/Table'
import { Tags } from '../../src/structure/Tags'
import { Text } from '../../src/content/Text'
import { Box } from '../../src/structure/Box'

const renderBanner = () =>
  Banner().status('info').title('Notice').subtitle('Structure gallery')

const renderCard = () =>
  Card().padding(16).children(Text('Standard card'))

const renderCollapse = () =>
  Collapse().title('More').content(Text('Hidden content'))

const renderGrid = () =>
  Grid()
    .columns(2)
    .gap('md')
    .children([
      Box().key('a').padding(8).children('A'),
      Box().key('b').padding(8).children('B'),
    ])

const renderList = () =>
  List()
    .items(['One', 'Two'])
    .renderItem((item) => Text(String(item)).key(String(item)))

const renderTable = () =>
  Table()
    .columns([{ header: 'Name', accessor: 'name' }])
    .data([{ name: 'Ada' }])

const renderTags = () =>
  Tags().items([
    { title: 'Primary' },
    { title: 'Success' },
    { title: 'Warning' },
  ])
</script>

# Structure components

Live gallery. Generated method tables: [API builders](/api/).

## Banner

<ReactWrapper :component="renderBanner" />

## Card

<ReactWrapper :component="renderCard" />

## Collapse

<ReactWrapper :component="renderCollapse" />

## Grid

<ReactWrapper :component="renderGrid" />

## List

<ReactWrapper :component="renderList" />

## Table

<ReactWrapper :component="renderTable" />

## Tags

<ReactWrapper :component="renderTags" />
