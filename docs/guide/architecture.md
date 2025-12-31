
# Architecture: The Builder Pattern

At the core of FiboUI is the `FiboBuilder` class. Every component in the system is constructed via a builder that extends this base class.

## How it works

1. **Instantiation**: Calling `Box()` creates a new instance of `BoxBuilder`.
2. **Chaining**: Methods like `.padding(4)` or `.color('red')` update the internal state of the builder and return `this`, allowing method chaining.
3. **Building**: The `.build()` method finalizes the configuration and returns a standard React Element.

## FiboBuilder Base Class

The base class provides common properties shared by all UI elements:

- `className(string)`: append CSS classes.
- `style(object)`: inline styles.
- `key(string)`: React key.
- `onPress(callback)`: click handler.

## Creating your own Builder

You can extend the system by creating your own builders using `createBuilder`.

```typescript
import { FiboBuilder, createBuilder } from 'fiboui/core';

class MyComponentBuilder extends FiboBuilder {
    private _title: string = "";

    title(val: string): this {
        this._title = val;
        return this;
    }

    build() {
        return <div className={this.getClassName()}>{this._title}</div>;
    }
}

export const MyComponent = createBuilder(MyComponentBuilder);
```
