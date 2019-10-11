import {Component, Input, OnInit} from '@angular/core';
import { single } from '../data';
import { Observable } from 'rxjs';
import {StatisticsService} from '../../services/statistics.service';
import {tap} from 'rxjs/operators';

@Component({
    selector: 'app-by-question-stats',
    templateUrl: './by-question-stats.component.html',
    styleUrls: ['./by-question-stats.component.css']
})
export class ByQuestionStatsComponent implements OnInit {

    @Input() quizId: number;
    successRateByQuestion$: Observable<any[]>;

    view: any[] = [700, 400];

    // options
    legendTitle = 'Légende';
    showXAxis = true;
    showYAxis = true;
    gradient = false;
    showLegend = true;
    showXAxisLabel = true;
    xAxisLabel = 'Questions';
    showYAxisLabel = true;
    yAxisLabel = '% réussite';

    colorScheme = {
        domain: ['#d9534f', '#DF691A', '#5bc0de', '#5cb85c']
    };
    customColors: any[] = [];

    constructor(private statisticsService: StatisticsService) { }

    ngOnInit(): void {
        this.successRateByQuestion$ = this.statisticsService.successRateByQuestion$.pipe(
            tap(
                data => {
                    if (data) {
                        data.forEach(
                            input => {
                                switch (true) {
                                    case input.value < 25:
                                        this.customColors.push({name: input.name, value: '#d9534f'});
                                        break;
                                    case input.value >= 25 && input.value < 50:
                                        this.customColors.push({name: input.name, value: '#DF691A'});
                                        break;
                                    case input.value >= 50 && input.value < 75:
                                        this.customColors.push({name: input.name, value: '#5bc0de'});
                                        break;
                                    case input.value >= 75:
                                        this.customColors.push({name: input.name, value: '#5cb85c'});
                                        break;
                                }
                            }
                        );
                    }
                }
            )
        );
    }

    onSelect(event) {
        console.log(event);
    }
}
