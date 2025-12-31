
<script setup>
import { Box } from '../../src/structure/Box'
import { Alert } from '../../src/content/Alert'
import { Avatar } from '../../src/content/Avatar'
import { Badge } from '../../src/content/Badge'
import { Progress } from '../../src/content/Progress'
import { Skeleton } from '../../src/content/Skeleton'
import { Spinner } from '../../src/content/Spinner'
import { Text } from '../../src/content/Text'

const renderAlert = () => 
  Box().flex().col().gap(4).children([
    Alert().title('Info').message('This is an info alert').variant('info').build(),
    Alert().title('Success').message('Operation successful').variant('success').build(),
    Alert().title('Error').message('Something went wrong').variant('error').build()
  ]).build()

const renderAvatar = () => 
  Box().flex().gap(4).children([
    Avatar().src('https://i.pravatar.cc/100').size('sm').build(),
    Avatar().src('https://i.pravatar.cc/100').size('md').build(),
    Avatar().src('https://i.pravatar.cc/100').size('lg').build(),
    Avatar().initials('FO').bg('blue-500').build()
  ]).build()

const renderBadge = () => 
  Box().flex().gap(2).children([
    Badge().label('New').variant('info').build(),
    Badge().label('Completed').variant('success').build(),
    Badge().label('Failed').variant('error').build()
  ]).build()

const renderProgress = () => 
  Box().flex().col().gap(4).w('full').children([
    Progress().value(30).build(),
    Progress().value(75).variant('success').build()
  ]).build()

const renderSkeleton = () => 
  Box().flex().col().gap(2).w('300px').children([
    Skeleton().variant('text').h(20).build(),
    Skeleton().variant('rect').h(100).build(),
    Skeleton().variant('circle').size(50).build()
  ]).build()

const renderSpinner = () => 
  Box().flex().gap(4).children([
    Spinner().size('sm').build(),
    Spinner().size('md').build(),
    Spinner().size('lg').build()
  ]).build()

const renderText = () => 
  Box().flex().col().gap(2).children([
    Text('Heading 1').variant('h1').build(),
    Text('Heading 2').variant('h2').build(),
    Text('Body Text').variant('body').build(),
    Text('Caption Text').variant('caption').color('gray-500').build()
  ]).build()
</script>

# Content Components

## Alert

Status messages.

<ReactWrapper :component="renderAlert" />

## Avatar

User profile images.

<ReactWrapper :component="renderAvatar" />

## Badge

Small status tags.

<ReactWrapper :component="renderBadge" />

## Progress

Progress bars.

<ReactWrapper :component="renderProgress" />

## Skeleton

Loading placeholders.

<ReactWrapper :component="renderSkeleton" />

## Spinner

Loading spinners.

<ReactWrapper :component="renderSpinner" />

## Text

Typography components.

<ReactWrapper :component="renderText" />
