import { ApplicationRef, Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { ChartOptions } from "chart.js";
import { ThemeService as ChartsThemeService } from "ng2-charts";

export type Theme = "theme-light" | "theme-dark";

@Injectable({
    providedIn: "root",
})
export class ThemeService {
    private readonly _theme: BehaviorSubject<Theme> =
        new BehaviorSubject<Theme>("theme-dark");
    readonly theme$ = this._theme.asObservable();

    constructor(
        private ref: ApplicationRef,
        private chartsThemeService: ChartsThemeService
    ) {
        this.initalize();
    }

    initalize() {
        const darkModeOn =
            window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches;

        const darkModeFromLocalStorage = localStorage.getItem("theme");

        if (darkModeFromLocalStorage) {
            this.setTheme(
                darkModeFromLocalStorage === "theme-light"
                    ? "theme-light"
                    : "theme-dark"
            );
        } // If dark mode is enabled then directly switch to the dark-theme
        else if (darkModeOn) {
            this.setTheme("theme-dark");
        }

        // Watch for changes of the preference
        window.matchMedia("(prefers-color-scheme: dark)").addListener((e) => {
            const turnOn = e.matches;
            this._theme.next(turnOn ? "theme-dark" : "theme-light");
            localStorage.setItem("theme", this._theme.value);
            // Trigger refresh of UI
            this.ref.tick();
        });
    }

    setTheme(theme: Theme) {
        this._theme.next(theme);
        localStorage.setItem("theme", theme);
        this.setThemeCharts();
    }

    getTheme() {
        return this._theme.value;
    }

    setThemeCharts() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let overrides: ChartOptions<any>;
        if (this._theme.value === "theme-dark") {
            overrides = {
                scales: {
                    x: {
                        ticks: {
                            color: "white",
                        },
                        grid: {
                            color: "rgba(255, 255, 255, 0.05)",
                        },
                    },
                    y: {
                        ticks: {
                            color: "white",
                        },
                        grid: {
                            color: "rgba(255, 255, 255, 0.05)",
                        },
                    },
                },
                plugins: {
                    legend: {
                        labels: {
                            color: "white",
                        },
                    },
                },
            };
        } else {
            overrides = {
                scales: undefined,
            };
        }
        this.chartsThemeService.setColorschemesOptions(overrides);
    }

    toggleTheme() {
        this._theme.next(
            this._theme.value === "theme-light" ? "theme-dark" : "theme-light"
        );
        localStorage.setItem("theme", this._theme.value);
        this.setThemeCharts();
    }
}
