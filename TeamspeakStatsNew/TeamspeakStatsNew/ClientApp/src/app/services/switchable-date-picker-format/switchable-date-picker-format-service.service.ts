import { Injectable } from "@angular/core";

@Injectable({
    providedIn: "root",
})
export class SwitchableDatePickerFormatService {
    private formatType: FormatTypes = FormatTypes.year;

    getFormats() {
        switch (this.formatType) {
            case FormatTypes.year:
                return this.yearFormat;
            case FormatTypes.yearMonth:
                return this.yearMonthFormat;
            default:
                return this.yearMonthDayFormat;
        }
    }

    getSelectedFormatsType(): FormatTypes {
        return this.formatType;
    }

    setFormats(parFormatType: FormatTypes) {
        this.formatType = parFormatType;
    }

    getFormatLabel(): string {
        switch (this.formatType) {
            case FormatTypes.year:
                return "YYYY";
            case FormatTypes.yearMonth:
                return "MM/YYYY";
            default:
                return "DD/MM/YYYY";
        }
    }

    private yearMonthDayFormat = {
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

    private yearMonthFormat = {
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

    private yearFormat = {
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
}

export enum FormatTypes {
    year = "year",
    yearMonth = "yearMonth",
    yearMonthDay = "yearMonthDay",
}
