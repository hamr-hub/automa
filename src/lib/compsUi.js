import VTooltip from '../directives/VTooltip';
import VAutofocus from '../directives/VAutofocus';
import VClosePopover from '../directives/VClosePopover';

// Vite 使用 import.meta.glob 替代 webpack 的 require.context
const uiComponents = import.meta.glob('../components/ui/*.vue', { eager: true });
const transitionComponents = import.meta.glob(
  '../components/transitions/*.vue',
  { eager: true }
);

function componentsExtractor(app, components) {
  Object.entries(components).forEach(([path, module]) => {
    const componentName = path.replace(/.*\/(.+)\.vue$/, '$1');
    const component = module?.default ?? {};

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
