import { Component, Inject } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { DateService } from "../services/date/date.service";
import {
    interval,
    switchMap,
    distinctUntilChanged,
    startWith,
    map,
    Observable,
    of,
    catchError,
} from "rxjs";

@Component({
    selector: "app-fetch-data",
    templateUrl: "./fetch-data.component.html",
    styleUrls: ["./fetch-data.component.scss"],
})
export class FetchDataComponent {
    public stats$: Observable<Stats[]>;
    public stats: Stats[] = [];
    public sortedBy = "lastConnected";
    public sortDirection = 1;

    constructor(
        private http: HttpClient,
        @Inject("BASE_URL") private baseUrl: string,
        private dateService: DateService
    ) {
        this.sortedBy = "hoursTotal";
        this.sortDirection = -1;

        this.stats$ = interval(5000).pipe(
            startWith(0),
            switchMap(() => this.httpGetAndFormatStats()),
            distinctUntilChanged(
                (x, y) => JSON.stringify(x) === JSON.stringify(y)
            ),
            map((stats) => this.sort(this.sortedBy, stats, false))
        );

        this.stats$.subscribe((stats) => {
            if (JSON.stringify(stats) !== JSON.stringify(this.stats)) {
                this.stats = stats;
            }
        });
    }

    formatStats(stats: Stats[]) {
        return stats.map((stat) => {
            return {
                ...stat,
                lastConnectedFormatted: this.dateService.format(
                    stat.lastConnected
                ),
            };
        });
    }

    httpGetAndFormatStats(): Observable<Stats[]> {
        let etag = null;
        if (this.stats.length <= 0) {
            localStorage.removeItem("stats-etag");
        } else {
            etag = localStorage.getItem("stats-etag");
        }

        const headers = etag
            ? new HttpHeaders({ "If-None-Match": etag })
            : new HttpHeaders();

        return this.http
            .get<Stats[]>(this.baseUrl + "api/stats", {
                headers,
                observe: "response",
            })
            .pipe(
                map((response) => {
                    const etag = response.headers.get("ETag");
                    if (etag) {
                        this.setEtag(etag);
                        localStorage.setItem("etag", etag);
                    }
                    return response.body;
                }),
                map((response) => {
                    if (response === null) {
                        return [];
                    } else {
                        return this.formatStats(response);
                    }
                }),
                catchError((error) => {
                    if (error.status === 304) {
                        return of(this.formatStats(this.stats));
                    }
                    throw error;
                })
            );
    }

    setEtag(etag: string): void {
        localStorage.setItem("stats-etag", etag);
    }

    trackByFn(index: number, item: Stats): number {
        return item.id;
    }

    formatLastConnectedDate(
        parDate: Date,
        parTimeZone = "Europe/Vilnius"
    ): string {
        return this.dateService.format(parDate, parTimeZone);
    }

    public sort(field: string, stats: Stats[], flipDirection = true): Stats[] {
        if (this.sortedBy === field) {
            // Flip sort direction
            if (flipDirection) {
                this.sortDirection = -this.sortDirection;
            }
        } else {
            // Sort by a new field
            this.sortDirection = 1;
            this.sortedBy = field;
        }

        stats.sort((a, b) => {
            const valueA = a[field];
            const valueB = b[field];

            if (valueA < valueB) {
                return -1 * this.sortDirection;
            } else if (valueA > valueB) {
                return 1 * this.sortDirection;
            } else {
                return 0;
            }
        });

        this.stats$ = of(stats);

        return stats;
    }

    getSortIcon(column: string): string {
        if (column === this.sortedBy) {
            if (this.sortDirection === 1) {
                return "arrow_upward";
            } else {
                return "arrow_downward";
            }
        } else {
            return "unfold_more";
        }
    }
}

interface Stats {
    id: number;
    latestName: string;
    namesList: string[];
    lastConnected: Date;
    hoursTotal: number;
    bot: boolean;
    online: boolean;
    lastConnectedFormatted: string;
    [key: string]: number | string | boolean | Date | string[];
}
