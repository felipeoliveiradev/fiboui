import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  Alert,
  Avatar,
  Badge,
  Banner,
  Box,
  Button,
  Card,
  Center,
  Checkbox,
  Collapse,
  Column,
  Combobox,
  Container,
  DashboardLayout,
  Grid,
  GridItem,
  Header,
  Image,
  Label,
  Line,
  List,
  ListTile,
  Progress,
  RadioGroup,
  Row,
  Scaffold,
  ScrollView,
  Select,
  Sidebar,
  Skeleton,
  Spacer,
  Spinner,
  Switch,
  Table,
  Tags,
  Text,
  TextField,
  Textarea,
  VirtualColumn,
  ZStack,
} from '../src';

describe('public builder smoke renders', () => {
  it('renders layout, content, and interactive factories', () => {
    render(
      Box().children([
        Text('Hello smoke').variant('h2'),
        Label('Field label'),
        Button('Press').onPress(() => undefined),
        TextField('typed').label('Name'),
        Textarea().placeholder('notes'),
        Checkbox().label('Ok').checked(false),
        Switch().label('On').checked(true),
        RadioGroup().options([{ label: 'One', value: '1' }]).value('1'),
        Select().options([{ label: 'A', value: 'a' }]).value('a'),
        Combobox().options([{ label: 'B', value: 'b' }]).value('b'),
        Alert().title('Heads up').description('Body').intent('info'),
        Badge().text('New').variant('accent'),
        Avatar().image('/avatar.png').size(32),
        Avatar().size(24).icon('user'),
        Avatar().size(24).initials('AB'),
        ListTile().title('Row').icon(Text('i')).chevron().divider(),
        Image('/x.png').alt('demo'),
        Spinner().size('sm'),
        Skeleton().width(40).height(10),
        Progress().value(25).max(100),
        Progress().variant('ring').size(80).segments([{ value: 1, color: '#fff' }]),
        Banner('Notice'),
        Tags().items([{ title: 'tag' }]),
        Table().columns([{ header: 'Col', accessor: 'v' }]).data([{ id: 1, v: 'cell' }]),
        List().items(['x']).renderItem((item) => item),
        Collapse().title('More').content(Text('inside')),
        Card().children(Text('card')),
        Grid().variant('bento').columns(2).children([GridItem().children(Text('g'))]),
        Column().children([Row().children([Center().children(Text('c'))])]),
        Container().children(Text('box')),
        Spacer(),
        Line(),
        ScrollView().children(Text('scroll')),
        VirtualColumn().itemHeight(16).containerHeight(32).children(['a', 'b']),
        ZStack().children([Text('z')]),
        Header().children(Text('hdr')),
        Sidebar().width(120).children(Text('nav')),
        Scaffold().children(Text('main')),
        DashboardLayout().header(Header().children(Text('dash'))).children(Text('body')),
      ]).build()
    );

    expect(screen.getByText('Hello smoke')).toBeInTheDocument();
    expect(screen.getByText('Press')).toBeInTheDocument();
    expect(screen.getByText('Heads up')).toBeInTheDocument();
    expect(screen.getByText('cell')).toBeInTheDocument();
    expect(screen.getAllByRole('status').length).toBeGreaterThan(0);
    expect(screen.getAllByRole('progressbar').length).toBeGreaterThan(0);
  });
});
