
<script setup>
import { Box } from '../../src/structure/Box'
import { Card } from '../../src/structure/Card'
import { Grid } from '../../src/structure/Grid'
import { List } from '../../src/structure/List'
import { Table } from '../../src/structure/Table'
import { Tags } from '../../src/structure/Tags'
import { Text } from '../../src/content/Text'

const renderTags = () => 
  Tags().items([
     { title: 'Primary' },
     { title: 'Success' },
     { title: 'Warning' }
  ]).build()
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
