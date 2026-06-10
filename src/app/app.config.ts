import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { DfArrowhead, provideNgDrawFlowConfigs } from '@ng-draw-flow/core';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { MarkdownNode } from './canvas/markdown-node';
import { FileNode } from './canvas/file-node';
import { ImageNode } from './canvas/image-node';
import { LinkCard } from './canvas/link-card';
import { GroupNode } from './canvas/group-node';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withViewTransitions()),
    provideClientHydration(),
    provideNgDrawFlowConfigs({
      nodes: {
        text: MarkdownNode,
        'file-note': FileNode,
        image: ImageNode,
        link: LinkCard,
        group: GroupNode,
      },
      connection: {
        arrowhead: { type: DfArrowhead.Arrow },
      },
      options: {
        nodesDraggable: true,
        nodesDeletable: false,
        connectionsDeletable: false,
        connectionsCreatable: false,
      },
    }),
  ],
};
