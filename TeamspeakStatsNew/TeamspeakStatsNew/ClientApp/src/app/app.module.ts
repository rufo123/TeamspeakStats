import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { RouterModule } from "@angular/router";

import { AppComponent } from "./app.component";
import { NavMenuComponent } from "./nav-menu/nav-menu.component";
import { HomeComponent } from "./home/home.component";
import { CounterComponent } from "./counter/counter.component";
import { FetchDataComponent } from "./fetch-data/fetch-data.component";
import { DateService } from "./services/date/date.service";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatNativeDateModule } from "@angular/material/core";
import { ThemeService } from "./services/theme/theme.service";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { DateFormatPipe } from "./pipes/date-format.pipe";
import { FetchGraphsComponent } from "./fetch-graphs/fetch-graphs.component";
import { NgChartsModule } from "ng2-charts";
import { DatePipe } from "@angular/common";
import {
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
} from "@angular-material-components/datetime-picker";

import { MatIconModule } from "@angular/material/icon";
import { MatBadgeModule } from "@angular/material/badge";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatSliderModule } from "@angular/material/slider";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatButtonModule } from "@angular/material/button";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatMenuModule } from "@angular/material/menu";
import { MatDividerModule } from "@angular/material/divider";
import { MatCardModule } from "@angular/material/card";

@NgModule({
    declarations: [
        AppComponent,
        NavMenuComponent,
        HomeComponent,
        CounterComponent,
        FetchDataComponent,
        FetchGraphsComponent,
        DateFormatPipe,
    ],
    imports: [
        BrowserModule.withServerTransition({ appId: "ng-cli-universal" }),
        BrowserAnimationsModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,

        NgxMatDatetimePickerModule,
        NgxMatTimepickerModule,

        MatIconModule,
        MatBadgeModule,
        MatSlideToggleModule,
        MatSliderModule,
        MatTooltipModule,
        MatButtonModule,
        MatToolbarModule,
        MatProgressSpinnerModule,
        MatMenuModule,
        MatDividerModule,
        MatCardModule,
        MatFormFieldModule,
        MatDatepickerModule,
        MatNativeDateModule,

        NgChartsModule,

        RouterModule.forRoot([
            { path: "", component: FetchDataComponent, pathMatch: "full" },
            { path: "stats", component: FetchDataComponent },
            { path: "stats/:sort", component: FetchDataComponent },
            { path: "graphs", component: FetchGraphsComponent },
        ]),
    ],
    providers: [DateService, ThemeService, DatePipe],
    bootstrap: [AppComponent],
})
export class AppModule {}
