import { page } from 'fiboui';
import { App } from '../../shared/App';

/** Call App() so createPage/page assemble the builder before Flight. HydrateFlag lives in layout. */
export default page(() => App());
