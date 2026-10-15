
<script setup>
import { Box } from '../../src/structure/Box'
import { Text } from '../../src/content/Text'
import { Button } from '../../src/interactive/Button'
import { Checkbox } from '../../src/interactive/Checkbox'
import { RadioGroup } from '../../src/interactive/RadioGroup'
import { Select } from '../../src/interactive/Select'
import { Switch } from '../../src/interactive/Switch'
import { TextField } from '../../src/interactive/TextField'
import { Textarea } from '../../src/interactive/Textarea'

const renderButtons = () =>
  Box().flex().gap(4).children([
    Button('Primary').variant('primary'),
    Button('Secondary').variant('secondary'),
    Button('Outline').variant('outline'),
    Button('Ghost').variant('ghost')
  ])

const renderCheckbox = () =>
  Box().flex().col().gap(2).children([
    Checkbox().label('Accept Terms'),
    Checkbox().label('Checked').checked(true)
  ])

const renderRadioGroup = () =>
  RadioGroup().options([
    { label: 'Option A', value: 'a' },
    { label: 'Option B', value: 'b' }
  ])

const renderSelect = () =>
  Select().options([
    { label: 'Red', value: 'red' },
    { label: 'Green', value: 'green' },
    { label: 'Blue', value: 'blue' }
  ]).placeholder('Choose a color')

const renderSwitch = () =>
  Box().flex().col().gap(4).children([
    Switch().label('Notifications'),
    Switch().label('Dark Mode').checked(true)
  ])

const renderTextField = () =>
  Box().flex().col().gap(4).maxW('300px').children([
    TextField().placeholder('Username').label('Username'),
    TextField().placeholder('Password').type('password').label('Password'),
    TextField().placeholder('Error state').error('Invalid input')
  ])

const renderTextarea = () =>
  Textarea().placeholder('Enter your bio...').rows(4)
</script>

# Interactive Components

## Button

<ReactWrapper :component="renderButtons" />

## Checkbox

<ReactWrapper :component="renderCheckbox" />

## RadioGroup

<ReactWrapper :component="renderRadioGroup" />

## Select

<ReactWrapper :component="renderSelect" />

## Switch

<ReactWrapper :component="renderSwitch" />

## TextField

<ReactWrapper :component="renderTextField" />

## Textarea

<ReactWrapper :component="renderTextarea" />
