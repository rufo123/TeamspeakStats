import {
    ComponentFixture,
    discardPeriodicTasks,
    fakeAsync,
    flush,
    inject,
    TestBed,
    tick,
} from "@angular/core/testing";
import {
    HttpClientTestingModule,
    HttpTestingController,
} from "@angular/common/http/testing";
import { FetchDataComponent } from "./fetch-data.component";
import { DateService } from "../services/date/date.service";
import { ActivatedRoute } from "@angular/router";
import { Observable, of } from "rxjs";
import { HttpClient } from "@angular/common/http";

class ActivatedRouteStub {
    snapshot = { params: {} };
}

// Create a mock class for the HttpClient
class MockHttpClient {
    // Implement the relevant methods used in the component
    get(url: string): Observable<any> {
        // Return an observable with some sample data to simulate HTTP response
        return of([{ value: 1 }, { value: 2 }, { value: 3 }]);
    }
}

describe("FetchDataComponent", () => {
    let component: FetchDataComponent;
    let fixture: ComponentFixture<FetchDataComponent>;
    let httpMock: HttpTestingController;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [FetchDataComponent],
            providers: [
                DateService,
                { provide: ActivatedRoute, useClass: ActivatedRouteStub }, // Use the mock ActivatedRoute
                { provide: "BASE_URL", useValue: "http://localhost:3000/" }, // Replace with your mock base URL
                { provide: HttpClient, useClass: MockHttpClient }, // Provide the mock HTTP service
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        httpMock = TestBed.inject(HttpTestingController);
        fixture = TestBed.createComponent(FetchDataComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("getSortIcon() - should return arrow_upward", () => {
        component.sortedBy = "testSortedBy";
        component.sortDirection = 1;
        const column = "testSortedBy";
        expect(component.getSortIcon(column)).toBe("arrow_upward");
    });

    it("getSortIcon() - should return arrow_downward", () => {
        component.sortedBy = "testSortedBy";
        component.sortDirection = 0;
        const column = "testSortedBy";
        expect(component.getSortIcon(column)).toBe("arrow_downward");
    });

    it("getSortIcon() - should return unfold_more", () => {
        component.sortedBy = "testSortedBy";
        const column = "wrongColumn";
        expect(component.getSortIcon(column)).toBe("unfold_more");
    });

    it("getTotalHours() - should return 100", () => {
        const stat: Stats = {
            id: 0,
            latestName: "",
            namesList: [],
            lastConnected: new Date(),
            hoursTotal: 100,
            bot: false,
            online: false,
            lastConnectedFormatted: "",
            connectedDates: [],
        };
        expect(component.getTotalHours(stat)).toBe(100);
    });

    it("formatStats() - should format stats with correct lastConnectedFormatted field", () => {
        const date1 = new Date();
        date1.setHours(date1.getHours() - 1); // 1 hour ago
        date1.setMinutes(date1.getMinutes() - 1); // 1 minute ago

        const date2 = new Date();
        date2.setDate(date2.getDate() - 2); // 2 days ago
        date2.setHours(date2.getHours() - 1); // 1 hour ago

        const mockStats = [
            {
                id: 1,
                lastConnected: date1,
                latestName: "",
                hoursTotal: 1,
                bot: false,
                online: false,
                lastConnectedFormatted: "",
                connectedDates: [
                    [new Date("2023-07-30T10:00:00Z")],
                    [new Date("2023-07-30T10:00:00Z")],
                ],
                namesList: [],
            },
            {
                id: 2,
                lastConnected: date2,
                latestName: "",
                hoursTotal: 1,
                bot: false,
                online: false,
                lastConnectedFormatted: "",
                connectedDates: [
                    [new Date("2023-07-30T10:00:00Z")],
                    [new Date("2023-07-30T10:00:00Z")],
                ],
                namesList: [],
            },
        ];
        const formattedStats = component.formatStats(mockStats);

        // Check if the lastConnectedFormatted field is formatted correctly
        expect(formattedStats[0].lastConnectedFormatted).toBe(
            "1 hour and 1 minute ago"
        );
        expect(formattedStats[1].lastConnectedFormatted).toBe(
            "2 days and 1 hour ago"
        );
    });

    it("formatLastConnectedDate() - should format last connected date correctly", () => {
        const date = new Date();
        date.setFullYear(date.getFullYear() - 4); // 4 years ago
        date.setMonth(date.getMonth() - 2); // 2 days ago

        const formattedLastConnectedDate =
            component.formatLastConnectedDate(date);
        expect(formattedLastConnectedDate).toBe("4 years and 2 months ago");
    });

    it("setEtag() - should set the ETag value in localStorage", () => {
        const mockEtag = "mock-etag";

        // Spy on localStorage.setItem to check if it's called with the correct values
        spyOn(localStorage, "setItem");

        // Call the setEtag method with mockEtag
        component.setEtag(mockEtag);

        // Expect that localStorage.setItem was called with the correct key-value pair
        expect(localStorage.setItem).toHaveBeenCalledWith(
            "stats-etag",
            mockEtag
        );
    });

    it("TrackByFn() - should return the id of the item as a unique identifier", () => {
        const mockStats = [
            {
                id: 1,
                lastConnected: new Date(),
                latestName: "A",
                hoursTotal: 10,
                bot: false,
                online: false,
                lastConnectedFormatted: "",
                connectedDates: [
                    [new Date("2023-07-30T10:00:00Z")],
                    [new Date("2023-07-30T10:00:00Z")],
                ],
                namesList: [],
            },
            {
                id: 2,
                lastConnected: new Date(),
                latestName: "B",
                hoursTotal: 5,
                bot: false,
                online: false,
                lastConnectedFormatted: "",
                connectedDates: [
                    [new Date("2023-07-30T10:00:00Z")],
                    [new Date("2023-07-30T10:00:00Z")],
                ],
                namesList: [],
            },
            {
                id: 3,
                lastConnected: new Date(),
                latestName: "C",
                hoursTotal: 15,
                bot: false,
                online: false,
                lastConnectedFormatted: "",
                connectedDates: [
                    [new Date("2023-07-30T10:00:00Z")],
                    [new Date("2023-07-30T10:00:00Z")],
                ],
                namesList: [],
            },
        ];

        // Call trackByFn method with mock index and items
        const result1 = component.trackByFn(0, mockStats[0]);
        const result2 = component.trackByFn(1, mockStats[1]);
        const result3 = component.trackByFn(2, mockStats[2]);

        // Expect that the method returns the correct ids as unique identifiers
        expect(result1).toBe(1);
        expect(result2).toBe(2);
        expect(result3).toBe(3);
    });

    it("sortData() - should set the correct dateToCountHoursFrom for SortTime.AllTime", () => {
        component.sortData(SortTime.AllTime);
        const date = new Date();
        date.setFullYear(1);
        expect(component.dateToCountHoursFrom).toEqual(date);
    });

    it("sortData() - should set the correct dateToCountHoursFrom for SortTime.Monthly", () => {
        component.sortData(SortTime.Monthly);
        expect(component.dateToCountHoursFrom).toEqual(component.oneMonthAgo);
    });

    it("sortData() - should set the correct dateToCountHoursFrom for SortTime.Daily", () => {
        component.sortData(SortTime.Daily);
        expect(component.dateToCountHoursFrom).toEqual(component.oneDayAgo);
    });

    it("sortData() - should set the correct dateToCountHoursFrom for default", () => {
        component.sortData("Unknown");
        component.dateToCountHoursFrom = new Date();
        expect(component.dateToCountHoursFrom).toEqual(new Date());
    });

    it("sortData() -  should call httpGetAndFormatStats() method and update stats$ correctly", () => {
        const mockStats = [
            {
                id: 1,
                lastConnected: new Date(),
                latestName: "A",
                hoursTotal: 10,
                bot: false,
                online: false,
                lastConnectedFormatted: "",
                connectedDates: [
                    [new Date("2023-07-30T10:00:00Z")],
                    [new Date("2023-07-30T10:00:00Z")],
                ],
                namesList: [],
            },
            {
                id: 2,
                lastConnected: new Date(),
                latestName: "B",
                hoursTotal: 5,
                bot: false,
                online: false,
                lastConnectedFormatted: "",
                connectedDates: [
                    [new Date("2023-07-30T10:00:00Z")],
                    [new Date("2023-07-30T10:00:00Z")],
                ],
                namesList: [],
            },
            {
                id: 3,
                lastConnected: new Date(),
                latestName: "C",
                hoursTotal: 15,
                bot: false,
                online: false,
                lastConnectedFormatted: "",
                connectedDates: [
                    [new Date("2023-07-30T10:00:00Z")],
                    [new Date("2023-07-30T10:00:00Z")],
                ],
                namesList: [],
            },
        ];
        spyOn(component, "httpGetAndFormatStats").and.returnValue(
            of(mockStats)
        );
        const sortBy = SortTime.AllTime;

        component.sortData(sortBy);

        // Expect that httpGetAndFormatStats is called
        expect(component.httpGetAndFormatStats).toHaveBeenCalled();

        // Expect that stats$ is updated with the correct data
        component.stats$.subscribe((stats) => {
            expect(stats).toEqual(mockStats);
        });

        // Expect that the properties are set correctly after the HTTP request
        expect(component.stats).toEqual(mockStats);
        expect(component.activeSorting).toBe(sortBy);
        expect(component.isSorting).toBe(false);
    });

    it("sort() -  should flipDirection, sort by a same field and sort data correctly by ascending order", () => {
        const field = "hoursTotal";
        const flipDirection = true;
        const mockStats = [
            {
                id: 1,
                lastConnected: new Date(),
                latestName: "A",
                hoursTotal: 10,
                bot: false,
                online: false,
                lastConnectedFormatted: "",
                connectedDates: [
                    [new Date("2023-07-30T10:00:00Z")],
                    [new Date("2023-07-30T10:00:00Z")],
                ],
                namesList: [],
            },
            {
                id: 2,
                lastConnected: new Date(),
                latestName: "B",
                hoursTotal: 10,
                bot: false,
                online: false,
                lastConnectedFormatted: "",
                connectedDates: [
                    [new Date("2023-07-30T10:00:00Z")],
                    [new Date("2023-07-30T10:00:00Z")],
                ],
                namesList: [],
            },
            {
                id: 3,
                lastConnected: new Date(),
                latestName: "C",
                hoursTotal: 2,
                bot: false,
                online: false,
                lastConnectedFormatted: "",
                connectedDates: [
                    [new Date("2023-07-30T10:00:00Z")],
                    [new Date("2023-07-30T10:00:00Z")],
                ],
                namesList: [],
            },
        ];

        component.sortedBy = "hoursTotal";
        const sortedStats = component.sort(field, mockStats, flipDirection);
        expect(sortedStats[0].hoursTotal).toBe(2);
        expect(sortedStats[1].hoursTotal).toBe(10);
        expect(sortedStats[2].hoursTotal).toBe(10);
        expect(component.sortedBy).toBe("hoursTotal");
        expect(component.sortDirection).toBe(1);
    });

    it("sort() -  should flipDirection by default, sort by new field and sort data correctly by descending order", () => {
        const field = "id";
        const mockStats = [
            {
                id: 1,
                lastConnected: new Date(),
                latestName: "A",
                hoursTotal: 10,
                bot: false,
                online: false,
                lastConnectedFormatted: "",
                connectedDates: [
                    [new Date("2023-07-30T10:00:00Z")],
                    [new Date("2023-07-30T10:00:00Z")],
                ],
                namesList: [],
            },
            {
                id: 2,
                lastConnected: new Date(),
                latestName: "B",
                hoursTotal: 10,
                bot: false,
                online: false,
                lastConnectedFormatted: "",
                connectedDates: [
                    [new Date("2023-07-30T10:00:00Z")],
                    [new Date("2023-07-30T10:00:00Z")],
                ],
                namesList: [],
            },
            {
                id: 3,
                lastConnected: new Date(),
                latestName: "C",
                hoursTotal: 2,
                bot: false,
                online: false,
                lastConnectedFormatted: "",
                connectedDates: [
                    [new Date("2023-07-30T10:00:00Z")],
                    [new Date("2023-07-30T10:00:00Z")],
                ],
                namesList: [],
            },
        ];

        component.sortedBy = "hoursTotal";
        const sortedStats = component.sort(field, mockStats);
        expect(sortedStats[0].hoursTotal).toBe(10);
        expect(sortedStats[1].hoursTotal).toBe(10);
        expect(sortedStats[2].hoursTotal).toBe(2);
        expect(component.sortedBy).toBe("id");
        expect(component.sortDirection).toBe(1);
    });

    interface Stats {
        id: number;
        latestName: string;
        namesList: string[];
        lastConnected: Date;
        hoursTotal: number;
        bot: boolean;
        online: boolean;
        lastConnectedFormatted: string;
        [key: string]: number | string | boolean | Date | Date[][] | string[];
        connectedDates: Date[][];
    }

    enum SortTime {
        AllTime = "all-time",
        Monthly = "monthly",
        Daily = "daily",
    }
});
