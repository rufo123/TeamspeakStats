import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { ChartConfiguration } from "chart.js";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { BaseChartDirective } from "ng2-charts";
import { DatePipe } from "@angular/common";

@Component({
    selector: "app-fetch-graphs",
    templateUrl: "./fetch-graphs.component.html",
    styleUrls: ["./fetch-graphs.component.scss"],
})
export class FetchGraphsComponent implements OnInit {
    @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

    title = "ng2-charts-demo";

    public barChartLegend = true;
    public barChartPlugins = [];

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

    public activeSorting: SortTime;

    public isSorting: boolean;

    constructor(
        private http: HttpClient,
        private datePipe: DatePipe,
        @Inject("BASE_URL") private baseUrl: string
    ) {
        this.activeSorting = SortTime.Hour;
        this.isSorting = false;
    }

    ngOnInit() {
        this.getGraphData(this.activeSorting);
    }

    getGraphData(sortTime: string | SortTime): void {
        this.isSorting = true;
        const headers = new HttpHeaders({
            "If-None-Match": "your-etag-value", // Replace 'your-etag-value' with the actual ETag value
        });

        const params = new HttpParams().set("period", sortTime); // Add the 'dateFrom' parameter to the query string

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

                    console.log(response);
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
                console.log("defalt");
                return this.datePipe.transform(date, "dd.MM.yyyy");
        }
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
