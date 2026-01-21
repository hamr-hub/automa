import VTooltip from '../directives/VTooltip';
import VAutofocus from '../directives/VAutofocus';
import VClosePopover from '../directives/VClosePopover';

// Webpack 使用 require.context 替代 Vite 的 import.meta.glob
const uiComponents = require.context('../components/ui', false, /\.vue$/);
const transitionComponents = require.context(
  '../components/transitions',
  false,
  /\.vue$/
);

function componentsExtractor(app, componentsContext) {
  componentsContext.keys().forEach((fileName) => {
    const componentName = fileName.replace(/^\.\/(.+)\.vue$/, '$1');
    const componentConfig = componentsContext(fileName);
    const component = componentConfig?.default ?? componentConfig;

    app.component(componentName, component);
  });
}

export default function (app) {
  app.directive('tooltip', VTooltip);
  app.directive('autofocus', VAutofocus);
  app.directive('close-popover', VClosePopover);

  componentsExtractor(app, uiComponents);
  componentsExtractor(app, transitionComponents);
}
