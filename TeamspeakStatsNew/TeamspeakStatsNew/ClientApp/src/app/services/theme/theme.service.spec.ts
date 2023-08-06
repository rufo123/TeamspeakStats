import { ApplicationRef } from "@angular/core";
import { ThemeService as ChartsThemeService } from "ng2-charts";
import { fakeAsync, TestBed, tick } from "@angular/core/testing";

import { Theme, ThemeService } from "./theme.service";

describe("ThemeService", () => {
    let service: ThemeService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ThemeService);
        jasmine.clock().install();
    });

    afterEach(() => {
        // Clean up the Jasmine clock
        jasmine.clock().uninstall();
    });

    it("should be created", () => {
        expect(service).toBeTruthy();
    });

    it("should set theme to 'theme-light' when calling setTheme('theme-light')", (done: DoneFn) => {
        service.setTheme("theme-light");
        service.theme$.subscribe((theme: Theme) => {
            expect(theme).toEqual("theme-light");
            done();
        });
    });

    it("should set theme to 'theme-dark' when calling setTheme('theme-dark')", (done: DoneFn) => {
        service.setTheme("theme-dark");
        service.theme$.subscribe((theme: Theme) => {
            expect(theme).toEqual("theme-dark");
            done();
        });
    });

    // Testing toggleTheme method:

    it("should toggle theme from 'theme-light' to 'theme-dark' when current theme is 'theme-light'", (done: DoneFn) => {
        service.setTheme("theme-light");
        service.toggleTheme();
        service.theme$.subscribe((theme: Theme) => {
            expect(theme).toEqual("theme-dark");
            done();
        });
    });

    it("should toggle theme from 'theme-dark' to 'theme-light' when current theme is 'theme-dark'", (done: DoneFn) => {
        service.setTheme("theme-dark");
        service.toggleTheme();
        service.theme$.subscribe((theme: Theme) => {
            expect(theme).toEqual("theme-light");
            done();
        });
    });

    // Testing setThemeCharts method:

    it("should call setColorschemesOptions with dark theme overrides when the theme is 'theme-dark'", () => {
        // Create a spy object for the private chartsThemeService
        const chartsThemeServiceSpy = jasmine.createSpyObj(
            "ChartsThemeService",
            ["setColorschemesOptions"]
        );

        // Access the private property and assign the spy
        (service as any).chartsThemeService = chartsThemeServiceSpy;

        service.setTheme("theme-dark");
        service.setThemeCharts();

        expect(
            chartsThemeServiceSpy.setColorschemesOptions
        ).toHaveBeenCalledWith({
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
        });
    });

    it("should call setColorschemesOptions with undefined overrides when the theme is 'theme-light'", () => {
        // Create a spy object for the private chartsThemeService
        const chartsThemeServiceSpy = jasmine.createSpyObj(
            "ChartsThemeService",
            ["setColorschemesOptions"]
        );

        // Access the private property and assign the spy
        (service as any).chartsThemeService = chartsThemeServiceSpy;

        service.setTheme("theme-light");
        service.setThemeCharts();

        expect(
            chartsThemeServiceSpy.setColorschemesOptions
        ).toHaveBeenCalledWith({
            scales: undefined,
        });
    });

    it("should set theme-dark, when dark-mode is preffered on construct", fakeAsync(() => {
        localStorage.removeItem("theme");

        const matchMediaSpy = spyOn(window, "matchMedia").and.returnValue({
            matches: true,
            media: "(prefers-color-scheme: dark)",
            onchange: null,
            addListener: (listener: (e: MediaQueryListEvent) => void) => {
                // Simulate a change in the preferred color scheme
                listener({ matches: true } as MediaQueryListEvent);
            },
            removeListener: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: function (event: Event): boolean {
                throw new Error("Function not implemented.");
            },
        });

        service.initalize();

        // Advance the Jasmine clock to trigger the listener callback
        jasmine.clock().tick(10000);

        expect(matchMediaSpy).toHaveBeenCalledWith(
            "(prefers-color-scheme: dark)"
        );
    }));
});
