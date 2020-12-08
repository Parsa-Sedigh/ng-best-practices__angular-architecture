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

35-10_component inheritance:*/

