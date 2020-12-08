import { Component, OnInit, OnDestroy } from '@angular/core';

import { Customer } from '../shared/interfaces';
import { DataService } from '../core/services/data.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-communication',
  templateUrl: './communication.component.html'
})
export class CommunicationComponent implements OnInit, OnDestroy {

  customers: Customer[] = [];
  customer: Customer;
  private subs = new SubSink();

  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.subs.sink = this.dataService.getCustomers()
        .subscribe((custs: Customer[]) => this.customers = custs);
  }

  selected(cust: Customer) {
    this.customer = cust;
  }

  /* In addCustomer() method in dataService, we push(push()) a new customer in the customers array. Now the question is, if that
  new customer is being pushed in the array and then that array is returned in this method, when we call the addCustomer() method
  and then we update our customers prop in this comp and then pass that customers to child and therefore the changeDetection of child would
  also run so it must rerender the ui right? But why it's not reflected in the UI???
  The answer relates to passing reference types vs value types. If our container comp(this comp), was updating a VALUE or primitive type,
  like a number, string, boolean, null, undefined, symbol, then in this case that would work and it would cause the child comp to rerender
  the UI. So if the customers prop of this comp was a primitive type, the updating of the value would work and that would update the @Input() prop
  of child and UI of child comp would rerender, because the change detection mechanism of child would catch that update ... . But customers prop here,
  isn't a primitive type.
  So if you go to service file and it's addCustomer() , it's pushing a new OBJECT and that would add a new item to the array, but would the array ITSELF
  change? NOOOOOO!
  Important: The array itself won't change when a new item push into it(either that item would be primitive type of value type, it won't change the array
   itself.)
  So we added a new item. but the array itself didn't change. So the data that being pass to @Input() prop of child comp, didn't change and the
  change detection which would be fire when the @Input() would updated, won't run(it's only looking for a CHANGE to the overall array(in this case)).
  That didn't happen, therefore the UI didn't update.

  Important: So when you pass an objet by reference, if EVEN ANYTHING in the object changes, that's not gonna reflected to the object itself and
   in this case, the presentation comp and the reason is outer object which could be an array(that array contains some objects, but when we push
   new object into it, the array doesn't change itself) or could just be an object(like customer object), if you change a prop in that object,
   that also won't not be change the outer object and that's because the outer object didn't change it's memory location or in other words, is by
   reference and it references a pointer in memory.

  By cloning, it gets us into immutable type of data and state. So we need to see the cloning techniques.*/
  addCustomerPush() {
    this.dataService.addCustomer()
        .subscribe((custs: Customer[]) => this.customers = custs);
  }

  addCustomerClone() {
    this.dataService.addCustomerClone()
        .subscribe((custs: Customer[]) => this.customers = custs);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

}
