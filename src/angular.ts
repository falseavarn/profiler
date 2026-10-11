import { Component, ElementRef, Input, OnChanges, OnDestroy, PLATFORM_ID, booleanAttribute, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { avatar, follow, type Shape } from './index.js';

@Component({
  selector: 'profiler-avatar',
  standalone: true,
  template: '',
  host: { '[innerHTML]': 'svg' },
})
export class AvatarComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) seed!: string | number;
  @Input() shape: Shape = 'circle';
  @Input({ transform: booleanAttribute }) blink = false;
  @Input({ transform: booleanAttribute }) spin = false;
  /** Eyes follow the pointer. */
  @Input({ transform: booleanAttribute }) follow = false;

  svg?: SafeHtml;
  private el: HTMLElement = inject(ElementRef).nativeElement;
  private sanitizer = inject(DomSanitizer);
  private browser = isPlatformBrowser(inject(PLATFORM_ID));
  private stop?: () => void;

  ngOnChanges() {
    // Angular strips SVG from innerHTML; safe to trust since output is built only from fixed shapes.
    this.svg = this.sanitizer.bypassSecurityTrustHtml(avatar(this.seed, this.shape, { blink: this.blink, spin: this.spin }));
    this.stop?.();
    this.stop = this.follow && this.browser ? follow(this.el) : undefined;
  }

  ngOnDestroy() {
    this.stop?.();
  }
}
