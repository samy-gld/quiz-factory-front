import {Component, Input, OnInit} from '@angular/core';
import { Observable } from 'rxjs';
import { StatisticsService } from '../../services/statistics.service';

@Component({
    selector: 'app-by-quiz-stats',
    templateUrl: './by-quiz-stats.component.html',
    styleUrls: ['./by-quiz-stats.component.css']
})
export class ByQuizStatsComponent implements OnInit {

    @Input() quizId: number;
    successRateByQuiz$: Observable<any[]>;

    view: any[] = [700, 400];

    // options
    legendTitle = 'Légende';
    gradient = false;
    showLegend = true;

    // pie
    showLabels = true;
    explodeSlices = false;
    doughnut = false;

    colorScheme = {
        domain: ['#d9534f', '#DF691A', '#5bc0de', '#5cb85c']
    };

    constructor(private statisticsService: StatisticsService) { }

    ngOnInit() {
        this.successRateByQuiz$ = this.statisticsService.successRateByQuiz$;
    }

    onSelect(event) {
        console.log(event);
    }
}
