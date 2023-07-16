import { Component } from "@angular/core";
import { Theme, ThemeService } from "./services/theme/theme.service";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"],
})
export class AppComponent {
    title = "app";
    theme: Theme = "theme-light";
    currentYear: number;

    constructor(private themeService: ThemeService) {
        this.themeService.theme$.subscribe((theme) => (this.theme = theme));
        this.currentYear = new Date().getFullYear();
    }

    ngOnInit() {
        this.themeService.theme$.subscribe((theme) => {
            this.theme = theme;
            if (this.theme === "theme-dark") {
                document.body.classList.add(this.theme);
                document.body.classList.remove("theme-light");
            } else {
                document.body.classList.add(this.theme);
                document.body.classList.remove("theme-dark");
            }
        });
    }

    toggleTheme() {
        this.themeService.toggleTheme();
    }
}
