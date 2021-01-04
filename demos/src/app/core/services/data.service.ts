import { Injectable } from '@angular/core';

import { Observable, of, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { Customer, Product } from '../../shared/interfaces';
import { ClonerService } from './cloner.service';
import { List } from 'immutable';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  customers: Customer[] = [
    {
      id: 1,
      name: 'John Doe',
      city: 'Phoenix',
      age: 42
    },
    {
      id: 2,
      name: 'Jane Doe',
      city: 'Seattle',
      age: 30
    },
    {
      id: 3,
      name: 'Michelle Thompson',
      city: 'Orlando',
      age: 22
    }
  ];

  products: Product[] =  [
    {
      id: 1,
      name: 'Basketball',
      price: 29.99
    },
    {
      id: 2,
      name: 'XBox',
      price: 249.99
    },
    {
      id: 3,
      name: 'Nintendo Switch',
      price: 249.99
    },
    {
      id: 4,
      name: 'Bat',
      price: 29.99
    },
    {
      id: 5,
      name: 'Glove',
      price: 29.99
    },
    {
      id: 6,
      name: 'Cell Phone',
      price: 799.99
    },
    {
      id: 7,
      name: 'Cell Phone Service',
      price: 49.99
    },
    {
      id: 8,
      name: 'Laptop',
      price: 999.99
    },
    {
      id: 9,
      name: 'Bluetooth Speaker',
      price: 69.99
    },
    {
      id: 10,
      name: 'TV',
      price: 1599.99
    }
  ];

  /* Here, we chose a BehaviorSubject, because I wanted any subscribers to automatically get the LAST value that might have been sent
  out and that way, we can keep multiple subscribers up to date. So as changes are emitted, one of those components subscribes a little bit
  later, but they'll still be able to get that last value that was sent to the earlier subscribers.

  So here, we have a BehaviorSubject of Customer array(Customer[]) and we're gonna return this.customers .
  Now we're NOT gonna expose that subject directly. Because you normally don't want to expose the subject directly. Instead, we're gonna
  call .asObservable() and that way, whoever subscribes, they just subscribe like normal.

  Now if you scroll a little bit and go to addCustomer() , in that method, when we add a customer, we're gonna call: this.customersSubject$.next()
  So you see that is exactly the same as what we've done in previous examples.
  So we raise that data.
  Now the difference here, is, not only the consumer or observer is subscribing to the service, but it also can go directly to the service, to see
  what exactly the data is which is being sent(so what is the data that's being sent?). WHEREAS with the event bus, some component or a service, would
  send an event WITH the data to the event bus, but on the other end or the subscribing end, we don't really know who ultimately sent that data. Again,
  unless we provide a little more information about who sent that data. Whereas with this approach, not only I do know who I'm subscribing to, but I ALSO
  know where to go to make data changes.
  That's all there is about this particular aspect of it(the observable service side). So before going to other side which is the subscribers to this
  service, let's go to communication tab of the running app, now if you click on add customer(push a clone) button, we know that we are seeing the
  number of customers in that red circle, which would be updated by each clicking that we do, because we have a subscriber to that added customer and it
  shows the length of current customers at that circle.
  Now as you push a new clone of the customer into the list, that's gonna send a notification out to ANY LISTENERS and in our application,
  the app.component.ts is one of the listeners.

  Notice how much those components(app.component and customers.component). Because the app.component is all the way up to the root and the
  customers-list.component which is another listener of this observable, is fairly deep in the hierarchy.

   So this was another way to communicate between comps.

   So now let's see how we can actually subscribe to the data(the observable service).*/
  immutableCustomers = List<Customer>();
  immutableProducts = List<Product>();

  private customersSubject$ = new BehaviorSubject<Customer[]>(this.customers);
  customersChanged$ = this.customersSubject$.asObservable();

  constructor(private cloner: ClonerService) { }

  getCustomers() : Observable<Customer[]> {
    // Use the following code if using immutable.js
    // return of(this.immutableCustomers.toJS());

    return of(this.customers);
  }

  getProducts() : Observable<Product[]> {
    // Use this for immutable.js
    // return of(this.immutableProducts.toJS());

    return of(this.products);
  }

  addCustomer() : Observable<Customer[]> {
    let id = this.customers[this.customers.length - 1].id + 1;
    this.customers.push({
      id: id,
      name: 'New Customer ' + id,
      city: 'Somewhere',
      age: id * 5
    });
    this.customersSubject$.next(this.customers);
    return of(this.customers);
  }

  addCustomerClone() : Observable<Customer[]> {
    return this.addCustomer().pipe(
      map(custs => {
        return this.cloner.deepClone(custs);
      })
    )
  }

  addCustomerImmutable() : Observable<Customer[]> {
    let id = this.immutableCustomers[this.immutableCustomers.size - 1].id + 1;
    this.immutableCustomers.push({
      id: id,
      name: 'New Customer ' + id,
      city: 'Somewhere',
      age: id * 5
    });
    this.customersSubject$.next(this.customers);
    return of(this.immutableCustomers.toJS());
  }

  addProduct(newProduct: Product) {
    this.products.push({
      id: this.products.length,
      name: newProduct.name,
      price: +newProduct.price
    });
    return of(this.products);
  }

}
