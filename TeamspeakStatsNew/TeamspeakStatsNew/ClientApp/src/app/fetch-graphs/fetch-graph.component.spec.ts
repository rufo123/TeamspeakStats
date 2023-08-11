import { DatePipe } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { Observable, of } from "rxjs";
import { FormatTypes } from "../services/switchable-date-picker-format/switchable-date-picker-format-service.service";
import { FetchGraphsComponent } from "./fetch-graphs.component";

describe("FetchGraphsComponent", () => {
    let component: FetchGraphsComponent;
    let fixture: ComponentFixture<FetchGraphsComponent>;
    let localStorageMock: { [key: string]: string } = {};

    // Create a mock class for the HttpClient
    class MockHttpClient {
        // Implement the relevant methods used in the component
        get(url: string): Observable<any> {
            // Return an observable with some sample data to simulate HTTP response
            return of([{ value: 1 }, { value: 2 }, { value: 3 }]);
        }
    }

    class ActivatedRouteStub {
        snapshot = { params: {} };
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [FetchGraphsComponent],
            providers: [
                DatePipe,
                { provide: HttpClient, useClass: MockHttpClient }, // Provide the mock HTTP service
                { provide: ActivatedRoute, useClass: ActivatedRouteStub }, // Use the mock ActivatedRoute
                { provide: "BASE_URL", useValue: "http://localhost:3000/" }, // Replace with your mock base URL
            ],
        });
        fixture = TestBed.createComponent(FetchGraphsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        // Create a mock for localStorage methods
        spyOn(localStorage, "getItem").and.callFake(
            (key: string) => localStorageMock[key] || null
        );
        spyOn(localStorage, "setItem").and.callFake(
            (key: string, value: string) => {
                localStorageMock[key] = value;
            }
        );
        spyOn(localStorage, "removeItem").and.callFake(
            (key: string) => delete localStorageMock[key]
        );
        spyOn(localStorage, "clear").and.callFake(
            () => (localStorageMock = {})
        );
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("should get current time as ISO string", () => {
        const currentDate: Date = new Date();
        const currentDateISO = removeMsFromISOString(currentDate.toISOString());
        const returnedISOString = removeMsFromISOString(
            component.getCurrentTimeAsIsoString()
        );

        expect(returnedISOString).toBe(currentDateISO);
    });

    it("should get graph data latest sorted by month", () => {
        const date = new Date().toISOString();
        component.getGraphDataLatest("hour");
        expect(component.format).toBe(FormatTypes.yearMonthDay);
        expect(component.relevantDate).toBe(date);
    });

    it("should get graph data latest sorted by day", () => {
        const date = new Date().toISOString();
        component.getGraphDataLatest("day");
        expect(component.format).toBe(FormatTypes.yearMonth);
        expect(component.relevantDate).toBe(date);
    });

    it("should get graph data latest sorted by month", () => {
        const date = new Date().toISOString();
        component.getGraphDataLatest("month");
        expect(component.format).toBe(FormatTypes.year);
        expect(component.relevantDate).toBe(date);
    });

    it("should move date by one day to the back", () => {
        component.activeSorting = SortTime.Hour;
        const date = new Date();
        component.minDate = new Date(date.getTime());
        component.minDate.setFullYear(date.getDate() - 1);
        component.relevantDate = date.toISOString();
        component.moveDate(Direction.Left);
        date.setDate(date.getDate() - 1);
        const newDate = date.toISOString();
        expect(component.relevantDate).toBe(newDate);
    });

    it("should move date by one day to the front", () => {
        component.activeSorting = SortTime.Hour;
        const date = new Date();
        component.maxDate = new Date(date.getTime());
        component.maxDate.setDate(date.getDate() + 1);
        component.relevantDate = date.toISOString();
        component.moveDate(Direction.Right);
        date.setDate(date.getDate() + 1);
        const newDate = date.toISOString();
        expect(component.relevantDate).toBe(newDate);
    });

    it("should not move date by one day to the back", () => {
        component.activeSorting = SortTime.Hour;
        const date = new Date();
        const minDate = new Date(date);
        minDate.setHours(minDate.getHours() + 1);
        component.minDate = minDate;
        component.relevantDate = date.toISOString();
        component.moveDate(Direction.Left);
        expect(component.relevantDate).toBe(date.toISOString());
    });

    it("should not move date by one day to the front", () => {
        component.activeSorting = SortTime.Hour;
        const date = new Date();
        const maxDate = new Date(date);
        component.maxDate = maxDate;
        component.relevantDate = date.toISOString();
        component.moveDate(Direction.Right);
        expect(component.relevantDate).toBe(date.toISOString());
    });

    it("should move date by one month to the back", () => {
        component.activeSorting = SortTime.Day;
        const date = new Date();
        component.minDate = new Date(date.getTime());
        component.minDate.setMonth(date.getMonth() - 1);
        component.relevantDate = date.toISOString();
        component.moveDate(Direction.Left);
        date.setMonth(date.getMonth() - 1);
        const newDate = date.toISOString();
        expect(component.relevantDate).toBe(newDate);
    });

    it("should move date by one year to the back", () => {
        component.activeSorting = SortTime.Month;
        const date: Date = new Date();
        component.minDate = new Date(date.getTime());
        component.minDate.setFullYear(date.getFullYear() - 1);
        component.relevantDate = date.toISOString();
        component.moveDate(Direction.Left);
        date.setFullYear(date.getFullYear() - 1);
        const newDate = date.toISOString();
        expect(component.relevantDate).toBe(newDate);
    });

    it("should not move date by one day to the front", () => {
        component.activeSorting = SortTime.Year;
        const date = new Date();
        component.relevantDate = date.toISOString();
        component.moveDate(Direction.None);
        expect(component.relevantDate).toBe(date.toISOString());
    });

    it("should update relevant date to current date", () => {
        const relevantDateDate = new Date();
        relevantDateDate.setFullYear(relevantDateDate.getFullYear() - 1);
        component.relevantDate = relevantDateDate.toISOString();
        component.updateRelevantDate(new Date());
    });

    it("should transform date to 'yyyy' format", () => {
        const dateISO = new Date("2023-07-30").toISOString();
        expect(component.dateTransform(dateISO, SortTime.Year)).toBe("2023");
    });

    it("should transform date to 'dd.MM.yy' format", () => {
        const dateISO = new Date("2023-07-30").toISOString();
        expect(component.dateTransform(dateISO, "")).toBe("30.07.2023");
    });

    it("should set etag to localstorage", () => {
        component.setEtag("new-etag");
        expect(localStorageMock["stats-etag"]).toBe("new-etag");
    });

    function removeMsFromISOString(ISOstring: string): string {
        const indexOfDot = ISOstring.indexOf(".");
        if (indexOfDot !== -1) {
            return ISOstring.substring(0, indexOfDot) + "Z";
        }
        return ISOstring;
    }

    enum SortTime {
        Year = "year",
        Month = "month",
        Day = "day",
        Hour = "hour",
    }

    enum Direction {
        None = 0,
        Left = 1,
        Right = 2,
    }
});
