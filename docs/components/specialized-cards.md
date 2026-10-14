<script setup>
import { AssetCard } from '../../src/structure/cards/AssetCard'
import { ProfileCard } from '../../src/structure/cards/ProfileCard'
import { CollectionCard } from '../../src/structure/cards/CollectionCard'
import { ContentCard } from '../../src/structure/cards/ContentCard'
import { Box } from '../../src/structure/Box'

const renderAssetCard = () =>
  AssetCard()
    .image('https://picsum.photos/400/400')
    .title('Cosmic Dreams #1234')
    .price('2.5')
    .likes('142')
    .timeLeft('2h 15m left')
    .maxWidth('320px')


const renderProfileCard = () =>
  ProfileCard()
    .banner('https://picsum.photos/400/200')
    .avatar('https://i.pravatar.cc/100')
    .name('Sarah Chen')
    .handle('@sarahchen')
    .stats({ items: '234', owners: '89', floor: '1.2' })
    .maxWidth('320px')


const renderCollectionCard = () =>
  CollectionCard()
    .image('https://picsum.photos/400/400')
    .title('Abstract Visions')
    .author('Michael Ross')
    .items('125 Items')
    .maxWidth('320px')


const renderContentCard = () =>
  ContentCard()
    .image('https://picsum.photos/400/300')
    .title('The Future of Web3 Design')
    .description('Exploring the intersection of blockchain technology and modern user interface design patterns.')
    .source('Design Blog')
    .date('Dec 30, 2024')
    .maxWidth('320px')

</script>

# Specialized Cards

Pre-styled card components for common use cases like NFTs, profiles, collections, and content.

These specialized cards are built on top of the base `Card` component and provide opinionated, production-ready designs for specific scenarios.

## Card Types

### AssetCard

For displaying NFTs, digital assets, or marketplace items.

<ReactWrapper :component="renderAssetCard" />

::: details View Source
```tsx
AssetCard()
  .image('https://picsum.photos/400/400')
  .title('Cosmic Dreams #1234')
  .price('2.5')
  .likes('142')
  .timeLeft('2h 15m left')

```
:::

**Properties:**

| Method | Type | Description |
| :--- | :--- | :--- |
| `.image(url)` | `string` | Asset image URL |
| `.title(text)` | `string` | Asset title/name |
| `.price(value)` | `string \| number` | Current price in ETH |
| `.likes(count)` | `string \| number` | Number of likes/favorites |
| `.timeLeft(time)` | `string` | Optional auction countdown timer |

---

### ProfileCard

For displaying user profiles with stats and social actions.

<ReactWrapper :component="renderProfileCard" />

::: details View Source
```tsx
ProfileCard()
  .banner('https://picsum.photos/400/200')
  .avatar('https://i.pravatar.cc/100')
  .name('Sarah Chen')
  .handle('@sarahchen')
  .stats({ items: '234', owners: '89', floor: '1.2' })

```
:::

**Properties:**

| Method | Type | Description |
| :--- | :--- | :--- |
| `.banner(url)` | `string` | Profile banner image URL |
| `.avatar(url)` | `string` | Profile avatar image URL |
| `.name(text)` | `string` | User display name |
| `.handle(text)` | `string` | User handle/username |
| `.stats(stats)` | `{ items, owners, floor }` | Profile statistics object |

---

### CollectionCard

For displaying NFT collections or galleries with overlay text.

<ReactWrapper :component="renderCollectionCard" />

::: details View Source
```tsx
CollectionCard()
  .image('https://picsum.photos/400/400')
  .title('Abstract Visions')
  .author('Michael Ross')
  .items('125 Items')

```
:::

**Properties:**

| Method | Type | Description |
| :--- | :--- | :--- |
| `.image(url)` | `string` | Collection cover image URL |
| `.title(text)` | `string` | Collection title |
| `.author(text)` | `string` | Creator/author name |
| `.items(text)` | `string` | Item count display text |

---

### ContentCard

For blog posts, articles, or news content.

<ReactWrapper :component="renderContentCard" />

::: details View Source
```tsx
ContentCard()
  .image('https://picsum.photos/400/300')
  .title('The Future of Web3 Design')
  .description('Exploring the intersection of blockchain...')
  .source('Design Blog')
  .date('Dec 30, 2024')

```
:::

**Properties:**

| Method | Type | Description |
| :--- | :--- | :--- |
| `.image(url)` | `string` | Optional featured image URL |
| `.title(text)` | `string` | Article/content title |
| `.description(text)` | `string` | Content description/excerpt |
| `.source(text)` | `string` | Optional content source |
| `.date(text)` | `string` | Optional publication date |

## Architecture

**Base Card vs. Specialized Cards:**

- **`Card`** (`/structure/Card`): Generic metric/stat card for dashboards
- **Specialized Cards** (`/structure/cards`): Pre-styled cards for specific use cases

All specialized cards inherit from `FiboBuilder` and can use any dynamic CSS properties.

## Usage Examples

### Grid of Assets

```tsx
Grid()
  .columns(3)
  .gap(4)
  .children([
    AssetCard().image('...').title('Item 1').price('1.5').likes('50'),
    AssetCard().image('...').title('Item 2').price('2.0').likes('75'),
    AssetCard().image('...').title('Item 3').price('1.8').likes('60')
  ])

```

### Profile Showcase

```tsx
ProfileCard()
  .banner('/profile-banner.jpg')
  .avatar('/avatar.jpg')
  .name('John Doe')
  .handle('@johndoe')
  .stats({ items: '500', owners: '120', floor: '2.5' })
  .width('400px')

```

## See Also

- [Card](/components/structure-card) - Base metric card
- [Avatar](/components/content-avatar) - User avatar component
- [Badge](/components/content-all) - Status badges
- [Grid](/components/structure-grid) - Grid layout
