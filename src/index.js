import React from 'react';
import ReactDOM from 'react-dom';
import whyDidYouUpdate from 'why-did-you-update';
import App from './app';
import registerServiceWorker from './registerServiceWorker';

whyDidYouUpdate(React, {
  exclude: /^(?:CssBaseline|Ripple|RootRef|Tooltip|TouchRipple|TransitionGroup)$/
});

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
