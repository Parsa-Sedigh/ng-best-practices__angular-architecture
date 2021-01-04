import { Component, OnInit } from '@angular/core';

import { EventBusService, Events } from './core/services/event-bus.service';
import { Customer } from './shared/interfaces';
import { Subscription } from 'rxjs';
import { DataService } from './core/services/data.service';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';

@AutoUnsubscribe()
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  customers: Customer[];
  customer: Customer;
  eventbusSub: Subscription;
  customersChangedSub: Subscription;

  constructor(private eventbus: EventBusService, private dataService: DataService) {}

  ngOnInit() {
    // Example of using an event bus to provide loosely coupled communication (mediator pattern)
    /* Here we're saying: Hey eventBus, on Events.CustomerSelected event, please call the callback function(second arg) which by calling
    that function, it will give us the data which we expect that data to be customer (based on the event I said that) and then we
    assign that received customer, to a prop. So here we're subscribing to event bus and was able to get the customer.*/
    /* Related to 46th vid:
     In this example, we're showing two different ways that app.component could get some data.
     So we could use the event bus, or we could use dataService.

     In case of using dataService(observable service), as we get the data, we can update the property(this.customers) and then, that
     property is read from this place, to update the red circle.

     Now what's different there, is with the event bus, if you right click on .on() and click on peek definition, that's not gonna show
     you WHO ACTUALLY(because, yeah! the eventBus sent this to us. But WHO ACTUALLY sent that data to eventBus to then that eventBus sent it
     to us? We can't find out! and it would show you just the event-bus and not that actual thing) raised the data. So it would just show
     the middle-man code.
     Whereas, if we click on peek definition on dataService in the second line, which will lead us to the service(till here, it's like
     what event-bus did to us, but in this case, we can go to where the actual thing happened which is at the place, where
     the customersSubject$ is called and used .next() on it, which is addCustomerImmutable() in this case.) we can jump down
     to where next() is called and if we need to change the data, we know exactly what's happening.

     So the difference is the observable service not only notifies, but it's also the one that is changing the data. So you have ONE
     place to go, for maintenance.
     Now is this better than the event bus?
     Well, it has it's own pros and cons. It's very easy to subscribe to it, as you'll see, so that's a pro. But let's talk about
     overall pros and cons now. So let's back to pamphlet.*/
    this.eventbusSub = this.eventbus.on(Events.CustomerSelected, cust => (this.customer = cust));

    //Example of using BehaviorSubject to be notified when a service changes
    this.customersChangedSub = this.dataService.customersChanged$.subscribe(custs => (this.customers = custs));
  }

  ngOnDestroy() {
    // AutoUnsubscribe decorator above makes these calls unnecessary
    // this.eventbusSub.unsubscribe();
    // this.customersChangedSub.unsubscribe();
  }
}
