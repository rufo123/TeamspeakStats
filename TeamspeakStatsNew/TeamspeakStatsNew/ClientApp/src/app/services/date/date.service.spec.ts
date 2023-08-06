import { TestBed } from "@angular/core/testing";

import { DateService } from "./date.service";

describe("DateService", () => {
    let service: DateService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DateService);
    });

    it("should be created", () => {
        expect(service).toBeTruthy();
    });

    it("should return seconds ago", () => {
        const date = new Date();
        date.setSeconds(date.getSeconds() - 10); // 10 seconds ago
        const formattedDate = service.format(date);
        expect(formattedDate).toBe("10 seconds ago");
    });

    it("should return 1 second ago", () => {
        const date = new Date();
        date.setSeconds(date.getSeconds() - 1); // 1 seconds ago
        const formattedDate = service.format(date);
        expect(formattedDate).toBe("1 second ago");
    });

    it("should return minutes and seconds ago", () => {
        const date = new Date();
        date.setMinutes(date.getMinutes() - 5); // 5 minutes ago
        const formattedDate = service.format(date);
        expect(formattedDate).toBe("5 minutes and 0 seconds ago");
    });

    it("should return 1 minute and 1 second ago", () => {
        const date = new Date();
        date.setMinutes(date.getMinutes() - 1); // 1 minute ago
        date.setSeconds(date.getSeconds() - 1);
        const formattedDate = service.format(date);
        expect(formattedDate).toBe("1 minute and 1 second ago");
    });

    it("should return hours and minutes ago", () => {
        const date = new Date();
        date.setHours(date.getHours() - 3); // 3 hours ago
        const formattedDate = service.format(date);
        expect(formattedDate).toBe("3 hours and 0 minutes ago");
    });

    it("should return 1 hour and 1 minute ago", () => {
        const date = new Date();
        date.setHours(date.getHours() - 1); // 1 hour ago
        date.setMinutes(date.getMinutes() - 1); // 3 hours ago
        const formattedDate = service.format(date);
        expect(formattedDate).toBe("1 hour and 1 minute ago");
    });

    it("should return days and hours ago", () => {
        const date = new Date();
        date.setDate(date.getDate() - 4); // 4 days ago
        const formattedDate = service.format(date);
        expect(formattedDate).toBe("4 days and 0 hours ago");
    });

    it("should return 1 day and 1 hour ago", () => {
        const date = new Date();
        date.setDate(date.getDate() - 1); // 1 day ago
        date.setHours(date.getHours() - 1);
        const formattedDate = service.format(date);
        expect(formattedDate).toBe("1 day and 1 hour ago");
    });

    it("should return months and days ago", () => {
        const date = new Date();
        date.setMonth(date.getMonth() - 6); // 4 months ago
        const formattedDate = service.format(date);
        expect(formattedDate).toBe("6 months and 0 days ago");
    });

    it("should return 1 month and 1 day ago", () => {
        const date = new Date();
        date.setDate(date.getDate() - 31);
        const formattedDate = service.format(date);
        expect(formattedDate).toBe("1 month and 1 day ago");
    });

    it("should return 1 years and months ago", () => {
        const date = new Date();
        date.setFullYear(date.getFullYear() - 1); // 1 year ago
        const formattedDate = service.format(date);
        expect(formattedDate).toBe("1 year and 0 months ago");
    });

    it("should return 2 years and 1 month ago", () => {
        const date = new Date();
        date.setFullYear(date.getFullYear() - 2); // 2 years ago
        date.setMonth(date.getMonth() - 1);
        const formattedDate = service.format(date);
        expect(formattedDate).toBe("2 years and 1 month ago");
    });
});
