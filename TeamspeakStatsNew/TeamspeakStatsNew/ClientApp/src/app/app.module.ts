import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { RouterModule } from "@angular/router";

import { AppComponent } from "./app.component";
import { NavMenuComponent } from "./nav-menu/nav-menu.component";
import { HomeComponent } from "./home/home.component";
import { CounterComponent } from "./counter/counter.component";
import { FetchDataComponent } from "./fetch-data/fetch-data.component";
import { DateService } from "./services/date/date.service";
import {
    MatBadgeModule,
    MatButtonModule,
    MatIconModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatTooltipModule,
} from "@angular/material";
import { ThemeService } from "./services/theme/theme.service";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

@NgModule({
    declarations: [
        AppComponent,
        NavMenuComponent,
        HomeComponent,
        CounterComponent,
        FetchDataComponent,
    ],
    imports: [
        BrowserModule.withServerTransition({ appId: "ng-cli-universal" }),
        BrowserAnimationsModule,
        HttpClientModule,
        FormsModule,
        MatIconModule,
        MatBadgeModule,
        MatSlideToggleModule,
        MatSliderModule,
        MatTooltipModule,
        MatButtonModule,
        RouterModule.forRoot([
            { path: "", component: FetchDataComponent, pathMatch: "full" },
            { path: "stats", component: FetchDataComponent },
        ]),
    ],
    providers: [DateService, ThemeService],
    bootstrap: [AppComponent],
})
export class AppModule {}
