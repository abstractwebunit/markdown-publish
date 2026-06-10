import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import DOMPurify from 'dompurify';
import type { CanvasNode, FileNotePayload } from '@shared/content-model';
import { CONNECTOR_IMPORTS, CONNECTORS_STYLES, CONNECTORS_TEMPLATE, CanvasNodeBase } from './connectors';

@Component({
  selector: 'app-file-node',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...CONNECTOR_IMPORTS],
  host: {
    '[style.width.px]': 'node().width',
    '[style.height.px]': 'node().height',
    '[style.border-color]': 'node().color || null',
  },
  template:
    `
    @if (payload().available) {
      <button type="button" class="card" (click)="open($event)">
        <div class="body" [innerHTML]="safeHtml()"></div>
      </button>
    } @else {
      <div class="card unavailable">
        <h3 class="title">{{ payload().title }}</h3>
        <p class="hint">This note is not available.</p>
      </div>
    }
  ` + CONNECTORS_TEMPLATE,
  styles: [
    CONNECTORS_STYLES,
    `
      :host {
        display: block;
        position: relative;
        box-sizing: border-box;
        height: 100%;
        border: 0.0625rem solid var(--df-node-border-color, var(--background-modifier-border));
        border-radius: 0.5rem;
        background: var(--background-primary);
        overflow: hidden;
      }

      .card {
        /* flex column: kills the UA vertical centering of <button> content */
        display: flex;
        flex-direction: column;
        align-items: stretch;
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0.5rem 0.75rem;
        border: none;
        background: transparent;
        text-align: left;
        font: inherit;
        color: inherit;
        overflow: auto;
      }

      button.card {
        cursor: pointer;
      }

      .title {
        margin: 0 0 0.5rem;
        font-size: 1rem;
      }

      .unavailable {
        opacity: 0.6;
      }
    `,
  ],
})
export class FileNode extends CanvasNodeBase {
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  protected readonly node = computed(() => this.modelSignal() as unknown as CanvasNode);
  protected readonly payload = computed(() => this.node().payload as FileNotePayload);

  protected readonly safeHtml = computed(() => {
    const html = this.payload().html ?? '';
    return this.sanitizer.bypassSecurityTrustHtml(
      this.isBrowser ? DOMPurify.sanitize(html) : html,
    );
  });

  protected open(event: MouseEvent): void {
    if (this.wasDragged(event)) {
      return; // the click ended a drag — don't navigate
    }
    const { slug, anchor } = this.payload();
    this.router.navigateByUrl(`/${slug}${anchor ? `#${anchor}` : ''}`);
  }
}
