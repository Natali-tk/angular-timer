import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Observable, fromEvent, merge, debounceTime } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  title = 'timer';
  interval: any;
  timerPaused: Boolean = false;
  running: Boolean = false;
  counter: number = 0;
  seconds: number = 0;
  minutes: number = 0;

  stream$ = new Observable((observer) => {
    this.interval = setInterval(() => {
      observer.next(this.counter++);
    }, 1000);
  });

  @ViewChild('seconds')
  secondsVal!: ElementRef;
  @ViewChild('minutes')
  minutesVal!: ElementRef;
  @ViewChild('pauseButton')
  pauseButton!: ElementRef;
  @ViewChild('startBtn')
  startBtn!: ElementRef;

  onStartClick() {
    const startBtn = this.startBtn.nativeElement;
    const startBtnClassName = startBtn.className.split(' ')[1];

    switch (startBtnClassName) {
      case 'start':
        this.running = true;
        if (this.running) {
          this.runTime();
          startBtn.textContent = 'Stop';
        }

        break;

      case 'stop':
        this.running = false;
        if (!this.running) {
          this.stopTime();
          startBtn.textContent = 'Start';
        }

        break;

      default:
        break;
    }
  }

  runTime() {
    this.timerPaused = false;
    this.stream$.subscribe((val) => {
      this.seconds++;
      this.secondsVal.nativeElement.textContent = `0${this.seconds}`;

      if (this.seconds > 9) {
        this.secondsVal.nativeElement.textContent = `${this.seconds}`;
      }
      if (this.seconds === 60) {
        this.minutes++;
        this.seconds = 0;
        this.minutesVal.nativeElement.textContent = `0${this.minutes}`;
        this.secondsVal.nativeElement.textContent = `0${this.seconds}`;
      }

      if (this.minutes > 9) {
        this.minutesVal.nativeElement.textContent = `${this.minutes}`;
      }
    });
  }

  stopTime() {
    clearInterval(this.interval);
    this.seconds = 0;
    this.minutes = 0;
    this.secondsVal.nativeElement.textContent = `0${this.seconds}`;
    this.minutesVal.nativeElement.textContent = `0${this.minutes}`;
  }

  onResetClick() {
    if (this.running || this.timerPaused) {
      this.seconds = 0;
      this.minutes = 0;
      this.secondsVal.nativeElement.textContent = `0${this.seconds}`;
      this.minutesVal.nativeElement.textContent = `0${this.minutes}`;
      clearInterval(this.interval);
      this.runTime();
    }
  }

  ngAfterViewInit(): void {
    const pauseButton = this.pauseButton.nativeElement;
    const clickEvent = fromEvent<MouseEvent>(pauseButton, 'click');
    const dblClickEvent = fromEvent<MouseEvent>(pauseButton, 'dblclick');
    const eventsMerged = merge(clickEvent, dblClickEvent).pipe(
      debounceTime(500)
    );
    eventsMerged.subscribe((event) => {
      if (event.type === 'dblclick') {
        pauseButton.textContent = 'Wait';
        clearInterval(this.interval);
        this.timerPaused = true;
        this.running = false;
        return;
      }
      pauseButton.textContent = 'Click twice';
    });
  }
}
