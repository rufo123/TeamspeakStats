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

        const duration = moment.duration(now.diff(date));
        const milliseconds = duration.asMilliseconds();

        // Handle negative durations (future dates)
        if (milliseconds < 0) {
            return "Just now";
        }

        const units: (
            | "years"
            | "months"
            | "days"
            | "hours"
            | "minutes"
            | "seconds"
        )[] = ["years", "months", "days", "hours", "minutes", "seconds"];

        for (let i = 0; i < units.length; i++) {
            const unit = units[i];
            const diff = now.diff(date, unit);
            if (diff > 0) {
                const diffLabel = diff === 1 ? unit.slice(0, -1) : unit;
                const nextUnit = units[i + 1];

                const durationNumber = duration.as(unit);

                if (i < 5) {
                    let remainingInUnitFloored: number =
                        duration.as(unit) - Math.floor(duration.as(unit));

                    if (remainingInUnitFloored === durationNumber) {
                        remainingInUnitFloored = 0;
                    }

                    const remainingInUnit = Math.round(
                        moment
                            .duration(remainingInUnitFloored, unit)
                            .as(nextUnit)
                    );

                    const remainingLabel =
                        remainingInUnit === 1
                            ? nextUnit.slice(0, -1)
                            : nextUnit;

                    return `${diff} ${diffLabel} and ${remainingInUnit} ${remainingLabel} ago`;
                }

                return `${diff} ${diffLabel} ago`;
            }
        }
        return `Just now`;
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
