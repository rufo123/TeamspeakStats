import { ApplicationRef, Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

export type Theme = "theme-light" | "theme-dark";

@Injectable({
    providedIn: "root",
})
export class ThemeService {
    private readonly _theme: BehaviorSubject<Theme> =
        new BehaviorSubject<Theme>("theme-dark");
    readonly theme$ = this._theme.asObservable();

    constructor(private ref: ApplicationRef) {
        // If dark mode is enabled then directly switch to the dark-theme
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
    }

    toggleTheme() {
        this._theme.next(
            this._theme.value === "theme-light" ? "theme-dark" : "theme-light"
        );
        localStorage.setItem("theme", this._theme.value);
    }
}
