import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, SimpleChanges, OnChanges } from '@angular/core';
import { Customer } from 'src/app/shared/interfaces';

@Component({
  selector: 'app-customer-details',
  templateUrl: './customer-details.component.html',
  styleUrls: ['./customer-details.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerDetailsComponent implements OnInit, OnChanges {

  @Input() customer: any;
  @Output() customerChanged = new EventEmitter<any>();
  logMessages = [];

  constructor() { }

  ngOnInit() {

  }

  ngOnChanges(changes: SimpleChanges) {

    /* When a new customer comes in this component(why comes in? Because it's an @Input() prop), we detect that entrance(so we check if
    there is a change to that @Input prop) and in this method, we always call addTax() when some changes happen.*/
    if (changes['customer']) {
      const cust = changes['customer'].currentValue as Customer;
      this.addTax(cust);
      this.logMessages.push({ title: 'Customer changed', value: cust });
    }
  }

  addTax(cust: Customer) {
    /* It's better to do this in service level.*/
    cust.orderTotalWithTax = cust.orderTotal + (cust.orderTotal * .08);
  }

  change() {
    this.customerChanged.emit(this.customer);
  }

}
