
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
    Button('Primary').variant('primary').build(),
    Button('Secondary').variant('secondary').build(),
    Button('Outline').variant('outline').build(),
    Button('Ghost').variant('ghost').build()
  ]).build()

const renderCheckbox = () => 
  Box().flex().col().gap(2).children([
    Checkbox().label('Accept Terms').build(),
    Checkbox().label('Checked').checked(true).build()
  ]).build()

const renderRadioGroup = () => 
  RadioGroup().options([
    { label: 'Option A', value: 'a' },
    { label: 'Option B', value: 'b' }
  ]).build()

const renderSelect = () => 
  Select().options([
    { label: 'Red', value: 'red' },
    { label: 'Green', value: 'green' },
    { label: 'Blue', value: 'blue' }
  ]).placeholder('Choose a color').build()

const renderSwitch = () => 
  Box().flex().col().gap(4).children([
    Switch().label('Notifications').build(),
    Switch().label('Dark Mode').checked(true).build()
  ]).build()

const renderTextField = () => 
  Box().flex().col().gap(4).maxW('300px').children([
    TextField().placeholder('Username').label('Username').build(),
    TextField().placeholder('Password').type('password').label('Password').build(),
    TextField().placeholder('Error state').error('Invalid input').build()
  ]).build()

const renderTextarea = () => 
  Textarea().placeholder('Enter your bio...').rows(4).build()
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
