import * as React from 'react';
import { HashRouter, Route, Switch } from "react-router-dom";
import { Spinner, SpinnerSize } from 'office-ui-fabric-react';
import * as strings from 'ForumsHooksWebPartStrings';

import { IForumsHooksProps } from './IForumsHooksProps';
import { AppStateProvider } from '../../../Contexts/AppContext';
import { WebPartContextProvider } from '../../../Contexts/WebPartContext';

const Forums = React.lazy(() => import('./Forums/ForumsView'))
const Topics = React.lazy(() => import('./Topics/TopicsView'))
const Posts = React.lazy(() => import('./Posts/PostsView'))

const ForumsHooks: React.FC<IForumsHooksProps> = ({ context }) =>
  <AppStateProvider>
    <WebPartContextProvider context={context}>
      <React.Suspense fallback={<Spinner size={SpinnerSize.large} label={strings.Loading} />}>
        <HashRouter>
          <Switch>
            <Route path="/" exact component={Forums} />
            <Route path="/topics/:fid" component={Topics} />
            <Route path="/posts/:fid/:tid" component={Posts} />
            <Route path="*" component={Forums} />
          </Switch>
        </HashRouter>
      </React.Suspense>
    </WebPartContextProvider>
  </AppStateProvider>

export default ForumsHooks