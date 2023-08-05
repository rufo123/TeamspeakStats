import { Pipe, PipeTransform } from "@angular/core";
import * as moment from "moment-timezone";
import { interval, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Pipe({
    name: "dateFormat",
    pure: false,
})
export class DateFormatPipe implements PipeTransform {
    private destroy$ = new Subject<void>();
    private shouldUpdateView = false;

    transform(dateStr: Date, timezone = "UTC"): string {
        const date = moment.tz(dateStr, timezone);
        const now = moment.tz(timezone);

        const diff = now.diff(date, "milliseconds", true);

        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const months = Math.floor(days / 30);
        const years = Math.floor(months / 12);

        if (seconds < 60) {
            return `${seconds} second${seconds === 1 ? "" : "s"} ago`;
        } else if (minutes < 60) {
            const remainingSeconds = seconds % 60;
            return `${minutes} minute${
                minutes === 1 ? "" : "s"
            } and ${remainingSeconds} second${
                remainingSeconds === 1 ? "" : "s"
            } ago`;
        } else if (hours < 24) {
            const remainingMinutes = minutes % 60;
            return `${hours} hour${
                hours === 1 ? "" : "s"
            } and ${remainingMinutes} minute${
                remainingMinutes === 1 ? "" : "s"
            } ago`;
        } else if (days < 30) {
            const remainingHours = hours % 24;
            return `${days} day${
                days === 1 ? "" : "s"
            } and ${remainingHours} hour${remainingHours === 1 ? "" : "s"} ago`;
        } else if (months < 12) {
            const remainingDays = days % 30;
            return `${months} month${
                months === 1 ? "" : "s"
            } and ${remainingDays} day${remainingDays === 1 ? "" : "s"} ago`;
        } else {
            const remainingMonths = months % 12;
            return `${years} year${
                years === 1 ? "" : "s"
            } and ${remainingMonths} month${
                remainingMonths === 1 ? "" : "s"
            } ago`;
        }
    }

    toggleShouldUpdateView() {
        this.shouldUpdateView = !this.shouldUpdateView;

        if (this.shouldUpdateView) {
            interval(1000).pipe(takeUntil(this.destroy$));
        } else {
            this.destroy$.next();
            this.destroy$.complete();
        }
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    constructor() {
        this.toggleShouldUpdateView();
    }
}
