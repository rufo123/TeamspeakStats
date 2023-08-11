import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { ChartConfiguration } from "chart.js";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { BaseChartDirective } from "ng2-charts";
import { DatePipe } from "@angular/common";
import { FormatTypes } from "../services/switchable-date-picker-format/switchable-date-picker-format-service.service";

@Component({
    selector: "app-fetch-graphs",
    templateUrl: "./fetch-graphs.component.html",
    styleUrls: ["./fetch-graphs.component.scss"],
})
export class FetchGraphsComponent implements OnInit {
    @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

    public barChartLegend = true;
    public barChartPlugins = [];
    private previousDate: string;
    public activeSorting: SortTime;

    public isSorting: boolean;

    public relevantDate: string;

    public format: FormatTypes;

    public minDate: Date = new Date(0);
    public maxDate: Date = new Date(Date.now());

    public barChartData: ChartConfiguration<"bar">["data"] = {
        labels: [],
        datasets: [
            {
                data: [],
                label: "Client Count",
                backgroundColor: ["#6f42c1"],
                hoverBackgroundColor: ["#6610f2"],
            },
        ],
    };

    public barChartOptions: ChartConfiguration<"bar">["options"] = {
        responsive: true,
    };

    constructor(
        private http: HttpClient,
        private datePipe: DatePipe,
        @Inject("BASE_URL") private baseUrl: string
    ) {
        this.activeSorting = SortTime.Hour;
        this.isSorting = false;
        this.relevantDate = new Date(Date.now()).toISOString();
        this.previousDate = this.relevantDate;
        this.format = FormatTypes.yearMonthDay;
    }

    ngOnInit() {
        this.getAllowedGraphDataRange();
        this.getGraphDataLatest(this.activeSorting);
    }

    getCurrentTimeAsIsoString() {
        return new Date(Date.now()).toISOString();
    }

    isDatePickerDisabled(): boolean {
        return this.activeSorting === SortTime.Year;
    }

    getGraphDataLatest(sortTime: string) {
        const date: string = new Date(Date.now()).toISOString();
        this.getGraphData(sortTime, date);
        switch (sortTime) {
            case SortTime.Day:
                this.format = FormatTypes.yearMonth;
                break;
            case SortTime.Hour:
                this.format = FormatTypes.yearMonthDay;
                break;
            case SortTime.Month:
                this.format = FormatTypes.year;
                break;
        }
        this.relevantDate = date;
    }

    moveDate(direction: Direction) {
        let moveByAmount = 0;
        const date: Date = new Date(this.relevantDate);
        switch (direction) {
            case Direction.Left:
                if (this.compareDatesNoTime(date, this.minDate) !== 1) {
                    // If the date is < this.minDate
                    return;
                }
                moveByAmount = -1;
                break;
            case Direction.Right:
                if (this.compareDatesNoTime(date, this.maxDate) !== -1) {
                    // If the date is > this.maxDate
                    return;
                }
                moveByAmount = 1;
                break;
            default:
        }

        console.log(date);
        console.log(this.maxDate);

        switch (this.activeSorting) {
            case SortTime.Hour:
                date.setDate(date.getDate() + moveByAmount);
                break;
            case SortTime.Day:
                date.setMonth(date.getMonth() + moveByAmount);
                break;
            case SortTime.Month:
                date.setFullYear(date.getFullYear() + moveByAmount);
                break;
            default:
        }
        if (this.activeSorting !== SortTime.Year) {
            this.relevantDate = date.toISOString();
            this.getGraphData(this.activeSorting, this.relevantDate);
        }
    }

    //

    getAllowedGraphDataRange() {
        const headers = new HttpHeaders({
            "If-None-Match": "your-etag-value", // Replace 'your-etag-value' with the actual ETag value
        });

        this.http
            .get<DateRange>(
                this.baseUrl + "api/stats/allowed-range-relative-to",
                {
                    headers,
                }
            )
            .subscribe(
                (response) => {
                    this.minDate = new Date(Date.parse(response[0]));
                    this.maxDate = new Date(Date.parse(response[1]));
                },
                (error) => {
                    console.error("Error fetching data:", error);
                }
            );
    }

    getGraphData(sortTime: string | SortTime, relevantDate: string): void {
        this.isSorting = true;
        this.getAllowedGraphDataRange();
        const headers = new HttpHeaders({
            "If-None-Match": "your-etag-value", // Replace 'your-etag-value' with the actual ETag value
        });

        const params = new HttpParams()
            .set("period", sortTime)
            .set("relevantDateTime", relevantDate); // Add the 'dateFrom' parameter to the query string

        this.http
            .get<StatsData>(this.baseUrl + "api/stats/conn-relative-to", {
                headers,
                params,
            })
            .subscribe(
                (response) => {
                    // Extract labels and datasets from the response
                    this.barChartData.labels = Object.keys(response)
                        .slice(-50)
                        .map((date) => this.dateTransform(date, sortTime));

                    this.barChartData.datasets[0].data = Object.values(response)
                        .slice(-50)
                        .map(Number);

                    this.chart?.update();

                    this.isSorting = false;
                    this.activeSorting = sortTime as SortTime;

                    // If you only want to store the first label and dataset, you can do:
                    // this.labels = [this.labels[0]];
                    // this.datasets = [this.datasets[0]];
                },
                (error) => {
                    console.error("Error fetching data:", error);
                    this.isSorting = false;
                }
            );
    }

    setEtag(etag: string): void {
        localStorage.setItem("stats-etag", etag);
    }

    dateTransform(date: string, sortTime: string | SortTime): string | null {
        switch (sortTime) {
            case SortTime.Hour:
                return this.datePipe.transform(date, "dd.MM.yyyy HH:mm");
            case SortTime.Day:
                return this.datePipe.transform(date, "dd.MM.yyyy");
            case SortTime.Month:
                return this.datePipe.transform(date, "MMMM yyyy");
            case SortTime.Year:
                return this.datePipe.transform(date, "yyyy");
            default:
                return this.datePipe.transform(date, "dd.MM.yyyy");
        }
    }

    updateRelevantDate(event: Date): void {
        this.relevantDate = new Date(
            event.getTime() - event.getTimezoneOffset() * 60000
        ).toISOString();
        if (event.toISOString() !== this.previousDate) {
            this.getGraphData(this.activeSorting, this.relevantDate);
            this.previousDate = this.relevantDate;
            console.log(this.maxDate);
            console.log(this.relevantDate);
        }
    }

    private compareDatesNoTime(date1: Date, date2: Date): number {
        const compareYears = this.compareNumber(
            date1.getFullYear(),
            date2.getFullYear()
        );

        if (compareYears === 0) {
            const compareMonths = this.compareNumber(
                date1.getMonth(),
                date2.getMonth()
            );

            if (compareMonths === 0) {
                return this.compareNumber(date1.getDate(), date2.getDate());
            }

            return compareMonths;
        }

        return compareYears;
    }

    private compareNumber(number1: number, number2: number): number {
        if (number1 < number2) {
            return -1;
        }

        if (number1 > number2) {
            return 1;
        }

        return 0;
    }
}

enum SortTime {
    Year = "year",
    Month = "month",
    Day = "day",
    Hour = "hour",
}

interface StatsData {
    [key: string]: number;
}

interface DateRange {
    0: string;
    1: string;
}

enum Direction {
    None = 0,
    Left = 1,
    Right = 2,
}
