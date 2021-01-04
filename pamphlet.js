/* 31-06_reference vs value types: (Continue)
In structuring-components folder, we have a container comp which it's name is structuring-components and then 2 child comps.
Now if you run the project and go to /structuring-components, in the left we have the presentation for customers-list comp and
on the right we have the presentation of customers-detail child comp. As you click on one of the customers on the left, the data of that
clicked customer would pass up to the parent component through @Output() prop and then stupiditly! it passes that data down and
in child comp and with @Input() we receive that data and the change detection runs and updates the UI and then renders it.

Now we have the same scenario in the communication folder but notice there we have ngOnChanges. Now what I gonna do now is going to call a
service in the parent comp which with doing that, it'll update the customers prop and it's gonna update the array that's displayed in the
child comp. How it gonna update the customers prop? It'll push a new customer in that array. BUT by doing that the UI won't change!
The funny part about this, is ACTUALLY it updated the array. So actually we do pushed a new customer in that array but the old ones are
showing and it's not reflecting the UI and that's because of how the data is passed when we use @Input() props and pass reference types vs
value types(why I didn't mention @Output() ? Because the UI is related to presentation comps and those comps use @Input to update their
data which is using in UI, so in this case we care about @Input()).
So let's go to communication folder and structuring-components folder.

32-07_cloning techniques:
Cloning is the process of making an exact copy of an OBJECT and you need to plan for it up front your architecture. A lot of times you hear
people refer to this as an immutable approach where we never change the object and instead, we always make a fresh copy of it and then pass
that fresh copy around to other variables and ... .
1) The simplest way would be JSON.parse() and a JSON.stringify() , but this cloning approach has some limitations.
2) You can write sth tht overcomes the limitation of previous approach.
3) Use immutable.js library or ...

33-08_cloning in action:
Assume this scenario:
1.Container component passes data to presentation comp using @Input prop then maybe that presentation comp renders that data
2.User changes data
3.Then when the button is clicked, @Output prop emits customer OBJECT to container comp
4.Container comp talks with service to update customer OBJECT
5.Container gets updated version of that object from service and then again passes that updated object to child and ... .

So when the @Output sends the customer prop up to the container and then the container can call the service and what should happen then, is
then the container comp should go and grabs the FRESH(cloned) customer from the service(by calling an appropriate method of service) and then it would
pass that new cloned object to child comp and therefore change detection should run and that would cause ngOnChanges() get called and the UI should
update. BUT when we're not cloning, if the object in memory hasn't changed or at least angular thinks it hasn't changed, then ngOnChanges isn't
gonna fire and this is sth you need to plan for, with your services. So if you don't clone the @Input prop in the child, it won't run the
changeDetection and ngOnChanges() and again that's because the service has a separate reference to that customer object, the container has another
reference and child comps has another and ... .
Now let's assume in ngOnInit() of container comp, we call this.getCustomer() and this.getCustomers() which those are defined in that comp and they
just call a method of service and then after calling those methods, they update some props which would go to @Input props of child comps and when we
update a customer through changed() method, we call updateCustomer() from service and AGAIN call getCustomer() and getCustomers() which as I mentioned,
are defined in that comp in order to get fresh customer and customers from service.
Now in the service and in it's getCustomers(), it just returns the data it has by using of() operator. But the thing is we're returning the exact
copy that this service has as well and it's the original customer object when the page loaded, therefore the outer object in memory(customer object)
didn't change but just a prop inside of it changed. That's why ngOnChanges() isn't firing. So we need to clone the object(array in this case), like:
const custs = JSON.parse(JSON.stringify(this.customers));
Learn: So first we stringify it and then reconstitute it with JSON.parse() . What it does, is it creates a deep copy of that object. But this approach has
 some problems. If you have sth like dates in that object and or few other scenarios, this won't work right.

So we can create a cloner.service file, which we injected into the service which we call for getting customers and that service uses clone npm package and
it fixes the things like date props and it's a very light package. So if you have a date prop in the object you want to clone, you need to use that
package.
clone.service.ts:
import * as clone from 'clone';

deepClone<T>(value): T {
    return clone<T>(value);
}

So the clone() method of clone package, does a deep copy.*/
/* 34-09_cloning with immutable.js:
Let's go to cloning project.
When you have a lot of things that should be immutable and cloneable, you can use immutable.js or ... . This package has an object called
List which can work with arrays(list of items), Map which can work with key-value pairs or objects, fromJS which can do a deep copy and creates
sth called a map and then we can convert that map into a normal JS object.

So we can create a different array of customers called immutableCustomers and that's gonna be a list of Customer, so it would be:
immutableCustomers = List<Customer>(this.customers); which that List of Customer is our old customers array but by wrapping it with List,
those customers that we had, are now immutable. So now we can't really change that array and if you do change that array, it'll give us a NEW
array. So now in customers.service and in it's getCustomers(): Observable<Customer []> {} we can use our immutableCustomers and use toArray() on it
and that's gonna clone those customers for us. BUT:
Important: Note that toArray() shallowly converts the collection or List(in our case the immutableCustomers list) to an Array.
 Use toJS() to DEEPLY convert the collection to an array.

Now in getCustomer() we can comment out return this.clonerService.deepClone<Customer>(cust) . Now in that method we want to return a single
object or Observable<Customer>. Now there's multiple to do that, but we can use fromJS() which is from a javascript object and that method returns any
type, but under the hood, it returns what's called a map and then we convert that into a JS object. So that was another kind of a fresh copy or clone
of an OBJECT. Then we cast it by using as keyword, because we specified the return value of that method, an observable of Customer object.

Important: If you had an @Input() prop with getter or setter, we also want that set or get block of code to be called, when that @Input prop changes. So
 when new data for that @Input prop arrive from parent comp, we also want that getter or setter prop gets called. Well again, that's not gonna happen
 unless the outer object changes(of course we assumed that @Input prop is not a primitive type) or in other words, the pointer to a location in memory of
 that prop, changes. So when we have an object of Customer, we want that Customer reference changes.

Notice that state management libraries, do that cloning and changing the reference, out of the box. But if you're using a service, you might run into this
challenge where you might say: why isn't my ngOnChanges() being called? Or why the set or get block of @Input prop being called on that @Input prop?
That's because angular didn't think the outer object itself changed and that's why cloning that object will solve the problem and after doing that,
everything gets updated as expected.

35-10_component inheritance:
The next topic that relates to structuring your components is comp inheritance. This feature in angular can provide some reuse in specific scenarios.
Let's say we had some widgets and they may render text boxes or text areas or other types of controls on the screen and let's assume that these widgets
have very similar @Input() and @Output() props.
For example, widget1 has some props and also tracks if the data is dirty or not with isDirty prop and let's say it's a text box which has those props and does all
of that. Then later, you create widget2 and it ALSO has the SAME EXACT @Input() and @Output() props. Now of cousrse it might have some additional, but those are shown,
are the common ones between two widgets.
So what if we could get rid of the commonality and move those common stuff somewhere else into a base component and then inherit from that base component in
widget 1 and widget2?

        widget1                              widget2
@Input() label: string                  @Input() label: string
@Output() value: string                 @Output() value: string
isDirty: false                          isDirty: false
@Output() valueChange                   @Output() valueChange

So we get rid of common stuff in both widgets and we're gonna move those things into a base comp that won't have a template file, but it will have methods and of course
@Input() and @Output() props.
Now we can share that functionality between widget1 and widget2. But actually there are most scenarios out there, where you don't need to use comp inheritance.
But in cases you find yourself duplicating code between your comps, specifically duplicating @Input and @Output props, then this approach is good.

    widget1         widget2
    \               /
     \             /
       base comp
@Input() label: string
@Output() value: string
isDirty: false
@Output() valueChange */
/* 36-11_component inheritance in action:
So let's create a base comp and inherit from that comp, with some widget type of comps(so those widget types of comps will inherit that
base comp). So let's go to demos/src/app/component-inheritance folder. Widget1 renders a text box. Both of them need an exact @Input prop for
the value they want to render and a way to track the dirty state. So in this case, because we have @Input and @Output props that we wanna to track,
we can create a base comp and in file of that comp you note that the template prop in object we pass to @Component is empty and we set the
change detection to onPush and notice we have an @Input which we had in our widgets, in order to receive data from parent and render it in UI and we define
a setter and also a getter for the value prop which itself is an @Input prop.

So by using a base comp, we can put those common @Input and @Output and even methods, into that base comp, so we don't have to duplicate that code across
our widgets. To apply that base comp, we go to our widget comp class and extend base comp class and we called super() in constructor of widget.

In fact in widgets that extend a base class, actually what we're after, is just a customized template in those widgets.

Remember: If you don't have that commonality of @Inputs and @Outputs and things like that across your widgets, then you definitely wouldn't do this.

37-12_summary:
That was about structuring comps.
- Break complex comps into child comps
- Use container->presentation pattern where possible
- (If you are currently following container-presentation pattern), container retrieves state and presentation comp render some stuff.
  So with that we know where to go if we need to change the retrieval of the data from a service.
- Use onPush change detection on presentation comps and the effect that has
- Leverage cloning or the concept of immutable data or state when appropriate. For example if your service always gets fresh data from server and therefore
  all you get, is from server and then that fresh data is passed down from service to comps. Well, in that case, you don't really need to clone that
  data per se, because it's always a new object. Likewise, if your POST, PUT or DELETE operations are always returning a fresh status object or sth like that,
  then of course you don't need to clone it, therefore your ngOnChanges() and other things in that comp(possibly presentation comp) will fire as
  you'd expect(I assumed the presentation comp has onPush change detection).
  But in the cases where you're calling the server and maybe caching some data for a while(maybe while user is editing sth), or other types of data such as even
  lookup data, then you gonna definitely look at cloning.
- Use comp inheritance sparingly(when it make sense). So if you have a lot of @Input and @Output props being duplicated across comps, then this way is good.*/
/* 38-00_introduction.4:
Component communication:
We already seen how parent and child comps can communicate with @Input and @Output and that's the standard way. But case 1) what happens when you have some
nested hierarchies with comps at many levels of the app and they need to talk? case 2) Or you have sibling comps that they need to talk?

module overview:
-Component communication
-understanding rxjs subjects. Important: Subjects can allow different items within an application to talk to each other.
-Different ways we can communicate: One of those is called an event bus service and pros and cons of doing things in that way.
-Creating and using an observable service. Both the event bus and observable service are going to use subjects, but we're gonna do it in a different way.
-Unsubscribing from observables: Now you probably used ngOnDestroy before, to unsubscribe and you're still gonna use that technique and there are some other
 techniques that are not built into angular but we can get them in our app and they can save a lot of code.

39-01_component communication:
Currently we're gonna focus on comp communication. may you need for services to communicate as well and we'll introduce different techniques in this module for
that scenario too.
Now one of the things that as we start to build features in our app is deeply nested hierarchies.
1) What happens when our comps are really deeply nested? Are we gonna continue to use @Input all the way down and @Output all the way up to parent?
So that was one scenario.
2)Another scenario is you might have a comp that needs to communicate with one or more comp that those comps could be anywhere in the app and
not necessarily a parent or a child.
So for example in this scenario below, we have a NavbarComp and a child comp in the app that needs to send information that ultimately makes it all
the way up to the Navbar component to maybe display a status message or ... . (So in this diagram, how we send info, from child component all the way up to
Navbar comp?) How we're gonna handle that?
Important: Well, because we have a child comp communicating up to other comps or even down potentially, we could use an event bus technique or an observable service
 technique. Both of those techniques are gonna be using subjects and they provide a flexible way to communicate between any area of an
 app and although we're gonna focus on components here, it can also be used to communicate between services.

                                    The need for comp communication

                                                AppComponent

                                                NavbarComponent

                                                feature component
                                                child component

Event bus vs observable service:
Both of these are gonna allow us to communicate between different areas of an application, but the event bus is based more on what we call the mediator pattern.
This is where you have a middle man service which injected into both sides(so both components that want to get data exchanged) and then it'll act as
the middle man between them. By doing this, it will allow us to send data from one component, up to the event bus and then anyone subscribed to event bus events,
can get that information. One of the big benefits of this, is it's very loosely coupled. but you'll see that also could be a challenge when it comes to
maintenance and it will rely on subjects and observables.

Now the observable service technique would follow more of the observer pattern, although there are some scenarios where you could argue it that it could also
be a mediator pattern. But we're gonna focus more on the observer pattern in observable service.
Learn: In Observer pattern you could have a subject and many observers and when that subject changes(of course we were subscribed to that subject before)
 we can get that new data.
So in this approach, we're gonna have an angular service that exposes an observable and any component can now subscribe to it. Now the components that
subscribe to that observable, are gonna know where data is coming from.
The service kind of acts as the source of truth and then we can subscribe to the data that's being emitted from that source of truth.
This approach is NOT as loosely coupled as the event bus technique, but that can provide some benefits actually, because we'll know more about
where the data is coming from exactly. This technique also relies on subjects and observables.

Also remember when building your app, you may not use either of these two options! But knowing them is good, when you have the scenarios where
you need comps to communicate across different LEVELS of an app.

   Event bus                                                            Observable service
mediator pattern                                                    observer pattern
angular service acts as middle man between components               angular service exposes observable directly to components
components don't know where data is coming from by default          components know where data is coming from
loosely coupled                                                     NOT as loosely coupled as event bus
relies on subject/observable                                        relies on subject/observable*/
/* 40-02_understanding rxjs subjects:
We're gonna talk about roles that subjects can play and integrate them into our event bus and observable service scenarios.

4 main type of subjects:
Subject, BehaviorSubject, ReplaySubject, AsyncSubject

Using subject:
Subject provides a way to send one or more data values to listeners. Now listeners are of course gonna subscribe and as they subscribe, they will get the data.
Now what's different about Subject from the other subjects is that if another component subscribes to that subject, but later(so those components do subscribe to
that subject, but in later time), they're NOT gonna get all the data that was sent by that subject to all other subscribers, earlier.

EX) Let's say the component1 subscribes. Then the subject sends some data for example number 1, to component1. Now in the meantime, the component2 HAS NOT subscribed,
so of course it did NOT get number 1.
Now let's say now it does subscribe and now number 2 is emitted or sent, out of the subject. Well that would sent to both components, because they're subscribed.

So with a normal subject, you're only gonna get the data that was sent, after you've subscribed and therefore, you won't get any of the previous emitted data by
that subject you now subscribed to it and that's gonna be one of the distinguishing facts of normal subject vs other types of subjects.

                subscribed at the beginning, so it will get the data without loosing any of them
  Subject    <------- component1
  |
  | subscribed at some point later, so gonna loose the previous emitted data(arrow is upward)
  |
component2

- BehaviorSubject:
It's similar to normal subject, except that it has one big feature that normal subject doesn't and that's the ability for
subscribers which come in later in the game(subscribe at some point later) to still get SOME(not all) of the previous emitted data.

Let's say component1 subscribes and it gets number1 and then number2. Now if component2 wasn't subscribed it doesn't get number1 and 2. Because those values
has already been passed.
Important: The difference between BehaviorSubject and Subject is the last value that was emitted, CAN STILL BE retrieved by someone who subscribes later in the game.
So in our example, 1 and 2 have been already sent to the component1, but NOW if component2 subscribes, it gonna get LAST VALUE THAT WAS EMITTED from that BehaviorSubject().
So if after sending number2 to component1, if NOW component2 subscribes to that BehaviorSubject, it's gonna get number2.
                    subscribed from beginning
BehaviorSubject <---------- component1(now has 1 and 2)
|
|   (subscribes after number2 was emitted from behaviorSubject, so it can get the LATEST value which is number2 and of course from now on, it also will get the emitted
|   values like component1)
|
component2(2)

So the big difference between Subject and BehaviorSubject is that with normal subject, you only get data AFTER you subscribe and you don't get any of the
previous emitted data. But with BehaviorSubject, you can get the LAST value that was sent out from BehaviorSubject, even if you subscribe 5 or 6 minutes later, or even
just 5 minutes you subscribe!
So that's a powerful feature that BehaviorSubject has, when you have components that you want to keep up do date and those comps subscribe a little bit later.

Important; Also when using BehaviorSubject yo need to specify an initial value and when X new initial subscribers, subscribe to that BehaviorSubject, they will get that
 value initially and then the later values which that BehaviorSubject emits. But if LATER, some new subscribers subscribe to that BehaviorSubject, they won't get
 that initial value, instead they will get the latest emitted value from that BehaviorSubject. So that initial value we specify for BehaviorSubject would only be
 retrieved by X initial subscribers and not by LATER subscribers(instead, LATER subscribers will get the latest value emitted by that BehaviorSubject and from that moment
 later, all of those subscribers will get same values (unless you specify some operators for some of them and ...)).

- ReplaySubject:
BehaviorSubject is a type of ReplaySubject, actually. Why? Because a BehaviorSubject REPLAYS the LAST value that was sent out to any NEW(not all of them, just the
new subscribers) subscriber.
ReplaySubject COULD replay just the last value, but it CAN also replay all of the previous values if you like and this is sth you can configure.
So a ReplaySubject is kind of caching any data that's been sent out, so any other subscriber that later subscribes, still can get that previous data or even all of
the previous sent out data.

EX) Let's say the component1 subscribes and get number1 and then number2(or maybe both of those values with one emitted phase like an http) so we have that
kind of flow between component1 and ReplaySubject.

Now LATER on, component1 subscribes. Now if it was normal subject, we know component1 wouldn't get anything at all, until that subject emits a new value.
If it was a BehaviorSubject, component2 will get only the LAST emitted value. But if it was ReplaySubject, it can replay all of the previous emitted values to
this new subscriber.
So in our example, 1 and 2 which are already sent to component1, are replayed to component2 and maybe 3 is a new data which emitted after subscription of
component1 and therefore because they both subscribed, they would both get that.

ReplaySubject <----- component1(1, 2, 3)
|
|
|
component2(1, 2, 3)

So this kind of subject can be powerful if you want to replay a sequence of data(really a stream of data), to late subscribers in the game.

- AsyncSubject:
This one is very different than the others.
Learn: With AsyncSubject, you're only wanting the very last value as the subject completes. So the AsyncSubject have a bunch of values that can be
 sent out POTENTIALLY, BUT, you're ONLY interested in the most up to date value for whatever reason.
EX) We subscribe, 1 is passed out, BUT we're not gonna get that. 2 comes out, we're not gonna get that either. Let's say 3 is the last and then the AsyncSubject
completes. Well, this allows our component to get the freshest or last piece of data and IGNORE all the others.

So this subject is good in the case where last most relevant piece of data would be required by our comp or comps that have been subscribed.

if completed, the subscribers gonna get the last emitted value
AsyncSubject <------------- component(3)

Recap:
- Subject(useful): With normal subject, we send data to subscribed observers, but any previously emitted data is not gonna be sent to new observers,
because they subscribed later. Therefore, the later subscribers only gonna get the data that emits AFTER you've subscribed.

- BehaviorSubject(useful): With this, we can send the LAST emitted data to any new observers(subscribers). That way, they can still stay ins sync, but they're
  not gonna have all the previous values Also, but at least they have the latest value. Also The first X subscribers will get the initial data of that BehaviorSubject.
  This is a type of ReplaySubject. If you have the need to send our many pieces of data and replay all of it(or some of it), ReplaySubject is good. But if you just
  want the last data for new observers, BehaviorSubject.

- ReplaySubject: With this, we can relay everything that was previously sent. Now you can control that on how much of that previous data would be sent to new
observers(so new observers can get all of the data that might have sent to older subscribed components, if you have that type of scenario).
 So all previous sent data can (this is optionally) be "replayed" to new observers.

- AsyncSubject: Emits ONLY the last value to observers, WHEN the sequence of data which is being sent out is completed. */
/* 41-03_rxjs subjects in action - part 1:
Go to demos/src/subjects . When you hit the start button, they will subscribe.

42-04_rxjs subjects in action - part 2:
Let's go to demos/src/app/core/services/subject.service

43-05_creating an event bus service:
Learn: An event bus is gonna allow us to send data between different components and it's gonna be a type of mediator or middleman.
As componentA wants to talk to another component out there, that it may not even know about, it can send data through the event bus and
then the comp can get that data. So the event bus is gonna be the communication mechanism between the components and it follows the mediator pattern,
and we're gonna be using a subject to do that. So it would look like this:
First a component is gonna subscribe to an event of the event bus, whatever that event may be called. In our example we're gonna have a customer selected
event. Now another comp(compB) is going to raise an event. Maybe when the customer selected and send details about that customer to the event bus. Now when it does that,
it doesn't know who's listening at all. In fact, it has NO IDEA if anyone's listening at this point. It's just saying: "hey event bus, this is what happened."
Now assuming the component on the left HAS SUBSCRIBED, it will then get the event data and be able to use that data to do sth.

Diagram:
          (1)subscribe to event  (has subject)
componentA -------------------> event bus    <---------- componentB
           <----------------                (2)raise event
                get event data

Now let's go to demos/src/app/core/services/event-bus.service
The key to event-bus.service is subject and you note it's private. Now that particular subject could send any type of data, which
is why we have an any in the generic<> , so we have: <any>. But if you only had specific types of data you could certainly lock that down,
with a class type or an interface or maybe it's just a number or sth like that.

Now when a particular comp wants to get an event and subscribe to that event happening, it can say: on() and they have to pass the event they want to
get it's data, as the first arg of .on() and the values they can pass as the first arg which is the name of event they want to get, are specific things and
they can't pass anything they want as the first arg. Why? Because we specified an enum as the type of first arg. Note that the first arg could be of type
string and therefore the components which want to get that event data could pass in a string but it's not goo. But it's good to avoid strings when you're
using this approach and it's good to use an enum instead of strings in these situations.
In our example, we just specified one event name which is customerSelected.
So let's say that the comp says: on(events.customerSelected, do sth) now about second arg:
When the component gets the data back, it's going to have an action which it passes that action as the second arg of on() and that action is a callback function and
then in on() we return Subscription therefore we can unsubscribe as well.
We know we have a subject, so once the components said on() , we're ultimately gonna subscribing OURSELVES(we subscribe in the on())! and then the
subscription (return this.subject.pipe(...).subscribe(action)) is gonna take the action which the component passed in and then the subscription call it.
So we're actually subscribing in the event bus and it's like we're subscribing to ourselves, but don't judge soon! Because actually
the component that want to get the event data, gonna pass the event bus a phone number and once new data emits by subject, we'll call that component on it's phone.

Let's say in the enum(which is the expected event names that components can pass in as the first arg of on()), we had 5 names.
Now if the component passes on(customerSelected, action) , that comp probably ONLY want that event data and we(event-bus) doubt that component want
the customerDeleted or ...(if we had some other event names, which we specify them in enum as well) or others, if that's not what the component asked for.
Therefore we used filter() and map() in order to filter those events and JUST get the event data that the component wants.
So if the comp, pass the event-bus an event type of customerSelected, then in event bus and in pipe(), we're gonna check the event that actually
fired in the subject(why from subject? Because the pipe() was used on this.subject) and there we check if the name of the event that was fired in the subject is the
same as the name of event that the comp passed. If those names matched, we continue. So after that(if we continue) we arrived to map() . There, we grabbed the value of
event that fired(in our example it would be a customer, because we only have 1 event in demo) and return it.

Again the reason we're subscribing in the service is, we COULD expose an observable from the subject(as we did in previous), but in this case, when component
calls .on(customerSelected, callback), as you can see, the comp pass a callback function and in event-bus we pass the subscription and that's one way to do it.
So another way would be, the component do all the work on the subscription, so in that case, the event-bus just would filter it down and use map() and then the
component subscribes to it.

So in the first approach, the event bus is basically saving the component from the trouble of having to worry about the subscribe portion of it and the comp just
pass event bus, what subscribe would do(so we basically pass the observer to event-bus) and the event-bus will automatically call that callback function(because
when a new value is emitted and match the event name we pass to event-bus, the callback function will be called, that's what reactive programming do) as long as
in the filter() , the name of event customer wants to get it's data, matches the actual raised event from subject.
So this allows us to use the subject, but also some RxJS operators to make this all happen, so the components only get the event data for the event that they're
subscribing to(actually the subscribing portion is done in service itself).

Now when new values will be emitted?
The component that's actually going to raise the data is gonna call .emit(event) and that will allow those components which raise the events, to emit an event.

Now we have a simple EmitEvent class that takes the name of of the event and we made it of type any. Because it could be a string or you could use an enum and then
the value of event which is optional. Because a lot of times, an event might fire to notify you that sth happened, but it may not have any actual
data for that event.
Everytime a comp, calls emit() method of the event-bus service, event-bus can take the event name and optionally event data and event-bus can emit it out by calling
next() on the subject.
Important: With that, anyone subscribing to that event(by calling on() method of service) will get that event and possibly gets the data that event emits.

So that event-bus can handle any number of events and any amount of data associated with those events. Now let's look how we could USE it.*/
/* 44-06_using an event bus service:
Let's go to customers-list.component which shows a list of customers and when user click on one of those customers, we want to notify other comps about which
WHICH customer was selected. So we're gonna call this.eventBus.emit(<an instance of EmitEvent() class which needs the name of event we want to emit in that comp and
optionally the value that emits>); So when a customer is selected we do that. In selectCustomer() the data we emit is the customer that was clicked.
So that's how one side of the equation can communicate with the middle man which is the event-bus. So it send the event-bus an object which has not only the
event name, but also the data.
Important: Now anywhere else in this app, we can now subscribe to that event to get notified and receive value, by using .on() method of event-bus service
 in those comps which want to get notified and get the value which the comp that raise the event. emits them.
For example in app.component we're subscribing(kinda, because the actual subscription is done in event-bus) to event bus and pass the event we want to
subscribe in that app.component and also the callback we want to be called after the new data was emitted.
So actually in comps that want to subscribe or listen to some events, we pass the name of event we want to subscribe and the observer.

So now we're able to communicate between some pretty deeply nested parts of the app and send any type of event and any type of data with that event.
Now if you look at the diagram I drawed for event-bus, the customer-list.component would be the right one in the diagram. So it raises the customerSelected
event(which we defined the possible events that raiser components can raise in enum definition, in the event-bus service) through calling .emit() on the instance
of EventBus service. Now by calling that emit() , we need to pass the event name we want to raise and the event data(optional) that we want to raise or send to
eventbus(not directly to listeners, but to event bus and then event bus do some rxjs operators and send the event data to whoever listens).

Now any subscribers that have called .on(customerSelected, ...) which are like the component on the left in that diagram, they get that event data and ONLY
that event data and then it's up to them to do sth with that value.

What's great about this approach is we can communicate at any different level of the app.

- EventBus pros and cons:
-pros:
simple to use - call emit() when you want to send an event or on() when you want to subscribe to an event
loosely coupled communication
lightweight(little code)

-cons:
who is triggering the event?(In our example, we didn't pass the sender of event. Now we COULD added that too. Imagine you're dubbing this and you magically get
that event data through the on() call. Now if you want to tweak that data, where do you go? So you have to go find the emit source to fix that. So it's soooo loosely
coupled that you normally don't EVEN know where it came from? If you use loosely coupled events too much, it can make maintenance hard. Because it's sooo loosely
coupled that you literally have no idea who's sending data from where?)

loosely coupled events can make maintenance more challenging(due to above)

must remember to unsubscribe(we use .on() to subscribe to the event and get the data, but then in ngOnDestroy() we need to take that subscription and
call .unsubscribe() on it.)

So this was one approach if you have a scenario where you need to communicate between different levels of the app, but the components don't know about
each other and don't really WANT to know about each other. Dashboard is a good example, where you have siblings that need to talk.
So if you have a lot of different events and you want to send event data around your app, then thins approach is good. But if you want to lock it a little more,
we have another option with observable service.

45-07_creating an observable service:
Although an even bus is certainly a viable option for communication across multiple levels of an ng app, there is another option that'll provide more control
over WHERE the data is emitted from, but also WHAT's being emitted. We saw earlier that an event bus acts as the middle man, but the receiver of the
event data, doesn't really know who sent it(the data), unless you were to include extra information IN the event.

An observable service is gonna provide not only the ability to subscribe the data changes, but also to know where those data changes actually originated from?
So this would be more of a published/subscribe pattern, or what we would be call, the observer pattern.

With this particular pattern, we're going to have a comp that subscribes and the observable service is then going to be able to send data to that
subscriber and we could have multiple subscribers of course and it doesn't have to be just one component.

Observable service provides a very simple to keep multiple observers(components, services) up to date, but every one one of those will know exactly where
the data came from. So if the data modifications need to be made down the road, then we'll know exactly where to go and that would be the observable service.

Now that is going to use a subject and an observable and so what we'll do, is we'll expose that observable to anyone that wants to subscribe, in this case(in diagram)
it might be a component and then, as that data changes, we'll emit that data by calling .next() on our subject. Then that data would flow down to any listeners.

Now the difference between this and the event bus is not only the observable service is SENDING the data, but it's also the SOURCE of the CHANGES to the data.
So now I know not only who I'm subscribing to, but also who's making those changes.

Now this is a more tightly coupled solution, but in more complex scenarios, this provides more visibility into exactly what's going on. If you'd prefer a
more loosely coupled approach, then you might want to stick with the event bus.

                Observable service
- observable services can send data to observers/subscribers
- follows the observer pattern
- provides a simple way to keep multiple observers(components, services) up to date
- service can use rxjs subject objects and observables

          subscribe    (subject/observable)
component ----------> observable service
          <------
          (as that data changes we'll emit that data by calling .next() on our subject)

Now go to demos/src/app/core/services/data.service.ts

46-08_Using an Observable Service:
Go to the running app, you saw how app.component at the top, is subscribing. Now go to app.component...


                        Observable service pros and cons:
pros: easy to use, because you've probably subscribed to httpclient or other observables in an ng app. This is no different.
The difference though again is the data source is known, which can simplify maintenance. It is more tightly coupled than the
event bus and so if you want that loosely coupled nature again, you might prefer the event bus. But at I know who's CHANGING and
SENDING the data.
It's also easy to share data between multiple layers of our app with this approach, as with the event bus(so they both have this, in
common).

cons: It's definitely not as loosely coupled as the event bus, but it provides some maintenance benefits.
There's also subject variations that you need to worry about. In this case, we used BehaviorSubject, but if we didn't want any
new subscribers to get that PREVIOUS value, we might just use subject or maybe we want them to get ALL PREVIOUS values with
ReplaySubject.
Of course, just like the event bus, we do need to remember to unsubscribe, so we prevent any memory leaks.
        pros:                                                           cons:
- simple to use - subscribe/unsubscribe                              - Not as loosely coupled as an event bus(coupling between observable and
- data source is know(simplifies maintenance)                         observer)
- easy to share data between different levels of an application      - subject variations can be challenging to master
                                                                     - must remember to unsubscribe
So in observable service, all you really have to know about, is the subject or BehaviorSubject or another type of subject and returning
that observable that anything can then subscribe to and from there, it's easy to use.

47-09_Unsubscribing from Observables
For most of us, we would add ngOnDestroy() and then we would call .unsubscribe() on the subscription object that we'd capture from subscribing and
that's pretty standard way to do this and nothing wrong with that approach. But there are some other options.
One of those is a decorator called @AutoUnsubscribe() and the other is an npm package you can import which is SubSink.
So we have 3 approaches:
1) ngOndDestroy/unsubscribe 2) AutoUnsubscribe decorator 3) SubSink

We subscribe to sth, in this case we have an event bus .on() and when the .on() is returned, it returns the subscription. We capture
that in a property and then in ngOnDestroy() we make sure that we have that subscription, if we do, we call .unsubscribe() .

EX)
export class MyComponent {
    eventBusSub: Subscription;
    constructor(private eventBus: EventBusService) {}

    ngOnInit() {
        this.eventBusSub = this.eventBus.on(Events.customerSelected, (cust => this.customer = cust));
    }

    ngOnDestroy() {
        if (this.eventBusSub) {
            this.eventBusSub.unsubscribe();
        }

        // By using @autoUnsubscribe this method might be empty and therefore you don't need to manually unsubscribe, but you MUST add ngOnDestroy() in that
        // case too!
    }
}
Unsubscribing in ngOnDestroy:
Each observable subscription must be assigned to a property
unsubscribe from observables in ngOnDestroy

Now there's nothing wrong with this approach, but if a given component has several subscriptions, this does mean writing a fair amount of
code.You have to capture those(subscriptions) in the properties and you have to call unsubscribe() for each of those subscriptions. in ngOnDestroy.

Another technique is @autoUnsubscribe() . Which on top of the component class(or ...) we use that decorator and what it does, is it
automatically iterates through the properties of your component, finds all subscriptions types and then, when ngOnDestroy() is called, it
automatically calls unsubscribe() . Now this means you still HAVE TO CAPTURE your subscriptions up in properties, because it(that decorator) requires
that and you still HAVE TO put the ngOnDestroy() . Now, it can be empty, but you need to put it although it would be empty.

What is saves you though, is the code to call unsubscribe. So if you have a lot of subscription PROPERTIES but we can even make it better by using
an npm package called subsink.

Subsink is a VERY simple way to handle all of that. Once you have subsink available, you new it up and create a property like: subs .
Now every time we want to subscribe to sth, instead of having to INDIVIDUALLY capture the subscription, we simply call: subs.sink and this will
automatically add it into a collection of all the subscriptions. Now in ngOnDestroy(), we simply say: this.subs.unsubscribe(); , the code will then
automatically iterate through all your subscriptions and call unsubscribe on them. So this saves quite a bit of code over the original one where
we have an ngOnDestroy , maybe MULTIPLE subscription PROPERTIES and then we have to unsubscribe manually and it EVEN saves code over
@AutoUnsubscribe() decorator, because we don't have to have MULTIPLE subscription PROPERTIES.

EX) With subsink:
export class MyComponent {
    subs = new SubSink();

    constructor(private eventBus: EventBusService, private obsService: ObsService) {}

    ngOnInit() {
        this.subs.sink = this.eventBus.on(Events.customerSelected, (cust => this.customer = cust));
        this.subs.sink = this.obsService.subscribe(...);
    }

    ngOnDestroy() {
        this.subs.unsubscribe();
    }
}

So if you want to save some code, we can use SubSink for pretty much everything we do when it comes to unsubscribing from observables that we might have.

You can also take an entirely different approach than those 3 different ones that I showed and for example use takeUntil operatpr.*/

