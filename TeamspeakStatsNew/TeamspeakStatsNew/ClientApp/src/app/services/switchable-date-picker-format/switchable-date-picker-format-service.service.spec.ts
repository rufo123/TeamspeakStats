import { TestBed } from "@angular/core/testing";
import {
    SwitchableDatePickerFormatService,
    FormatTypes,
} from "./switchable-date-picker-format-service.service";

describe("SwitchableDatePickerFormatService", () => {
    let service: SwitchableDatePickerFormatService;

    const yearMonthDayFormat = {
        parse: {
            dateInput: "DD/MM/YYYY",
        },
        display: {
            dateInput: "DD/MM/YYYY",
            monthYearLabel: "DDD MMM YYYY",
            dateA11yLabel: "LL",
            monthYearA11yLabel: "DDDD MMMM YYYY",
        },
    };

    const yearMonthFormat = {
        parse: {
            dateInput: "MM/YYYY",
        },
        display: {
            dateInput: "MM/YYYY",
            monthYearLabel: "MMM YYYY",
            dateA11yLabel: "LL",
            monthYearA11yLabel: "MMMM YYYY",
        },
    };

    const yearFormat = {
        parse: {
            dateInput: "YYYY",
        },
        display: {
            dateInput: "YYYY",
            monthYearLabel: "YYYY",
            dateA11yLabel: "LL",
            monthYearA11yLabel: "YYYY",
        },
    };

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SwitchableDatePickerFormatService);
    });

    it("should be created", () => {
        expect(service).toBeTruthy();
    });

    it("should have the initial format type set to 'yearMonthDay'", () => {
        expect(service.getSelectedFormatsType()).toEqual(FormatTypes.year);
    });

    // Test the getFormats() method:

    it("should return the correct format for 'year'", () => {
        service.setFormats(FormatTypes.year);
        expect(service.getFormats()).toEqual(yearFormat);
    });

    it("should return the correct format for 'yearMonth'", () => {
        service.setFormats(FormatTypes.yearMonth);
        expect(service.getFormats()).toEqual(yearMonthFormat);
    });

    it("should return the correct format for default (yearMonthDay)", () => {
        service.setFormats(FormatTypes.yearMonthDay);
        expect(service.getFormats()).toEqual(yearMonthDayFormat);
    });

    // Test the getSelectedFormatsType() and setFormats() methods:

    it("should set the format type correctly", () => {
        service.setFormats(FormatTypes.year);
        expect(service.getSelectedFormatsType()).toEqual(FormatTypes.year);

        service.setFormats(FormatTypes.yearMonth);
        expect(service.getSelectedFormatsType()).toEqual(FormatTypes.yearMonth);

        service.setFormats(FormatTypes.yearMonthDay);
        expect(service.getSelectedFormatsType()).toEqual(
            FormatTypes.yearMonthDay
        );
    });

    // Test the getFormatLabel() method:

    it("should return the correct format label for 'year'", () => {
        service.setFormats(FormatTypes.year);
        expect(service.getFormatLabel()).toEqual("YYYY");
    });

    it("should return the correct format label for 'yearMonth'", () => {
        service.setFormats(FormatTypes.yearMonth);
        expect(service.getFormatLabel()).toEqual("MM/YYYY");
    });

    it("should return the correct format label for default (yearMonthDay)", () => {
        service.setFormats(FormatTypes.yearMonthDay);
        expect(service.getFormatLabel()).toEqual("DD/MM/YYYY");
    });
});
