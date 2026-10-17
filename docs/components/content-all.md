
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
  Box().flex().flexDirection('column').gap(4).children([
    Alert().title('Info').description('This is an info alert').intent('info'),
    Alert().title('Success').description('Operation successful').intent('success'),
    Alert().title('Error').description('Something went wrong').intent('error')
  ])

const renderAvatar = () =>
  Box().flex().gap(4).children([
    Avatar().image('https://i.pravatar.cc/100').size(32),
    Avatar().image('https://i.pravatar.cc/100').size(48),
    Avatar().image('https://i.pravatar.cc/100').size(64),
    Avatar().initials('FO').bg('#3B82F6')
  ])

const renderBadge = () =>
  Box().flex().gap(2).children([
    Badge().text('New').variant('accent').intent('info'),
    Badge().text('Completed').variant('neutral').intent('success'),
    Badge().text('Failed').variant('solid').intent('error')
  ])

const renderProgress = () =>
  Box().flex().flexDirection('column').gap(4).width('full').children([
    Progress().value(30),
    Progress().value(75).color('#22c55e')
  ])

const renderSkeleton = () =>
  Box().flex().flexDirection('column').gap(2).width('300px').children([
    Skeleton().shape('rounded').height(20),
    Skeleton().shape('square').height(100),
    Skeleton().shape('circle').width(50).height(50)
  ])

const renderSpinner = () =>
  Box().flex().gap(4).children([
    Spinner().size('sm'),
    Spinner().size('md'),
    Spinner().size('lg')
  ])

const renderText = () =>
  Box().flex().flexDirection('column').gap(2).children([
    Text('Heading 1').variant('h1'),
    Text('Heading 2').variant('h2'),
    Text('Body Text').variant('body'),
    Text('Caption Text').variant('caption').color('#6B7280')
  ])
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
