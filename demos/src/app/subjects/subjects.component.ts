import { Component, OnInit, OnDestroy } from '@angular/core';

import { SubjectService } from '../core/services/subject.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-subjects',
  templateUrl: './subjects.component.html',
  styles: [`
    .status {
      color: red;
    }`
  ]
})
export class SubjectsComponent implements OnInit, OnDestroy {
  status: string;
  subjectObservableData = [];
  behaviorSubjectObservableData = [];
  replaySubjectObservableData = [];
  asyncSubjectObservableData = [];
  timeoutIds = [];
  subsink = new SubSink();

  constructor(private subjectService: SubjectService) { }

  ngOnInit() { }

  start() {
    this.subjectService.start();
    this.runAction('Calling SubjectService start()', null, null);
    this.runAction('Subscribing to Subject', ActionType.subject, 2000);
    this.runAction('Subscribing to BehaviorSubject (6 seconds after subject)', ActionType.behaviorSubject, 8000);
    this.runAction('Subscribing to ReplaySubject (10 seconds after subject)', ActionType.replaySubject, 13000);
    this.runAction('Subscribing to AsyncSubject (12 seconds after subject)', ActionType.asyncSubject, 15000);
  }

  /* This is a reusable method that takes a log message and type of subject we want to subscribe to and the delay before we
  subscribe to that subject(and with this arg, we're simulating subscribing to a subject(subjects are special kind of observables)
  a bit later). The first one just logs a message but after that, our subjects will be kicked off.
  Remember, each subject in subject.service calls next() every 3 seconds. But here for case of normal subject, we're subscribing to that
  normal subject BEFORE the first 3 seconds pass(because the delay before we subscribe to the normal subject is 2 seconds which is lower
  than 3seconds) and that would mean we wouldn't miss any data. Because we've subscribed before the subject actually starting sending data.

  In case of BehaviorSubject, we're subscribing after 8 seconds. We know the first value gonna emit after 3 seconds, the second one at 6seconds
  and then at 8seconds we subscribe to BehaviorSubject so we get the lates value which is the second one, so we'll miss the first emitted
  value in case of subscribing to BehaviorSubject.

  About subscribing to ReplaySubject, because it's configuration is in a way that it would get EVERYTHING before it was subscribed,
  even we're subscribing after 13seconds, it would get everything and that's because it's configuration is in a way that the ReplaySubject
  would replay all the data for this new subscriber it had previously emitted.

  About asyncSubject subscriber, we know it would only get the last value after the AsyncSubject completes. In this casae, we're waiting
  15seconds and after that we subscribe, but the last value hasn't been emitted yet. Because */
  runAction(actionText: string, actionType: ActionType, delay: number) {
    let action: () => void;
    switch (actionType) {
      case ActionType.subject:
        action = () => {
          this.subsink.sink = this.subjectService.subjectObservable$.subscribe(custs => {
            this.subjectObservableData.push(custs);
          })
        };
        break;

      case ActionType.behaviorSubject:
        action = () => {
          this.subsink.sink = this.subjectService.behaviorSubjectObservable$.subscribe(custs => {
            this.behaviorSubjectObservableData.push(custs);
          })
        };
        break;

      case ActionType.replaySubject:
        action = () => {
          this.subsink.sink = this.subjectService.replaySubjectObservable$.subscribe(custs => {
            this.replaySubjectObservableData.push(custs);
          })
        };
        break;

      case ActionType.asyncSubject:
        action = () => {
          this.subsink.sink = this.subjectService.asyncSubjectObservable$.subscribe(custs => {
            this.asyncSubjectObservableData.push(custs);
          })
        };
        break;
    }

    // update status and perform action
    let timeoutId = setTimeout(() => {
      this.status = actionText;
      if (action) {
        console.log('in');
        action();
      }
    }, (delay) ? delay : 0);
    this.timeoutIds.push(timeoutId);
  }

  ngOnDestroy() {
    this.subsink.unsubscribe();
    for (let id of this.timeoutIds) {
      clearInterval(id);
    }
  }

}

enum ActionType {
  subject,
  behaviorSubject,
  replaySubject,
  asyncSubject
}
