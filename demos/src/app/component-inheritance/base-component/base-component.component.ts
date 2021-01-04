import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-base-component',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BaseComponent implements OnInit, OnChanges {
  @Input() label: string;
  
  private _value: string;
  @Input() get value() {
      console.log('in getter');
      return this._value;
  }
  set value(val: string) {
      console.log('in setter');
      if (val && val !== this._value) {
        this.isDirty = true;
      }
      this._value = val;
      this.valueChange.emit(val);
  }

  @Input() isDirty = false;
  @Output() valueChange = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['value']) {
      console.log('Value changed ', changes['value'].currentValue);
    }
  }

}
