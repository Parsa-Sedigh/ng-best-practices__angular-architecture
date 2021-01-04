import { Injectable } from '@angular/core';

import { Subject, BehaviorSubject, ReplaySubject, 
         AsyncSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubjectService {

  /* Here, we're defining 4 different subjects and then exposing an observable for each of them.
  Learn: As you can see below, we kind of made it very obvious that ICustomer is an interface by putting I in the first char.

  In our example all of these subjects are just pushing a new item into an array of customers and then in template of subjects.component,
  Now you note all of these subjects themselves are private and then all of the observables which are associated with those subjects somehow(we'll see how)
  are public which is the default for typescript if you don't put public or private. So if you don't put an accessor, it will
  be public.
  You also note each one has a dollar sign. Now the dollar sign is optional but it's a nice naming convention to represent that
  we could have a stream of data or some poeple say it's just an observable that we can subscribe to.
  The reasong that the subject is private and the observable associated to it is public, is because you don't want to make the
  subject, public and the reason for that is while you CAN subscribe to a subject directly(because the subject was public),
  for example from a comp, you wouldn't want to expose the subject because by doing that, whoever is subscribing to that public
  subject can't only subscribe, but they can actually do anything want to the subject. We don't want that! We would not want
  those subscribers changing the subject that we're trying to own here in the service where subject lives.
  So instead, we expose an observable from the subject.

  As you can see, in initSubjects() , we don't give the subject again as a public member, we instead access subject and then
  call asObservable() on it. That means if you subscribe to result of asObservable() , it'll look just like a normal observable subscription
  but we won't be opening myself up to letting those subscribers change the subject behavior.
  But for this demo, these are the main subjects that are ultimately showing in the web page(but we don't access them directly
  (actually we can't! Because they're private), instead we use their observable).

  In the component where we use these subjects, we store all the data that we would get from each of the subjects into properties.
  So every time we get a new value, we store that value in those props.*/
  customers = [];
  intervalIds = [];
  private subject$: Subject<ICustomer[]>;
  subjectObservable$: Observable<ICustomer[]>;

  private behaviorSubject$;
  behaviorSubjectObservable$: Observable<ICustomer[]>;

  private replaySubject$: ReplaySubject<ICustomer[]>;
  replaySubjectObservable$: Observable<ICustomer[]>;

  private asyncSubject$: AsyncSubject<ICustomer[]>;
  asyncSubjectObservable$: Observable<ICustomer[]>;

  constructor() { }

  start() {
    this.initSubjects();
    // simulate array getting new data from a data source
    let intervalId = setInterval(() => {
      let len = this.customers.length;
      this.customers.push({
        name: 'Customers ' + len,
        city: 'City ' + len
      });
      let clone: ICustomer[] = JSON.parse(JSON.stringify(this.customers));

      /* The data type that these subjects emits, are specified in <> when we defined these subjects. */
      this.subject$.next(clone);
      this.behaviorSubject$.next(clone);
      this.replaySubject$.next(clone);
      this.asyncSubject$.next(clone);

      if (this.customers.length > 5) {
        this.asyncSubject$.complete();
      }
    }, 3000);

    this.intervalIds.push(intervalId);
  }

  initSubjects() {
    this.subject$ = new Subject();
    this.subjectObservable$ = this.subject$.asObservable();

    this.behaviorSubject$ = new BehaviorSubject(this.customers);
    this.behaviorSubjectObservable$ = this.behaviorSubject$.asObservable();

    this.replaySubject$ = new ReplaySubject();
    this.replaySubjectObservable$ = this.replaySubject$.asObservable();

    this.asyncSubject$ = new AsyncSubject();
    this.asyncSubjectObservable$ = this.asyncSubject$.asObservable();
  }

}

export interface ICustomer {
  name: string;
  city: string;
}
