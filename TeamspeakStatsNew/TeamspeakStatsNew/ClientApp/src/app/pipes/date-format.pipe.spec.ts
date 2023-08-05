import { fakeAsync, flush, tick } from "@angular/core/testing";
import moment from "moment";
import { DateFormatPipe } from "./date-format.pipe";

describe("DateFormatPipe", () => {
    let pipe: DateFormatPipe;

    beforeEach(() => {
        pipe = new DateFormatPipe();
    });

    it("should create the pipe", () => {
        expect(pipe).toBeTruthy();
    });

    it("should transform date to seconds ago", () => {
        const currentDate = moment();
        const date = currentDate.clone().subtract(10, "seconds");
        const formattedDate = pipe.transform(date.toDate());
        expect(formattedDate).toBe("10 seconds ago");
    });

    it("should transform date to minutes and seconds ago", () => {
        const currentDate = moment();
        const date = currentDate.clone().subtract(5, "minutes");
        const formattedDate = pipe.transform(date.toDate());
        expect(formattedDate).toBe("5 minutes and 0 seconds ago");
    });

    it("should transform date to hours and minutes ago", () => {
        const currentDate = moment();
        const date = currentDate.clone().subtract(3, "hours");
        const formattedDate = pipe.transform(date.toDate());
        expect(formattedDate).toBe("3 hours and 0 minutes ago");
    });

    it("should transform date to days and hours ago", () => {
        const currentDate = moment();
        const date = currentDate.clone().subtract(4, "days");
        const formattedDate = pipe.transform(date.toDate());
        expect(formattedDate).toBe("4 days and 0 hours ago");
    });

    it("should transform date to 2 months and 3 days ago", () => {
        const currentDate = moment();
        const date = currentDate
            .clone()
            .subtract(2, "months")
            .subtract(2, "days"); // This is intended
        const formattedDate = pipe.transform(date.toDate());
        expect(formattedDate).toBe("2 months and 3 days ago");
    });

    it("should transform date to 4 years and 6 months ago", () => {
        const currentDate = moment();
        const date = currentDate
            .clone()
            .subtract(4, "years")
            .subtract(6, "months");
        const formattedDate = pipe.transform(date.toDate());
        expect(formattedDate).toBe("4 years and 6 months ago");
    });

    it("should transform date to 1 second ago", () => {
        const currentDate = moment();
        const date = currentDate.clone().subtract(1, "second");
        const formattedDate = pipe.transform(date.toDate());
        expect(formattedDate).toBe("1 second ago");
    });

    it("should transform date to 1 minute and 1 second ago", () => {
        const currentDate = moment();
        const date = currentDate
            .clone()
            .subtract(1, "minute")
            .subtract(1, "second");
        const formattedDate = pipe.transform(date.toDate());
        expect(formattedDate).toBe("1 minute and 1 second ago");
    });

    it("should transform date to 1 hour and 1 minute ago", () => {
        const currentDate = moment();
        const date = currentDate
            .clone()
            .subtract(1, "hour")
            .subtract(1, "minute");
        const formattedDate = pipe.transform(date.toDate());
        expect(formattedDate).toBe("1 hour and 1 minute ago");
    });

    it("should transform date to 1 day and 1 hour ago", () => {
        const currentDate = moment();
        const date = currentDate.clone().subtract(1, "day").subtract(1, "hour");
        const formattedDate = pipe.transform(date.toDate());
        expect(formattedDate).toBe("1 day and 1 hour ago");
    });

    it("should transform date to 1 month and 1 day ago", () => {
        const currentDate = moment();
        const date = currentDate
            .clone()
            .subtract(1, "month")
            .subtract(1, "day");
        const formattedDate = pipe.transform(date.toDate());
        expect(formattedDate).toBe("1 month and 1 day ago");
    });

    it("should transform date to 1 year and 1 month ago", () => {
        const currentDate = moment();
        const date = currentDate
            .clone()
            .subtract(1, "year")
            .subtract(1, "month");
        const formattedDate = pipe.transform(date.toDate());
        expect(formattedDate).toBe("1 year and 1 month ago");
    });

    it("should update the view every second", fakeAsync(() => {
        const currentDate = moment();
        const date = currentDate.clone().subtract(10, "seconds");

        const formattedDateBefore = pipe.transform(date.toDate());
        expect(formattedDateBefore).toBe("10 seconds ago");

        // Wait for 1 second
        tick(1000);

        const formattedDateAfter = pipe.transform(date.toDate());
        expect(formattedDateAfter).toBe("11 seconds ago");
    }));

    it("should update the view when toggleShouldUpdateView is called", fakeAsync(() => {
        const currentDate = moment();
        const date = currentDate.clone().subtract(10, "seconds");

        const formattedDateBefore = pipe.transform(date.toDate());
        expect(formattedDateBefore).toBe("10 seconds ago");

        pipe["toggleShouldUpdateView"](); // Accessing the private method directly to test it

        tick(1000); // Wait for 1 second

        const formattedDateAfterUpdate = pipe.transform(date.toDate());

        expect(formattedDateAfterUpdate).toBe("11 seconds ago");
    }));

    it("should call complete() on the destroy$ Subject on ngOnDestroy()", () => {
        const spyComplete = spyOn(pipe["destroy$"], "complete");

        pipe.ngOnDestroy();

        expect(spyComplete).toHaveBeenCalled();
    });

    // Add more test cases for the remaining scenarios
});
