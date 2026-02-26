import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[horizontalScroll]'
})
export class HorizontalScrollDirective {

  constructor(private el: ElementRef<HTMLElement>) { }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent) {

    if (window.innerWidth >= 992) return;

    if (event.deltaY !== 0) {
      event.preventDefault();
      this.el.nativeElement.scrollLeft += event.deltaY;
    }
  }
}
