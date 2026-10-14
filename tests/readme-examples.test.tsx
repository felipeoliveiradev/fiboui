import { describe, expect, it } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import {
  Badge,
  Box,
  Button,
  Card,
  Column,
  Grid,
  Header,
  Row,
  Scaffold,
  Text,
  computed,
  createStore,
  signal,
} from '../src';

describe('README examples type-check and render', () => {
  it('assembly pattern uses onPress (not onClick)', () => {
    const handlePress = () => undefined;
    render(
      Column()
        .children([
          Text('Title').variant('h1'),
          Button('Action').onPress(handlePress),
        ])
        .build()
    );
    expect(screen.getByText('Title').tagName).toBe('H1');
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });

  it('signals example with bindSignal and function children', async () => {
    const count = signal(0);

    render(
      Box()
        .bindSignal(count)
        .children(() => [
          Text(`Count: ${count.value}`),
          Button('+').onPress(() => {
            count.value += 1;
          }),
        ])
        .build()
    );

    expect(screen.getByText('Count: 0')).toBeInTheDocument();
    await act(async () => {
      screen.getByRole('button', { name: '+' }).click();
    });
    expect(screen.getByText('Count: 1')).toBeInTheDocument();
  });

  it('scaffold uses headerBar / sideBarLeft (actual API)', () => {
    render(
      Scaffold()
        .headerBar(
          Header()
            .height(80)
            .className('px-6')
            .children([Text('App Title').variant('h2')])
        )
        .children([Text('Welcome to the main content area.')])
        .build()
    );

    expect(screen.getByText('App Title')).toBeInTheDocument();
    expect(screen.getByText('Welcome to the main content area.')).toBeInTheDocument();
  });

  it('store + grid shop snippet compiles', () => {
    const appStore = createStore({
      cart: [] as { id: string; name: string; price: number; quantity: number }[],
      products: [
        { id: '1', name: 'MacBook Pro', price: 2499 },
        { id: '2', name: 'iPhone 15', price: 999 },
      ],
    });

    const cartTotal = computed(() => {
      const cart = appStore.getState().cart;
      return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    });

    render(
      Box()
        .observer()
        .children(() => [
          Row().children([
            Text(`Total: $${cartTotal.value.toFixed(2)}`).bindSignal(cartTotal),
            Badge().text(String(appStore.getState().cart.length)),
          ]),
          Grid()
            .columns(2)
            .gap('md')
            .children(
              appStore.getState().products.map((product) =>
                Card().children([
                  Text(product.name).weight('bold'),
                  Button(`Add $${product.price}`).onPress(() => {
                    appStore.setState((s) => ({
                      cart: [...s.cart, { ...product, quantity: 1 }],
                    }));
                  }),
                ])
              )
            ),
        ])
        .build()
    );

    expect(screen.getByText('Total: $0.00')).toBeInTheDocument();
    expect(screen.getByText('MacBook Pro')).toBeInTheDocument();
  });
});
