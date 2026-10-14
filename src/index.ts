'use client';

export type {
  Buildable,
  FiboChild,
  FiboChildren,
  FiboThemeName,
  ResponsiveStyles,
  BaseProps,
  ChildrenProps,
  Alignment,
  MainAxisAlignment,
  CrossAxisAlignment,
  LayoutProps,
  TextType,
  ButtonVariant,
  StatusType,
} from './core/types';
export {
  signal,
  computed,
  observable,
  createStore,
  Signal,
  ComputedSignal,
  Observable,
  createReactivityRoot,
  runInScope,
  getCurrentScope,
} from './core/state';
export type { BindableSignal, Store as ReactiveStore, ReactivityScope } from './core/state';
export { useSignal, useReactiveStore, useObservable } from './core/hooks';
export { useBuilderState, Observer, ProviderWrapper, useProvider } from './core/StateWrapper';
export { ReactivityRoot } from './core/ReactivityRoot';
export { FineGrainText, bindText } from './core/FineGrain';
export { applyResponsiveStyles } from './core/component';
export {
  useTransition,
  useSpring,
  useStagger,
  useMountTransition,
  usePrefersReducedMotion,
  useScrollProgress,
  Easing,
} from './core/animationHooks';
export type { TransitionConfig, SpringConfig } from './core/animationHooks';
export { cssCurve } from './core/animations';
export type { AnimationOptions } from './core/animations';
export { Presence } from './core/Presence';
export type { PresenceProps } from './core/Presence';
export { Reveal } from './core/Reveal';
export type { RevealProps } from './core/Reveal';
export { ScrollProgress } from './core/ScrollProgress';
export { scrollTo, startViewTransition, supportsViewTimeline, supportsScrollTimeline } from './core/scroll';
export { springEase, resolveCssEase } from './core/easing';
export type { SpringOptions } from './core/easing';
export { MOTION_PRESETS, normalizePreset, FIBO_MOTION_CSS } from './core/motionCss';
export type { MotionPreset, CustomMotion } from './core/motionCss';
export { MotionStyles, getMotionCss, ensureMotionCss } from './core/styleManager';
export { FIBO_BREAKPOINTS, toMediaQuery } from './core/breakpoints';
export type { BreakpointKey } from './core/breakpoints';
export { useViewportWidth } from './core/ResponsiveWrapper';
export { FiboApp, FiboAppBuilder } from './core/FiboApp';
export { mount, Fibo, toElement } from './core/mount';
export { PluginManager } from './core/plugin/PluginManager';
export type { FiboPlugin, FiboContext, RouteDefinition, SidebarConfig } from './core/plugin/types';
export { ValueBuilder } from './core/builder';
export type { PseudoStateFn } from './core/builder';
export type { PseudoStateBuilder } from './core/PseudoStateBuilder';

export { FiboThemeProvider, useFiboTheme } from './theme/provider';
export { materialTheme } from './theme/material';
export { cupertinoTheme } from './theme/cupertino';
export { webTheme } from './theme/web';
export type { FiboTheme } from './theme/types';

export { Center } from './layout/Center';
export { Column } from './layout/Column';
export { Container } from './layout/Container';
export { Row } from './layout/Row';
export { Spacer } from './layout/Spacer';
export { Scaffold } from './layout/Scaffold';
export { Header } from './layout/Header';
export { Sidebar } from './layout/Sidebar';
export { DashboardLayout } from './layout/DashboardLayout';
export { ZStack } from './layout/Stack';
export { Line } from './layout/Line';
export { ScrollView } from './layout/ScrollView';
export { VirtualColumn } from './layout/VirtualColumn';

export { Avatar } from './content/Avatar';
export { Badge } from './content/Badge';
export { Text } from './content/Text';
export { Label } from './content/Label';
export { Image } from './content/Image';
export { Spinner } from './content/Spinner';
export { Skeleton } from './content/Skeleton';
export { Alert } from './content/Alert';
export { Progress } from './content/Progress';
export { Icon } from './content/Icon';
export { Integration } from './content/Integration';

export { Button } from './interactive/Button';
export { TextField } from './interactive/TextField';
export { Switch } from './interactive/Switch';
export { Checkbox } from './interactive/Checkbox';
export { RadioGroup } from './interactive/RadioGroup';
export { Textarea } from './interactive/Textarea';
export { Select } from './interactive/Select';
export { Combobox } from './interactive/Combobox';

export { Box } from './structure/Box';
export { Card } from './structure/Card';
export { List } from './structure/List';
export { ListTile } from './structure/ListTile';
export { Table } from './structure/Table';
export { Tags } from './structure/Tags';
export { Banner } from './structure/Banner';
export { Collapse } from './structure/Collapse';
export { Grid, GridItem } from './structure/Grid';
export { AssetCard } from './structure/cards/AssetCard';
export { ProfileCard } from './structure/cards/ProfileCard';
export { CollectionCard } from './structure/cards/CollectionCard';
export { ContentCard } from './structure/cards/ContentCard';

export { Canvas } from './graphics/Canvas';
export { Circle } from './graphics/shapes/Circle';
export { Rect } from './graphics/shapes/Rect';
export { Path } from './graphics/shapes/Path';
export { LinearGradient } from './graphics/gradients/LinearGradient';
export { BurgerIcon } from './graphics/icons/BurgerIcon';

export {
  Router,
  Link,
  NavLink,
  useRouter,
  useNavigate,
  useParams,
  useLocation,
  useQuery,
} from './navigation';

export { Component, Page, getRegisteredRoutes, clearRoutes, registerRoute } from './decorators';
export { Store, useStore, getStore, clearStores, isStore } from './state';
export { persist, clearPersistedState, getPersistedState, storageAdapters } from './state';
export type { PersistOptions, StorageAdapter } from './state';
